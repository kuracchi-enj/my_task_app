# Implementation Plan — mcp-server-gem (monkey_mcp)

- [ ] 1. Gem の骨格とコア設定を作成する
- [ ] 1.1 (P) `monkey_mcp` Gem の骨格を初期化し、依存関係を定義する
  - `bundle gem monkey_mcp` で骨格を生成する
  - `gemspec` に `rails` への runtime dependency を追加する
  - `lib/monkey_mcp.rb` に `MonkeyMcp.configure` / `MonkeyMcp.configuration` を実装する
  - `Configuration` クラスに `mount_path`, `server_name`, `server_version`, `protocol_version`, `auto_append_route`, `excluded_tool_methods` のデフォルト値を持たせる
  - _Requirements: 5.1, 5.2, 5.3, 5.7_

- [ ] 1.2 (P) `MonkeyMcp::Registry` を実装する
  - ツール定義（name, description, inputSchema, http_method, path_resolver）を保持するグローバルストアを実装する
  - `register`, `all`, `find`, `reset!` の各メソッドを `Mutex` で排他制御する
  - 同一名のツールが登録された場合は後勝ちで上書きし `Rails.logger.warn` を出力する
  - _Requirements: 1.6, 1.7, 5.6_

- [ ] 2. スキーマ自動生成機能を実装する
- [ ] 2.1 `MonkeyMcp::SchemaBuilder` を実装する
  - ActiveRecord の `columns_hash` と `defined_enums` から JSON Schema を自動生成する
  - `created_at`, `updated_at` を除外し、`show/update/destroy` では `id` を required に含める
  - AR 型 → JSON Schema 型のマッピング（`:string`→`"string"`, `:integer`→`"integer"` 等）を実装する
  - モデルクラスが見つからない場合は空の schema を返し `Rails.logger.warn` を出力する
  - _Requirements: 1.3, 5.5_

- [ ] 3. DSL（Toolable concern）を実装する
- [ ] 3.1 `MonkeyMcp::Toolable` concern を実装する
  - `include MonkeyMcp::Toolable` でコントローラのアクションが自動登録される仕組みを実装する
  - `mcp_desc` メソッドを `@_pending_mcp_desc` に一時保存するデコレータとして実装する
  - `method_added` フックで public メソッドを検知し、Routes に存在する `controller#action` のみ Registry へ登録する
  - `SchemaBuilder` に委譲して `input_schema` を生成する
  - `excluded_tool_methods` に含まれるメソッドはスキップし、Routes 未定義メソッドは `Rails.logger.warn` を出力する
  - コントローラ名・アクション名から `task_index` 形式のツール名を自動生成する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8, 1.9_

- [ ] 4. Engine と JSON-RPC コントローラを実装する
- [ ] 4.1 `MonkeyMcp::Engine` を実装する
  - `Rails::Engine` を継承し、`auto_append_route=true` のとき `app.routes.append` で `/mcp` を重複なく追加する
  - `to_prepare` で `Registry.reset!` 後に対象コントローラを preload し、reload 時の二重登録を防止する
  - `to_prepare` で `MCP_INTERNAL_TOKEN` を生成・管理する
  - `mount_path` 変更と `auto_append_route=false` による手動ルート定義をサポートする
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4.2 `MonkeyMcp::McpController` を実装する
  - `initialize`, `tools/list`, `tools/call`, `notifications/initialized` の JSON-RPC 2.0 メソッドを処理する
  - `Rack::MockRequest` で内部サブリクエストを発行し、`HTTP_X_MCP_INTERNAL_TOKEN` を付与する
  - `POST/PATCH/PUT` はボディを JSON で送信、`GET/DELETE` はクエリパラメータとして引数を付与する
  - `create/update` 相当アクションでは `arguments` を推論リソースキーでラップして送信する
  - 不正 JSON は HTTP 400 + JSON-RPC `-32700`、未知メソッドは `-32601`、未知ツールは `-32602` を返す
  - 内部サブリクエストが 2xx 以外の場合は `isError: true` で返す
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 4.9_

- [ ] 4.3 (P) `MonkeyMcp.protect_with_internal_token!` を実装する
  - ホストアプリのベースコントローラに内部トークン検証 `before_action` を追加する API を実装する
  - _Requirements: 4.8_

- [ ] 5. Gem のユニットテストを実装する
- [ ] 5.1 (P) `SchemaBuilder` のユニットテストを実装する
  - AR カラム型ごとの JSON Schema 変換、enum 変換、除外カラム、`show/update/destroy` での `id` required を検証する
  - _Requirements: 1.3, 5.5_

- [ ] 5.2 (P) `Registry` のユニットテストを実装する
  - 登録・検索・重複警告・`reset!` の動作を検証する
  - _Requirements: 1.6, 1.7, 5.6_

- [ ] 5.3 (P) `Toolable` のユニットテストを実装する
  - `mcp_desc` + アクション定義で Registry へ正しく登録されること、Routes 未定義メソッドがスキップされること、`excluded_tool_methods` が機能することを検証する
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.8, 1.9_

- [ ] 5.4 (P) `Configuration` のユニットテストを実装する
  - デフォルト値と `configure` ブロックによる変更を検証する
  - _Requirements: 5.1, 5.2, 5.3, 5.7_

- [ ] 6. McpController の統合テストを実装する
- [ ] 6.1 `initialize` / `tools/list` / `tools/call` レスポンスを検証する
  - 各 JSON-RPC メソッドのレスポンス形式を検証する
  - `create/update` 時のリソースキーラップを検証する
  - _Requirements: 2.1, 2.2, 2.3, 4.7_

- [ ] 6.2 エラーハンドリングを検証する
  - 不正 JSON（-32700）、未知メソッド（-32601）、未知ツール（-32602）、内部サブリクエストエラー（isError: true）を検証する
  - _Requirements: 2.4, 2.5, 2.6, 4.5_

- [ ] 7. `my_task_app` への移行と後方互換性確認
- [ ] 7.1 `my_task_app` を `monkey_mcp` Gem に切り替える
  - Gemfile に `gem 'monkey_mcp', path: '../monkey_mcp'`（またはローカルパス）を追加する
  - `McpController`, `McpToolable`, `config/initializers/mcp_tools.rb` を削除し、`routes.rb` の手動ルートを削除する
  - `TasksController` を `include MonkeyMcp::Toolable` と `mcp_desc` 形式に書き換える
  - _Requirements: 6.1, 6.3, 6.4_

- [ ] 7.2 既存テストで後方互換性を確認する
  - `spec/requests/mcp_spec.rb` を変更なしで全パスさせる
  - _Requirements: 6.1, 6.2, 6.3_
