# Requirements Document

## Introduction
`my_task_app` に直接実装されている MCP (Model Context Protocol) サーバコードを、独立した Ruby Gem として抽出・抽象化する。これにより任意の Rails アプリケーションから再利用可能な MCP サーバ機能を提供する。

## Requirements

### Requirement 1: Gem としてのツール自動登録

**Objective:** As a Rails 開発者, I want `include MonkeyMcp::Toolable` するだけでコントローラのアクションが自動的に MCP ツールとして登録されてほしい, so that MCP プロトコルの詳細や冗長な定義を書かなくて済む

#### Acceptance Criteria
1. When Rails コントローラが `include MonkeyMcp::Toolable` を呼び出す, the Gem shall コントローラで定義された public メソッドのうち Rails routes に存在する `controller#action` のみを MCP ツールとして登録する
2. When ツール名を生成する, the Gem shall `コントローラ名（単数形）+ "_" + アクション名` を snake_case で使用する（例: `Api::V1::TasksController#index` → `task_index`）
3. When `input_schema` を生成する, the Gem shall アクション名から対応する ActiveRecord モデルを推論し、そのカラム定義（型・null 制約）から JSON Schema を自動生成する
4. When アクション定義の直前に `mcp_desc "説明文"` が呼ばれた場合, the Gem shall その文字列をツールの `description` として使用する
5. When `mcp_desc` が呼ばれていないアクションの場合, the Gem shall `description` を空文字列としてツールを登録する
6. The Gem shall 登録済みツール一覧を `MonkeyMcp::Toolable.registry` から取得できるようにする
7. If 同一名のツールが複数回登録された場合, the Gem shall 後から登録したものを優先し警告ログを出力する
8. The Gem shall `MonkeyMcp.configure` でツール化除外メソッドを指定できるようにし、指定されたメソッドは自動登録対象から除外する
9. If public メソッドが Rails routes に存在しない場合, the Gem shall ツール登録をスキップし警告ログを出力する

### Requirement 2: JSON-RPC 2.0 プロトコル処理

**Objective:** As a Rails 開発者, I want MCP の JSON-RPC 2.0 プロトコル処理を Gem が担う, so that アプリケーション側にプロトコル実装を持たなくてよい

#### Acceptance Criteria
1. When `initialize` メソッドのリクエストを受信する, the Gem shall `protocolVersion`, `capabilities`, `serverInfo` を含むレスポンスを返す
2. When `tools/list` メソッドのリクエストを受信する, the Gem shall 登録済みツールの一覧を JSON-RPC 2.0 形式で返す
3. When `tools/call` メソッドのリクエストを受信する, the Gem shall ツール名でレジストリを検索し対応するツール定義（`path_resolver`, `http_method`）を使って内部サブリクエストを実行しレスポンスを返す
4. If 存在しないメソッド名のリクエストを受信した場合, the Gem shall JSON-RPC 2.0 エラーコード `-32601` のエラーレスポンスを返す
5. If 存在しないツール名が `tools/call` で指定された場合, the Gem shall エラーコード `-32602` のエラーレスポンスを返す
6. If リクエストボディが不正な JSON の場合, the Gem shall エラーコード `-32700` のエラーレスポンスを返し HTTP ステータスは `400 Bad Request` とする

### Requirement 3: Rails への組み込み（Engine / Railtie）

**Objective:** As a Rails 開発者, I want Gemfile に追加するだけで MCP エンドポイントが利用可能になる, so that 手動でルートやコントローラを追加する手間が不要になる

#### Acceptance Criteria
1. When Gem が Gemfile に追加される, the Gem shall Rails Engine または Railtie としてホストアプリの routes へ `append` し、自動的に `/mcp` ルートを有効化する
2. When Rails アプリが起動する, the Gem shall `McpToolable` を include したコントローラを事前ロードしツールをレジストリに登録する
3. The Gem shall 内部サブリクエスト用のランダムトークン（`MCP_INTERNAL_TOKEN` 相当）をプロセス起動時に生成・管理する
4. Where マウントパスをカスタマイズする必要がある場合, the Gem shall イニシャライザで `MonkeyMcp.mount_path = '/custom-path'` のように変更できるようにする
5. The Gem shall `auto_append_route` 設定を持ち、`true` の場合は自動 `append`、`false` の場合はホストアプリで手動ルート定義できるようにする
6. When `auto_append_route` が `true` の場合, the Gem shall `/mcp` ルートの重複登録を防止し、`to_prepare` ではルート追加処理を実行しない

