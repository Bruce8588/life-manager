import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Edit3, Trash2, BookOpen, ChevronRight, ChevronLeft, FileText, Network } from 'lucide-react'
import Masonry from 'react-masonry-css'
import MindMap from './MindMap'

const STORAGE_KEY = 'reading-books'

export default function BookNotes() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [notes, setNotes] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('notes') // 'notes' | 'mindmap'
  const [editingNote, setEditingNote] = useState(null)
  const [noteContent, setNoteContent] = useState('')
  const [summaryContent, setSummaryContent] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const books = JSON.parse(saved)
      const found = books.find(b => b.id === bookId)
      if (found) {
        setBook(found)
        setNotes(found.notes || [])
        setSummaryContent(found.summary || '')
      }
    }
  }, [bookId])

  const saveBook = (updatedBook) => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const books = JSON.parse(saved)
      const newBooks = books.map(b => b.id === bookId ? updatedBook : b)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newBooks))
      setBook(updatedBook)
    }
  }

  const updateNotes = (newNotes) => {
    const updated = { ...book, notes: newNotes }
    saveBook(updated)
    setNotes(newNotes)
  }

  const handleSaveNote = () => {
    if (!noteContent.trim()) return
    
    if (editingNote) {
      updateNotes(notes.map(n => n.id === editingNote.id ? { ...n, content: noteContent } : n))
    } else {
      const newNote = {
        id: Date.now().toString(),
        content: noteContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      updateNotes([...notes, newNote])
    }
    setShowModal(false)
    setEditingNote(null)
    setNoteContent('')
  }

  const handleEditNote = (note) => {
    setEditingNote(note)
    setNoteContent(note.content)
    setShowModal(true)
  }

  const handleDeleteNote = (id) => {
    if (confirm('确定删除这条笔记吗？')) {
      updateNotes(notes.filter(n => n.id !== id))
    }
  }

  const handleSaveSummary = () => {
    const updated = { ...book, summary: summaryContent }
    saveBook(updated)
    alert('笔记保存成功！')
  }

  const breakpointColumns = {
    default: 3,
    1100: 2,
    700: 1
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div
              className="w-10 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: book.color }}
            >
              {book.title.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-lg">{book.title}</h1>
              <p className="text-sm text-gray-500">{book.author || '未知作者'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{notes.length} 条笔记</span>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${sidebarOpen ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
              title="笔记边栏"
            >
              <FileText size={20} />
            </button>
            <button
              onClick={() => setActiveTab(activeTab === 'notes' ? 'mindmap' : 'notes')}
              className={`p-2 rounded-lg transition-colors ${activeTab === 'mindmap' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
              title="思维导图"
            >
              <Network size={20} />
            </button>
            <button
              onClick={() => { setShowModal(true); setEditingNote(null); setNoteContent(''); }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={18} />
              记录思考
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Notes Area */}
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'mr-96' : ''}`}>
          <div className="max-w-6xl mx-auto">
            {activeTab === 'mindmap' ? (
              <MindMap bookId={bookId} bookTitle={book.title} />
            ) : notes.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-indigo-300" />
                </div>
                <h2 className="text-xl text-gray-500 mb-4">还没有记录任何思考</h2>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  点击记录第一条思考
                </button>
              </div>
            ) : (
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex -ml-6 w-auto"
                columnClassName="pl-6 bg-clip-padding"
              >
                {notes.map(note => (
                  <div
                    key={note.id}
                    className="mb-6 group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {/* Note Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap flex-1">{note.content}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit3 size={14} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                    {/* Note Card Footer */}
                    <div className="text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                ))}
              </Masonry>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`fixed right-0 top-0 h-full w-96 bg-white border-l shadow-2xl transform transition-transform duration-300 z-50 ${
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-indigo-600" size={20} />
              <h2 className="font-bold">正式笔记</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Sidebar Content */}
          <div className="p-6">
            <p className="text-sm text-gray-500 mb-4">
              这是对书中思考的正式总结，区别于上面的碎片化思考记录。
            </p>
            <textarea
              value={summaryContent}
              onChange={e => setSummaryContent(e.target.value)}
              className="w-full h-80 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="在这里写下你对这本书的正式笔记..."
            />
            <button
              onClick={handleSaveSummary}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              保存笔记
            </button>
          </div>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Add/Edit Note Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">{editingNote ? '编辑思考' : '记录思考'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <textarea
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              className="w-full h-48 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="写下你的思考..."
              autoFocus
            />
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveNote}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
