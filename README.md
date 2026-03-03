# My Task App

Docker + Ruby on Rails で構築したタスク管理 Web アプリケーションです。

## 概要

カテゴリ・優先度・ステータス・担当者でタスクを管理できる SPA ライクな Web アプリです。  
バックエンドは Rails API、フロントエンドは React + TypeScript + React Router で構成されています。

### 主な機能

- ユーザー認証（ログイン / ログアウト）
- タスクの作成・編集・削除
- ステータス管理（未着手 / 対応中 / 完了）
- 優先度管理（低 / 中 / 高）
- カテゴリによる分類・フィルタリング
- 担当者の指定・担当者でのフィルタリング（デフォルト: ログインユーザー）
- タスクの作成者・最終更新者の記録・表示
- タイトルのキーワード検索
- 期限日の設定
- カテゴリ管理（専用ページ）
- グループ管理（管理者グループのみ利用可能）
- サイドバーナビゲーション

## 技術スタック

### バックエンド

| 項目 | 内容 |
|------|------|
| 言語 | Ruby 3.4.3 |
| フレームワーク | Ruby on Rails 8.1 |
| DB | PostgreSQL 16 |
| 認証 | has_secure_password (bcrypt) |
| API 形式 | JSON REST API (`/api/v1/`) |

### フロントエンド

| 項目 | 内容 |
|------|------|
| UI ライブラリ | React 19 + TypeScript 5 |
| ルーティング | React Router v7 |
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
│   │   │   ├── base_controller.rb           # 認証・管理者ガード
│   │   │   ├── tasks_controller.rb          # タスク CRUD API
│   │   │   ├── categories_controller.rb     # カテゴリ CRUD API
│   │   │   ├── groups_controller.rb         # グループ CRUD API (管理者のみ)
│   │   │   └── users_controller.rb          # ユーザー一覧・ログインユーザー情報
│   │   ├── sessions_controller.rb           # ログイン / ログアウト (HTML + JSON)
│   │   └── tasks_controller.rb              # HTML レンダリング (SPA エントリ)
│   ├── frontend/                            # Vite のソースディレクトリ
│   │   ├── components/
│   │   │   ├── App.tsx                      # ルーター + サイドバーレイアウト
│   │   │   ├── Sidebar.tsx                  # 左サイドバーナビゲーション
│   │   │   ├── TasksPage.tsx                # タスク一覧ページ
│   │   │   ├── TaskFilter.tsx               # 検索・フィルター
│   │   │   ├── TaskList.tsx                 # タスク一覧
│   │   │   ├── TaskCard.tsx                 # タスクカード
│   │   │   ├── TaskForm.tsx                 # 作成・編集モーダル
│   │   │   ├── CategoryPage.tsx             # カテゴリ管理ページ
│   │   │   ├── CategoryManager.tsx          # カテゴリ管理コンポーネント
│   │   │   ├── GroupPage.tsx                # グループ管理ページ
│   │   │   ├── GroupManager.tsx             # グループ管理コンポーネント
│   │   │   └── LoginForm.tsx                # ログインフォーム
│   │   ├── hooks/
│   │   │   ├── useTasks.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useCurrentUser.ts
│   │   │   └── useUsers.ts
│   │   ├── utils/api.ts                     # CSRF 対応 fetch ラッパー
│   │   ├── types/index.ts                   # 共通型定義
│   │   ├── styles/application.css           # Tailwind CSS エントリ
│   │   └── entrypoints/
│   │       ├── application.tsx              # メインアプリ エントリポイント
│   │       └── login.tsx                    # ログイン画面 エントリポイント
│   ├── models/
│   │   ├── user.rb
│   │   ├── group.rb
│   │   ├── task.rb
│   │   └── category.rb
│   └── views/
│       ├── layouts/
│       │   ├── application.html.erb         # メインレイアウト
│       │   └── login.html.erb               # ログイン専用レイアウト
│       ├── sessions/new.html.erb            # ログイン画面 (React マウント)
│       └── tasks/index.html.erb             # メインアプリ (React マウント)
├── config/
│   ├── locales/ja.yml                       # Rails i18n 日本語
│   ├── routes.rb
│   └── vite.json                            # Vite-Ruby 設定
├── db/
│   ├── migrate/
│   └── seeds.rb                             # 初期データ (ユーザー・グループ・カテゴリ)
├── spec/                                    # RSpec テスト
│   ├── models/
│   └── requests/api/v1/
├── Dockerfile                               # 本番用
├── Dockerfile.dev                           # 開発用 (Node.js 22 込み)
├── docker-compose.yml
├── vite.config.ts
└── .pre-commit-config.yaml
```

## データモデル

```
Group
  - id: integer
  - name: string
  - admin: boolean  # true の場合、グループ管理機能が利用可能（開発者のみ変更可）

User
  - id: integer
  - login_id: string
  - name: string
  - password_digest: string
  - group_id: integer

Category
  - id: integer
  - name: string

Task
  - id: integer
  - title: string
  - description: text
  - status: enum (pending / responding / finish)
  - priority: enum (low / medium / high)
  - due_date: date
  - category_id: integer (optional)
  - assignee_id: integer (optional, → User)
  - created_user_id: integer (→ User)
  - updated_user_id: integer (→ User)
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

### 初期ユーザー

| ログインID | パスワード | グループ | 管理者 |
|-----------|-----------|--------|--------|
| `user01` | `password` | 開発部 | ○ |
| `user02` | `password` | 一般部 | - |

> `admin: true` のグループに所属するユーザーのみグループ管理機能を利用できます。

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
| PATCH | `/api/v1/categories/:id` | カテゴリ更新 |
| DELETE | `/api/v1/categories/:id` | カテゴリ削除 |
| GET | `/api/v1/groups` | グループ一覧（管理者のみ） |
| POST | `/api/v1/groups` | グループ作成（管理者のみ） |
| PATCH | `/api/v1/groups/:id` | グループ更新（管理者のみ） |
| DELETE | `/api/v1/groups/:id` | グループ削除（管理者のみ） |
| GET | `/api/v1/users` | ユーザー一覧 |
| GET | `/api/v1/me` | ログイン中ユーザー情報 |

### タスク検索パラメータ

| パラメータ | 型 | 説明 |
|------------|-----|------|
| `q` | string | タイトルのキーワード検索（部分一致） |
| `status` | string | ステータスでフィルター |
| `priority` | string | 優先度でフィルター |
| `category_id` | integer | カテゴリでフィルター |
| `assignee_id` | integer | 担当者でフィルター（省略時は全件） |

