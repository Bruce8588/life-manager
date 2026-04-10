import { useState, useEffect } from 'react'
import { X, Target, Heart, Wallet, FileText, Briefcase, BookOpen, Brain, Plus, Trash2, Edit3, Check } from 'lucide-react'

const PROJECTS = [
  { id: 'body', name: '身体', icon: Heart, color: '#FF6B6B', emoji: '💪' },
  { id: 'finance', name: '财务', icon: Wallet, color: '#FFB347', emoji: '💰' },
  { id: 'thesis', name: '论文', icon: FileText, color: '#87CEEB', emoji: '📄' },
  { id: 'career', name: '职业发展', icon: Briefcase, color: '#98D8C8', emoji: '💼' },
  { id: 'accumulation', name: '积累', icon: BookOpen, color: '#DDA0DD', emoji: '📚' },
  { id: 'psychology', name: '心理', icon: Brain, color: '#F7DC6F', emoji: '🧠' },
]

export default function ProgressSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [projectNotes, setProjectNotes] = useState({})
  const [newNoteInputs, setNewNoteInputs] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('project-notes-v2')
    if (saved) {
      setProjectNotes(JSON.parse(saved))
    }
  }, [])

  const saveNotes = (projectId, notes) => {
    const updated = { ...projectNotes, [projectId]: notes }
    setProjectNotes(updated)
    localStorage.setItem('project-notes-v2', JSON.stringify(updated))
  }

  const addNote = (projectId) => {
    const text = (newNoteInputs[projectId] || '').trim()
    if (!text) return
    
    const notes = projectNotes[projectId] || []
    const newNote = {
      id: Date.now(),
      text,
      createdAt: new Date().toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
    saveNotes(projectId, [newNote, ...notes])
    setNewNoteInputs({ ...newNoteInputs, [projectId]: '' })
  }

  const deleteNote = (projectId, noteId) => {
    const notes = (projectNotes[projectId] || []).filter(n => n.id !== noteId)
    saveNotes(projectId, notes)
  }

  const startEdit = (note) => {
    setEditingId(note.id)
    setEditText(note.text)
  }

  const saveEdit = (projectId, noteId) => {
    if (!editText.trim()) return
    const notes = (projectNotes[projectId] || []).map(n => 
      n.id === noteId ? { ...n, text: editText.trim() } : n
    )
    saveNotes(projectId, notes)
    setEditingId(null)
    setEditText('')
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-40 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-3 hover:bg-white transition-all group"
        title="项目进展"
      >
        <Target size={20} className="text-warm-600 group-hover:text-warm-700" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-warm-500 to-warm-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={20} />
            <h2 className="font-bold text-lg">项目进展</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Project List */}
        <div className="p-4 space-y-4">
          {PROJECTS.map((project) => {
            const notes = projectNotes[project.id] || []
            
            return (
              <div 
                key={project.id}
                className="rounded-xl border border-warm-100 overflow-hidden"
                style={{ borderLeft: `4px solid ${project.color}` }}
              >
                <div 
                  className="px-3 py-2 flex items-center gap-2"
                  style={{ backgroundColor: `${project.color}15` }}
                >
                  <span className="text-lg">{project.emoji}</span>
                  <span className="font-medium text-warm-800">{project.name}</span>
                  <span className="ml-auto text-xs text-warm-400">{notes.length}条</span>
                </div>
                
                <div className="p-3 space-y-2">
                  {/* Add Note Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNoteInputs[project.id] || ''}
                      onChange={(e) => setNewNoteInputs({ ...newNoteInputs, [project.id]: e.target.value })}
                      placeholder="添加记录..."
                      className="flex-1 px-3 py-2 bg-white rounded-lg border border-warm-200 focus:outline-none focus:border-warm-400 text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && addNote(project.id)}
                    />
                    <button 
                      onClick={() => addNote(project.id)}
                      className="p-2 text-warm-500 hover:text-warm-700 hover:bg-warm-50 rounded-lg transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notes.map((note) => (
                      <div 
                        key={note.id}
                        className="bg-warm-50 rounded-lg p-2 text-sm group"
                      >
                        {editingId === note.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full p-2 bg-white rounded border border-warm-200 focus:outline-none focus:border-warm-400 text-sm resize-none"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => setEditingId(null)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                              >
                                <X size={14} />
                              </button>
                              <button 
                                onClick={() => saveEdit(project.id, note.id)}
                                className="p-1 text-green-500 hover:text-green-600"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-700 whitespace-pre-wrap">{note.text}</p>
                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-warm-100">
                              <span className="text-xs text-gray-400">{note.createdAt}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => startEdit(note)}
                                  className="p-1 text-gray-400 hover:text-amber-600"
                                >
                                  <Edit3 size={12} />
                                </button>
                                <button 
                                  onClick={() => deleteNote(project.id, note.id)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-warm-100 p-3">
          <p className="text-center text-xs text-warm-400">
            💡 数据自动保存到本地
          </p>
        </div>
      </div>
    </>
  )
}
