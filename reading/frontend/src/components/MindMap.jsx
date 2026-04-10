import { useState, useEffect, useRef } from 'react'
import { Plus, Edit3, Trash2, X, Check, ChevronRight, ChevronDown, Folder } from 'lucide-react'

const STORAGE_PREFIX = 'mindmap-'

export default function MindMap({ bookId, bookTitle }) {
  const [nodes, setNodes] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [selectedNode, setSelectedNode] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const inputRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + bookId)
    if (saved) {
      setNodes(JSON.parse(saved))
    } else {
      // 初始化根节点
      const rootNode = {
        id: 'root',
        text: bookTitle || '思维导图',
        children: [],
        collapsed: false
      }
      setNodes([rootNode])
    }
  }, [bookId, bookTitle])

  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem(STORAGE_PREFIX + bookId, JSON.stringify(nodes))
    }
  }, [nodes, bookId])

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingId])

  const findNode = (id, list = nodes) => {
    for (const node of list) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNode(id, node.children)
        if (found) return found
      }
    }
    return null
  }

  const updateNode = (id, updates, list = nodes) => {
    return list.map(node => {
      if (node.id === id) {
        return { ...node, ...updates }
      }
      if (node.children) {
        return { ...node, children: updateNode(id, updates, node.children) }
      }
      return node
    })
  }

  const deleteNode = (id, list = nodes) => {
    return list.filter(node => {
      if (node.id === id) return false
      if (node.children) {
        node.children = deleteNode(id, node.children)
      }
      return true
    }).map(node => {
      if (node.children) {
        return { ...node, children: deleteNode(id, node.children) }
      }
      return node
    })
  }

  const handleAddChild = (parentId) => {
    const newNode = {
      id: Date.now().toString(),
      text: '新节点',
      children: [],
      collapsed: false
    }
    setNodes(updateNode(parentId, { children: [...(findNode(parentId)?.children || []), newNode] }))
    setSelectedNode(null)
    // 开始编辑新节点
    setTimeout(() => {
      setEditingId(newNode.id)
      setEditText(newNode.text)
    }, 50)
  }

  const handleEdit = (node) => {
    setEditingId(node.id)
    setEditText(node.text)
  }

  const handleSaveEdit = () => {
    if (editingId && editText.trim()) {
      setNodes(updateNode(editingId, { text: editText.trim() }))
    }
    setEditingId(null)
    setEditText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditText('')
    }
  }

  const handleDelete = (id) => {
    if (id === 'root') {
      alert('根节点不能删除')
      return
    }
    if (confirm('确定删除这个节点及其所有子节点？')) {
      setNodes(deleteNode(id))
      setSelectedNode(null)
    }
  }

  const toggleCollapse = (id) => {
    const node = findNode(id)
    if (node && node.children && node.children.length > 0) {
      setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
    }
  }

  const renderNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isCollapsed = collapsed[node.id]
    const isEditing = editingId === node.id
    const isSelected = selectedNode === node.id

    return (
      <div key={node.id} className="relative">
        <div
          className={`flex items-center gap-1 py-1 px-2 rounded-lg cursor-pointer transition-all ${
            isSelected ? 'bg-indigo-100' : 'hover:bg-gray-50'
          } ${level === 0 ? 'bg-indigo-50' : ''}`}
          style={{ marginLeft: level * 20 }}
          onClick={() => setSelectedNode(node.id)}
        >
          {/* Collapse Toggle */}
          {hasChildren ? (
            <button
              onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
              className="p-0.5 hover:bg-indigo-100 rounded"
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {/* Node Content */}
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
                className="flex-1 px-2 py-0.5 border rounded text-sm focus:ring-1 focus:ring-indigo-500"
              />
              <button onClick={handleSaveEdit} className="p-1 hover:bg-indigo-100 rounded">
                <Check size={14} className="text-green-600" />
              </button>
              <button onClick={() => { setEditingId(null); setEditText(''); }} className="p-1 hover:bg-gray-100 rounded">
                <X size={14} className="text-gray-500" />
              </button>
            </div>
          ) : (
            <>
              <span className={`flex-1 text-sm ${level === 0 ? 'font-bold' : ''}`}>
                {node.text}
              </span>
              
              {/* Node Actions */}
              <div className={`flex items-center gap-0.5 ${isSelected ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddChild(node.id); }}
                  className="p-1 hover:bg-indigo-100 rounded"
                  title="添加子节点"
                >
                  <Plus size={12} className="text-indigo-600" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(node); }}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="编辑"
                >
                  <Edit3 size={12} className="text-gray-500" />
                </button>
                {level > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(node.id); }}
                    className="p-1 hover:bg-red-50 rounded"
                    title="删除"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Children */}
        {hasChildren && !isCollapsed && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <Folder size={18} />
        <span className="font-bold">思维导图</span>
        <span className="text-xs opacity-70">点击节点添加子节点</span>
      </div>
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {nodes.length > 0 ? (
          <div>
            {nodes.map(node => renderNode(node))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            加载中...
          </div>
        )}
      </div>
    </div>
  )
}
