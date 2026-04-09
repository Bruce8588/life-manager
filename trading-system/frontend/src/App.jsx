import { useState } from 'react'
import { FileText, Network, Database, Palette, Menu, X, BarChart3 } from 'lucide-react'
import MemoList from './components/Memo/MemoList'
import LogicGroupList from './components/LogicGroups/LogicGroupList'
import StockList from './components/Stocks/StockList'
import TradingModelList from './components/TradingModels/TradingModelList'
import MarketInfoList from './components/MarketInfo/MarketInfoList'

function App() {
  const [activeTab, setActiveTab] = useState('market')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { id: 'market', label: '市场信息', icon: BarChart3 },
    { id: 'memos', label: '宏观叙事', icon: FileText },
    { id: 'logic-groups', label: '逻辑分组', icon: Network },
    { id: 'stocks', label: '股票管理', icon: Database },
    { id: 'models', label: '交易模型', icon: Palette },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'memos':
        return <MemoList />
      case 'logic-groups':
        return <LogicGroupList />
      case 'stocks':
        return <StockList />
      case 'models':
        return <TradingModelList />
      case 'market':
        return <MarketInfoList />
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
          <h1 className="text-xl font-bold text-indigo-400 mb-8">交易系统</h1>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-150
                  ${activeTab === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
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
