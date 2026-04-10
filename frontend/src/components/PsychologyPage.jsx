import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PsychologyHub from './PsychologyHub'

export default function PsychologyPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
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
