import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Network, Eye, Database, Check } from 'lucide-react'
import StockList from '../Stocks/StockList'
import StockPickerModal from '../Stocks/StockPickerModal'

const API = '/api'

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6'
]

export default function LogicGroupList() {
  const [groups, setGroups] = useState([])
  const [stocks, setStocks] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', color: COLORS[0] })
  const [showForm, setShowForm] = useState(false)
  const [viewingGroupId, setViewingGroupId] = useState(null)
  const [showStockPicker, setShowStockPicker] = useState(null) // which group we're adding to

  useEffect(() => {
    fetchGroups()
    fetchStocks()
  }, [])

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API}/logic-groups`)
      const data = await res.json()
      setGroups(data)
    } catch (err) {
      console.error('Failed to fetch groups:', err)
    }
  }

  const fetchStocks = async () => {
    try {
      const res = await fetch(`${API}/stocks`)
      const data = await res.json()
      setStocks(data)
    } catch (err) {
      console.error('Failed to fetch stocks:', err)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) return
    try {
      await fetch(`${API}/logic-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      resetForm()
      fetchGroups()
    } catch (err) {
      console.error('Failed to create group:', err)
    }
  }

  const handleUpdate = async (id) => {
    try {
      await fetch(`${API}/logic-groups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      resetForm()
      fetchGroups()
    } catch (err) {
      console.error('Failed to update group:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除这个逻辑分组？')) return
    try {
      await fetch(`${API}/logic-groups/${id}`, { method: 'DELETE' })
      fetchGroups()
    } catch (err) {
      console.error('Failed to delete group:', err)
    }
  }

  const startEdit = (group) => {
    setEditingId(group.id)
    setFormData({ name: group.name, description: group.description || '', color: group.color })
    setShowForm(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', color: COLORS[0] })
    setShowForm(false)
  }

  const getStockCount = (groupId) => stocks.filter(s => s.logic_group_id === groupId).length

  // Add stocks to group via multi-select
  const openStockPicker = (groupId) => {
    setShowStockPicker(groupId)
  }

  const handleAddStocksToGroup = async (groupId, selectedStockIds) => {
    if (selectedStockIds.length === 0) {
      setShowStockPicker(null)
      return
    }
    try {
      // Update each selected stock
      await Promise.all(selectedStockIds.map(async (stockId) => {
        const stock = stocks.find(s => s.id === stockId)
        await fetch(`${API}/stocks/${stockId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: stock.name,
            logic_group_id: groupId,
            field_values: stock.field_values || {},
            notes: stock.notes || ''
          })
        })
      }))
      setShowStockPicker(null)
      fetchStocks()
    } catch (err) {
      console.error('Failed to add stocks to group:', err)
    }
  }

  // Viewing stocks in a group
  if (viewingGroupId) {
    const group = groups.find(g => g.id === viewingGroupId)
    return (
      <div>
        <button
          onClick={() => setViewingGroupId(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          ← 返回分组列表
        </button>
        <StockList initialGroupId={viewingGroupId} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">逻辑分组</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          <Plus size={18} />
          新建分组
        </button>
      </div>

      {/* Stock Picker Modal */}
      {showStockPicker !== null && (
        <StockPickerModal
          stocks={stocks}
          groupId={showStockPicker}
          onClose={() => setShowStockPicker(null)}
          onConfirm={(selectedIds) => handleAddStocksToGroup(showStockPicker, selectedIds)}
        />
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="分组名称"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="描述这个交易逻辑..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">颜色</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full transition-transform ${formData.color === color ? 'ring-2 ring-white scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Save size={16} />
              {editingId ? '更新' : '保存'}
            </button>
          </div>
        </div>
      )}

      {/* Group list */}
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((group) => {
          const stockCount = getStockCount(group.id)
          const groupStocks = stocks.filter(s => s.logic_group_id === group.id)
          return (
            <div key={group.id} className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <div className="flex items-start gap-4">
                <div
                  className="w-5 h-5 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: group.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg">{group.name}</h3>
                  {group.description && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{group.description}</p>
                  )}
                  
                  {/* Stock count & actions */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <button
                      onClick={() => openStockPicker(group.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm transition-colors"
                    >
                      <Plus size={14} />
                      添加股票
                    </button>
                    <button
                      onClick={() => setViewingGroupId(group.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                    >
                      <Database size={14} />
                      {stockCount} 只
                    </button>
                    <button
                      onClick={() => startEdit(group)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Show stocks in this group */}
                  {groupStocks.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {groupStocks.map(s => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 rounded text-xs"
                          style={{ backgroundColor: group.color + '30', color: group.color }}
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {groups.length === 0 && (
          <div className="col-span-2 text-center text-slate-500 py-12">
            <Network size={48} className="mx-auto mb-4 opacity-50" />
            <p>暂无逻辑分组，点击新建开始</p>
          </div>
        )}
      </div>
    </div>
  )
}
