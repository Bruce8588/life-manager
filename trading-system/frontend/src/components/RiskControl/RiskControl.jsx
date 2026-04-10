import { useState, useEffect } from 'react'
import { Shield, TrendingDown, AlertTriangle, Settings, Plus, Trash2, Save, RefreshCw } from 'lucide-react'

const API = '/api'

// 默认风控规则
const DEFAULT_RULES = {
  max_position_percent: 20,      // 单只股票最大仓位占比 (%)
  max_total_exposure: 80,        // 总仓位最大暴露 (%)
  stop_loss_percent: 8,          // 默认止损比例 (%)
  max_drawdown: 15,             // 最大回撤预警 (%)
  daily_loss_limit: 5,          // 单日亏损限制 (%)
}

export default function RiskControl() {
  const [positions, setPositions] = useState([])
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [alerts, setAlerts] = useState([])
  const [showRuleEditor, setShowRuleEditor] = useState(false)
  const [editingRules, setEditingRules] = useState(DEFAULT_RULES)
  const [showAddPosition, setShowAddPosition] = useState(false)
  const [newPosition, setNewPosition] = useState({ symbol: '', name: '', price: '', quantity: '', cost: '', stopLoss: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [positionsRes, rulesRes, alertsRes] = await Promise.all([
        fetch(`${API}/risk-positions`),
        fetch(`${API}/risk-rules`),
        fetch(`${API}/risk-alerts`)
      ])
      const positionsData = await positionsRes.json()
      const rulesData = await rulesRes.json()
      const alertsData = await alertsRes.json()
      
      setPositions(positionsData)
      setRules(rulesData)
      setAlerts(alertsData)
    } catch (err) {
      console.error('Failed to fetch risk data:', err)
    }
    setLoading(false)
  }

  // 计算风控指标
  const totalValue = positions.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0)
  const totalCost = positions.reduce((sum, p) => sum + (p.cost || 0) * (p.quantity || 0), 0)
  const totalProfitLoss = totalValue - totalCost
  const profitLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost * 100).toFixed(2) : 0

  const getPositionPL = (position) => {
    const pl = ((position.price || 0) - (position.cost || 0)) * (position.quantity || 0)
    const plPercent = position.cost > 0 ? (((position.price || 0) - (position.cost || 0)) / position.cost * 100).toFixed(2) : 0
    return { pl, plPercent }
  }

  const getDistanceToStop = (position) => {
    if (!position.stop_loss || position.price <= position.stop_loss) return 0
    return ((position.price - position.stop_loss) / position.price * 100).toFixed(2)
  }

  const handleSaveRules = async () => {
    try {
      await fetch(`${API}/risk-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRules)
      })
      setRules(editingRules)
      setShowRuleEditor(false)
    } catch (err) {
      console.error('Failed to save rules:', err)
    }
  }

  const handleDeletePosition = async (id) => {
    try {
      await fetch(`${API}/risk-positions/${id}`, { method: 'DELETE' })
      setPositions(positions.filter(p => p.id !== id))
    } catch (err) {
      console.error('Failed to delete position:', err)
    }
  }

  const handleAddPosition = async () => {
    if (!newPosition.symbol || !newPosition.name) return
    try {
      const res = await fetch(`${API}/risk-positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: newPosition.symbol,
          name: newPosition.name,
          price: parseFloat(newPosition.price) || 0,
          quantity: parseInt(newPosition.quantity) || 0,
          cost: parseFloat(newPosition.cost) || 0,
          stop_loss: parseFloat(newPosition.stopLoss) || 0,
        })
      })
      const position = await res.json()
      setPositions([...positions, position])
      setNewPosition({ symbol: '', name: '', price: '', quantity: '', cost: '', stopLoss: '' })
      setShowAddPosition(false)
    } catch (err) {
      console.error('Failed to add position:', err)
    }
  }

  const handleUpdatePosition = async (id, field, value) => {
    const position = positions.find(p => p.id === id)
    if (!position) return
    try {
      await fetch(`${API}/risk-positions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...position,
          [field]: field === 'quantity' ? parseInt(value) || 0 : parseFloat(value) || 0
        })
      })
      setPositions(positions.map(p => p.id === id ? { ...p, [field]: field === 'quantity' ? parseInt(value) || 0 : parseFloat(value) || 0 } : p))
    } catch (err) {
      console.error('Failed to update position:', err)
    }
  }

  const getRiskLevel = () => {
    const exposure = (totalValue / 100000) * 100
    if (exposure > (rules.max_total_exposure || 80)) return 'high'
    if (positions.some(p => getDistanceToStop(p) < 5 && getDistanceToStop(p) > 0)) return 'high'
    if (Math.abs(profitLossPercent) > 10) return 'medium'
    return 'low'
  }

  const riskLevel = getRiskLevel()
  const riskLevelConfig = {
    low: { color: 'text-green-400', bg: 'bg-green-900/30', label: '安全' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-900/30', label: '注意' },
    high: { color: 'text-red-400', bg: 'bg-red-900/30', label: '危险' },
  }

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
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
          <Shield className="text-indigo-400" size={28} />
          <h2 className="text-2xl font-bold text-white">风险控制</h2>
          <span className={`px-2 py-1 rounded text-xs font-medium ${riskLevelConfig[riskLevel].bg} ${riskLevelConfig[riskLevel].color}`}>
            {riskLevelConfig[riskLevel].label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="刷新"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => { setEditingRules(rules); setShowRuleEditor(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <Settings size={18} />
            风控规则
          </button>
        </div>
      </div>

      {/* 风控规则编辑器 */}
      {showRuleEditor && (
        <div className="mb-6 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">风控规则设置</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(editingRules).map(([key, value]) => (
              <div key={key}>
                <label className="block text-slate-400 text-sm mb-1">
                  {key === 'max_position_percent' && '单只股票最大仓位 (%)'}
                  {key === 'max_total_exposure' && '总仓位最大暴露 (%)'}
                  {key === 'stop_loss_percent' && '默认止损比例 (%)'}
                  {key === 'max_drawdown' && '最大回撤预警 (%)'}
                  {key === 'daily_loss_limit' && '单日亏损限制 (%)'}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setEditingRules({ ...editingRules, [key]: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowRuleEditor(false)}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveRules}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Save size={18} />
              保存规则
            </button>
          </div>
        </div>
      )}

      {/* 风控指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <TrendingDown size={16} />
            总盈亏
          </div>
          <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toLocaleString()}
          </p>
          <p className={`text-sm ${profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent}%
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Shield size={16} />
            总持仓
          </div>
          <p className="text-2xl font-bold text-white">{totalValue.toLocaleString()}</p>
          <p className="text-sm text-slate-400">市值 (元)</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-slate-400 text-sm mb-2">仓位暴露</div>
          <p className={`text-2xl font-bold ${(totalValue / 1000) > (rules.max_total_exposure || 80) ? 'text-red-400' : 'text-white'}`}>
            {(totalValue / 1000).toFixed(1)}%
          </p>
          <p className="text-sm text-slate-400">上限 {rules.max_total_exposure || 80}%</p>
        </div>

        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-slate-400 text-sm mb-2">持仓数量</div>
          <p className="text-2xl font-bold text-white">{positions.length}</p>
          <p className="text-sm text-slate-400">只股票</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* 持仓风控 */}
        <div className="md:col-span-2 bg-slate-800 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h3 className="font-semibold text-white">持仓监控</h3>
            <button
              onClick={() => setShowAddPosition(true)}
              className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
            >
              <Plus size={16} />
              添加
            </button>
          </div>

          {/* 添加持仓表单 */}
          {showAddPosition && (
            <div className="p-4 border-b border-slate-700 bg-slate-750">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input
                  placeholder="代码"
                  value={newPosition.symbol}
                  onChange={(e) => setNewPosition({ ...newPosition, symbol: e.target.value })}
                  className="bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
                <input
                  placeholder="名称"
                  value={newPosition.name}
                  onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
                  className="bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
                <input
                  placeholder="当前价"
                  type="number"
                  value={newPosition.price}
                  onChange={(e) => setNewPosition({ ...newPosition, price: e.target.value })}
                  className="bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input
                  placeholder="数量"
                  type="number"
                  value={newPosition.quantity}
                  onChange={(e) => setNewPosition({ ...newPosition, quantity: e.target.value })}
                  className="bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
                <input
                  placeholder="成本价"
                  type="number"
                  value={newPosition.cost}
                  onChange={(e) => setNewPosition({ ...newPosition, cost: e.target.value })}
                  className="bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
                <input
                  placeholder="止损价"
                  type="number"
                  value={newPosition.stopLoss}
                  onChange={(e) => setNewPosition({ ...newPosition, stopLoss: e.target.value })}
                  className="bg-slate-700 text-white rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setShowAddPosition(false); setNewPosition({ symbol: '', name: '', price: '', quantity: '', cost: '', stopLoss: '' }) }}
                  className="px-3 py-1 text-slate-400 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleAddPosition}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm"
                >
                  确认
                </button>
              </div>
            </div>
          )}

          {/* 持仓列表 */}
          <div className="divide-y divide-slate-700">
            {positions.map((position) => {
              const { pl, plPercent } = getPositionPL(position)
              const distance = getDistanceToStop(position)
              const isNearStop = distance > 0 && parseFloat(distance) < 5

              return (
                <div key={position.id} className="p-4 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{position.name}</span>
                        <span className="text-slate-500 text-sm">{position.symbol}</span>
                        {isNearStop && (
                          <span className="flex items-center gap-1 text-red-400 text-xs">
                            <AlertTriangle size={12} />
                            距止损{distance}%
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-sm mt-1">
                        {position.quantity}股 × {position.price?.toFixed(2)}元
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pl >= 0 ? '+' : ''}{pl.toLocaleString()}
                      </p>
                      <p className={`text-sm ${plPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {plPercent >= 0 ? '+' : ''}{plPercent}%
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePosition(position.id)}
                      className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500">
                    <span>成本: {position.cost}</span>
                    <span>止损: {position.stop_loss}</span>
                    <span>市值: {((position.price || 0) * (position.quantity || 0)).toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {positions.length === 0 && (
            <div className="text-center text-slate-500 py-12">
              <Shield size={36} className="mx-auto mb-3 opacity-50" />
              <p>暂无持仓监控</p>
              <p className="text-sm mt-1">点击"添加"开始</p>
            </div>
          )}
        </div>

        {/* 风险预警 */}
        <div className="bg-slate-800 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 p-4 border-b border-slate-700">
            <AlertTriangle className="text-yellow-400" size={18} />
            <h3 className="font-semibold text-white">风险预警</h3>
          </div>
          <div className="divide-y divide-slate-700">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4">
                <div className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                    alert.type === 'warning' ? 'bg-yellow-400' :
                    alert.type === 'danger' ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <div>
                    <p className="text-slate-300 text-sm">{alert.message}</p>
                    <p className="text-slate-500 text-xs mt-1">{formatTime(alert.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {alerts.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              <p>暂无预警</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
