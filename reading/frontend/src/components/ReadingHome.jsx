import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Book, Plus, Edit3, Trash2, X, BookOpen } from 'lucide-react'

const STORAGE_KEY = 'reading-books'

export default function ReadingHome() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [formData, setFormData] = useState({ title: '', author: '', cover: '', description: '', color: '#6366f1' })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setBooks(JSON.parse(saved))
    }
  }, [])

  const saveBooks = (newBooks) => {
    setBooks(newBooks)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBooks))
  }

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    
    if (editingBook) {
      saveBooks(books.map(b => b.id === editingBook.id ? { ...b, ...formData } : b))
    } else {
      const newBook = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        notes: []
      }
      saveBooks([...books, newBook])
    }
    setShowModal(false)
    setEditingBook(null)
    setFormData({ title: '', author: '', cover: '', description: '', color: '#6366f1' })
  }

  const handleDelete = (id) => {
    if (confirm('确定删除这本书吗？')) {
      saveBooks(books.filter(b => b.id !== id))
    }
  }

  const handleEdit = (book) => {
    setEditingBook(book)
    setFormData({ title: book.title, author: book.author, cover: book.cover, description: book.description, color: book.color })
    setShowModal(true)
  }

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6']

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">读书笔记</h1>
              <p className="text-gray-500">{books.length} 本书</p>
            </div>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditingBook(null); setFormData({ title: '', author: '', cover: '', description: '', color: '#6366f1' }) }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            添加书籍
          </button>
        </div>

        {/* Book Grid */}
        {books.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Book className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-xl text-gray-500 mb-4">还没有添加任何书籍</h2>
            <button
              onClick={() => setShowModal(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              点击添加第一本书
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {books.map(book => (
              <div
                key={book.id}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                {/* Book Cover */}
                <div
                  className="h-48 flex items-center justify-center text-white font-bold text-xl p-4"
                  style={{ backgroundColor: book.color }}
                >
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className="h-full object-contain rounded-lg shadow" />
                  ) : (
                    <span className="text-center leading-tight">{book.title}</span>
                  )}
                </div>
                
                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{book.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{book.author || '未知作者'}</p>
                  <p className="text-xs text-gray-400 mt-1">{book.notes?.length || 0} 条笔记</p>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(book); }}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white shadow"
                  >
                    <Edit3 size={14} className="text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(book.id); }}
                    className="p-2 bg-white/90 rounded-lg hover:bg-white shadow"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">{editingBook ? '编辑书籍' : '添加书籍'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">书名 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="书名"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="作者"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">封面图片URL</label>
                <input
                  type="text"
                  value={formData.cover}
                  onChange={e => setFormData({ ...formData, cover: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="可选"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={2}
                  placeholder="简短描述"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">封面颜色</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              {editingBook ? '保存修改' : '添加书籍'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
