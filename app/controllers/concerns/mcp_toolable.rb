# McpToolable: Controllerがこのconcernをincludeして `mcp_tool` を呼び出すことで
# MCPツールをグローバルレジストリに登録できる。
# McpController はレジストリを参照してツール一覧の返却と内部ディスパッチを行う。
module McpToolable
  extend ActiveSupport::Concern

  # ツール定義のグローバルレジストリ
  def self.registry
    @registry ||= []
  end

  class_methods do
    # MCPツールを登録する。
    # build_request ブロックは引数(Hash)を受け取り、
    # { method:, path:, params: } を返す必要がある。
    def mcp_tool(name:, description:, input_schema:, &build_request)
      McpToolable.registry << {
        name: name,
        description: description,
        inputSchema: input_schema,
        build_request: build_request
      }
    end
  end
end
