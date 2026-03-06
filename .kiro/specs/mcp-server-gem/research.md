# Research & Design Decisions — mcp-server-gem

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

---

## Summary
- **Feature**: `mcp-server-gem`
- **Discovery Scope**: Complex Integration（既存 MCP 実装の Gem 抽出 + 自動スキーマ生成機能の追加）
- **Key Findings**:
  - Rails Engine として実装するのが最も自然。Railtie だけでもルート追加はできるが、Engine の方がコントローラ・ルート・initializer をひとまとめに管理できる
  - ActiveRecord のカラムメタデータ（`columns_hash`）は実行時に参照できるため、`input_schema` の自動生成は十分に実現可能
  - Rails の `route_url_helpers` と `recognize_path` を使えばコントローラ名＋アクション名からパスを逆引きできる
  - `mcp_desc` のデコレータパターンは Ruby の `method_added` フックで実装できる（Sorbet の `sig` と同様）

## Research Log

### Rails Engine vs Railtie

- **Context**: Gem がルート・コントローラ・initializer を自動提供するための最小構成を調査
- **Findings**:
  - `Rails::Engine` は `Rails::Railtie` のサブクラスであり、`Railtie` の機能をすべて含む
  - `Engine` は `app/` 以下のディレクトリを自動的に autoload パスに追加し、routes も `draw` で定義できる
  - マウントパスは `isolate_namespace` を使わない場合はホストアプリの routes に直接追加される
- **Implications**: `Rails::Engine` を採用し、`/mcp` ルートを Engine の routes で定義する。マウントパス変更は設定値で対応

### ActiveRecord カラムメタデータからの JSON Schema 自動生成

- **Context**: `input_schema` を手動定義せずにモデルのカラム情報から自動生成できるか調査
- **Findings**:
  - `Model.columns_hash` で `{ "title" => #<ActiveRecord::ConnectionAdapters::Column ...> }` を取得できる
  - `column.type` は `:string`, `:integer`, `:boolean`, `:datetime`, `:text`, `:decimal` 等の Symbol
  - `column.null` で NULL 許容かどうかが分かる（`false` なら required）
  - ActiveRecord の type → JSON Schema type のマッピング: `:string`/`:text` → `"string"`, `:integer` → `"integer"`, `:boolean` → `"boolean"`, `:decimal`/`:float` → `"number"`, `:datetime`/`:date` → `"string"（format 付き）`
  - `enum` 制約はモデルの `defined_enums` から取得できる
- **Implications**: `columns_hash` + `defined_enums` の組み合わせで型・必須制約・enum 値を自動生成できる。ただし `id`, `created_at`, `updated_at` 等のメタカラムは除外する必要あり

### コントローラ名・アクション名からモデル・ルートを推論

- **Context**: `Api::V1::TasksController#index` から対応モデル（`Task`）とルートパスを自動解決する方法を調査
- **Findings**:
  - コントローラ名の末尾（`Tasks`）を単数形にすることでモデル名（`Task`）を推論できる（`controller_name.classify.constantize`）
  - `Rails.application.routes.url_helpers` と `ActionDispatch::Routing::RouteSet#recognize_path` でパスを逆引きできる
  - CRUD アクション（`index`, `show`, `create`, `update`, `destroy`）は HTTP メソッドとの対応が明確
  - ただし非 CRUD アクション（カスタムアクション）はパス解決が曖昧になる可能性がある
- **Implications**: 標準 CRUD アクションのみ自動解決をサポートし、カスタムアクションは手動オーバーライドを提供する設計にする

### `mcp_desc` デコレータの Ruby 実装パターン

- **Context**: アクション直前に `mcp_desc "説明文"` を書いてメソッドに紐づける方法を調査
- **Findings**:
  - `method_added` フックでメソッド定義のタイミングを捕捉できる
  - クラス変数（`@_pending_mcp_desc`）に一時保存し、`method_added` が呼ばれた時点で対象メソッドに紐づけてクリアする
  - これは Sorbet の `sig { ... }` や RSpec の `let` と同様のパターン
