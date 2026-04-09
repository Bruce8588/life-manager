import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'

const API = '/api'

export default function MemoList() {
  const [memos, setMemos] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [newContent, setNewContent] = useState('')
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    fetchMemos()
  }, [])

  const fetchMemos = async () => {
    try {
      const res = await fetch(`${API}/memos`)
      const data = await res.json()
      setMemos(data)
    } catch (err) {
      console.error('Failed to fetch memos:', err)
    }
  }

  const handleCreate = async () => {
    if (!newContent.trim()) return
    try {
      await fetch(`${API}/memos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      })
      setNewContent('')
      setShowEditor(false)
      fetchMemos()
    } catch (err) {
      console.error('Failed to create memo:', err)
    }
  }

  const handleUpdate = async (id) => {
    try {
      await fetch(`${API}/memos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      })
      setEditingId(null)
      setEditContent('')
      fetchMemos()
    } catch (err) {
      console.error('Failed to update memo:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除这条备忘录？')) return
    try {
      await fetch(`${API}/memos/${id}`, { method: 'DELETE' })
      fetchMemos()
    } catch (err) {
      console.error('Failed to delete memo:', err)
    }
  }

  const startEdit = (memo) => {
    setEditingId(memo.id)
    setEditContent(memo.content)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">备忘录</h2>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <Plus size={18} />
          新建
        </button>
      </div>

      {/* New memo editor */}
      {showEditor && (
        <div className="mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="记录你的市场观点..."
            className="w-full h-32 bg-slate-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => { setShowEditor(false); setNewContent('') }}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Save size={16} />
              保存
            </button>
          </div>
        </div>
      )}

      {/* Memo list */}
      <div className="space-y-4">
        {memos.map((memo) => (
          <div key={memo.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            {editingId === memo.id ? (
              <>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-32 bg-slate-700 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => { setEditingId(null); setEditContent('') }}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleUpdate(memo.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    <Save size={16} />
                    保存
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-slate-200 whitespace-pre-wrap">{memo.content}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700">
                  <span className="text-sm text-slate-500">
                    {formatDate(memo.updated_at)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(memo)}
                      className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(memo.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        {memos.length === 0 && (
          <p className="text-center text-slate-500 py-12">暂无备忘录，点击新建开始记录</p>
        )}
      </div>
    </div>
  )
}
