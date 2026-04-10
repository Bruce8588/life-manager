import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, X, Heart, Wallet, FileText, Briefcase, BookOpen, Brain, GripVertical } from 'lucide-react'
import SortableCard from './SortableCard'
import ProgressSidebar from './ProgressSidebar'
import { lifeApi } from '../utils/lifeApi'

const DEFAULT_PROJECTS = [
  { id: 'body', name: '身体', icon: Heart, color: '#FF6B6B', emoji: '💪' },
  { id: 'finance', name: '财务', icon: Wallet, color: '#FFB347', emoji: '💰' },
  { id: 'thesis', name: '论文', icon: FileText, color: '#87CEEB', emoji: '📄' },
  { id: 'career', name: '职业发展', icon: Briefcase, color: '#98D8C8', emoji: '💼' },
  { id: 'accumulation', name: '积累', icon: BookOpen, color: '#DDA0DD', emoji: '📚' },
  { id: 'psychology', name: '心理', icon: Brain, color: '#F7DC6F', emoji: '🧠' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState(DEFAULT_PROJECTS)
  const [showAdd, setShowAdd] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', emoji: '📌' })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    lifeApi.getProjects().then(data => {
      if (data && data.length > 0) {
        setProjects(data)
      }
      setLoaded(true)
    }).catch(() => {
      // Fallback to localStorage if API fails
      const saved = localStorage.getItem('life-projects')
      if (saved) setProjects(JSON.parse(saved))
      setLoaded(true)
    })
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const saveProjects = (newProjects) => {
    setProjects(newProjects)
    // Sync to API (fire and forget, keep localStorage as fallback)
    lifeApi.saveProjects(newProjects).catch(() => {})
    localStorage.setItem('life-projects', JSON.stringify(newProjects))
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        saveProjects(newItems)
        return newItems
      })
    }
  }

  const handleAddProject = () => {
    if (!newProject.name.trim()) return
    const id = 'custom-' + Date.now()
    const project = { ...newProject, id, color: '#FFB347' }
    const updated = [...projects, project]
    saveProjects(updated)
    setNewProject({ name: '', emoji: '📌' })
    setShowAdd(false)
  }

  const handleDelete = (id) => {
    const updated = projects.filter((p) => p.id !== id)
    saveProjects(updated)
  }

  const handleCardClick = (project) => {
    if (project.id === 'finance') {
      navigate('/finance')
    } else if (project.id === 'psychology') {
      navigate('/psychology')
    } else {
      navigate(`/project/${project.id}`)
    }
  }

  return (
    <>
      <ProgressSidebar />
      <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-warm-800 mb-2">星夜</h1>
          <p className="text-warm-600 text-lg">规划生活，掌握未来</p>
        </div>

        {/* Project Cards */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={projects} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {projects.map((project) => (
                <SortableCard
                  key={project.id}
                  project={project}
                  onClick={() => handleCardClick(project)}
                  onDelete={() => handleDelete(project.id)}
                />
              ))}

              {/* Add Card */}
              {showAdd ? (
                <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-warm-300 flex flex-col items-center justify-center min-h-[160px]">
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="项目名称"
                    className="w-full text-center bg-transparent border-b-2 border-warm-300 focus:outline-none text-warm-800 font-medium mb-3"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddProject()}
                  />
                  <input
                    type="text"
                    value={newProject.emoji}
                    onChange={(e) => setNewProject({ ...newProject, emoji: e.target.value })}
                    placeholder="emoji"
                    className="w-16 text-center bg-warm-100 rounded-lg py-1 focus:outline-none text-xl mb-3"
                    maxLength={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddProject}
                      className="px-4 py-1 bg-warm-500 text-white rounded-full text-sm hover:bg-warm-600 transition-colors"
                    >
                      添加
                    </button>
                    <button
                      onClick={() => setShowAdd(false)}
                      className="px-4 py-1 bg-gray-200 text-gray-500 rounded-full text-sm hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-white/50 rounded-2xl border-2 border-dashed border-warm-300 p-6 flex flex-col items-center justify-center min-h-[160px] hover:bg-white/70 hover:border-warm-400 transition-all group"
                >
                  <Plus size={32} className="text-warm-400 group-hover:text-warm-500 mb-2" />
                  <span className="text-warm-500 font-medium">添加项目</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Hint */}
        <p className="text-center text-warm-500 text-sm mt-8 opacity-70">
          💡 拖动卡片可以调整位置
        </p>
      </div>
    </div>
    </>
  )
}
