'use client'

import { useState, useEffect } from 'react'
import { apiService, Product } from '@/services/api'
import { Minus, Plus, Package } from 'lucide-react'

export default function SimpleStockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load products from API
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await apiService.getProducts()
      // Sort alphabetically by name
      const sortedProducts = data.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      setProducts(sortedProducts)
    } catch (err) {
      console.error('Failed to load products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, change: number) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const newQuantity = Math.max(0, (product.current_quantity || 0) + change)
      
      await apiService.updateProduct(productId, {
        ...product,
        current_quantity: newQuantity
      })

      // Update local state
      setProducts(prev => 
        prev.map(p => 
          p.id === productId 
            ? { ...p, current_quantity: newQuantity }
            : p
        )
      )
    } catch (err) {
      console.error('Failed to update product:', err)
      // Reload products on error to ensure consistency
      loadProducts()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadProducts}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock L'Osteria</h1>
              <p className="text-gray-600">{products.length} produits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-3">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-500">
                      {product.category?.name || 'Sans catégorie'}
                    </span>
                    <span className="text-sm text-gray-500">{product.unit}</span>
                    {(product.current_quantity || 0) <= (product.minimum_stock || 0) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Stock faible
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => updateQuantity(product.id, -1)}
                    disabled={(product.current_quantity || 0) === 0}
                    className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Minus className="h-5 w-5 text-red-600 disabled:text-gray-400" />
                  </button>

                  <div className="text-center min-w-[60px]">
                    <div className="text-2xl font-bold text-gray-900">
                      {product.current_quantity || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.unit}
                    </div>
                  </div>

                  <button
                    onClick={() => updateQuantity(product.id, 1)}
                    className="w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-5 w-5 text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Aucun produit trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}