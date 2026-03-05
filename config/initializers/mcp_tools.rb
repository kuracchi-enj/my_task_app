# MonkeyMcp の設定
# internal_token は MCP サブリクエストの認証に使用される。
# ApplicationController の require_login で照合される。
MonkeyMcp.configure do |config|
  config.internal_token = ENV.fetch("MCP_INTERNAL_TOKEN") { SecureRandom.hex(32) }
end

# eager_load が無効な development/test 環境でも MCP ツールが確実に登録されるよう事前ロード
Rails.application.config.to_prepare do
  Api::V1::TasksController
end
