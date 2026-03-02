## Reactの実装について

### 実装概要
React 19 + TypeScript で SPA 風 UI を構築。状態管理は `useState` + `useEffect`、データ取得はカスタムフックに分離。

### 実装する上で重要なポイント

- **カスタムフックでロジックを分離**: `useTasks`, `useCategories` にデータ取得・状態管理を切り出し、コンポーネントはUIに専念
- **`useCallback` で関数の参照を安定させる**: `fetchTasks` を `useCallback` でメモ化し、`useEffect` の依存配列に安全に含められる
- **コンポーネントは責務ごとに分割**: `TaskApp`（状態管理）→ `TaskFilter`/`TaskList`/`TaskForm`/`CategoryManager` の階層構造
- **`React.FC<Props>` で型を明示**: `interface Props` を定義し `React.FC<Props>` で型安全なコンポーネントを作成
- **`key` には安定したIDを使う**: 配列レンダリングの `key` には index ではなく `task.id` のような一意な値を使う
- **モーダルは `fixed inset-0` で実装**: Tailwindで `fixed inset-0 z-50 flex items-center justify-center bg-black/50` がモーダルオーバーレイの基本パターン

### わかりづらいポイント

- **`useEffect` の依存配列**: `useCallback` でメモ化した関数を依存配列に入れると無限ループを防げる
- **フォームの初期値リセット**: 編集→新規作成に切り替えた際に `useEffect([task])` でフォームデータをリセットする
- **`React.StrictMode` の二重呼び出し**: 開発環境では `useEffect` が2回実行される。副作用のクリーンアップを正しく実装する必要がある
- **`createRoot` (React 18+)**: `ReactDOM.render` は非推奨。`createRoot(container).render(<App />)` を使う
