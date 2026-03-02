## TypeScriptの実装について

### 実装概要
TypeScript 5 + React 19 で SPA 風フロントエンドを実装。vite-ruby 経由でRailsに統合。

### 実装する上で重要なポイント

- **型定義は `types/index.ts` に集約**: `Task`, `Category`, `FilterParams`, `TaskFormData` などのインターフェースを一か所で管理
- **`type` vs `interface`**: オブジェクト型は `interface`、union型（`Status`, `Priority`）は `type` で定義する
- **`noUnusedLocals`, `noUnusedParameters` を有効化**: `tsconfig.json` で有効にすると未使用変数を型エラーとして検出できる
- **`strict: true`**: 必ず有効にする。`strictNullChecks` が有効になり `null | undefined` を明示的に扱う必要がある
- **`baseUrl` + `paths` でパスエイリアス**: `@/*` を `app/frontend/*` にマッピングするとインポートパスが短くなる
- **`moduleResolution: "bundler"`**: Vite使用時は `bundler` を指定（`node16` より緩い解決ルールが適用される）

### わかりづらいポイント

- **`as const` と `Record<K, V>` の組み合わせ**: ラベルマップを `Record<Status, string>` で型安全に定義できる
- **`React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>`**: フォームの onChange ハンドラは要素の型ユニオンを指定する
- **`allowImportingTsExtensions: true`**: `.tsx` ファイルを直接インポートする場合に必要。`noEmit: true` と組み合わせて使う
