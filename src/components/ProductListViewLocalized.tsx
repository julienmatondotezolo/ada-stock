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

interface ProductListViewProps {
  products: Product[]
  onUpdateQuantity: (id: number, newQuantity: number) => void
  onUpdateProduct: (id: number, updatedProduct: Partial<Product>) => void
  onDeleteProduct: (id: number) => void
}

export function ProductListView({ products, onUpdateQuantity, onUpdateProduct, onDeleteProduct }: ProductListViewProps) {
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
        <h3 className="text-ada-xl font-medium text-ada-text-primary mb-2">{t('search.noResults')}</h3>
        <p className="text-ada-text-secondary">{t('search.tryAdjusting')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-ada-sm text-ada-text-secondary">
          {t('stats.showing', { count: products.length.toString() })}
        </p>
      </div>

      {/* Table */}
      <div className="card-stock overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ada-bg-accent border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">{t('product.status')}</th>
                <th className="text-left py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">{t('product.name')}</th>
                <th className="text-left py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">{t('product.category')}</th>
                <th className="text-center py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">{t('product.quantity')}</th>
                <th className="text-center py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">{t('time.min')}</th>
                <th className="text-center py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">-</th>
                <th className="text-center py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">{t('time.updated')}</th>
                <th className="text-center py-3 px-4 text-ada-sm font-medium text-ada-text-secondary">{t('product.actions')}</th>
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
                      <span className="text-ada-sm text-ada-text-secondary">
                        {t(`categories.${product.category.toLowerCase().replace(/\s+/g, '')}`) !== `categories.${product.category.toLowerCase().replace(/\s+/g, '')}` ? 
                          t(`categories.${product.category.toLowerCase().replace(/\s+/g, '')}`) : 
                          product.category}
                      </span>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-4 text-center">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24 px-3 py-2 text-center text-xl font-bold border-2 border-ada-success rounded-lg focus:outline-none focus:ring-4 focus:ring-green-200"
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
                      ) : (
                        <span className={`font-bold text-xl ${
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
                      <span className="text-ada-sm text-ada-text-muted">
                        {translateUnit(product.unit)}
                      </span>
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
                            className="text-ada-success hover:text-green-700 p-1 rounded hover:bg-green-50"
                            title={t('product.save')}
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-ada-text-muted hover:text-ada-text-secondary p-1 rounded hover:bg-gray-50"
                            title={t('product.cancel')}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-1">
                          {/* Quick decrease by 1 */}
                          <button
                            onClick={() => handleQuickUpdate(product, -1)}
                            disabled={product.quantity === 0}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t('product.decrease') + ' 1'}
                          >
                            <Minus size={16} />
                          </button>

                          {/* Edit Quantity */}
                          <button
                            onClick={() => handleEditStart(product)}
                            className="p-1 text-ada-text-muted hover:text-ada-text-secondary hover:bg-blue-50 rounded"
                            title={t('product.editQuantity')}
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Quick increase by 1 */}
                          <button
                            onClick={() => handleQuickUpdate(product, 1)}
                            className="p-1 text-ada-success hover:text-green-700 hover:bg-green-50 rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title={t('product.increase') + ' 1'}
                          >
                            <Plus size={16} />
                          </button>

                          {/* Edit Product */}
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title={t('product.editProduct')}
                          >
                            <Edit3 size={14} />
                          </button>

                          {/* Delete Product */}
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            title={t('product.deleteProduct')}
                          >
                            <Trash2 size={14} />
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
          <div className="text-ada-sm text-ada-text-secondary">{t('stats.outOfStockProducts')}</div>
        </div>
        <div className="bg-ada-bg-secondary rounded-ada-md p-4 text-center border border-gray-200">
          <div className="text-ada-lg font-semibold text-ada-warning">
            {products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length}
          </div>
          <div className="text-ada-sm text-ada-text-secondary">{t('stats.lowStockProducts')}</div>
        </div>
        <div className="bg-ada-bg-secondary rounded-ada-md p-4 text-center border border-gray-200">
          <div className="text-ada-lg font-semibold text-ada-success">
            {products.filter(p => p.quantity > p.minStock).length}
          </div>
          <div className="text-ada-sm text-ada-text-secondary">{t('stock.goodStock')}</div>
        </div>
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