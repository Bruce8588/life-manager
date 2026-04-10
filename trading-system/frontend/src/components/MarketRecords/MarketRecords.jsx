import { useState, useEffect } from 'react'
import { Table, Plus, Trash2, RefreshCw, StickyNote, X } from 'lucide-react'

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

export default function MarketRecords({ stockId, stockName, onBack }) {
  const [records, setRecords] = useState([])
  const [stocks, setStocks] = useState([])
  const [selectedStockId, setSelectedStockId] = useState(stockId || null)
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(null)

  useEffect(() => {
    fetchStocks()
  }, [])

  useEffect(() => {
    if (selectedStockId || stockId) {
      fetchRecords()
    }
  }, [selectedStockId, stockId])

  const fetchStocks = async () => {
    try {
      const res = await fetch(`${API}/stocks`)
      const data = await res.json()
      setStocks(data)
      if (!selectedStockId && data.length > 0) {
        setSelectedStockId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch stocks:', err)
    }
  }

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const url = selectedStockId 
        ? `${API}/market-records?stock_id=${selectedStockId}`
        : `${API}/market-records`
      const res = await fetch(url)
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
        body: JSON.stringify({ 
          stock_id: selectedStockId,
          date: new Date().toISOString().split('T')[0],
          data: {}
        })
      })
      const newRecord = await res.json()
      setRecords([newRecord, ...records])
    } catch (err) {
      console.error('Failed to add record:', err)
    }
  }

  const updateCell = async (recordId, trend, value) => {
    const record = records.find(r => r.id === recordId)
    if (!record) return

    const newData = { ...record.data, [trend]: { ...record.data?.[trend], value } }
    
    try {
      await fetch(`${API}/market-records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stock_id: selectedStockId,
          data: newData 
        })
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
        body: JSON.stringify({ 
          stock_id: selectedStockId,
          data: newData 
        })
      })
      setRecords(records.map(r => r.id === recordId ? { ...r, data: newData } : r))
      setShowNoteModal(null)
    } catch (err) {
      console.error('Failed to update note:', err)
    }
  }

  const deleteRecord = async (id) => {
    try {
      await fetch(`${API}/market-records/${id}`, { method: 'DELETE' })
      setRecords(records.filter(r => r.id !== id))
    } catch (err) {
      console.error('Failed to delete record:', err)
    }
  }

  // Calculate percentage: current row's filled value vs previous row's filled value (any column)
  const getPreviousFilledValue = (currentRecordIndex) => {
    for (let i = currentRecordIndex + 1; i < records.length; i++) {
      const record = records[i]
      for (const trend of TREND_COLUMNS) {
        const val = record.data?.[trend.key]?.value
        if (val) return val
      }
    }
    return null
  }

  const getCurrentFilledValue = (record) => {
    for (const trend of TREND_COLUMNS) {
      const val = record.data?.[trend.key]?.value
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
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 bg-slate-700 rounded-lg text-slate-400 hover:text-white">
              <X size={18} />
            </button>
          )}
          <Table className="text-indigo-400" size={28} />
          <h2 className="text-2xl font-bold text-white">行情记录</h2>
        </div>
        
        {/* Stock Selector */}
        <select
          value={selectedStockId || ''}
          onChange={(e) => setSelectedStockId(e.target.value ? parseInt(e.target.value) : null)}
          className="bg-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">所有股票</option>
          {stocks.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

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
              <th className="p-3 text-center text-sm font-medium text-slate-400 border border-slate-700 min-w-[80px]">涨跌%</th>
              {TREND_COLUMNS.map(col => (
                <th key={col.key} className="p-3 text-center text-sm font-medium border border-slate-700 min-w-[90px]">
                  <span style={{ color: col.color }}>{col.name}</span>
                </th>
              ))}
              <th className="p-3 text-center text-sm font-medium text-slate-400 border border-slate-700 w-10">删</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, recordIndex) => {
              const currentValue = getCurrentFilledValue(record)
              const prevValue = getPreviousFilledValue(recordIndex)
              const percentChange = currentValue && prevValue 
                ? ((currentValue - prevValue) / prevValue * 100).toFixed(1)
                : null

              return (
                <tr key={record.id} className="hover:bg-slate-700/50">
                  <td className="p-2 border border-slate-700 sticky left-0 bg-slate-800 z-10">
                    <span className="text-white font-medium">{formatDate(record.date)}</span>
                  </td>
                  {/* Percent change column */}
                  <td className="p-2 border border-slate-700 text-center">
                    {percentChange !== null ? (
                      <span className={`font-medium ${parseFloat(percentChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(percentChange) >= 0 ? '↑' : '↓'} {Math.abs(percentChange)}%
                      </span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>
                  {/* Trend columns */}
                  {TREND_COLUMNS.map(col => {
                    const cellData = record.data?.[col.key] || {}
                    const cellValue = cellData.value
                    const cellColor = cellData.color

                    return (
                      <td
                        key={col.key}
                        className="p-1 border border-slate-700 relative"
                        style={{ backgroundColor: cellColor ? `${cellColor}20` : 'transparent' }}
                      >
                        {editingCell?.recordId === record.id && editingCell?.trend === col.key ? (
                          <input
                            type="number"
                            step="0.01"
                            className="w-full bg-slate-600 text-white rounded px-1 py-2 text-center text-sm focus:outline-none"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => {
                              updateCell(record.id, col.key, parseFloat(editValue) || null)
                              setEditingCell(null)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCell(record.id, col.key, parseFloat(editValue) || null)
                                setEditingCell(null)
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div
                            className="flex items-center justify-center gap-1"
                          >
                            <span
                              className="py-2 cursor-pointer hover:bg-slate-600/50 rounded w-full text-center text-white"
                              onClick={() => {
                                setEditingCell({ recordId: record.id, trend: col.key })
                                setEditValue(cellValue || '')
                              }}
                            >
                              {cellValue || '-'}
                            </span>
                            {cellData.note && (
                              <button
                                className="p-1 text-slate-400 hover:text-white"
                                onClick={() => setShowNoteModal({ recordId: record.id, trend: col.key })}
                              >
                                <StickyNote size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    )
                  })}
                  <td className="p-2 border border-slate-700 text-center">
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="p-1 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
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
                        updateNote(showNoteModal.recordId, showNoteModal.trend, textarea.value, c || null)
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowNoteModal(null)} className="px-4 py-2 text-slate-400 hover:text-white">
                  取消
                </button>
                <button
                  onClick={() => {
                    const textarea = document.getElementById('noteTextarea')
                    updateNote(showNoteModal.recordId, showNoteModal.trend, textarea.value, cellData.color || null)
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