- **Implications**: スレッドセーフではないが Rails のクラスロードは single-threaded なので問題なし

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Rails::Engine | Engine としてルート・コントローラを Gem 内に持つ | 完全な自己完結、既存 Rails パターンに沿う | Engine の autoload 設定が複雑になることがある | **採用** |
| Rails::Railtie のみ | Railtie で initializer とルートだけ追加、コントローラはホストアプリ | 軽量 | コントローラをホストアプリに置く必要があり抽象化が不完全 | 不採用 |
| Rack ミドルウェア | Rack レイヤーで MCP リクエストを横取り | Rails に依存しない | 内部サブリクエストのための Rails 統合が困難 | 不採用 |

## Design Decisions

### Decision: Rails::Engine の採用

- **Context**: Gem がルート・コントローラを自動提供する最適な方法
- **Alternatives Considered**:
  1. `Rails::Railtie` のみ — ルートは追加できるがコントローラを Gem 内に持てない
  2. `Rails::Engine` — コントローラ・ルート・initializer を Gem 内で完結できる
- **Selected Approach**: `Rails::Engine` を使用し、`/mcp` エンドポイントを Engine のルートで定義
- **Rationale**: 既存の `McpController` をそのまま Gem 内のコントローラとして移植でき、ホストアプリへの侵食が最小限
- **Trade-offs**: Railtie より若干重いが、今回の用途では問題なし
- **Follow-up**: `isolate_namespace` を使うかどうかは実装時に検討

### Decision: `input_schema` の自動生成に `columns_hash` を使用

- **Context**: 手動 `input_schema` 定義を廃止して自動生成にする
- **Alternatives Considered**:
  1. `columns_hash` による自動生成 — 型・null 制約・enum を取得できる
  2. Strong Parameters から推論 — permit リストからフィールドを取得するが型情報が不足
  3. 手動定義の維持 — 柔軟だが冗長
- **Selected Approach**: `columns_hash` + `defined_enums` で自動生成、`mcp_desc` で description を補完
- **Rationale**: モデルのスキーマは single source of truth であり、重複定義を避けられる
- **Trade-offs**: カラム定義にない制約（例: 文字数制限、カスタム enum）は表現できないが、基本ユースケースはカバーできる
- **Follow-up**: `input_schema` を手動オーバーライドするオプションも提供する

### Decision: `mcp_desc` を `method_added` フックで実装

- **Context**: アクション直前に説明文を書く Ruby ネイティブな方法
- **Alternatives Considered**:
  1. `method_added` フック — Ruby 標準機能、既存パターン（Sorbet）に倣う
  2. `before_action` 風の宣言 `mcp_description :index, "..."` — Rails に馴染みやすいが冗長
  3. YARD コメント解析 — 実行時コメントパースはオーバーヘッドが大きい
- **Selected Approach**: `method_added` フックと `@_pending_mcp_desc` インスタンス変数の組み合わせ
- **Rationale**: 記述量が最小で、視覚的にアクション定義と説明が紐づいていることが明確
- **Trade-offs**: `method_added` の実行タイミングに依存するため、継承時の挙動に注意が必要
- **Follow-up**: `mcp_desc` を呼んだが対応するアクションが存在しない場合の警告を実装する

## Risks & Mitigations

- **カスタムアクションのパス解決失敗** — 非 CRUD アクションはルート逆引きが失敗する可能性。手動 `mcp_path` オーバーライドオプションで対応
- **eager_load オフ環境でのレジストリ未登録** — development/test では eager_load が無効なため、initializer で対象コントローラを明示ロードする（現行実装と同様）
- **モデル推論の失敗** — コントローラ名とモデル名が一致しないケース（例: `Api::V1::MeController` → `Me` は存在しない）。モデルが見つからない場合は空の `input_schema` を返し警告ログを出力する

## References

- [Rails::Engine ガイド](https://guides.rubyonrails.org/engines.html) — Engine の基本構造とルートの定義方法
- [ActiveRecord::ConnectionAdapters::Column](https://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/Column.html) — カラムメタデータの取得
- [MCP 仕様 (2024-11-05)](https://spec.modelcontextprotocol.io/specification/2024-11-05/) — JSON-RPC 2.0 プロトコル詳細
