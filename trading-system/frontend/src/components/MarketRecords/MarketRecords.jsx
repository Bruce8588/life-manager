import { useState, useEffect } from 'react'
import { Table, Save, Plus, Trash2, RefreshCw, Palette, StickyNote, Calculator } from 'lucide-react'

const API = '/api'
const TREND_COLUMNS = [
  { key: 'up', name: '上升趋势', color: '#22c55e' },
  { key: 'up_natural', name: '自然回撤', color: '#f97316' },
  { key: 'up_rally', name: '回升', color: '#eab308' },
  { key: 'up_secondary', name: '次级回撤', color: '#a855f7' },
  { key: 'up_break', name: '上升破坏', color: '#ec4899' },
  { key: 'down', name: '下跌趋势', color: '#ef4444' },
  { key: 'down_natural', name: '自然回升', color: '#06b6d4' },
  { key: 'down_rally', name: '回撤', color: '#f97316' },
  { key: 'down_secondary', name: '次级回升', color: '#3b82f6' },
  { key: 'down_break', name: '下跌破坏', color: '#8b5cf6' },
]

export default function MarketRecords() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState(null) // {recordId, trend, field: 'value'|'note'}
  const [editValue, setEditValue] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(null) // {recordId, trend}

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/market-records`)
      const data = await res.json()
      setRecords(data)
    } catch (err) {
      console.error('Failed to fetch records:', err)
    }
    setLoading(false)
  }

  const addRecord = async () => {
    try {
      const res = await fetch(`${API}/market-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString().split('T')[0] })
      })
      const newRecord = await res.json()
      setRecords([newRecord, ...records])
    } catch (err) {
      console.error('Failed to add record:', err)
    }
  }

  const updateCell = async (recordId, trend, field, value) => {
    const record = records.find(r => r.id === recordId)
    if (!record) return

    const newData = { ...record.data, [trend]: { ...record.data?.[trend], [field]: value } }
    
    try {
      await fetch(`${API}/market-records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newData })
      })
      setRecords(records.map(r => r.id === recordId ? { ...r, data: newData } : r))
    } catch (err) {
      console.error('Failed to update cell:', err)
    }
  }

  const updateNote = async (recordId, trend, note, color) => {
    const record = records.find(r => r.id === recordId)
    if (!record) return

    const trendData = record.data?.[trend] || {}
    const newData = { ...record.data, [trend]: { ...trendData, note, color } }

    try {
      await fetch(`${API}/market-records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newData })
      })
      setRecords(records.map(r => r.id === recordId ? { ...r, data: newData } : r))
      setShowNoteModal(null)
    } catch (err) {
      console.error('Failed to update note:', err)
    }
  }

  const deleteRecord = async (id) => {
    if (!confirm('确定删除这行记录？')) return
    try {
      await fetch(`${API}/market-records/${id}`, { method: 'DELETE' })
      setRecords(records.filter(r => r.id !== id))
    } catch (err) {
      console.error('Failed to delete record:', err)
    }
  }

  // Calculate percentage change between two values
  const calcPercent = (current, previous) => {
    if (!current || !previous) return null
    const diff = ((current - previous) / previous * 100).toFixed(1)
    return diff
  }

  // Get previous non-null value in any trend column
  const getPreviousValue = (currentRecordIndex, trend) => {
    for (let i = currentRecordIndex + 1; i < records.length; i++) {
      const val = records[i].data?.[trend]?.value
      if (val) return val
    }
    return null
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-indigo-400" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Table className="text-indigo-400" size={28} />
          <h2 className="text-2xl font-bold text-white">行情记录</h2>
          <span className="text-slate-500 text-sm">{records.length} 条记录</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRecords} className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white" title="刷新">
            <RefreshCw size={18} />
          </button>
          <button onClick={addRecord} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg">
            <Plus size={18} />
            新增行
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-750">
              <th className="p-3 text-left text-sm font-medium text-slate-400 border border-slate-700 sticky left-0 bg-slate-750 z-10 min-w-[100px]">日期</th>
              {TREND_COLUMNS.map(col => (
                <th key={col.key} className="p-3 text-center text-sm font-medium border border-slate-700 min-w-[100px]">
                  <div className="flex flex-col items-center gap-1">
                    <span style={{ color: col.color }}>{col.name}</span>
                  </div>
                </th>
              ))}
              <th className="p-3 text-center text-sm font-medium text-slate-400 border border-slate-700 w-10">删除</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, recordIndex) => (
              <tr key={record.id} className="hover:bg-slate-700/50">
                <td className="p-2 border border-slate-700 sticky left-0 bg-slate-800 z-10">
                  <span className="text-white font-medium">{formatDate(record.date)}</span>
                </td>
                {TREND_COLUMNS.map(col => {
                  const cellData = record.data?.[col.key] || {}
                  const cellValue = cellData.value
                  const cellColor = cellData.color
                  const prevValue = getPreviousValue(recordIndex, col.key)
                  const percentChange = cellValue && prevValue ? calcPercent(cellValue, prevValue) : null

                  return (
                    <td
                      key={col.key}
                      className="p-1 border border-slate-700 relative"
                      style={{ backgroundColor: cellColor ? `${cellColor}20` : 'transparent' }}
                    >
                      <div className="flex flex-col items-center">
                        {/* Value input */}
                        {editingCell?.recordId === record.id && editingCell?.trend === col.key && editingCell?.field === 'value' ? (
                          <input
                            type="number"
                            step="0.01"
                            className="w-full bg-slate-600 text-white rounded px-2 py-1 text-center text-sm focus:outline-none"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => {
                              updateCell(record.id, col.key, 'value', parseFloat(editValue) || null)
                              setEditingCell(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCell(record.id, col.key, 'value', parseFloat(editValue) || null)
                                setEditingCell(null)
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div
                            className="w-full text-center py-1 cursor-pointer hover:bg-slate-600/50 rounded text-white"
                            onClick={() => {
                              setEditingCell({ recordId: record.id, trend: col.key, field: 'value' })
                              setEditValue(cellValue || '')
                            }}
                          >
                            {cellValue || '-'}
                          </div>
                        )}

                        {/* Percentage indicator */}
                        {percentChange !== null && (
                          <span className={`text-xs ${parseFloat(percentChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {parseFloat(percentChange) >= 0 ? '↑' : '↓'} {Math.abs(percentChange)}%
                          </span>
                        )}

                        {/* Note indicator */}
                        {cellData.note && (
                          <button
                            className="text-xs text-slate-400 hover:text-white mt-1"
                            onClick={() => setShowNoteModal({ recordId: record.id, trend: col.key })}
                          >
                            📝
                          </button>
                        )}
                      </div>

                      {/* Cell actions */}
                      <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 flex gap-1">
                        <button
                          className="p-1 bg-slate-600 rounded text-xs hover:bg-slate-500"
                          onClick={() => setShowNoteModal({ recordId: record.id, trend: col.key })}
                          title="笔记"
                        >
                          <StickyNote size={12} />
                        </button>
                      </div>
                    </td>
                  )
                })}
                <td className="p-2 border border-slate-700 text-center">
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={12} className="p-8 text-center text-slate-500">
                  暂无记录，点击"新增行"开始
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Note Modal */}
      {showNoteModal && (() => {
        const record = records.find(r => r.id === showNoteModal.recordId)
        const cellData = record?.data?.[showNoteModal.trend] || {}
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNoteModal(null)}>
            <div className="bg-slate-800 rounded-lg p-6 w-96 border border-slate-700" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white mb-4">
                笔记 - {TREND_COLUMNS.find(c => c.key === showNoteModal.trend)?.name}
              </h3>
              <textarea
                id="noteTextarea"
                className="w-full bg-slate-700 text-white rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="输入笔记..."
                defaultValue={cellData.note || ''}
              />
              <div className="mt-4">
                <label className="block text-sm text-slate-400 mb-2">选择颜色</label>
                <div className="flex gap-2">
                  {['', '#22c55e', '#ef4444', '#3b82f6', '#eab308', '#8b5cf6', '#f97316', '#ec4899'].map(c => (
                    <button
                      key={c || 'none'}
                      className={`w-8 h-8 rounded ${!c ? 'border-2 border-slate-500' : ''}`}
                      style={c ? { backgroundColor: c } : {}}
                      onClick={() => {
                        const textarea = document.getElementById('noteTextarea')
                        const note = textarea.value
                        updateNote(showNoteModal.recordId, showNoteModal.trend, note, c || null)
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowNoteModal(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    const textarea = document.getElementById('noteTextarea')
                    const note = textarea.value
                    updateNote(showNoteModal.recordId, showNoteModal.trend, note, cellData.color || null)
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
