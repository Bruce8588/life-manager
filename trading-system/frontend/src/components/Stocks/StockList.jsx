import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Database, Settings, ArrowLeft, ChevronRight, Trash, Search, Check } from 'lucide-react'

const API = '/api'

export default function StockList({ initialGroupId = null, initialStockId = null }) {
  const [stocks, setStocks] = useState([])
  const [logicGroups, setLogicGroups] = useState([])
  const [customFields, setCustomFields] = useState([])
  const [showStockForm, setShowStockForm] = useState(false)
  const [showFieldForm, setShowFieldForm] = useState(false)
  const [nameError, setNameError] = useState('')
  const [editingStockId, setEditingStockId] = useState(null)
  const [editingFieldId, setEditingFieldId] = useState(null)
  const [selectedStock, setSelectedStock] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [groupPickerStock, setGroupPickerStock] = useState(null)
  const [groupPickerSelected, setGroupPickerSelected] = useState([])
  const [stockForm, setStockForm] = useState({
    name: '',
    code: '',
    logic_group_id: initialGroupId || '',
    field_values: {}
  })
  const [fieldForm, setFieldForm] = useState({ name: '', field_type: 'text' })

  useEffect(() => {
    fetchAll()
  }, [initialGroupId])

  // Auto-select stock when navigated from MemoList
  useEffect(() => {
    if (initialStockId && stocks.length > 0) {
      const stock = stocks.find(s => String(s.id) === String(initialStockId))
      if (stock) setSelectedStock(stock)
    }
  }, [initialStockId, stocks])

  const fetchAll = async () => {
    await Promise.all([fetchStocks(), fetchLogicGroups(), fetchCustomFields()])
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

  const fetchLogicGroups = async () => {
    try {
      const res = await fetch(`${API}/logic-groups`)
      const data = await res.json()
      setLogicGroups(data)
    } catch (err) {
      console.error('Failed to fetch groups:', err)
    }
  }

  const fetchCustomFields = async () => {
    try {
      const res = await fetch(`${API}/custom-fields`)
      const data = await res.json()
      setCustomFields(data)
    } catch (err) {
      console.error('Failed to fetch custom fields:', err)
    }
  }

  const handleStockSubmit = async () => {
    const name = stockForm.name.trim()
    if (!name) return
    // Check for duplicate name (only for new stocks, not editing)
    if (!editingStockId) {
      const exists = stocks.find(s => s.name === name)
      if (exists) {
        setNameError('该股票已存在')
        return
      }
    }
    const payload = {
      name: stockForm.name,
      code: stockForm.code || '',
      logic_group_id: stockForm.logic_group_id || null,
      field_values: stockForm.field_values || {}
    }
    try {
      if (editingStockId) {
        await fetch(`${API}/stocks/${editingStockId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        await fetch(`${API}/stocks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
      resetStockForm()
      fetchStocks()
    } catch (err) {
      console.error('Failed to save stock:', err)
    }
  }

  const handleDeleteStock = async (id) => {
    if (!confirm('确定删除这只股票？')) return
    try {
      await fetch(`${API}/stocks/${id}`, { method: 'DELETE' })
      fetchStocks()
      if (selectedStock?.id === id) setSelectedStock(null)
    } catch (err) {
      console.error('Failed to delete stock:', err)
    }
  }

  const openGroupPicker = (stock, e) => {
    e?.stopPropagation()
    setGroupPickerStock(stock)
    // Load current groups (single group_id currently)
    setGroupPickerSelected(stock.logic_group_id ? [stock.logic_group_id] : [])
  }

  const handleGroupPickerSave = async () => {
    if (!groupPickerStock) return
    // Currently using single group_id - take first selected or null
    const newGroupId = groupPickerSelected.length > 0 ? groupPickerSelected[0] : null
    try {
      await fetch(`${API}/stocks/${groupPickerStock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupPickerStock.name,
          code: groupPickerStock.code || '',
          logic_group_id: newGroupId,
          field_values: groupPickerStock.field_values || {},
          notes: groupPickerStock.notes || ''
        })
      })
      setGroupPickerStock(null)
      fetchStocks()
    } catch (err) {
      console.error('Failed to update stock group:', err)
    }
  }

  const toggleGroupPickerItem = (groupId) => {
    setGroupPickerSelected(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const handleFieldSubmit = async () => {
    if (!fieldForm.name.trim()) return
    try {
      if (editingFieldId) {
        await fetch(`${API}/custom-fields/${editingFieldId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fieldForm)
        })
      } else {
        await fetch(`${API}/custom-fields`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fieldForm)
        })
      }
      resetFieldForm()
      fetchCustomFields()
    } catch (err) {
      console.error('Failed to save field:', err)
    }
  }

  const handleDeleteField = async (id) => {
    if (!confirm('确定删除这个字段？相关数据也会被删除。')) return
    try {
      await fetch(`${API}/custom-fields/${id}`, { method: 'DELETE' })
      fetchCustomFields()
      fetchStocks()
    } catch (err) {
      console.error('Failed to delete field:', err)
    }
  }

  const startEditStock = (stock) => {
    setEditingStockId(stock.id)
    setStockForm({
      name: stock.name,
      code: stock.code || '',
      logic_group_id: stock.logic_group_id || '',
      field_values: stock.field_values || {}
    })
    setShowStockForm(true)
    setSelectedStock(null)
  }

  const startEditField = (field) => {
    setEditingFieldId(field.id)
    setFieldForm({ name: field.name, field_type: field.field_type })
    setShowFieldForm(true)
  }

  const resetStockForm = () => {
    setShowStockForm(false)
    setEditingStockId(null)
    setNameError('')
    setStockForm({ name: '', code: '', logic_group_id: initialGroupId || '', field_values: {} })
  }

  const resetFieldForm = () => {
    setShowFieldForm(false)
    setEditingFieldId(null)
    setFieldForm({ name: '', field_type: 'text' })
  }

  const getGroupById = (id) => logicGroups.find(g => g.id === id)

  // Filter stocks by group if initialGroupId is set, then by search query
  const displayedStocks = stocks
    .filter(s => !initialGroupId || s.logic_group_id === initialGroupId)
    .filter(s => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q))
      )
    })

  // Stock Detail View
  if (selectedStock) {
    const stock = selectedStock
    const group = getGroupById(stock.logic_group_id)
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setSelectedStock(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          返回列表
        </button>

        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-750">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{stock.name}</h2>
                {stock.code && <span className="text-sm text-slate-400">{stock.code}</span>}
              </div>
              {group && (
                <span
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: group.color + '30', color: group.color }}
                >
                  {group.name}
                </span>
              )}
            </div>
          </div>

          {/* Custom Fields */}
          {customFields.length > 0 && (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">详细信息</h3>
              <div className="grid grid-cols-2 gap-4">
                {customFields.map((field) => (
                  <div key={field.id} className="bg-slate-700 rounded-lg p-4">
                    <span className="text-sm text-slate-400">{field.name}</span>
                    <p className="text-white mt-1 text-lg">{stock.field_values[field.id] || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {stock.notes && (
            <div className="p-6 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">备注</h3>
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-slate-300 whitespace-pre-wrap">{stock.notes}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 border-t border-slate-700 flex gap-3">
            <button
              onClick={() => startEditStock(stock)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              <Edit2 size={16} />
              编辑
            </button>
            <button
              onClick={() => { handleDeleteStock(stock.id) }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              删除
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {initialGroupId ? `${getGroupById(initialGroupId)?.name || '分组'} - 股票` : '股票管理'}
          {searchQuery && <span className="text-lg font-normal text-slate-400 ml-3">（{displayedStocks.length} 只）</span>}
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索名称或代码..."
              className="bg-slate-700 text-white pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 placeholder-slate-500"
            />
          </div>
          <div className="flex gap-2">
          <button
            onClick={() => setShowFieldForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            <Settings size={18} />
            字段设置
          </button>
          <button
            onClick={() => setShowStockForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus size={18} />
            添加股票
          </button>
        </div>
        </div>
      </div>

      {/* Custom Fields Section */}
      <div className="mb-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">自定义字段</h3>
          <span className="text-sm text-slate-400">用于记录股票的各类信息</span>
        </div>
        {customFields.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full"
              >
                <span className="text-sm text-slate-200">{field.name}</span>
                <span className="text-xs text-slate-500">({field.field_type})</span>
                <button onClick={() => startEditField(field)} className="text-slate-400 hover:text-indigo-400">
                  <Edit2 size={12} />
                </button>
                <button onClick={() => handleDeleteField(field.id)} className="text-slate-400 hover:text-red-400">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        {customFields.length === 0 && (
          <p className="text-sm text-slate-500 mb-4">暂无自定义字段，点击下方添加</p>
        )}
        {showFieldForm && (
          <div className="border-t border-slate-700 pt-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={fieldForm.name}
                onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                placeholder="字段名称，如：市盈率、主要业务、毛利率"
                className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={fieldForm.field_type}
                onChange={(e) => setFieldForm({ ...fieldForm, field_type: e.target.value })}
                className="bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="text">文本</option>
                <option value="number">数字</option>
                <option value="date">日期</option>
              </select>
              <button
                onClick={handleFieldSubmit}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                {editingFieldId ? '更新' : '添加'}
              </button>
              <button onClick={resetFieldForm} className="px-4 py-2 text-slate-400 hover:text-white">
                取消
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stock Form Modal */}
      {showStockForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                {editingStockId ? '编辑股票' : '添加股票'}
              </h3>
              <button onClick={resetStockForm} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">股票名称 *</label>
                <input
                  type="text"
                  value={stockForm.name}
                  onChange={(e) => { setStockForm({ ...stockForm, name: e.target.value }); setNameError('') }}
                  className={`w-full bg-slate-700 text-white rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 ${nameError ? 'focus:ring-red-500 ring-2 ring-red-500' : 'focus:ring-indigo-500'}`}
                  placeholder="如：铜陵有色"
                />
                {nameError && <p className="text-red-400 text-sm mt-1">{nameError}</p>}
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">股票代码</label>
                <input
                  type="text"
                  value={stockForm.code}
                  onChange={(e) => setStockForm({ ...stockForm, code: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="如：SZ000630"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">所属逻辑分组</label>
                <select
                  value={stockForm.logic_group_id}
                  onChange={(e) => setStockForm({ ...stockForm, logic_group_id: e.target.value })}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">无分组</option>
                  {logicGroups.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              {/* Custom fields inputs */}
              {customFields.length > 0 && (
                <div className="space-y-4">
                  {customFields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm text-slate-400 mb-1">{field.name}</label>
                      {field.field_type === 'number' ? (
                        <input
                          type="number"
                          step="0.01"
                          value={stockForm.field_values[field.id] || ''}
                          onChange={(e) => setStockForm({
                            ...stockForm,
                            field_values: { ...stockForm.field_values, [field.id]: e.target.value }
                          })}
                          className="w-full bg-slate-700 text-white rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="0.00"
                        />
                      ) : (
                        <input
                          type={field.field_type === 'date' ? 'date' : 'text'}
                          value={stockForm.field_values[field.id] || ''}
                          onChange={(e) => setStockForm({
                            ...stockForm,
                            field_values: { ...stockForm.field_values, [field.id]: e.target.value }
                          })}
                          className="w-full bg-slate-700 text-white rounded-lg px-3 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button onClick={resetStockForm} className="px-4 py-2 text-slate-400 hover:text-white">
                取消
              </button>
              <button
                onClick={handleStockSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Save size={16} />
                {editingStockId ? '更新' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Picker Popup */}
      {groupPickerStock && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setGroupPickerStock(null)}>
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">选择分组</h3>
                <p className="text-sm text-slate-400 mt-1">{groupPickerStock.name}（可多选）</p>
              </div>
              <button onClick={() => setGroupPickerStock(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {logicGroups.length === 0 ? (
                <p className="text-center text-slate-500 py-4">暂无分组，请先创建分组</p>
              ) : (
                <div className="space-y-2">
                  {logicGroups.map(g => {
                    const isSelected = groupPickerSelected.includes(g.id)
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGroupPickerItem(g.id)}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-lg border transition-all
                          ${isSelected
                            ? 'border-indigo-500 bg-indigo-500/20 text-white'
                            : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                          }
                        `}
                      >
                        <div className={`
                          w-6 h-6 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0
                          ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500'}
                        `}>
                          {isSelected && <Check size={14} className="text-white" />}
                        </div>
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: g.color }}
                        />
                        <span className="font-medium">{g.name}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setGroupPickerStock(null)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleGroupPickerSave}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <Save size={16} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedStocks.map((stock) => {
          const group = getGroupById(stock.logic_group_id)
          return (
            <div
              key={stock.id}
              onClick={() => setSelectedStock(stock)}
              className="bg-slate-800 rounded-xl border border-slate-700 p-5 cursor-pointer hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-lg group-hover:text-indigo-400 transition-colors">
                    {stock.name}
                  </h3>
                  {stock.code && <span className="text-xs text-slate-500">{stock.code}</span>}
                </div>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              
              {/* Group tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {group ? (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm cursor-pointer hover:opacity-80"
                    style={{ backgroundColor: group.color + '30', color: group.color }}
                    onClick={(e) => openGroupPicker(stock, e)}
                    title="点击编辑分组"
                  >
                    {group.name}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm cursor-pointer bg-slate-700 text-slate-400 hover:bg-slate-600"
                    onClick={(e) => openGroupPicker(stock, e)}
                    title="点击添加分组"
                  >
                    + 添加分组
                  </span>
                )}
              </div>

              {/* Show custom fields as preview */}
              {customFields.length > 0 && (
                <div className="space-y-2">
                  {customFields.slice(0, 3).map((field) => (
                    <div key={field.id} className="flex justify-between text-sm">
                      <span className="text-slate-500">{field.name}</span>
                      <span className="text-slate-300 font-medium">{stock.field_values[field.id] || '-'}</span>
                    </div>
                  ))}
                  {customFields.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{customFields.length - 3} 更多
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        
        {displayedStocks.length === 0 && (
          <div className="col-span-full text-center text-slate-500 py-12">
            <Database size={48} className="mx-auto mb-4 opacity-50" />
            <p>暂无股票，点击添加开始</p>
          </div>
        )}
      </div>
    </div>
  )
}
