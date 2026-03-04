# MCPサーバーとして使用するための手順

このドキュメントでは、`my_task_app` を MCP (Model Context Protocol) サーバーとして Claude Desktop 等のMCPクライアントから使用するための手順を説明します。

---

## 概要

`POST /mcp` エンドポイントが JSON-RPC 2.0 に準拠した MCP サーバーとして機能します。  
タスクの取得・作成・更新・削除を MCP ツールとして外部クライアントから操作できます。

---

## セットアップ手順

### 1. アプリを起動する

```bash
docker compose up
```

### 2. DBを初期化する（初回のみ）

```bash
docker compose exec web bundle exec rails db:create db:migrate db:seed
```

> `db:seed` を実行しないとユーザーが存在せず、ログインできません。

### 3. MCPクライアントの設定

Claude Desktop の場合、`claude_desktop_config.json` に以下を追加します。

```json
{
  "mcpServers": {
    "my_task_app": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

設定ファイルの場所：
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

---

## 利用可能なMCPツール

| ツール名 | 説明 | 必須パラメータ |
|---|---|---|
| `task_index` | タスク一覧取得 | なし |
| `task_show` | タスク詳細取得 | `id` |
| `task_create` | タスク作成 | `title` |
| `task_update` | タスク更新 | `id` |
| `task_destroy` | タスク削除 | `id` |

### task_index のフィルタパラメータ

| パラメータ | 説明 |
|---|---|
| `status` | ステータスで絞り込み（`todo` / `in_progress` / `done`） |
| `priority` | 優先度で絞り込み（`low` / `medium` / `high`） |
| `category_id` | カテゴリIDで絞り込み |
| `user_id` | 担当者IDで絞り込み |
| `q` | タイトルのキーワード検索 |

---

## 動作確認（curl）

```bash
# ツール一覧取得
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# タスク一覧取得
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"task_index","arguments":{}}}'

# タスク作成
curl -s -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"task_create","arguments":{"title":"MCPから作成したタスク"}}}'
```

---

## 実装の概要

### アーキテクチャ

```
MCPクライアント
    │
    │ POST /mcp (JSON-RPC 2.0)
    ▼
McpController#handle
    │
    ├─ initialize      → プロトコルバージョン・サーバー情報を返す
    ├─ tools/list      → McpToolable.registry からツール一覧を返す
    └─ tools/call
           │
           │ internal_dispatch (Rails.application.call)
           ▼
       Api::V1::TasksController (既存アクション)
```

### 認証バイパス

MCP 内部サブリクエストにはセッションがないため、`MCP_INTERNAL_TOKEN`（起動時にランダム生成）を Rack env に付与し、`ApplicationController#require_login` でバイパスしています。外部からのリクエストにはこのトークンが存在しないため、通常の認証が適用されます。

### ツール登録（McpToolable）

`Api::V1::TasksController` が `include McpToolable` し、`mcp_tool` クラスメソッドでツールを登録しています。レジストリは `MCP_TOOL_REGISTRY` 定数（initializer で定義）に格納されるため、Zeitwerk のコードリロード後も保持されます。

---

## トラブルシューティング

### Tool: None になる

Docker コンテナを再起動することでレジストリが初期化されます。

```bash
docker compose restart web
```

### Blocked Host エラー

`config/environments/development.rb` に `config.hosts.clear` が設定されていることを確認してください。

### ログインできない

`db:seed` が未実行の可能性があります。

```bash
docker compose exec web bundle exec rails db:seed
```

初期ユーザー:
- **ログインID**: `admin`
- **パスワード**: `password1`
