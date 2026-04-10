import { useState, useEffect } from 'react'
import { FileText, Network, Database, Palette, Menu, X, BarChart3, Shield, GripVertical, Check, XCircle } from 'lucide-react'
import MemoList from './components/Memo/MemoList'
import LogicGroupList from './components/LogicGroups/LogicGroupList'
import StockList from './components/Stocks/StockList'
import TradingModelList from './components/TradingModels/TradingModelList'
import MarketInfoList from './components/MarketInfo/MarketInfoList'
import RiskControl from './components/RiskControl/RiskControl'

const PENDING_STOCK_KEY = '__pending_stock_id__'
const PAGE_ORDER_KEY = '__page_order__'

// 默认页面顺序
const DEFAULT_PAGE_ORDER = [
  { id: 'market', label: '市场信息', icon: BarChart3 },
  { id: 'memos', label: '宏观叙事', icon: FileText },
  { id: 'logic-groups', label: '逻辑分组', icon: Network },
  { id: 'stocks', label: '股票管理', icon: Database },
  { id: 'models', label: '交易模型', icon: Palette },
  { id: 'risk', label: '决策与风控', icon: Shield },
]

function App() {
  const [activeTab, setActiveTab] = useState('market')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [initialStockId, setInitialStockId] = useState(() => {
    const saved = sessionStorage.getItem(PENDING_STOCK_KEY)
    if (saved) {
      sessionStorage.removeItem(PENDING_STOCK_KEY)
      return saved
    }
    return null
  })
  const [pageOrder, setPageOrder] = useState(() => {
    const saved = localStorage.getItem(PAGE_ORDER_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_PAGE_ORDER
  })
  const [editMode, setEditMode] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)

  const handleStockNavigate = (stockId) => {
    sessionStorage.setItem(PENDING_STOCK_KEY, stockId)
    setInitialStockId(stockId)
    setActiveTab('stocks')
  }

  // 保存页面顺序
  const savePageOrder = (newOrder) => {
    setPageOrder(newOrder)
    localStorage.setItem(PAGE_ORDER_KEY, JSON.stringify(newOrder))
  }

  // 拖拽开始
  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  // 拖拽经过
  const handleDragOver = (e, targetItem) => {
    e.preventDefault()
    if (!draggedItem || draggedItem.id === targetItem.id) return

    const newOrder = [...pageOrder]
    const draggedIndex = newOrder.findIndex(item => item.id === draggedItem.id)
    const targetIndex = newOrder.findIndex(item => item.id === targetItem.id)

    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedItem)

    savePageOrder(newOrder)
  }

  // 重置页面顺序
  const resetPageOrder = () => {
    savePageOrder(DEFAULT_PAGE_ORDER)
    setEditMode(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'memos':
        return <MemoList onStockClick={handleStockNavigate} />
      case 'logic-groups':
        return <LogicGroupList />
      case 'stocks':
        return <StockList key={initialStockId} initialStockId={initialStockId} />
      case 'models':
        return <TradingModelList />
      case 'risk':
        return <RiskControl />
      case 'market':
      default:
        return <MarketInfoList />
    }
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-800 p-2 rounded-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-slate-800 border-r border-slate-700
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-indigo-400">交易系统</h1>
            <button
              onClick={() => {
                if (editMode) {
                  resetPageOrder()
                } else {
                  setEditMode(true)
                }
              }}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                editMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {editMode ? '完成' : '排序'}
            </button>
          </div>
          <nav className="space-y-1">
            {pageOrder.map((item) => (
              <div
                key={item.id}
                draggable={editMode}
                onDragStart={(e) => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, item)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-150 cursor-pointer
                  ${editMode ? 'bg-slate-700/50' : ''}
                  ${draggedItem?.id === item.id ? 'opacity-50' : ''}
                  ${activeTab === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
                onClick={() => {
                  if (!editMode) {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }
                }}
              >
                {editMode && (
                  <GripVertical size={16} className="text-slate-500 cursor-grab" />
                )}
                <item.icon size={20} />
                <span>{item.label}</span>
                {editMode && activeTab === item.id && (
                  <span className="ml-auto text-xs text-indigo-300">当前</span>
                )}
              </div>
            ))}
          </nav>

          {editMode && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 mb-2">拖动排序，长按拖手柄移动</p>
              <button
                onClick={resetPageOrder}
                className="w-full text-xs text-slate-500 hover:text-white py-1"
              >
                恢复默认顺序
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
