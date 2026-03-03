import React from 'react'
import GroupManager from './GroupManager'

const GroupPage: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <h1 className="text-xl font-bold text-gray-900 mb-6">グループ管理</h1>
      <GroupManager />
    </div>
  )
}

export default GroupPage
