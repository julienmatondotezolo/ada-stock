'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, ArrowUpDown } from 'lucide-react'
import { ProductListView } from './ProductListViewLocalized'
import { ProductCardView } from './ProductCardViewLocalized'
import { ViewToggle, ViewMode } from './ViewToggle'
import { useLocale } from './LocaleProvider'

interface Product {
  id: number
  name: string
  category: string
  quantity: number
  minStock: number
  unit: string
  lastUpdated: string
}

interface ProductViewProps {
  products: Product[]
  onUpdateQuantity: (id: number, newQuantity: number) => void
  onUpdateProduct: (id: number, updatedProduct: Partial<Product>) => void
  onDeleteProduct: (id: number) => void
  className?: string
}

export function ProductView({ products, onUpdateQuantity, onUpdateProduct, onDeleteProduct, className = '' }: ProductViewProps) {
  const [currentView, setCurrentView] = useState<ViewMode>('card')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [isEditing, setIsEditing] = useState(false)
  const [editingTimeout, setEditingTimeout] = useState<NodeJS.Timeout | null>(null)
  const [autoSortEnabled, setAutoSortEnabled] = useState(true)
  const { t } = useLocale()

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category))).sort()

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (editingTimeout) {
        clearTimeout(editingTimeout)
      }
    }
  }, [editingTimeout])

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    
    const matchesStock = stockFilter === 'all' ||
                        (stockFilter === 'out' && product.quantity === 0) ||
                        (stockFilter === 'low' && product.quantity > 0 && product.quantity <= product.minStock) ||
                        (stockFilter === 'good' && product.quantity > product.minStock)
    
    return matchesSearch && matchesCategory && matchesStock
  })

  // Stable sorting: maintain order during editing or when auto-sort is disabled
  const sortedProducts = (isEditing || !autoSortEnabled) ? 
    // During editing or auto-sort disabled: keep current order stable
    filteredProducts :
    // When not editing and auto-sort enabled: sort by priority
    filteredProducts.sort((a, b) => {
      const getStatusPriority = (product: Product) => {
        if (product.quantity === 0) return 0 // Out of stock first
        if (product.quantity <= product.minStock) return 1 // Low stock second
        return 2 // Good stock last
      }
      
      const aPriority = getStatusPriority(a)
      const bPriority = getStatusPriority(b)
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      // Within same priority, sort by name
      return a.name.localeCompare(b.name)
    })

  // Handle quantity updates with editing state management
  const handleUpdateQuantity = (id: number, newQuantity: number) => {
    // Set editing state to prevent re-sorting
    setIsEditing(true)
    
    // Clear existing timeout
    if (editingTimeout) {
      clearTimeout(editingTimeout)
    }
    
    // Set new timeout to reset editing state after user stops interacting
    const timeout = setTimeout(() => {
      setIsEditing(false)
    }, 30000) // 30 seconds after last interaction
    
    setEditingTimeout(timeout)
    
    // Call the original update function
    onUpdateQuantity(id, newQuantity)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with search and controls */}
      <div className="card-stock">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ada-text-muted" />
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-stock pl-10"
              />
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Filters */}
            <div className="flex items-center space-x-3">
              <Filter size={16} className="text-ada-text-muted" />
              
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-stock min-w-32 py-2"
              >
                <option value="all">{t('filters.allCategories')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {t(`categories.${category.toLowerCase().replace(/\s+/g, '')}`) !== `categories.${category.toLowerCase().replace(/\s+/g, '')}` ? 
                      t(`categories.${category.toLowerCase().replace(/\s+/g, '')}`) : 
                      category}
                  </option>
                ))}
              </select>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="input-stock min-w-28 py-2"
              >
                <option value="all">{t('filters.allStock')}</option>
                <option value="out">{t('stock.outOfStock')}</option>
                <option value="low">{t('stock.lowStock')}</option>
                <option value="good">{t('stock.goodStock')}</option>
              </select>
            </div>

            {/* Auto-Sort Toggle */}
            <button
              onClick={() => setAutoSortEnabled(!autoSortEnabled)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                autoSortEnabled
                  ? 'bg-ada-success border-ada-success text-white'
                  : 'bg-white border-gray-300 text-ada-text-primary hover:bg-gray-50'
              }`}
              title={autoSortEnabled ? t('sorting.disableAutoSort') : t('sorting.enableAutoSort')}
            >
              <ArrowUpDown size={16} />
              <span className="text-ada-sm hidden sm:inline">
                {autoSortEnabled ? t('sorting.sortOn') : t('sorting.sortOff')}
              </span>
            </button>

            {/* View Toggle */}
            <ViewToggle
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || categoryFilter !== 'all' || stockFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-ada-sm text-ada-text-secondary">{t('filters.activeFilters')}</span>
              
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-ada-xs bg-ada-success text-white">
                  {t('filters.search')}: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:bg-green-600 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {categoryFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-ada-xs bg-ada-text-muted text-white">
                  {t('product.category')}: {t(`categories.${categoryFilter.toLowerCase().replace(/\s+/g, '')}`) !== `categories.${categoryFilter.toLowerCase().replace(/\s+/g, '')}` ? 
                    t(`categories.${categoryFilter.toLowerCase().replace(/\s+/g, '')}`) : 
                    categoryFilter}
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className="ml-1 hover:bg-gray-600 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {stockFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-ada-xs bg-ada-text-muted text-white">
                  {t('product.quantity')}: {t(`stock.${stockFilter}Stock`) !== `stock.${stockFilter}Stock` ? 
                    t(`stock.${stockFilter}Stock`) : 
                    stockFilter}
                  <button
                    onClick={() => setStockFilter('all')}
                    className="ml-1 hover:bg-gray-600 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                </span>
              )}
              
              <button
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('all')
                  setStockFilter('all')
                }}
                className="text-ada-xs text-ada-text-muted hover:text-ada-text-secondary underline"
              >
                {t('filters.clear')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results summary */}
      {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all' ? (
        <div className="text-ada-sm text-ada-text-secondary">
          {t('stats.showingFiltered', { 
            filtered: sortedProducts.length.toString(), 
            total: products.length.toString() 
          })}
        </div>
      ) : null}

      {/* Product Views */}
      {currentView === 'list' ? (
        <ProductListView
          products={sortedProducts}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
        />
      ) : (
        <ProductCardView
          products={sortedProducts}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
        />
      )}

      {/* No results */}
      {sortedProducts.length === 0 && products.length > 0 && (
        <div className="card-stock text-center py-12">
          <div className="text-ada-text-muted mb-4">
            <Search size={48} className="mx-auto opacity-50" />
          </div>
          <h3 className="text-ada-lg font-medium text-ada-text-primary mb-2">
            {t('search.noResults')}
          </h3>
          <p className="text-ada-text-secondary mb-4">
            {t('search.tryAdjusting')}
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setCategoryFilter('all')
              setStockFilter('all')
            }}
            className="btn-stock-secondary"
          >
            {t('search.clearFilters')}
          </button>
        </div>
      )}
    </div>
  )
}