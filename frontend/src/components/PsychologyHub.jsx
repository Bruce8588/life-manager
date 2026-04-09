import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, ChevronRight, Brain, Wrench } from 'lucide-react'

const STORAGE_KEY_HEARTS = 'psychology-hearts'
const STORAGE_KEY_TOOLS = 'psychology-tools'

// 心影卡片详情
function HeartDetail({ card, onBack, onEdit, onDelete }) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} />返回
      </button>
      <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{card.name}</h2>
            {card.updatedAt && <p className="text-sm text-slate-500 mt-1">更新于 {new Date(card.updatedAt).toLocaleDateString('zh-CN')}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(card)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(card.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">🎯 特点</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{card.traits || '暂无'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">🔧 擅长使用的工具</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{card.tools || '暂无'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 工具箱卡片详情
function ToolDetail({ card, onBack, onEdit, onDelete }) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} />返回
      </button>
      <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{card.name}</h2>
            {card.updatedAt && <p className="text-sm text-slate-500 mt-1">更新于 {new Date(card.updatedAt).toLocaleDateString('zh-CN')}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(card)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(card.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">📖 方法</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{card.method || '暂无'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">🎬 应用场景</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{card.scenario || '暂无'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">📝 其他说明</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{card.notes || '暂无'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 心影表单
function HeartForm({ card, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', traits: '', tools: '' })
  useEffect(() => {
    if (card) setForm({ name: card.name || '', traits: card.traits || '', tools: card.tools || '' })
    else setForm({ name: '', traits: '', tools: '' })
  }, [card])

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 rounded-t-2xl">
          <h3 className="text-xl font-bold text-white">{card ? '编辑心影' : '添加心影'}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">名称 *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="如：INTJ、ESTP..." autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">特点</label>
            <textarea value={form.traits} onChange={e => setForm({...form, traits: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              rows={4} placeholder="描述这个人格的特点..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">擅长使用的工具</label>
            <textarea value={form.tools} onChange={e => setForm({...form, tools: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              rows={4} placeholder="这个人格擅长使用哪些工具..." />
          </div>
        </div>
        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">取消</button>
          <button onClick={() => form.name.trim() && onSave(form)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50"
            disabled={!form.name.trim()}>
            <Save size={18} />保存
          </button>
        </div>
      </div>
    </div>
  )
}

// 工具箱表单
function ToolForm({ card, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', method: '', scenario: '', notes: '' })
  useEffect(() => {
    if (card) setForm({ name: card.name || '', method: card.method || '', scenario: card.scenario || '', notes: card.notes || '' })
    else setForm({ name: '', method: '', scenario: '', notes: '' })
  }, [card])

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800 rounded-t-2xl">
          <h3 className="text-xl font-bold text-white">{card ? '编辑工具' : '添加工具'}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">名称 *</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
              placeholder="如：第一性原理、二八法则..." autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">方法</label>
            <textarea value={form.method} onChange={e => setForm({...form, method: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              rows={4} placeholder="描述这个方法的核心内容..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">应用场景</label>
            <textarea value={form.scenario} onChange={e => setForm({...form, scenario: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              rows={4} placeholder="什么时候使用这个方法..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">其他说明</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              className="w-full px-4 py-3 rounded-xl bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
              rows={4} placeholder="补充说明..." />
          </div>
        </div>
        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button onClick={onCancel} className="px-6 py-2 text-slate-400 hover:text-white transition-colors">取消</button>
          <button onClick={() => form.name.trim() && onSave(form)}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50"
            disabled={!form.name.trim()}>
            <Save size={18} />保存
          </button>
        </div>
      </div>
    </div>
  )
}

// 心影列表
function HeartList({ hearts, onBack, onAdd, onEdit, onDelete, onSelect }) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} />返回心理板块
      </button>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">👤 心影</h2>
        <button onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
          <Plus size={18} />添加
        </button>
      </div>
      {hearts.length === 0 ? (
        <div className="bg-slate-800 rounded-3xl p-12 border border-slate-700 text-center">
          <Brain size={64} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">还没有心影</h3>
          <p className="text-slate-500 mb-6">记录你的人格特征和擅长的工具</p>
          <button onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
            <Plus size={18} />添加第一个心影
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {hearts.map(h => (
            <div key={h.id} onClick={() => onSelect(h)}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700 cursor-pointer hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-white text-xl group-hover:text-indigo-400">{h.name}</h4>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onEdit(h)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDelete(h.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2">{h.traits || '暂无特点'}</p>
              <ChevronRight size={18} className="text-slate-600 mt-3 group-hover:text-indigo-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// 工具箱列表
function ToolList({ tools, onBack, onAdd, onEdit, onDelete, onSelect }) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft size={20} />返回心理板块
      </button>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">🧰 工具箱</h2>
        <button onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
          <Plus size={18} />添加
        </button>
      </div>
      {tools.length === 0 ? (
        <div className="bg-slate-800 rounded-3xl p-12 border border-slate-700 text-center">
          <Wrench size={64} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">还没有工具</h3>
          <p className="text-slate-500 mb-6">记录你的思维方式和应用场景</p>
          <button onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
            <Plus size={18} />添加第一个工具
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tools.map(t => (
            <div key={t.id} onClick={() => onSelect(t)}
              className="bg-slate-800 rounded-2xl p-6 border border-slate-700 cursor-pointer hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-white text-xl group-hover:text-indigo-400">{t.name}</h4>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onEdit(t)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => onDelete(t.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2">{t.method || '暂无方法说明'}</p>
              <ChevronRight size={18} className="text-slate-600 mt-3 group-hover:text-indigo-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PsychologyHub() {
  const [hearts, setHearts] = useState([])
  const [tools, setTools] = useState([])
  const [view, setView] = useState('hub')
  const [activeCard, setActiveCard] = useState(null)
  const [showHeartForm, setShowHeartForm] = useState(false)
  const [showToolForm, setShowToolForm] = useState(false)
  const [editingHeart, setEditingHeart] = useState(null)
  const [editingTool, setEditingTool] = useState(null)

  useEffect(() => {
    const h = localStorage.getItem(STORAGE_KEY_HEARTS)
    const t = localStorage.getItem(STORAGE_KEY_TOOLS)
    if (h) setHearts(JSON.parse(h))
    if (t) setTools(JSON.parse(t))
  }, [])

  const saveHearts = (data) => { localStorage.setItem(STORAGE_KEY_HEARTS, JSON.stringify(data)); setHearts(data) }
  const saveTools = (data) => { localStorage.setItem(STORAGE_KEY_TOOLS, JSON.stringify(data)); setTools(data) }

  const handleHeartSave = (form) => {
    if (editingHeart) {
      const updated = hearts.map(h => h.id === editingHeart.id ? { ...h, ...form, updatedAt: new Date().toISOString() } : h)
      saveHearts(updated)
    } else {
      saveHearts([...hearts, { id: Date.now().toString(), ...form, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }])
    }
    setShowHeartForm(false); setEditingHeart(null)
  }

  const handleToolSave = (form) => {
    if (editingTool) {
      const updated = tools.map(t => t.id === editingTool.id ? { ...t, ...form, updatedAt: new Date().toISOString() } : t)
      saveTools(updated)
    } else {
      saveTools([...tools, { id: Date.now().toString(), ...form, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }])
    }
    setShowToolForm(false); setEditingTool(null)
  }

  const handleHeartDelete = (id) => {
    if (!confirm('确定删除？')) return
    saveHearts(hearts.filter(h => h.id !== id))
    setView('hearts'); setActiveCard(null)
  }

  const handleToolDelete = (id) => {
    if (!confirm('确定删除？')) return
    saveTools(tools.filter(t => t.id !== id))
    setView('tools'); setActiveCard(null)
  }

  // Hub 入口页面
  if (view === 'hub') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">🧠 心理板块</h2>
        </div>
        <div className="flex justify-center gap-8">
          {/* 心影大卡片 */}
          <div
            onClick={() => setView('hearts')}
            className="bg-slate-800 rounded-2xl p-8 border border-slate-700 cursor-pointer hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group text-center w-72 h-96 flex flex-col justify-center"
          >
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Brain size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">👤 心影</h3>
            <p className="text-slate-400 mb-4">人格特征 · 特点 · 擅长工具</p>
            <span className="inline-flex items-center gap-1 text-indigo-400 text-sm">
              {hearts.length} 个心影 <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* 工具箱大卡片 */}
          <div
            onClick={() => setView('tools')}
            className="bg-slate-800 rounded-2xl p-8 border border-slate-700 cursor-pointer hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group text-center w-72 h-96 flex flex-col justify-center"
          >
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Wrench size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">🧰 工具箱</h3>
            <p className="text-slate-400 mb-4">思维方式 · 方法 · 应用场景</p>
            <span className="inline-flex items-center gap-1 text-indigo-400 text-sm">
              {tools.length} 个工具 <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 心影相关视图
  if (view === 'hearts') {
    return (
      <div>
        {showHeartForm && <HeartForm card={editingHeart} onSave={handleHeartSave} onCancel={() => { setShowHeartForm(false); setEditingHeart(null) }} />}
        <HeartList
          hearts={hearts}
          onBack={() => setView('hub')}
          onAdd={() => { setEditingHeart(null); setShowHeartForm(true) }}
          onEdit={(h) => { setEditingHeart(h); setShowHeartForm(true) }}
          onDelete={handleHeartDelete}
          onSelect={(h) => { setActiveCard(h); setView('heart-detail') }}
        />
      </div>
    )
  }

  if (view === 'heart-detail' && activeCard) {
    return <HeartDetail card={activeCard} onBack={() => setView('hearts')} onEdit={c => { setEditingHeart(c); setShowHeartForm(true) }} onDelete={handleHeartDelete} />
  }

  // 工具箱相关视图
  if (view === 'tools') {
    return (
      <div>
        {showToolForm && <ToolForm card={editingTool} onSave={handleToolSave} onCancel={() => { setShowToolForm(false); setEditingTool(null) }} />}
        <ToolList
          tools={tools}
          onBack={() => setView('hub')}
          onAdd={() => { setEditingTool(null); setShowToolForm(true) }}
          onEdit={(t) => { setEditingTool(t); setShowToolForm(true) }}
          onDelete={handleToolDelete}
          onSelect={(t) => { setActiveCard(t); setView('tool-detail') }}
        />
      </div>
    )
  }

  if (view === 'tool-detail' && activeCard) {
    return <ToolDetail card={activeCard} onBack={() => setView('tools')} onEdit={c => { setEditingTool(c); setShowToolForm(true) }} onDelete={handleToolDelete} />
  }

  return null
}