### Requirement 4: 内部サブリクエスト機能

**Objective:** As a Rails 開発者, I want ツール呼び出しが既存の Rails ルーティングを経由して処理される, so that 既存のコントローラ・認証・バリデーションロジックを再利用できる

#### Acceptance Criteria
1. When `tools/call` が実行される, the Gem shall `Rack::MockRequest` を使って Rails アプリへ内部サブリクエストを発行する
2. When 内部サブリクエストが `POST`, `PATCH`, `PUT` の場合, the Gem shall リクエストボディを JSON 形式で送信する
3. When 内部サブリクエストが `GET`, `DELETE` の場合, the Gem shall クエリパラメータとして引数を付与する
4. The Gem shall 内部サブリクエストに認証トークンヘッダー（`HTTP_X_MCP_INTERNAL_TOKEN`）を付与する
5. If 内部サブリクエストが 2xx 以外のステータスを返した場合, the Gem shall `isError: true` を含む MCP エラーレスポンスを返す
6. When `include MonkeyMcp::Toolable` したコントローラのアクションが呼ばれる, the Gem shall コントローラ名・アクション名から Rails routes を逆引きしてパスを自動解決する
7. When `create` または `update` 相当のアクションを内部呼び出しする場合, the Gem shall Strong Parameters 互換のために `arguments` を推論したリソースキー（例: `task`）でラップして送信する
8. The Gem shall `MonkeyMcp.protect_with_internal_token!(BaseControllerClass)` API を提供し、ホストアプリが対象コントローラへ明示的に内部トークン検証を適用できるようにする
9. When 非 CRUD の public メソッドがツール呼び出し対象となる場合, the Gem shall Rails routes から対応する controller#action のルートを探索して内部サブリクエスト先を解決する

### Requirement 5: 設定・カスタマイズ

**Objective:** As a Rails 開発者, I want Gem の動作を設定ファイルでカスタマイズしたい, so that アプリの要件に合わせて柔軟に調整できる

#### Acceptance Criteria
1. The Gem shall `MonkeyMcp.configure` ブロックで設定を受け付ける
2. The Gem shall サーバ名・バージョン（`SERVER_INFO` 相当）を設定で変更できるようにする
3. The Gem shall MCP プロトコルバージョン（`PROTOCOL_VERSION`）をデフォルト値として持ち、設定で上書き可能にする
4. Where CSRF 検証が必要な場合, the Gem shall `skip_before_action :verify_authenticity_token` を自動的に適用する
5. The Gem shall `input_schema` 生成時に action 単位で必須項目ルールを持ち、`show/update/destroy` では `id` を required とする
6. The Gem shall レジストリ更新（register/reset）を `Mutex` で排他制御し、development の reload 時にも一貫した状態を保つ
7. The Gem shall `excluded_tool_methods` 設定を持ち、コントローラごとにツール化対象から除外する public メソッドを指定できるようにする

### Requirement 6: 後方互換性と移行

**Objective:** As a `my_task_app` 開発者, I want 既存の MCP 実装を Gem に置き換えてもアプリの動作が変わらない, so that リグレッションなく移行できる

#### Acceptance Criteria
1. When Gem を導入し既存の `McpController` と `McpToolable` を削除した場合, the Gem shall 同一の `/mcp` エンドポイントで同一の JSON-RPC レスポンスを返す
2. The Gem shall 既存の `spec/requests/mcp_spec.rb` のテストがすべてパスする状態を維持する
3. When `Api::V1::TasksController` に `include MonkeyMcp::Toolable` と `mcp_desc` を適用した場合, the Gem shall 移行前と同じツール一覧（`task_index`, `task_show`, `task_create`, `task_update`, `task_destroy`）を `tools/list` で返す
4. When 移行する場合, the Gem shall `TasksController` から `mcp_tool(name:, description:, input_schema:)` の手動定義をすべて削除し `mcp_desc` のみで記述できる
