## Tailwind CSSの実装について

### 実装概要
Tailwind CSS v4 + `@tailwindcss/vite` プラグインを使用。`@import "tailwindcss"` の1行でセットアップ完了。

### 実装する上で重要なポイント

- **v4 は `@import "tailwindcss"` のみでセットアップ**: v3 の `tailwind.config.js` + `@tailwind base/components/utilities` は不要
- **`@tailwindcss/vite` プラグインで統合**: `vite.config.ts` に `tailwindcss()` を追加するだけで Vite と連携できる
- **レスポンシブは `md:` `lg:` プレフィックス**: `flex-col md:flex-row` のように小さい画面のスタイルをベースに記述する（モバイルファースト）
- **バッジのパターン**: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-xxx-100 text-xxx-700` が基本
- **`line-clamp-2`**: テキストを2行で切り詰める。`overflow-hidden` と組み合わせる必要はなく単体で使用可能
- **`shrink-0`**: フレックスボックス内でボタングループが縮小されないよう `shrink-0` を指定する

### わかりづらいポイント

- **v4 の `bg-black/50`**: スラッシュ記法で透明度を指定できる（`bg-opacity-50` は不要）
- **`max-h-[90vh] overflow-y-auto`**: モーダルの高さ制限とスクロール。任意の値は `[...]` で指定できる
- **`min-w-0`**: フレックスアイテム内で `truncate` を使う場合、親に `min-w-0` が必要（デフォルトの `min-width: auto` を上書き）
- **`transition-colors` vs `transition`**: 色の変化のみアニメーションする場合は `transition-colors` の方が軽量
