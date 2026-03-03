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

---

## `useState` の実装について

### 実装概要

`useState` はコンポーネントに**ローカルな状態（state）**を持たせるための React フック。
`const [状態変数, セッター関数] = useState(初期値)` という形で宣言し、セッター関数を呼び出すとコンポーネントが再レンダリングされる。

### 実装する上で重要なポイント

#### 基本的な宣言

```tsx
// プリミティブ値
const [isOpen, setIsOpen] = useState(false)
const [newName, setNewName] = useState('')

// 型を明示する（TypeScript）
const [errors, setErrors] = useState<string[]>([])
const [error, setError] = useState<string | null>(null)
const [editingTask, setEditingTask] = useState<Task | null>(null)

// 複雑なオブジェクトは定数で初期値を定義しておくと再利用しやすい
const INITIAL_FORM_DATA: TaskFormData = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  due_date: '',
  category_id: '',
}
const [formData, setFormData] = useState<TaskFormData>(INITIAL_FORM_DATA)
```

#### セッター関数の2つの呼び出し方

```tsx
// ① 新しい値を直接渡す（前の値に依存しない場合）
setNewName('')
setErrors(['タイトルは必須です'])

// ② 関数型アップデーター（前の値に基づいて更新する場合）
// 前の値が確実に最新の状態を反映する
setShowCategoryManager((prev) => !prev)  // トグル
setFormData((prev) => ({ ...prev, [name]: value }))  // 一部フィールドだけ更新
```

#### オブジェクト・配列の状態更新

```tsx
// ❌ 直接変更は NG（再レンダリングされない）
formData.title = '新しいタイトル'

// ✅ スプレッド演算子で新しいオブジェクトを生成して渡す
setFormData((prev) => ({ ...prev, title: '新しいタイトル' }))

// ✅ 配列も同様（push/splice ではなく新配列を返す）
setErrors((prev) => [...prev, '新しいエラー'])
```

#### 非同期処理と組み合わせるパターン（このアプリでの典型例）

```tsx
const [submitting, setSubmitting] = useState(false)
const [errors, setErrors] = useState<string[]>([])

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setSubmitting(true)  // ローディング開始
  setErrors([])        // エラーをクリア

  try {
    await onSubmit(formData)
    onClose()
  } catch (err) {
    setErrors(err instanceof Error ? [err.message] : ['送信に失敗しました'])
  } finally {
    setSubmitting(false)  // 成功・失敗問わず終了
  }
}
```

### わかりづらいポイント

- **状態更新は非同期（バッチ処理）**: `setState` を呼んでも同じ関数内で即座に値が変わるわけではない。更新後の値が必要なら `useEffect` で監視するか、関数型アップデーターを使う

  ```tsx
  setCount(count + 1)
  console.log(count) // ← まだ古い値が出る
  ```

- **セッター関数は再レンダリングをトリガーする**: 同じ値をセットした場合（`Object.is` で等値判定）は再レンダリングされない。そのためオブジェクトや配列は必ず新しい参照を渡す必要がある

- **状態はコンポーネントインスタンスごとに独立**: 同じコンポーネントを複数箇所で使っても、それぞれが独自の state を持つ

- **初期値は初回レンダリング時のみ使われる**: `useState(initialValue)` の `initialValue` は最初の1回だけ適用される。props が変わっても state は自動的に更新されない（`useEffect` でのリセットが必要）

  ```tsx
  // TaskForm.tsx での例: task が変わったときにフォームをリセット
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        due_date: task.due_date ?? '',
        category_id: task.category?.id ?? '',
      })
    } else {
      setFormData(INITIAL_FORM_DATA)
    }
  }, [task])
  ```

- **`useState` vs props**: コンポーネント内部だけで完結する一時的な値（フォーム入力中の文字列、ローディングフラグ等）は `useState` で管理し、親コンポーネントと共有が必要な値は props や Context を使う
