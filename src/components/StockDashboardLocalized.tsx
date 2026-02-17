'use client'

import { useState } from 'react'
import { AlertTriangle, Package, TrendingDown, Clock, Edit3, Minus, Plus, Check, X } from 'lucide-react'
import { useLocale } from './LocaleProvider'

interface Product {
  id: string
  name: string
  category: string
  quantity: number
  minStock: number
  unit: string
  lastUpdated: string
}

interface StockDashboardProps {
  products: Product[]
  onUpdateQuantity: (id: string, newQuantity: number) => void
}

export function StockDashboard({ products, onUpdateQuantity }: StockDashboardProps) {
  const { t } = useLocale()
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  
  // Calculate stats
  const totalProducts = products.length
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock)
  const outOfStockProducts = products.filter(p => p.quantity === 0)
  const recentlyUpdated = products.filter(p => {
    const today = new Date().toISOString().split('T')[0]
    return p.lastUpdated === today
  })

  const categories = [...new Set(products.map(p => p.category))]
  const categoryStats = categories.map(category => ({
    name: category,
    products: products.filter(p => p.category === category),
    lowStock: products.filter(p => p.category === category && p.quantity <= p.minStock).length
  }))

  // Editing functionality
  const handleEditStart = (product: Product) => {
    setEditingProduct(product.id)
    setEditValue(product.quantity.toString())
  }

  const handleEditSave = (productId: number) => {
    const newQuantity = parseInt(editValue) || 0
    onUpdateQuantity(productId, Math.max(0, newQuantity))
    setEditingProduct(null)
    setEditValue('')
  }

  const handleEditCancel = () => {
    setEditingProduct(null)
    setEditValue('')
  }

  const handleQuickUpdate = (product: Product, change: number) => {
    const newQuantity = Math.max(0, product.quantity + change)
    onUpdateQuantity(product.id, newQuantity)
  }

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-stock text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-ada-success bg-opacity-10 rounded-full mx-auto mb-3">
            <Package className="text-ada-success" size={24} />
          </div>
          <div className="text-ada-2xl font-bold text-ada-text-primary">{totalProducts}</div>
          <div className="text-ada-sm text-ada-text-secondary">{t('stats.totalProducts')}</div>
        </div>

        <div className="card-stock text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-3">
            <AlertTriangle className="text-ada-error" size={24} />
          </div>
          <div className="text-ada-2xl font-bold text-ada-error">{lowStockProducts.length}</div>
          <div className="text-ada-sm text-ada-text-secondary">{t('stats.lowStockProducts')}</div>
        </div>

        <div className="card-stock text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3">
            <TrendingDown className="text-gray-600" size={24} />
          </div>
          <div className="text-ada-2xl font-bold text-gray-600">{outOfStockProducts.length}</div>
          <div className="text-ada-sm text-ada-text-secondary">{t('stats.outOfStockProducts')}</div>
        </div>

        <div className="card-stock text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
            <Clock className="text-ada-blue" size={24} />
          </div>
          <div className="text-ada-2xl font-bold text-ada-blue">{recentlyUpdated.length}</div>
          <div className="text-ada-sm text-ada-text-secondary">{t('stats.updatedToday')}</div>
        </div>
      </div>

      {/* Urgent Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="card-stock">
          <h3 className="text-ada-xl font-bold text-ada-text-primary mb-4 flex items-center">
            <AlertTriangle className="text-ada-error mr-2" size={24} />
            {t('alerts.urgentAttention')}
          </h3>
          
          <div className="space-y-3">
            {outOfStockProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-ada-md border border-red-200 hover:bg-red-100 transition-colors">
                <div className="flex-1">
                  <span className="font-medium text-ada-text-primary">{product.name}</span>
                  <div className="text-ada-sm text-ada-text-secondary">
                    {t(`categories.${product.category}`) !== `categories.${product.category}` ? 
                      t(`categories.${product.category}`) : 
                      product.category}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {editingProduct === product.id ? (
                    <>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-3 py-2 text-center text-lg font-bold border-2 border-ada-success rounded-lg focus:outline-none focus:ring-4 focus:ring-green-200"
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
                      <button
                        onClick={() => handleEditSave(product.id)}
                        className="p-2 text-ada-success hover:text-green-700 hover:bg-green-100 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
                        title={t('product.save')}
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-2 text-ada-text-muted hover:text-ada-text-secondary hover:bg-gray-100 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
                        title={t('product.cancel')}
                      >
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-1">
                        <span className={`font-semibold text-lg text-ada-error`}>
                          {product.quantity}
                        </span>
                      </div>
                      <button
                        onClick={() => handleQuickUpdate(product, 1)}
                        className="p-3 text-ada-success hover:text-green-700 hover:bg-green-100 rounded-lg text-xl font-bold min-w-[48px] min-h-[48px] flex items-center justify-center"
                        title={t('product.add') + ' 1'}
                      >
                        <Plus size={24} />
                      </button>
                      <button
                        onClick={() => handleEditStart(product)}
                        className="p-2 text-ada-text-muted hover:text-ada-text-secondary hover:bg-gray-100 rounded"
                        title={t('product.edit')}
                      >
                        <Edit3 size={16} />
                      </button>
                      <div className="qty-badge-low">{t('badges.outOfStock')}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {lowStockProducts.filter(p => p.quantity > 0).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-ada-md border border-yellow-200 hover:bg-yellow-100 transition-colors">
                <div className="flex-1">
                  <span className="font-medium text-ada-text-primary">{product.name}</span>
                  <div className="text-ada-sm text-ada-text-secondary">
                    {t(`categories.${product.category}`) !== `categories.${product.category}` ? 
                      t(`categories.${product.category}`) : 
                      product.category}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {editingProduct === product.id ? (
                    <>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-16 px-2 py-1 text-center text-ada-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ada-success focus:border-transparent"
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
                      <button
                        onClick={() => handleEditSave(product.id)}
                        className="p-1 text-ada-success hover:text-green-700 hover:bg-green-100 rounded"
                        title={t('product.save')}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-1 text-ada-text-muted hover:text-ada-text-secondary hover:bg-gray-100 rounded"
                        title={t('product.cancel')}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleQuickUpdate(product, -1)}
                        disabled={product.quantity === 0}
                        className="p-3 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg text-xl font-bold min-w-[48px] min-h-[48px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title={t('product.decrease') + ' 1'}
                      >
                        <Minus size={24} />
                      </button>
                      <div className="text-center min-w-[60px]">
                        <div className={`text-2xl font-bold ${
                          product.quantity === 0 ? 'text-ada-error' :
                          product.quantity <= product.minStock ? 'text-ada-warning' : 'text-ada-success'
                        }`}>
                          {product.quantity}
                        </div>
                        <div className="text-ada-xs text-ada-text-muted">
                          {t('time.min')}: {product.minStock}
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickUpdate(product, 1)}
                        className="p-3 text-ada-success hover:text-green-700 hover:bg-green-100 rounded-lg text-xl font-bold min-w-[48px] min-h-[48px] flex items-center justify-center"
                        title={t('product.add') + ' 1'}
                      >
                        <Plus size={24} />
                      </button>
                      <button
                        onClick={() => handleEditStart(product)}
                        className="p-2 text-ada-text-muted hover:text-ada-text-secondary hover:bg-gray-100 rounded"
                        title={t('product.edit')}
                      >
                        <Edit3 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Overview */}
      <div className="card-stock">
        <h3 className="text-ada-xl font-bold text-ada-text-primary mb-4">{t('dashboard.categoriesOverview')}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map(category => (
            <div key={category.name} className={`p-4 bg-ada-bg-accent rounded-ada-md cursor-pointer transition-all hover:shadow-md hover:bg-gray-100 ${
              expandedCategory === category.name ? 'ring-2 ring-ada-success bg-green-50' : ''
            }`}>
              <div 
                className="flex items-center justify-between mb-2"
                onClick={() => toggleCategoryExpansion(category.name)}
              >
                <h4 className="font-medium text-ada-text-primary">
                  {t(`categories.${category.name}`) !== `categories.${category.name}` ? 
                    t(`categories.${category.name}`) : 
                    category.name}
                </h4>
                {category.lowStock > 0 && (
                  <div className="qty-badge-low">{category.lowStock} {t('badges.low')}</div>
                )}
              </div>
              
              <div className="text-ada-2xl font-bold text-ada-success">{category.products.length}</div>
              <div className="text-ada-sm text-ada-text-secondary mb-2">{t('dashboard.products')}</div>
              
              {expandedCategory === category.name ? (
                // Expanded view with full product list and editing
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {category.products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-2 bg-ada-bg-secondary rounded border hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="text-ada-sm font-medium text-ada-text-primary truncate block">
                          {product.name}
                        </span>
                        <span className="text-ada-xs text-ada-text-muted">
                          {t('time.min')}: {product.minStock}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        {editingProduct === product.id ? (
                          <>
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-16 px-2 py-1 text-center text-md font-bold border-2 border-ada-success rounded-lg focus:outline-none focus:ring-2 focus:ring-green-200"
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
                            <button
                              onClick={() => handleEditSave(product.id)}
                              className="p-1 text-ada-success hover:bg-green-100 rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center"
                              title={t('product.save')}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="p-1 text-ada-text-muted hover:bg-gray-100 rounded-lg min-w-[32px] min-h-[32px] flex items-center justify-center"
                              title={t('product.cancel')}
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuickUpdate(product, -1)
                              }}
                              disabled={product.quantity === 0}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg font-bold min-w-[40px] min-h-[40px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                              title={t('product.decrease') + ' 1'}
                            >
                              <Minus size={20} />
                            </button>
                            
                            <div className="text-center min-w-[50px]">
                              <span className={`text-xl font-bold ${
                                product.quantity === 0 ? 'text-ada-error' :
                                product.quantity <= product.minStock ? 'text-ada-warning' : 'text-ada-success'
                              }`}>
                                {product.quantity}
                              </span>
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuickUpdate(product, 1)
                              }}
                              className="p-2 text-ada-success hover:text-green-700 hover:bg-green-100 rounded-lg font-bold min-w-[40px] min-h-[40px] flex items-center justify-center"
                              title={t('product.add') + ' 1'}
                            >
                              <Plus size={20} />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditStart(product)
                              }}
                              className="p-1 text-ada-text-muted hover:text-ada-text-secondary hover:bg-gray-100 rounded"
                              title={t('product.edit')}
                            >
                              <Edit3 size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Collapsed view with sample products
                <div className="mt-3 space-y-1">
                  {category.products.slice(0, 3).map(product => (
                    <div key={product.id} className="flex justify-between text-ada-sm">
                      <span className="text-ada-text-secondary truncate">{product.name}</span>
                      <span className={`font-medium text-lg ${
                        product.quantity <= product.minStock ? 'text-ada-error' : 'text-ada-success'
                      }`}>
                        {product.quantity}
                      </span>
                    </div>
                  ))}
                  {category.products.length > 3 && (
                    <div className="text-ada-xs text-ada-text-muted">
                      +{category.products.length - 3} {t('dashboard.more')}
                    </div>
                  )}
                  <div className="text-ada-xs text-ada-success mt-2 opacity-70">
                    {t('product.clickToEdit')} →
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-stock">
        <h3 className="text-ada-xl font-bold text-ada-text-primary mb-4">{t('dashboard.recentActivity')}</h3>
        
        {recentlyUpdated.length > 0 ? (
          <div className="space-y-3">
            {recentlyUpdated.slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-ada-bg-accent rounded-ada-md">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-ada-success rounded-full"></div>
                  <div>
                    <span className="font-medium text-ada-text-primary">{product.name}</span>
                    <div className="text-ada-sm text-ada-text-secondary">{t('dashboard.updatedToday')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium text-lg ${
                    product.quantity <= product.minStock ? 'stock-level-low' : 'stock-level-good'
                  }`}>
                    {product.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-ada-text-muted">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>{t('dashboard.noProductsUpdated')}</p>
          </div>
        )}
      </div>
    </div>
  )
}