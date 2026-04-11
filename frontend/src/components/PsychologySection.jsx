import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Brain, ArrowLeft, ChevronRight } from 'lucide-react'

const STORAGE_KEY = 'psychology-cards'

export default function PsychologySection() {
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState(null)
  const [formData, setFormData] = useState({ title: '', content: '' })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setCards(JSON.parse(saved))
    }
  }, [])

  const saveToStorage = (newCards) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCards))
    setCards(newCards)
  }

  const handleAdd = () => {
    setEditingCard(null)
    setFormData({ title: '', content: '' })
    setShowForm(true)
  }

  const handleEdit = (card, e) => {
    e?.stopPropagation()
    setEditingCard(card)
    setFormData({ title: card.title, content: card.content })
    setShowForm(true)
  }

  const handleSave = () => {
    if (!formData.title.trim()) return
    
    if (editingCard) {
      // Update existing
      const updated = cards.map(c => 
        c.id === editingCard.id ? { ...c, ...formData, updatedAt: new Date().toISOString() } : c
      )
      saveToStorage(updated)
    } else {
      // Create new
      const newCard = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      saveToStorage([...cards, newCard])
    }
    
    setShowForm(false)
    setFormData({ title: '', content: '' })
    setEditingCard(null)
  }

  const handleDelete = (id, e) => {
    e?.stopPropagation()
    if (!confirm('确定删除这张卡片？')) return
    saveToStorage(cards.filter(c => c.id !== id))
    if (selectedCard?.id === id) setSelectedCard(null)
  }

  // Detail view
  if (selectedCard) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setSelectedCard(null)}
          className="flex items-center gap-2 text-warm-700 hover:text-warm-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          返回卡片列表
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-warm-800">{selectedCard.title}</h2>
              <p className="text-sm text-warm-500 mt-1">
                更新于 {new Date(selectedCard.updatedAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => handleEdit(selectedCard, e)}
                className="p-2 text-warm-600 hover:text-warm-800 hover:bg-warm-100 rounded-lg transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={(e) => handleDelete(selectedCard.id, e)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="prose prose-warm max-w-none">
            <p className="text-warm-700 whitespace-pre-wrap leading-relaxed">
              {selectedCard.content || '暂无详细内容'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Form modal
  if (showForm) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg">
          <div className="p-6 border-b border-warm-200 flex items-center justify-between">
            <h3 className="text-xl font-bold text-warm-800">
              {editingCard ? '编辑卡片' : '添加卡片'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-warm-500 hover:text-warm-700">
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">标题 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent"
                placeholder="如：情绪管理、压力应对..."
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">详细内容</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-warm-300 focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent resize-none"
                placeholder="输入详细的资料内容..."
                rows={8}
              />
            </div>
          </div>
          <div className="p-6 border-t border-warm-200 flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 text-warm-600 hover:text-warm-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-warm-600 hover:bg-warm-700 text-white rounded-xl transition-colors"
            >
              <Save size={18} />
              保存
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Card list
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-warm-800">🧠 心理板块</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-warm-600 hover:bg-warm-700 text-white rounded-xl transition-colors"
        >
          <Plus size={18} />
          添加卡片
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 shadow-xl text-center">
          <Brain size={64} className="mx-auto text-warm-300 mb-4" />
          <h3 className="text-xl font-semibold text-warm-700 mb-2">还没有卡片</h3>
          <p className="text-warm-500 mb-6">点击添加按钮，创建你的第一张心理资料卡</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-warm-600 hover:bg-warm-700 text-white rounded-xl transition-colors"
          >
            <Plus size={18} />
            添加卡片
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedCard(card)}
              className="bg-white rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-warm-800 text-lg group-hover:text-warm-600 transition-colors">
                  {card.title}
                </h3>
                <ChevronRight size={20} className="text-warm-400 group-hover:text-warm-600 transition-colors" />
              </div>
              
              <p className="text-warm-600 text-sm line-clamp-3 mb-4">
                {card.content || '暂无详细内容'}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-warm-400">
                  {new Date(card.updatedAt).toLocaleDateString('zh-CN')}
                </span>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleEdit(card, e)}
                    className="p-1.5 text-warm-400 hover:text-warm-600 hover:bg-warm-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(card.id, e)}
                    className="p-1.5 text-warm-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
