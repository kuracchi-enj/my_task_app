## Rubyの実装について

### 実装概要
Ruby 3.4 を使用。Rails 8.1 アプリケーションのモデル・サービス層の実装で使用。

### 実装する上で重要なポイント

- **enum は整数で保存、シンボルで参照**: `enum :status, { pending: 0, responding: 1, finish: 2 }` と定義すると `task.pending?`, `task.finish!` などのメソッドが自動生成される
- **scope はラムダで定義**: `->(arg) { ... if arg.present? }` のパターンで nil/空文字を安全にスキップできる
- **`optional: true` で belongs_to の必須チェックを外す**: Rails 5以降 `belongs_to` はデフォルトで必須。カテゴリなしを許容する場合は明示的に `optional: true` が必要
- **`find_or_create_by!` でべき等な seeds**: `!` 付きでバリデーション失敗時に例外を投げる
- **定数はファイル先頭に大文字で定義**: マジックナンバー・マジック文字列を避け、`CATEGORY_NAMES = %w[...].freeze` のように定義する

### わかりづらいポイント

- **`ILIKE` vs `LIKE`**: PostgreSQLでの大文字小文字を無視した部分一致検索は `ILIKE` を使う（`LIKE` は大文字小文字を区別する）
- **enum の prefix/suffix**: 複数のenumが同名の値を持つ場合は `prefix: true` オプションで衝突を避けられる
- **`.freeze` の必要性**: 定数として定義した配列・ハッシュを誤って変更されないよう `freeze` を呼ぶ
