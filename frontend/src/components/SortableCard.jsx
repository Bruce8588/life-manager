import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'

export default function SortableCard({ project, onClick, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const Icon = project.icon

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative bg-white rounded-2xl cursor-pointer
        shadow-lg hover:shadow-xl transition-all duration-300
        transform hover:-translate-y-1 group
        ${isDragging ? 'z-50 scale-105' : ''}
      `}
      onClick={onClick}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 p-1 cursor-grab opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:text-red-500 transition-all"
      >
        <X size={16} />
      </button>

      {/* Content */}
      <div className="flex flex-col items-center text-center p-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
          style={{ backgroundColor: project.color + '30' }}
        >
          {project.emoji}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
      </div>

      {/* Decorative Bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 rounded-b-2xl"
        style={{ backgroundColor: project.color }}
      />
    </div>
  )
}
