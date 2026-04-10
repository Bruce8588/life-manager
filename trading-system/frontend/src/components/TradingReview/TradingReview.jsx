import { useState, useEffect } from 'react'
import { BookOpen, Plus, Trash2, TrendingUp, TrendingDown, Calendar, RefreshCw, BarChart3 } from 'lucide-react'

const API = '/api'

export default function TradingReview() {
  const [reviews, setReviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    stock_name: '',
    trade_date: '',
    decision: '',
    outcome: '',
    actual_profit_loss: '',
    actual_exit_price: '',
    reflection: '',
    tags: '',
  })

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/trading-reviews`)
      const data = await res.json()
      setReviews(data)
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.stock_name || !form.decision) return
    try {
      await fetch(`${API}/trading-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          actual_profit_loss: parseFloat(form.actual_profit_loss) || 0,
          actual_exit_price: parseFloat(form.actual_exit_price) || 0,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })
      setForm({ stock_name: '', trade_date: '', decision: '', outcome: '', actual_profit_loss: '', actual_exit_price: '', reflection: '', tags: '' })
      setShowForm(false)
      fetchReviews()
    } catch (err) {
      console.error('Failed to save review:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/trading-reviews/${id}`, { method: 'DELETE' })
      fetchReviews()
    } catch (err) {
      console.error('Failed to delete review:', err)
    }
  }

  // 统计数据
  const totalProfit = reviews.reduce((sum, r) => sum + (r.actual_profit_loss || 0), 0)
  const winCount = reviews.filter(r => r.actual_profit_loss > 0).length
  const totalCount = reviews.length
  const winRate = totalCount > 0 ? ((winCount / totalCount) * 100).toFixed(1) : 0

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case '盈利': return 'text-green-400 bg-green-900/30'
      case '亏损': return 'text-red-400 bg-red-900/30'
      case '持平': return 'text-slate-400 bg-slate-700'
      default: return 'text-slate-400 bg-slate-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-indigo-400" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="text-indigo-400" size={28} />
          <h2 className="text-2xl font-bold text-white">交易复盘</h2>
          <span className="text-slate-500 text-sm">{totalCount} 条记录</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchReviews} className="p-2 text-slate-400 hover:text-white" title="刷新">
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus size={18} />
            添加复盘
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <BarChart3 size={14} />
            总盈亏
          </div>
          <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)}%
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">总交易数</div>
          <p className="text-xl font-bold text-white">{totalCount}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">盈利次数</div>
          <p className="text-xl font-bold text-green-400">{winCount}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-slate-400 text-sm mb-1">胜率</div>
          <p className="text-xl font-bold text-white">{winRate}%</p>
        </div>
      </div>

      {/* 添加表单 */}
      {showForm && (
        <div className="mb-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">新增复盘记录</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">股票名称 *</label>
                <input
                  value={form.stock_name}
                  onChange={(e) => setForm({ ...form, stock_name: e.target.value })}
                  placeholder="如：铜陵有色"
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">交易日期</label>
                <input
                  type="date"
                  value={form.trade_date}
                  onChange={(e) => setForm({ ...form, trade_date: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">交易决策 *</label>
              <textarea
                value={form.decision}
                onChange={(e) => setForm({ ...form, decision: e.target.value })}
                placeholder="描述当时的交易决策和理由..."
                rows={2}
                className="w-full bg-slate-700 text-white rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">结果</label>
                <select
                  value={form.outcome}
                  onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">选择</option>
                  <option value="盈利">盈利</option>
                  <option value="亏损">亏损</option>
                  <option value="持平">持平</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">实际盈亏 (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.actual_profit_loss}
                  onChange={(e) => setForm({ ...form, actual_profit_loss: e.target.value })}
                  placeholder="如：5.2 或 -3.1"
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">实际卖出价</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.actual_exit_price}
                  onChange={(e) => setForm({ ...form, actual_exit_price: e.target.value })}
                  placeholder="如：4.15"
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">复盘反思</label>
              <textarea
                value={form.reflection}
                onChange={(e) => setForm({ ...form, reflection: e.target.value })}
                placeholder="总结这次交易的经验教训..."
                rows={3}
                className="w-full bg-slate-700 text-white rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">标签（逗号分隔）</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="如：趋势交易, 突破买入"
                className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => { setShowForm(false); setForm({ stock_name: '', trade_date: '', decision: '', outcome: '', actual_profit_loss: '', actual_exit_price: '', reflection: '', tags: '' }) }}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              保存复盘
            </button>
          </div>
        </div>
      )}

      {/* 复盘列表 */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-slate-800 rounded-lg p-5 border border-slate-700 group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white text-lg">{review.stock_name}</h3>
                {review.outcome && (
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getOutcomeColor(review.outcome)}`}>
                    {review.outcome}
                  </span>
                )}
                {review.actual_profit_loss !== 0 && (
                  <span className={`text-sm font-medium ${review.actual_profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {review.actual_profit_loss >= 0 ? '+' : ''}{review.actual_profit_loss}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {review.trade_date && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {formatDate(review.trade_date)}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">交易决策：</span>
                <span className="text-slate-300 ml-2">{review.decision}</span>
              </div>
              {review.actual_exit_price > 0 && (
                <div>
                  <span className="text-slate-500">实际卖出价：</span>
                  <span className="text-slate-300 ml-2">{review.actual_exit_price}</span>
                </div>
              )}
              {review.reflection && (
                <div className="mt-3 p-3 bg-slate-750 rounded">
                  <span className="text-indigo-400 text-xs">📝 复盘反思：</span>
                  <p className="text-slate-300 mt-1">{review.reflection}</p>
                </div>
              )}
              {review.tags && review.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {review.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {reviews.length === 0 && !showForm && (
          <div className="text-center text-slate-500 py-16">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>暂无复盘记录</p>
            <p className="text-sm mt-1">点击"添加复盘"开始记录</p>
          </div>
        )}
      </div>
    </div>
  )
}
