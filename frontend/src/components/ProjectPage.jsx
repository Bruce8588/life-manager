import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PsychologyHub from './PsychologyHub'
import BodyHub from './BodyHub'

export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // 身体项目 - 中转页面
  if (id === 'body') {
    return (
      <div className="min-h-screen p-6 md:p-12" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fff2e8 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-warm-700 hover:text-warm-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            返回首页
          </button>
          <h1 className="text-3xl font-bold text-center text-warm-800 mb-2">💪 身体</h1>
          <p className="text-center text-warm-600 mb-8">管理你的身体健康和运动计划</p>
          <BodyHub />
        </div>
      </div>
    )
  }

  // 心理板块使用深色背景
  if (id === 'psychology') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="p-6 md:p-12">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            返回首页
          </button>
          <PsychologyHub />
        </div>
      </div>
    )
  }

  // 积累页面 - 知识积累入口
  if (id === 'accumulation') {
    return (
      <div className="min-h-screen p-6 md:p-12" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-900 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            返回首页
          </button>
          
          <h1 className="text-3xl font-bold text-center text-amber-800 mb-2">📚 积累</h1>
          <p className="text-center text-amber-600 mb-10">持续学习，沉淀智慧</p>
          
          <div className="space-y-4">
            {/* 读书笔记卡片 */}
            <a
              href="http://8.129.109.139:6789/reading/"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📖</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">读书笔记</h2>
                  <p className="text-gray-500 text-sm mt-1">记录每本书的思考与精华</p>
                </div>
                <div className="text-indigo-500 group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    )
  }

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
