import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Edit3, Trash2, BookOpen, FileText, Network, Save, ChevronDown, ChevronRight } from 'lucide-react'
import MindMap from './MindMap'
import { readingApi } from '../utils/readingApi'

export default function BookNotes() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [notes, setNotes] = useState([])
  const [summaries, setSummaries] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')
  const [editingNote, setEditingNote] = useState(null)
  const [noteContent, setNoteContent] = useState('')
  // Summary states
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [editingSummary, setEditingSummary] = useState(null)
  const [summaryTitle, setSummaryTitle] = useState('')
  const [summaryContent, setSummaryContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [bookId])

  const loadData = async () => {
    try {
      const [booksData, notesData, summariesData] = await Promise.all([
        readingApi.getBooks(),
        readingApi.getNotes(bookId),
        readingApi.getSummaries(bookId)
      ])
      const found = booksData.find(b => b.id === bookId)
      if (found) setBook(found)
      setNotes(notesData.map(n => ({
        id: n.id, content: n.content, createdAt: n.created_at
      })))
      setSummaries(summariesData.map(s => ({
        id: s.id, title: s.title, content: s.content, createdAt: s.created_at
      })))
      setLoading(false)
    } catch (e) {
      console.error('Failed to load:', e)
      setLoading(false)
    }
  }

  // Note handlers
  const handleSaveNote = () => {
    if (!noteContent.trim()) return
    if (editingNote) {
      readingApi.updateNote(editingNote.id, noteContent).then(() => {
        setNotes(notes.map(n => n.id === editingNote.id ? { ...n, content: noteContent } : n))
      })
    } else {
      readingApi.createNote(bookId, noteContent).then(newNote => {
        setNotes([...notes, { id: newNote.id, content: noteContent, createdAt: newNote.created_at }])
      })
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
      readingApi.deleteNote(id).then(() => setNotes(notes.filter(n => n.id !== id)))
    }
  }

  // Summary handlers
  const handleSaveSummary = () => {
    if (!summaryContent.trim()) return
    if (editingSummary) {
      readingApi.updateSummary(editingSummary.id, { title: summaryTitle, content: summaryContent }).then(() => {
        setSummaries(summaries.map(s => s.id === editingSummary.id ? { ...s, title: summaryTitle, content: summaryContent } : s))
      })
    } else {
      readingApi.createSummary(bookId, summaryTitle, summaryContent).then(newSummary => {
        setSummaries([...summaries, { id: newSummary.id, title: summaryTitle, content: summaryContent, createdAt: newSummary.created_at }])
      })
    }
    setShowSummaryModal(false)
    setEditingSummary(null)
    setSummaryTitle('')
    setSummaryContent('')
  }

  const handleEditSummary = (summary) => {
    setEditingSummary(summary)
    setSummaryTitle(summary.title)
    setSummaryContent(summary.content)
    setShowSummaryModal(true)
  }

  const handleDeleteSummary = (id) => {
    if (confirm('确定删除这条正式笔记吗？')) {
      readingApi.deleteSummary(id).then(() => setSummaries(summaries.filter(s => s.id !== id)))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">书籍不存在</p>
        <button onClick={() => navigate('/')} className="text-indigo-500 hover:text-indigo-600">返回首页</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: book.color }}>
              {book.title.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-lg">{book.title}</h1>
              <p className="text-sm text-gray-500">{book.author || '未知作者'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{notes.length} 条笔记 · {summaries.length} 篇总结</span>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`p-2 rounded-lg transition-colors ${sidebarOpen ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`} title="正式笔记">
              <FileText size={20} />
            </button>
            <button onClick={() => setActiveTab(activeTab === 'notes' ? 'mindmap' : 'notes')} className={`p-2 rounded-lg transition-colors ${activeTab === 'mindmap' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`} title="思维导图">
              <Network size={20} />
            </button>
            <button onClick={() => { setShowModal(true); setEditingNote(null); setNoteContent(''); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus size={18} />记录思考
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
                <button onClick={() => setShowModal(true)} className="text-indigo-600 hover:text-indigo-700 font-medium">
                  点击记录第一条思考
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map(note => (
                  <div key={note.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 group flex flex-col h-48">
                    <div className="flex items-start justify-between mb-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleDateString('zh-CN')}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditNote(note)} className="p-1 hover:bg-gray-100 rounded"><Edit3 size={12} className="text-gray-400 hover:text-gray-600" /></button>
                        <button onClick={() => handleDeleteNote(note.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-gray-400 hover:text-red-500" /></button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap overflow-hidden">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Summaries */}
        <div className={`fixed right-0 top-0 h-full w-96 bg-white border-l shadow-2xl transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-indigo-600" size={20} />
              <h2 className="font-bold">正式笔记</h2>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
          </div>
          
          <div className="p-4 overflow-y-auto h-[calc(100vh-120px)]">
            <button
              onClick={() => { setEditingSummary(null); setSummaryTitle(''); setSummaryContent(''); setShowSummaryModal(true); }}
              className="w-full flex items-center justify-center gap-2 py-3 mb-4 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              <Plus size={18} /> 添加新笔记
            </button>
            
            {summaries.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">还没有正式笔记<br />点击上方按钮添加</p>
            ) : (
              <div className="space-y-3">
                {summaries.map(summary => (
                  <div key={summary.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 group">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-800">{summary.title || '无标题'}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditSummary(summary)} className="p-1 hover:bg-gray-200 rounded"><Edit3 size={12} className="text-gray-500" /></button>
                        <button onClick={() => handleDeleteSummary(summary.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={12} className="text-red-400" /></button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{summary.content}</p>
                    <p className="text-gray-400 text-xs mt-2">{new Date(summary.createdAt).toLocaleDateString('zh-CN')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSidebarOpen(false)} />}
      </div>

      {/* Note Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">{editingNote ? '编辑思考' : '记录思考'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} className="w-full h-48 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" placeholder="写下你的思考..." autoFocus />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={handleSaveNote} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSummaryModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">{editingSummary ? '编辑笔记' : '添加正式笔记'}</h2>
              <button onClick={() => setShowSummaryModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">标题（可选）</label>
                <input type="text" value={summaryTitle} onChange={e => setSummaryTitle(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="例如：第3章 吸引机制" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea value={summaryContent} onChange={e => setSummaryContent(e.target.value)} className="w-full h-48 p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" placeholder="写下你的总结..." autoFocus />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowSummaryModal(false)} className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={handleSaveSummary} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
