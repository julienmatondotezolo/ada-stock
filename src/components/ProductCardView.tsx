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

interface ProductCardViewProps {
  products: Product[]
  onUpdateQuantity: (id: number, newQuantity: number) => void
}

export function ProductCardView({ products, onUpdateQuantity }: ProductCardViewProps) {
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

  const getStockColor = (status: string) => {
    switch (status) {
      case 'out': return 'border-ada-error bg-red-50'
      case 'low': return 'border-ada-warning bg-yellow-50' 
      case 'good': return 'border-gray-200 bg-ada-bg-secondary'
      default: return 'border-gray-200 bg-ada-bg-secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'out':
        return <AlertTriangle size={18} className="text-ada-error" />
      case 'low':
        return <TrendingDown size={18} className="text-ada-warning" />
      case 'good':
        return <TrendingUp size={18} className="text-ada-success" />
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
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-ada-bg-secondary rounded-ada-lg p-4 text-center border-2 border-ada-error">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle size={20} className="text-ada-error mr-2" />
            <div className="text-ada-xl font-bold text-ada-error">
              {products.filter(p => p.quantity === 0).length}
            </div>
          </div>
          <div className="text-ada-sm font-medium text-ada-text-primary">Out of Stock</div>
        </div>
        <div className="bg-ada-bg-secondary rounded-ada-lg p-4 text-center border-2 border-ada-warning">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown size={20} className="text-ada-warning mr-2" />
            <div className="text-ada-xl font-bold text-ada-warning">
              {products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length}
            </div>
          </div>
          <div className="text-ada-sm font-medium text-ada-text-primary">Low Stock</div>
        </div>
        <div className="bg-ada-bg-secondary rounded-ada-lg p-4 text-center border-2 border-ada-success">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp size={20} className="text-ada-success mr-2" />
            <div className="text-ada-xl font-bold text-ada-success">
              {products.filter(p => p.quantity > p.minStock).length}
            </div>
          </div>
          <div className="text-ada-sm font-medium text-ada-text-primary">Good Stock</div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-ada-sm text-ada-text-secondary">
          Showing {products.length} products
        </p>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {products.map(product => {
          const stockStatus = getStockStatus(product)
          const isEditing = editingId === product.id

          return (
            <div
              key={product.id}
              className={`product-card border-2 ${getStockColor(stockStatus)} transition-all duration-200 hover:shadow-md`}
            >
              {/* Header with Status Icon and Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {getStatusIcon(stockStatus)}
                  <span className="ml-2 text-ada-sm font-medium capitalize">{stockStatus === 'out' ? 'Out' : stockStatus} Stock</span>
                </div>
                {stockStatus !== 'good' && (
                  <div className="text-right">
                    {stockStatus === 'out' ? (
                      <div className="qty-badge-low">URGENT</div>
                    ) : (
                      <div className="qty-badge-medium flex items-center">
                        <AlertTriangle size={12} className="mr-1" />
                        LOW
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="mb-6">
                <h3 className="text-ada-lg font-semibold text-ada-text-primary mb-1 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-ada-sm text-ada-text-secondary bg-ada-bg-accent px-2 py-1 rounded-ada-sm inline-block">
                  {product.category}
                </p>
              </div>

              {/* Quantity Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-ada-sm font-medium text-ada-text-secondary">Current Stock</span>
                  <span className="text-ada-xs text-ada-text-muted bg-gray-100 px-2 py-1 rounded">
                    Min: {product.minStock} {product.unit}
                  </span>
                </div>

                {isEditing ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="input-stock text-center w-24"
                        min="0"
                        autoFocus
                      />
                      <span className="text-ada-sm text-ada-text-secondary">{product.unit}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={`text-ada-4xl font-bold mb-1 ${
                      stockStatus === 'out' ? 'stock-level-low' :
                      stockStatus === 'low' ? 'stock-level-medium' : 'stock-level-good'
                    }`}>
                      {product.quantity}
                    </div>
                    <div className="text-ada-sm text-ada-text-muted">{product.unit}</div>
                  </div>
                )}

                {/* Stock Level Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        stockStatus === 'out' ? 'bg-ada-error w-0' :
                        stockStatus === 'low' ? 'bg-ada-warning' : 'bg-ada-success'
                      }`}
                      style={{
                        width: stockStatus === 'out' ? '0%' : 
                               stockStatus === 'low' ? '25%' : 
                               Math.min(100, (product.quantity / (product.minStock * 2)) * 100) + '%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleEditSave(product.id)}
                      className="btn-stock-primary py-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="btn-stock-secondary py-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Primary actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleQuickUpdate(product, -1)}
                        disabled={product.quantity === 0}
                        className="btn-stock-secondary flex items-center justify-center py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove 1"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleEditStart(product)}
                        className="btn-stock-secondary flex items-center justify-center py-2"
                        title="Edit quantity"
                      >
                        <Edit3 size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleQuickUpdate(product, 1)}
                        className="btn-stock-primary flex items-center justify-center py-2"
                        title="Add 1"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Quick increment buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleQuickUpdate(product, -5)}
                        disabled={product.quantity < 5}
                        className="btn-stock-secondary py-2 text-ada-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove 5"
                      >
                        -5
                      </button>
                      
                      <button
                        onClick={() => handleQuickUpdate(product, -10)}
                        disabled={product.quantity < 10}
                        className="btn-stock-secondary py-2 text-ada-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove 10"
                      >
                        -10
                      </button>
                      
                      <button
                        onClick={() => handleQuickUpdate(product, 10)}
                        className="btn-stock-primary py-2 text-ada-sm"
                        title="Add 10"
                      >
                        +10
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Footer with Last Updated */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-ada-xs text-ada-text-muted text-center">
                  Updated: {new Date(product.lastUpdated).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}