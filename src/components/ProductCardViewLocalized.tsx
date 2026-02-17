'use client'

import { useState } from 'react'
import { Package, Minus, Plus, Edit3, AlertTriangle, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'
import { useLocale } from './LocaleProvider'
import { EditProductModal } from './EditProductModal'

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
  onUpdateProduct: (id: number, updatedProduct: Partial<Product>) => void
  onDeleteProduct: (id: number) => void
}

export function ProductCardView({ products, onUpdateQuantity, onUpdateProduct, onDeleteProduct }: ProductCardViewProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const { t } = useLocale()

  const translateUnit = (unit: string) => {
    return t(`units.${unit}`) || unit
  }

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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowEditModal(true)
  }

  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(t('modal.confirmDelete', { name: product.name }))) {
      onDeleteProduct(product.id)
    }
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'out':
        return t('stock.outOfStock')
      case 'low':
        return t('stock.lowStock')
      case 'good':
        return t('stock.goodStock')
      default:
        return status
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={64} className="mx-auto mb-4 text-ada-text-muted opacity-50" />
        <h3 className="text-ada-xl font-medium text-ada-text-primary mb-2">{t('search.noResults')}</h3>
        <p className="text-ada-text-secondary">{t('search.tryAdjusting')}</p>
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
          <div className="text-ada-sm font-medium text-ada-text-primary">{t('stats.outOfStockProducts')}</div>
        </div>
        <div className="bg-ada-bg-secondary rounded-ada-lg p-4 text-center border-2 border-ada-warning">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown size={20} className="text-ada-warning mr-2" />
            <div className="text-ada-xl font-bold text-ada-warning">
              {products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length}
            </div>
          </div>
          <div className="text-ada-sm font-medium text-ada-text-primary">{t('stats.lowStockProducts')}</div>
        </div>
        <div className="bg-ada-bg-secondary rounded-ada-lg p-4 text-center border-2 border-ada-success">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp size={20} className="text-ada-success mr-2" />
            <div className="text-ada-xl font-bold text-ada-success">
              {products.filter(p => p.quantity > p.minStock).length}
            </div>
          </div>
          <div className="text-ada-sm font-medium text-ada-text-primary">{t('stock.goodStock')}</div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-ada-sm text-ada-text-secondary">
          {t('stats.showing', { count: products.length.toString() })}
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
                  <span className="ml-2 text-ada-sm font-medium">{getStatusText(stockStatus)}</span>
                </div>
                {stockStatus !== 'good' && (
                  <div className="text-right">
                    {stockStatus === 'out' ? (
                      <div className="qty-badge-low">{t('badges.urgent')}</div>
                    ) : (
                      <div className="qty-badge-medium flex items-center">
                        <AlertTriangle size={12} className="mr-1" />
                        {t('badges.low')}
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
                  {t(`categories.${product.category}`) !== `categories.${product.category}` ? 
                    t(`categories.${product.category}`) : 
                    product.category}
                </p>
              </div>

              {/* Quantity Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-ada-sm font-medium text-ada-text-secondary">{t('product.currentStock')}</span>
                  <span className="text-ada-xs text-ada-text-muted bg-gray-100 px-2 py-1 rounded">
                    {t('time.min')}: {product.minStock}
                  </span>
                </div>

                {isEditing ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-32 px-4 py-3 text-center text-2xl font-bold border-2 border-ada-success rounded-lg focus:outline-none focus:ring-4 focus:ring-green-200 bg-white"
                        min="0"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEditSave(product.id)
                          } else if (e.key === 'Escape') {
                            handleEditCancel()
                          }
                        }}
                      />
                      <span className="text-ada-sm text-ada-text-secondary">
                        {translateUnit(product.unit)}
                      </span>
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
                    <div className="text-ada-sm text-ada-text-muted">
                      {translateUnit(product.unit)}
                    </div>
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
                      className="p-4 bg-ada-success text-white rounded-lg text-lg font-bold min-h-[56px] hover:bg-green-600"
                    >
                      {t('product.save')}
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="p-4 bg-gray-200 text-gray-700 rounded-lg text-lg font-bold min-h-[56px] hover:bg-gray-300"
                    >
                      {t('product.cancel')}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Primary actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleQuickUpdate(product, -1)}
                        disabled={product.quantity === 0}
                        className="p-4 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 rounded-lg font-bold min-w-[56px] min-h-[56px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('product.remove') + ' 1'}
                      >
                        <Minus size={24} />
                      </button>
                      
                      <button
                        onClick={() => handleEditStart(product)}
                        className="btn-stock-secondary flex items-center justify-center py-2 min-h-[56px]"
                        title={t('product.editQuantity')}
                      >
                        <Edit3 size={20} />
                      </button>
                      
                      <button
                        onClick={() => handleQuickUpdate(product, 1)}
                        className="p-4 bg-ada-success text-white rounded-lg font-bold min-w-[56px] min-h-[56px] flex items-center justify-center hover:bg-green-600"
                        title={t('product.add') + ' 1'}
                      >
                        <Plus size={24} />
                      </button>
                    </div>

                    {/* Quick increment buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleQuickUpdate(product, -5)}
                        disabled={product.quantity < 5}
                        className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-lg font-bold min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('product.remove') + ' 5'}
                      >
                        -5
                      </button>
                      
                      <button
                        onClick={() => handleQuickUpdate(product, -10)}
                        disabled={product.quantity < 10}
                        className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-lg font-bold min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('product.remove') + ' 10'}
                      >
                        -10
                      </button>
                      
                      <button
                        onClick={() => handleQuickUpdate(product, 10)}
                        className="p-3 bg-green-100 hover:bg-green-200 border border-green-300 text-green-700 rounded-lg text-lg font-bold min-h-[48px]"
                        title={t('product.add') + ' 10'}
                      >
                        +10
                      </button>
                    </div>

                    {/* Edit & Delete actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="btn-stock-secondary flex items-center justify-center space-x-2 min-h-[48px]"
                        title={t('product.editProduct')}
                      >
                        <Edit3 size={16} />
                        <span>{t('product.edit')}</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="p-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg font-medium min-h-[48px] flex items-center justify-center space-x-2 hover:text-red-700"
                        title={t('product.deleteProduct')}
                      >
                        <Trash2 size={16} />
                        <span>{t('product.delete')}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Footer with Last Updated */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-ada-xs text-ada-text-muted text-center">
                  {t('time.updated')}: {new Date(product.lastUpdated).toLocaleDateString('en-US', { 
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

      {/* Edit Product Modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingProduct(null)
        }}
        onUpdate={onUpdateProduct}
      />
    </div>
  )
}