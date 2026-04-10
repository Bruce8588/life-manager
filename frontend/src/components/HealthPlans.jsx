import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Check, Trash2, Calendar, Target, Apple, ChevronRight, Edit3, Save, FileText, Trophy, Lightbulb, ArrowLeft } from 'lucide-react'

// 健康方案详情页
function PlanDetail({ planId, onBack }) {
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [newGoal, setNewGoal] = useState('')
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlan()
  }, [planId])

  const loadPlan = async () => {
    try {
      const res = await fetch('/api/life/health-plans')
      const data = await res.json()
      const found = data.find(p => p.id === planId)
      setPlan(found)
      setLoading(false)
    } catch (e) {
      console.error('Failed to load plan:', e)
      setLoading(false)
    }
  }

  const updatePlan = async (updates) => {
    try {
      await fetch(`/api/life/health-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      setPlan({ ...plan, ...updates })
    } catch (e) {
      console.error('Failed to update plan:', e)
    }
  }

  const updateGoals = async (goals) => {
    try {
      await fetch(`/api/life/health-plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals })
      })
      setPlan({ ...plan, goals })
    } catch (e) {
      console.error('Failed to update goals:', e)
    }
  }

  const handleToggleGoal = (goalId) => {
    if (plan.status === 'completed') return
    const newGoals = plan.goals.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g)
    updateGoals(newGoals)
  }

  const handleAddGoal = () => {
    if (!newGoal.trim()) return
    const newGoals = [...plan.goals, { id: 'g-' + Date.now(), text: newGoal, completed: false }]
    updateGoals(newGoals)
    setNewGoal('')
  }

  const handleDeleteGoal = (goalId) => {
    const newGoals = plan.goals.filter(g => g.id !== goalId)
    updateGoals(newGoals)
  }

  const handleStartPlan = () => {
    const today = new Date().toISOString().split('T')[0]
    updatePlan({ status: 'active', start_date: today })
  }

  const handleSaveField = (field) => {
    updatePlan({ [field]: editValue })
    setEditingField(null)
  }

  const startEditing = (field, value) => {
    setEditingField(field)
    setEditValue(value || '')
  }

  const getProgress = () => {
    if (!plan.goals || plan.goals.length === 0) return 0
    const completed = plan.goals.filter(g => g.completed).length
    return Math.round((completed / plan.goals.length) * 100)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'planning': return '待开始'
      case 'active': return '进行中'
      case 'completed': return '已完成'
      default: return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-600'
      case 'active': return 'bg-green-100 text-green-600'
      case 'completed': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">方案不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={18} /> 返回方案列表
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors text-sm"
          >
            <ArrowLeft size={16} /> 返回首页
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-orange-100 to-yellow-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-800">{plan.name}</h1>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                    {getStatusBadge(plan.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {plan.duration}
                  </span>
                  {plan.start_date && <span>开始于 {plan.start_date}</span>}
                </div>
              </div>
              {plan.status === 'planning' && (
                <button
                  onClick={handleStartPlan}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  开始执行
                </button>
              )}
            </div>

            {/* Progress */}
            {plan.status === 'active' && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">执行进度</span>
                  <span className="font-medium text-orange-600">{getProgress()}%</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goals Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={20} className="text-orange-500" />
            <h2 className="font-bold text-gray-800">目标清单</h2>
          </div>

          <div className="space-y-3">
            {plan.goals && plan.goals.map(goal => (
              <div 
                key={goal.id}
                className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
                  goal.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <button
                  onClick={() => handleToggleGoal(goal.id)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                    goal.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-orange-400'
                  }`}
                  disabled={plan.status === 'completed'}
                >
                  {goal.completed && <Check size={16} />}
                </button>
                <span className={`flex-1 ${goal.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {goal.text}
                </span>
                {plan.status !== 'active' && (
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {plan.status !== 'completed' && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                placeholder="添加新目标..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent outline-none"
              />
              <button
                onClick={handleAddGoal}
                className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Expected Results Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-yellow-500" />
              <h2 className="font-bold text-gray-800">预期成果</h2>
            </div>
            <button
              onClick={() => startEditing('expected_results', plan.expected_results)}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <Edit3 size={18} />
            </button>
          </div>
          {editingField === 'expected_results' ? (
            <div>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent outline-none resize-none"
                placeholder="描述你预期的成果..."
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSaveField('expected_results')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <Save size={16} /> 保存
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 whitespace-pre-wrap min-h-[80px]">
              {plan.expected_results || '点击编辑按钮添加预期成果...'}
            </p>
          )}
        </div>

        {/* Reflection Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb size={20} className="text-blue-500" />
              <h2 className="font-bold text-gray-800">执行情况反思</h2>
            </div>
            <button
              onClick={() => startEditing('reflection', plan.reflection)}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <Edit3 size={18} />
            </button>
          </div>
          {editingField === 'reflection' ? (
            <div>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent outline-none resize-none"
                placeholder="记录执行过程中的思考和反思..."
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSaveField('reflection')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <Save size={16} /> 保存
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 whitespace-pre-wrap min-h-[80px]">
              {plan.reflection || '点击编辑按钮添加执行反思...'}
            </p>
          )}
        </div>

        {/* Final Results Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-green-500" />
              <h2 className="font-bold text-gray-800">最终成果</h2>
            </div>
            <button
              onClick={() => startEditing('final_results', plan.final_results)}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <Edit3 size={18} />
            </button>
          </div>
          {editingField === 'final_results' ? (
            <div>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent outline-none resize-none"
                placeholder="总结最终达成的成果..."
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSaveField('final_results')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <Save size={16} /> 保存
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 whitespace-pre-wrap min-h-[80px]">
              {plan.final_results || '点击编辑按钮添加最终成果...'}
            </p>
          )}
        </div>

        {/* Memo Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-purple-500" />
              <h2 className="font-bold text-gray-800">备忘录</h2>
            </div>
            <button
              onClick={() => startEditing('memo', plan.memo)}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <Edit3 size={18} />
            </button>
          </div>
          {editingField === 'memo' ? (
            <div>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full h-48 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent outline-none resize-none"
                placeholder="自由记录任何内容..."
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleSaveField('memo')}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <Save size={16} /> 保存
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 whitespace-pre-wrap min-h-[120px]">
              {plan.memo || '点击编辑按钮添加备忘录...'}
            </p>
          )}
        </div>

        {/* Tips */}
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Apple size={20} className="text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium text-orange-700 mb-2">执行建议</p>
              <ul className="text-orange-600 text-sm space-y-1">
                <li>• 杂粮代替主食：糙米、燕麦、藜麦</li>
                <li>• 优质蛋白：鸡蛋、鱼虾、豆腐</li>
                <li>• 控糖控油腻，多吃蔬菜</li>
                <li>• 每天饮水 1500-2000ml</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 健康方案列表页
export default function HealthPlans() {
  const [plans, setPlans] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanDuration, setNewPlanDuration] = useState('30天')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const res = await fetch('/api/life/health-plans')
      const data = await res.json()
      setPlans(data)
      setLoading(false)
    } catch (e) {
      console.error('Failed to load plans:', e)
      setLoading(false)
    }
  }

  const handleAddPlan = async () => {
    if (!newPlanName.trim()) return
    
    const newPlan = {
      id: 'plan-' + Date.now(),
      name: newPlanName,
      duration: newPlanDuration,
      start_date: '',
      status: 'planning',
      goals: [],
      reflection: '',
      expected_results: '',
      final_results: '',
      memo: ''
    }
    
    try {
      await fetch('/api/life/health-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan)
      })
      setPlans([...plans, newPlan])
      setShowAdd(false)
      setNewPlanName('')
      setNewPlanDuration('30天')
    } catch (e) {
      console.error('Failed to add plan:', e)
    }
  }

  const handleDeletePlan = async (id, e) => {
    e.stopPropagation()
    if (!confirm('确定删除这个方案吗？')) return
    try {
      await fetch(`/api/life/health-plans/${id}`, { method: 'DELETE' })
      setPlans(plans.filter(p => p.id !== id))
    } catch (e) {
      console.error('Failed to delete plan:', e)
    }
  }

  const getProgress = (plan) => {
    if (!plan.goals || plan.goals.length === 0) return 0
    const completed = plan.goals.filter(g => g.completed).length
    return Math.round((completed / plan.goals.length) * 100)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'planning': return '待开始'
      case 'active': return '进行中'
      case 'completed': return '已完成'
      default: return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-600'
      case 'active': return 'bg-green-100 text-green-600'
      case 'completed': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  // 详情页模式
  if (selectedPlan) {
    return <PlanDetail planId={selectedPlan} onBack={() => setSelectedPlan(null)} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Return to Home */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-4 text-sm"
        >
          <ArrowLeft size={16} /> 返回首页
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">健康方案</h1>
            <p className="text-gray-500 text-sm mt-1">规划管理你的健康计划</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Plus size={18} />
            新增方案
          </button>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
              <Target size={28} className="text-orange-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">还没有健康方案</h3>
            <p className="text-gray-400 text-sm mb-4">点击上方按钮创建一个新的健康方案</p>
            <button
              onClick={() => setShowAdd(true)}
              className="text-orange-500 font-medium"
            >
              创建我的第一个方案
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className="bg-white rounded-2xl shadow-md p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all border border-orange-100 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {plan.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                        {getStatusBadge(plan.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {plan.duration}
                      </span>
                      {plan.start_date && <span>开始于 {plan.start_date}</span>}
                      {plan.goals && plan.goals.length > 0 && (
                        <span>{plan.goals.filter(g => g.completed).length}/{plan.goals.length} 目标</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeletePlan(plan.id, e)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

                {/* Progress */}
                {plan.status === 'active' && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${getProgress(plan)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{getProgress(plan)}% 完成</span>
                      <span>{plan.goals.filter(g => g.completed).length}/{plan.goals.length} 目标</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">新增健康方案</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">方案名称</label>
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="例如：三个月健康饮食方案"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">持续时间</label>
                <select
                  value={newPlanDuration}
                  onChange={(e) => setNewPlanDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-transparent outline-none"
                >
                  <option value="30天">30天</option>
                  <option value="60天">60天</option>
                  <option value="90天">90天</option>
                  <option value="180天">180天</option>
                  <option value="365天">365天</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleAddPlan}
              className="w-full mt-6 bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              创建方案
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
