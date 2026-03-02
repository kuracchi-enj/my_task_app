# My Task App

Docker + Ruby on Rails で構築したタスク管理 Web アプリケーションです。

## 概要

カテゴリ・優先度・ステータスでタスクを管理できる SPA ライクな Web アプリです。  
バックエンドは Rails API、フロントエンドは React + TypeScript で構成されています。

### 主な機能

- タスクの作成・編集・削除
- ステータス管理（未着手 / 対応中 / 完了）
- 優先度管理（低 / 中 / 高）
- カテゴリによる分類・フィルタリング
- タイトルのキーワード検索
- 期限日の設定

## 技術スタック

### バックエンド

| 項目 | 内容 |
|------|------|
| 言語 | Ruby 3.4.3 |
| フレームワーク | Ruby on Rails 8.1 |
| DB | PostgreSQL 16 |
| API 形式 | JSON REST API (`/api/v1/`) |

### フロントエンド

| 項目 | 内容 |
|------|------|
| UI ライブラリ | React 19 + TypeScript 5 |
| ビルドツール | Vite 6 (vite-rails) |
| CSS | Tailwind CSS v4 |
| セレクト | react-select |
| 日付ピッカー | react-datepicker |

### 品質管理

| ツール | 用途 |
|--------|------|
| RuboCop | Ruby 静的解析 |
| Brakeman | セキュリティ脆弱性検査 |
| RSpec | ユニット・リクエストテスト |
| pre-commit | コミット前の自動チェック |

### インフラ

| 項目 | 内容 |
|------|------|
| コンテナ | Docker / Docker Compose |
| Web サーバー | Puma |
| 開発用 Dockerfile | `Dockerfile.dev` |
| 本番用 Dockerfile | `Dockerfile` |

## ディレクトリ構成

```
my_task_app/
├── app/
│   ├── controllers/
│   │   ├── api/v1/
│   │   │   ├── tasks_controller.rb      # タスク CRUD API
│   │   │   └── categories_controller.rb # カテゴリ CRUD API
│   │   └── tasks_controller.rb          # HTML レンダリング (SPA のエントリ)
│   ├── frontend/                        # Vite のソースディレクトリ
│   │   ├── components/                  # React コンポーネント
│   │   │   ├── TaskApp.tsx              # ルートコンポーネント
│   │   │   ├── TaskFilter.tsx           # 検索・フィルター
│   │   │   ├── TaskList.tsx             # タスク一覧
│   │   │   ├── TaskCard.tsx             # タスクカード
│   │   │   ├── TaskForm.tsx             # 作成・編集モーダル
│   │   │   └── CategoryManager.tsx      # カテゴリ管理
│   │   ├── hooks/
│   │   │   ├── useTasks.ts
│   │   │   └── useCategories.ts
│   │   ├── utils/api.ts                 # CSRF 対応 fetch ラッパー
│   │   ├── types/index.ts               # 共通型定義
│   │   ├── styles/application.css       # Tailwind CSS エントリ
│   │   └── entrypoints/application.tsx  # Vite エントリポイント
│   ├── models/
│   │   ├── task.rb                      # enum / validates / scope
│   │   └── category.rb
│   └── views/
│       ├── layouts/application.html.erb
│       └── tasks/index.html.erb         # React マウントポイント
├── config/
│   ├── locales/ja.yml                   # Rails i18n 日本語
│   ├── routes.rb
│   └── vite.json                        # Vite-Ruby 設定
├── db/
│   ├── migrate/
│   └── seeds.rb                         # カテゴリ初期データ
├── spec/                                # RSpec テスト
│   ├── models/
│   └── requests/api/v1/
├── Dockerfile                           # 本番用
├── Dockerfile.dev                       # 開発用 (Node.js 22 込み)
├── docker-compose.yml
├── vite.config.ts
└── .pre-commit-config.yaml
```

## データモデル

```
Category
  - id: integer
  - name: string (一般 / 開発 / お金 / その他)

Task
  - id: integer
  - title: string
  - description: text
  - status: enum (pending / responding / finish)
  - priority: enum (low / medium / high)
  - due_date: date
  - category_id: integer (optional)
```

## セットアップ

### 前提条件

- Docker Desktop がインストール済みであること

### 起動手順

```bash
# リポジトリをクローン
git clone https://github.com/kuracchi-enj/my_task_app.git
cd my_task_app

# コンテナのビルドと起動
docker compose up --build

# 別ターミナルで DB セットアップ（初回のみ）
docker compose exec web rails db:create db:migrate db:seed
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## テスト実行

```bash
# RSpec
docker compose exec web bundle exec rspec

# RuboCop
docker compose exec web bundle exec rubocop

# Brakeman
docker compose exec web bundle exec brakeman
```

## API エンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/v1/tasks` | タスク一覧（検索・フィルター対応） |
| POST | `/api/v1/tasks` | タスク作成 |
| PATCH | `/api/v1/tasks/:id` | タスク更新 |
| DELETE | `/api/v1/tasks/:id` | タスク削除 |
| GET | `/api/v1/categories` | カテゴリ一覧 |
| POST | `/api/v1/categories` | カテゴリ作成 |
| DELETE | `/api/v1/categories/:id` | カテゴリ削除 |

### タスク検索パラメータ

| パラメータ | 型 | 説明 |
|------------|-----|------|
| `q` | string | タイトルのキーワード検索（部分一致） |
| `status` | string | ステータスでフィルター |
| `priority` | string | 優先度でフィルター |
| `category_id` | integer | カテゴリでフィルター |

