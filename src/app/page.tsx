'use client'

import { useState, useEffect } from 'react'
import { StockDashboard } from '@/components/StockDashboardLocalized'
import { ProductView } from '@/components/ProductView'
import { AddProductModalLocalized as AddProductModal } from '@/components/AddProductModalLocalized'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLocale } from '@/components/LocaleProvider'
import { Package, Plus, BarChart3 } from 'lucide-react'

// Product interface
interface Product {
  id: number
  name: string
  category: string
  quantity: number
  minStock: number
  unit: string
  lastUpdated: string
}

import { apiService, Product as ApiProduct } from '@/services/api'

// Product interface matching the backend
interface Product {
  id: string
  name: string
  category: string
  quantity: number
  minStock: number
  unit: string
  lastUpdated: string
}

export default function StockPage() {
  const [activeView, setActiveView] = useState<'dashboard' | 'products'>('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const { t } = useLocale()

  // Load products from API
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Test API connection first
      const healthCheck = await apiService.healthCheck()
      console.log('Health check:', healthCheck)
      
      // Load products from API
      const apiProducts = await apiService.getProducts()
      
      // Convert API products to local format
      const localProducts: Product[] = apiProducts.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category?.name || 'other',
        quantity: product.current_quantity,
        minStock: product.minimum_stock,
        unit: product.unit,
        lastUpdated: product.updated_at ? product.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]
      }))
      
      setProducts(localProducts)
    } catch (err) {
      console.error('Failed to load products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
      
      // Fallback to mock data if API fails
      const mockProducts: Product[] = [
        { id: '1', name: 'Tomaten / Tomates / Tomatoes', category: 'vegetables', quantity: 5, minStock: 10, unit: 'kg', lastUpdated: '2026-02-17' },
        { id: '2', name: 'Mozzarella', category: 'dairy', quantity: 8, minStock: 5, unit: 'pcs', lastUpdated: '2026-02-17' },
        { id: '3', name: 'Pasta', category: 'drygoods', quantity: 25, minStock: 15, unit: 'kg', lastUpdated: '2026-02-16' },
        { id: '4', name: 'Olijfolie / Huile d\'olive / Olive Oil', category: 'oils', quantity: 2, minStock: 5, unit: 'L', lastUpdated: '2026-02-17' },
        { id: '5', name: 'Basilicum / Basilic / Basil', category: 'herbs', quantity: 12, minStock: 8, unit: 'bunch', lastUpdated: '2026-02-17' },
        { id: '6', name: 'Bloem / Farine / Flour', category: 'drygoods', quantity: 18, minStock: 20, unit: 'kg', lastUpdated: '2026-02-16' },
        { id: '7', name: 'Parmesan', category: 'dairy', quantity: 0, minStock: 3, unit: 'pcs', lastUpdated: '2026-02-17' },
        { id: '8', name: 'Oregano', category: 'spices', quantity: 1, minStock: 5, unit: 'pack', lastUpdated: '2026-02-16' },
      ]
      setProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  const updateProductQuantity = async (id: string, newQuantity: number) => {
    try {
      await apiService.updateProductQuantity(id, newQuantity)
      
      // Update local state
      setProducts(prev => prev.map(product =>
        product.id === id 
          ? { ...product, quantity: newQuantity, lastUpdated: new Date().toISOString().split('T')[0] }
          : product
      ))
    } catch (err) {
      console.error('Failed to update quantity:', err)
      
      // Fallback to local update if API fails
      setProducts(prev => prev.map(product =>
        product.id === id 
          ? { ...product, quantity: newQuantity, lastUpdated: new Date().toISOString().split('T')[0] }
          : product
      ))
    }
  }

  const addProduct = async (newProduct: any) => {
    try {
      // Get first category as default if no category selected
      const categories = await apiService.getCategories()
      const categoryId = newProduct.category_id || categories[0]?.id
      
      if (!categoryId) {
        throw new Error('No categories available. Please create a category first.')
      }

      const createData = {
        category_id: categoryId,
        name: newProduct.name,
        name_nl: newProduct.name_nl,
        name_fr: newProduct.name_fr,
        name_en: newProduct.name_en,
        unit: newProduct.unit || 'pcs',
        current_quantity: newProduct.quantity || 0,
        minimum_stock: newProduct.minStock || 0,
        description: newProduct.description
      }

      const apiProduct = await apiService.createProduct(createData)
      
      // Convert to local format and add to state
      const localProduct: Product = {
        id: apiProduct.id,
        name: apiProduct.name,
        category: apiProduct.category?.name || 'other',
        quantity: apiProduct.current_quantity,
        minStock: apiProduct.minimum_stock,
        unit: apiProduct.unit,
        lastUpdated: new Date().toISOString().split('T')[0]
      }

      setProducts(prev => [...prev, localProduct])
    } catch (err) {
      console.error('Failed to create product:', err)
      
      // Fallback to local addition if API fails
      const product = {
        ...newProduct,
        id: Date.now().toString(), // Use timestamp as ID
        lastUpdated: new Date().toISOString().split('T')[0]
      }
      setProducts(prev => [...prev, product])
    }
  }

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const updateData: any = {}
      
      if (updatedProduct.name) updateData.name = updatedProduct.name
      if (updatedProduct.quantity !== undefined) updateData.current_quantity = updatedProduct.quantity
      if (updatedProduct.minStock !== undefined) updateData.minimum_stock = updatedProduct.minStock
      if (updatedProduct.unit) updateData.unit = updatedProduct.unit

      await apiService.updateProduct(id, updateData)
      
      // Update local state
      setProducts(prev => prev.map(product =>
        product.id === id 
          ? { ...product, ...updatedProduct, lastUpdated: new Date().toISOString().split('T')[0] }
          : product
      ))
    } catch (err) {
      console.error('Failed to update product:', err)
      
      // Fallback to local update if API fails
      setProducts(prev => prev.map(product =>
        product.id === id 
          ? { ...product, ...updatedProduct, lastUpdated: new Date().toISOString().split('T')[0] }
          : product
      ))
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await apiService.deleteProduct(id)
      
      // Update local state
      setProducts(prev => prev.filter(product => product.id !== id))
    } catch (err) {
      console.error('Failed to delete product:', err)
      
      // Fallback to local deletion if API fails
      setProducts(prev => prev.filter(product => product.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-ada-bg-primary">
      {/* Header */}
      <header className="bg-ada-bg-secondary shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-ada-success rounded-lg flex items-center justify-center">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-ada-2xl font-bold text-ada-text-primary">{t('app.title')}</h1>
                <p className="text-ada-sm text-ada-text-secondary">{t('app.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-stock-primary flex items-center space-x-2"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">{t('app.addProduct')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-ada-bg-secondary border-b sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-ada-sm transition-colors touch-optimize ${
                activeView === 'dashboard'
                  ? 'border-ada-success text-ada-success'
                  : 'border-transparent text-ada-text-secondary hover:text-ada-text-primary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 size={20} />
                <span>{t('app.dashboard')}</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveView('products')}
              className={`py-4 px-1 border-b-2 font-medium text-ada-sm transition-colors touch-optimize ${
                activeView === 'products'
                  ? 'border-ada-success text-ada-success'
                  : 'border-transparent text-ada-text-secondary hover:text-ada-text-primary'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package size={20} />
                <span>{t('app.products')} ({products.length})</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ProductView handles search internally */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ada-success mx-auto mb-4"></div>
              <p className="text-ada-text-secondary">{t('loading') || 'Loading products...'}</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-lg font-medium text-red-800 mb-2">API Connection Issue</h3>
                <p className="text-red-700 mb-3">{error}</p>
                <p className="text-sm text-red-600 mb-3">Using offline mode with sample data. Some features may be limited.</p>
                <button
                  onClick={loadProducts}
                  className="btn-stock-primary text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeView === 'dashboard' ? (
          <StockDashboard 
            products={products} 
            onUpdateQuantity={updateProductQuantity}
          />
        ) : (
          <ProductView 
            products={products}
            onUpdateQuantity={updateProductQuantity}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        )}
      </main>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addProduct}
      />

      {/* Bottom Safe Area */}
      <div className="safe-bottom h-4" />
    </div>
  )
}