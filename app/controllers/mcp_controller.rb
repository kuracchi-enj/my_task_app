# MCPサーバーコントローラー
# Model Context Protocol (MCP) over HTTP (JSON-RPC 2.0) を実装する。
# ツールの定義と実装は各コントローラーが McpToolable concern を通じて登録する。
# McpController はレジストリを参照してディスパッチするだけであり、ビジネスロジックを持たない。
class McpController < ApplicationController
  skip_before_action :verify_authenticity_token
  skip_before_action :require_login

  PROTOCOL_VERSION = "2024-11-05"
  SERVER_INFO = { name: "my_task_app", version: "1.0.0" }.freeze

  def handle
    body = JSON.parse(request.body.read)
    result = process_mcp_request(body)
    render json: result
  rescue JSON::ParserError
    render json: jsonrpc_error(nil, -32_700, "Parse error"), status: :bad_request
  end

  private

  def process_mcp_request(body)
    method = body["method"]
    id = body["id"]
    params = body["params"] || {}

    case method
    when "initialize"
      handle_initialize(id, params)
    when "notifications/initialized"
      # 通知メッセージのため応答不要
      nil
    when "tools/list"
      handle_tools_list(id)
    when "tools/call"
      handle_tools_call(id, params)
    else
      jsonrpc_error(id, -32_601, "Method not found: #{method}")
    end
  end

  # プロトコルハンドシェイク
  def handle_initialize(id, _params)
    jsonrpc_result(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO
    })
  end

  # 登録済みツール一覧を返す
  def handle_tools_list(id)
    tools = McpToolable.registry.map { |t| t.slice(:name, :description, :inputSchema) }
    jsonrpc_result(id, { tools: tools })
  end

  # ツール名をキーにレジストリを引き、対応するコントローラーアクションへ内部ディスパッチする
  def handle_tools_call(id, params)
    tool_name = params["name"]
    arguments = params["arguments"] || {}

    tool = McpToolable.registry.find { |t| t[:name] == tool_name }
    return jsonrpc_error(id, -32_602, "Unknown tool: #{tool_name}") unless tool

    status, body = internal_dispatch(**tool[:build_request].call(arguments))
    result_text = status == 204 ? { success: true }.to_json : body

    if status >= 200 && status < 300
      jsonrpc_result(id, { content: [ { type: "text", text: result_text } ] })
    else
      jsonrpc_result(id, { content: [ { type: "text", text: body } ], isError: true })
    end
  end

  # build_request ブロックの戻り値 { method:, path:, params: } を使って
  # Rails アプリへ内部サブリクエストを発行し、[status, body] を返す
  def internal_dispatch(method:, path:, params: {})
    http_method = method.to_s.upcase
    env_opts = { method: http_method, "HTTP_ACCEPT" => "application/json" }

    if %w[POST PATCH PUT].include?(http_method)
      json_body = params.to_json
      env_opts[:input] = json_body
      env_opts["CONTENT_TYPE"] = "application/json"
    else
      env_opts["QUERY_STRING"] = params.to_query
    end

    env = Rack::MockRequest.env_for(path, **env_opts)
    env["HTTP_X_MCP_INTERNAL_TOKEN"] = MCP_INTERNAL_TOKEN

    status, _headers, body_parts = Rails.application.call(env)
    body = body_parts.each.to_a.join
    body_parts.close if body_parts.respond_to?(:close)

    [ status, body ]
  end

  # --- JSON-RPC 2.0 ヘルパー ---

  def jsonrpc_result(id, result)
    { jsonrpc: "2.0", id: id, result: result }
  end

  def jsonrpc_error(id, code, message)
    { jsonrpc: "2.0", id: id, error: { code: code, message: message } }
  end
end
