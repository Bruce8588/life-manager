import { ExternalLink, Utensils, Activity } from 'lucide-react'

export default function BodyHub() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* 饮食追踪卡片 */}
        <a 
          href="http://8.129.109.139/diet-n8w3x/"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Utensils size={24} className="text-orange-500" />
            </div>
            <ExternalLink size={18} className="text-orange-300 group-hover:text-orange-500 transition-colors" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-800">饮食追踪</h3>
          <p className="mt-2 text-sm text-gray-500">记录每日饮食，追踪营养摄入</p>
          <div className="mt-4 flex items-center gap-2 text-orange-500 text-sm font-medium">
            立即访问
            <ExternalLink size={14} />
          </div>
        </a>

        {/* 运动记录卡片（预留） */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 opacity-60">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Activity size={24} className="text-green-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-800">运动记录</h3>
          <p className="mt-2 text-sm text-gray-500">功能开发中...</p>
          <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
            敬请期待
          </div>
        </div>
      </div>

      {/* 快捷链接 */}
      <div className="bg-warm-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-warm-700 mb-2">💡 提示</h4>
        <p className="text-xs text-warm-500">
          点击饮食追踪卡片将打开新窗口。两个系统相互独立，饮食追踪无法访问星夜的数据。
        </p>
      </div>
    </div>
  )
}
