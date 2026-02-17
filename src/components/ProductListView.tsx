'use client'

import { useState } from 'react'
import { Package, Minus, Plus, Edit3, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

interface Product {
  id: number
  name: string
  category: string
  quantity: number
  minStock: number
  unit: string
  lastUpdated: string
}

interface ProductListViewProps {
  products: Product[]
  onUpdateQuantity: (id: number, newQuantity: number) => void
}

export function ProductListView({ products, onUpdateQuantity }: ProductListViewProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleQuickUpdate = (product: Product, change: number) => {
    const newQuantity = Math.max(0, product.quantity + change)
    onUpdateQuantity(product.id, newQuantity)
  }

  const handleEditStart = (product: Product) => {
    setEditingId(product.id)
    setEditValue(product.quantity.toString())
  }

  const handleEditSave = (productId: number) => {
    const newQuantity = parseInt(editValue) || 0
    onUpdateQuantity(productId, Math.max(0, newQuantity))
    setEditingId(null)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue('')
  }

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) return 'out'
    if (product.quantity <= product.minStock) return 'low'
    return 'good'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'out':
        return <AlertTriangle size={16} className="text-ada-error" />
      case 'low':
        return <TrendingDown size={16} className="text-ada-warning" />
      case 'good':
        return <TrendingUp size={16} className="text-ada-success" />
      default:
        return null
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={64} className="mx-auto mb-4 text-ada-text-muted opacity-50" />
        <h3 className="text-ada-xl font-medium text-ada-text-primary mb-2">No products found</h3>
        <p className="text-ada-text-secondary">Try adjusting your search or add your first product.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-ada-sm text-ada-text-secondary">
          Showing {products.length} products
        </p>
      </div>

      {/* Table */}
      <div className="card-stock overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ada-bg-accent border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">Status</th>
                <th className="text-left py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">Product</th>
                <th className="text-left py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">Category</th>
                <th className="text-center py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">Stock</th>
                <th className="text-center py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">Min</th>
                <th className="text-center py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">Unit</th>
                <th className="text-center py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">Updated</th>
                <th className="text-center py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const stockStatus = getStockStatus(product)
                const isEditing = editingId === product.id
                
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-100 hover:bg-ada-bg-accent transition-colors ${
                      stockStatus === 'out' ? 'bg-red-50' :
                      stockStatus === 'low' ? 'bg-yellow-50' : ''
                    }`}
                  >
                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(stockStatus)}
                        <span className="sr-only">{stockStatus}</span>
                      </div>
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-ada-text-primary">{product.name}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="text-ada-sm text-ada-text-secondary">{product.category}</span>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-16 px-2 py-1 text-center text-ada-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ada-success focus:border-transparent"
                          min="0"
                          autoFocus
                        />
                      ) : (
                        <span className={`font-semibold ${
                          stockStatus === 'out' ? 'stock-level-low' :
                          stockStatus === 'low' ? 'stock-level-medium' : 'stock-level-good'
                        }`}>
                          {product.quantity}
                        </span>
                      )}
                    </td>

                    {/* Min Stock */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-ada-sm text-ada-text-muted">{product.minStock}</span>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-ada-sm text-ada-text-muted">{product.unit}</span>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-ada-sm text-ada-text-muted">
                        {new Date(product.lastUpdated).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleEditSave(product.id)}
                            className="text-ada-success hover:text-green-700 p-1"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-ada-text-muted hover:text-ada-text-secondary p-1"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-1">
                          {/* Quick decrease */}
                          <button
                            onClick={() => handleQuickUpdate(product, -1)}
                            disabled={product.quantity === 0}
                            className="p-1 text-ada-text-muted hover:text-ada-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Decrease by 1"
                          >
                            <Minus size={14} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEditStart(product)}
                            className="p-1 text-ada-text-muted hover:text-ada-text-secondary"
                            title="Edit quantity"
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Quick increase */}
                          <button
                            onClick={() => handleQuickUpdate(product, 1)}
                            className="p-1 text-ada-text-muted hover:text-ada-text-secondary"
                            title="Increase by 1"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-ada-bg-secondary rounded-ada-md p-4 text-center border border-gray-200">
          <div className="text-ada-lg font-semibold text-ada-error">
            {products.filter(p => p.quantity === 0).length}
          </div>
          <div className="text-ada-sm text-ada-text-secondary">Out of Stock</div>
        </div>
        <div className="bg-ada-bg-secondary rounded-ada-md p-4 text-center border border-gray-200">
          <div className="text-ada-lg font-semibold text-ada-warning">
            {products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length}
          </div>
          <div className="text-ada-sm text-ada-text-secondary">Low Stock</div>
        </div>
        <div className="bg-ada-bg-secondary rounded-ada-md p-4 text-center border border-gray-200">
          <div className="text-ada-lg font-semibold text-ada-success">
            {products.filter(p => p.quantity > p.minStock).length}
          </div>
          <div className="text-ada-sm text-ada-text-secondary">Good Stock</div>
        </div>
      </div>
    </div>
  )
}