# McpToolable concern を include したコントローラーを事前にロードして
# MCPツールをレジストリに登録する。
# eager_load が無効な development および test 環境でも、
# リクエスト処理前にツールが登録された状態を保証する。
#
# また、McpController 内部サブリクエスト用のランダムトークンを定義する。
# このトークンは起動時に生成され、プロセス間で共有されない。
Rails.application.config.to_prepare do
  Api::V1::TasksController
  MCP_INTERNAL_TOKEN = SecureRandom.hex(32) unless defined?(MCP_INTERNAL_TOKEN)
end
