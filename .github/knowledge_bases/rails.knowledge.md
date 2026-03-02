## Railsの実装について

### 実装概要
Rails 8.1 + PostgreSQL 16 で JSON API を提供。vite-ruby + React のフロントエンドと組み合わせたハイブリッド構成。

### 実装する上で重要なポイント

- **namespace で API バージョン管理**: `namespace :api do namespace :v1 do` でルーティングを整理。コントローラーも `app/controllers/api/v1/` 配下に配置
- **BaseController で共通処理を集約**: `render_not_found`, `render_unprocessable` をBasseControllerに定義しサブクラスで再利用
- **`protect_from_forgery with: :exception` をJSON APIでも維持**: フロント側で `<meta name="csrf-token">` からトークンを取得しヘッダーに付与する
- **`includes(:category)` でN+1を防ぐ**: タスク一覧で `category.name` を参照する場合は必ず `includes` でプリロード
- **scope chain**: `Task.search_by_title(q).filter_by_status(s).filter_by_priority(p)` のようにスコープをチェーンできる
- **Rails 8.1 のデフォルト gems**: brakeman, rubocop-rails-omakase が標準で同梱されている
- **`db/seeds.rb` はべき等に**: `find_or_create_by!` を使い何度実行しても同じ結果になるよう実装する

### わかりづらいポイント

- **vite-ruby のソースディレクトリ**: デフォルトは `app/frontend`（`app/javascript` ではない）。`config/vite.json` の `sourceCodeDir` で確認・変更できる
- **`--skip-javascript` オプション**: Rails new 時に指定すると importmap が生成されず、Vite のみでJS管理できる（Propshaft は残る）
- **DATABASE_URL の優先順位**: `database.yml` に `url: <%= ENV["DATABASE_URL"] %>` を設定するとDockerの環境変数が自動的に上書きできる
- **Rails 8.1 の Solid Cache/Queue**: デフォルトで有効。SQLiteベースなので本番ではPostgreSQLに切り替えるか無効化が必要
