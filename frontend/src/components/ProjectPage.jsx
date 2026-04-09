import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-warm-700 hover:text-warm-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          返回首页
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-center text-warm-800 mb-4">
            {id === 'body' && '💪 身体'}
            {id === 'thesis' && '📄 论文'}
            {id === 'career' && '💼 职业发展'}
            {id === 'accumulation' && '📚 积累'}
            {id === 'psychology' && '🧠 心理'}
            {id?.startsWith('custom-') && '📌 自定义项目'}
          </h1>
          <p className="text-center text-warm-600 mb-8">
            {id === 'body' && '管理你的身体健康和运动计划'}
            {id === 'thesis' && '追踪你的论文进度和学术研究'}
            {id === 'career' && '规划你的职业发展和技能提升'}
            {id === 'accumulation' && '积累知识、经验和资源'}
            {id === 'psychology' && '关注心理健康和情绪管理'}
            {id?.startsWith('custom-') && '项目内容将在这里显示'}
          </p>
          <div className="text-center text-warm-400 py-12">
            <p>功能开发中...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
