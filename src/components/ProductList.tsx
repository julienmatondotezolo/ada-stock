'use client'

import { useState } from 'react'
import { Package, Minus, Plus, Edit3, AlertTriangle } from 'lucide-react'

interface Product {
  id: number
  name: string
  category: string
  quantity: number
  minStock: number
  unit: string
  lastUpdated: string
}

interface ProductListProps {
  products: Product[]
  onUpdateQuantity: (id: number, newQuantity: number) => void
}

export function ProductList({ products, onUpdateQuantity }: ProductListProps) {
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
      {/* Sort options */}
      <div className="flex items-center justify-between">
        <p className="text-ada-sm text-ada-text-secondary">
          Showing {products.length} products
        </p>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => {
          const stockStatus = getStockStatus(product)
          const isEditing = editingId === product.id

          return (
            <div
              key={product.id}
              className={`product-card border-2 ${getStockColor(stockStatus)} transition-all duration-200`}
            >
              {/* Stock Alert Badge */}
              {stockStatus !== 'good' && (
                <div className="absolute top-3 right-3">
                  {stockStatus === 'out' ? (
                    <div className="qty-badge-low">OUT</div>
                  ) : (
                    <div className="qty-badge-medium flex items-center">
                      <AlertTriangle size={12} className="mr-1" />
                      LOW
                    </div>
                  )}
                </div>
              )}

              {/* Product Info */}
              <div className="mb-4">
                <h3 className="text-ada-lg font-semibold text-ada-text-primary mb-1">
                  {product.name}
                </h3>
                <p className="text-ada-sm text-ada-text-secondary">{product.category}</p>
              </div>

              {/* Quantity Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-ada-sm text-ada-text-secondary">Current Stock</span>
                  <span className="text-ada-xs text-ada-text-muted">Min: {product.minStock} {product.unit}</span>
                </div>

                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="input-stock text-center"
                      min="0"
                      autoFocus
                    />
                    <span className="text-ada-sm text-ada-text-secondary">{product.unit}</span>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={`text-ada-3xl font-bold ${
                      stockStatus === 'out' ? 'stock-level-low' :
                      stockStatus === 'low' ? 'stock-level-medium' : 'stock-level-good'
                    }`}>
                      {product.quantity}
                    </div>
                    <div className="text-ada-sm text-ada-text-muted">{product.unit}</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2">
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
                    {/* Quick adjust buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleQuickUpdate(product, -1)}
                        disabled={product.quantity === 0}
                        className="btn-stock-secondary flex items-center justify-center py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleEditStart(product)}
                        className="btn-stock-secondary flex items-center justify-center py-2"
                      >
                        <Edit3 size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleQuickUpdate(product, 1)}
                        className="btn-stock-primary flex items-center justify-center py-2"
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
                      >
                        -5
                      </button>
                      
                      <button
                        onClick={() => handleQuickUpdate(product, -10)}
                        disabled={product.quantity < 10}
                        className="btn-stock-secondary py-2 text-ada-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -10
                      </button>
                      
                      <button
                        onClick={() => handleQuickUpdate(product, 10)}
                        className="btn-stock-primary py-2 text-ada-sm"
                      >
                        +10
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Last Updated */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-ada-xs text-ada-text-muted text-center">
                  Updated: {new Date(product.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}