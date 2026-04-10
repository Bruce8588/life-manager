import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Receipt } from 'lucide-react'

export default function FinancePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-warm-700 hover:text-warm-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          返回首页
        </button>

        <h1 className="text-3xl font-bold text-center text-warm-800 mb-8">💰 财务</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 投资 Card */}
          <button
            onClick={() => window.open('http://8.129.109.139:4816/', '_blank')}
            className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">投资</h2>
              <p className="text-gray-500 text-center mb-4">
                股票、基金、数字货币等<br/>投资组合管理
              </p>
              <span className="px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                进入交易系统 →
              </span>
            </div>
          </button>

          {/* 开支 Card */}
          <button
            className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Receipt size={40} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">开支</h2>
              <p className="text-gray-500 text-center mb-4">
                日常支出记录<br/>预算管理与分析
              </p>
              <span className="px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
                功能开发中...
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
