import React from 'react'
import { useCategories } from '../hooks/useCategories'
import CategoryManager from './CategoryManager'

const CategoryPage: React.FC = () => {
  const { categories, fetchCategories } = useCategories()

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-xl font-bold text-gray-900 mb-6">カテゴリ管理</h1>
      <CategoryManager categories={categories} onCategoriesChange={fetchCategories} />
    </div>
  )
}

export default CategoryPage
