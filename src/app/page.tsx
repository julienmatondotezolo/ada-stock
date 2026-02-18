'use client'

import { useState, useEffect } from 'react'
import { apiService, Product } from '@/services/api'
import { Minus, Plus, Package, Search, Filter, Edit2, Trash2, X, Save } from 'lucide-react'

export default function SimpleStockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [stockFilter, setStockFilter] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  // Load products from API
  useEffect(() => {
    loadProducts()
  }, [])

  // Filter products when search/filters change
  useEffect(() => {
    let filtered = products

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category?.name === selectedCategory)
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(product => (product.current_quantity || 0) <= (product.minimum_stock || 0))
    } else if (stockFilter === 'medium') {
      filtered = filtered.filter(product => {
        const qty = product.current_quantity || 0
        const min = product.minimum_stock || 0
        const max = product.maximum_stock || (min * 3)
        return qty > min && qty <= max * 0.7
      })
    } else if (stockFilter === 'good') {
      filtered = filtered.filter(product => {
        const qty = product.current_quantity || 0
        const max = product.maximum_stock || ((product.minimum_stock || 0) * 3)
        return qty > max * 0.7
      })
    }

    // Always sort alphabetically
    filtered = filtered.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    
    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, stockFilter])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await apiService.getProducts()
      setProducts(data)
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
      loadProducts()
    }
  }

  const handleCardClick = (product: Product) => {
    // Toggle selection - if already selected, deselect it
    if (selectedProductId === product.id) {
      setSelectedProductId(null)
    } else {
      setSelectedProductId(product.id)
    }
  }

  const handleEditClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProduct({ ...product })
    setShowEditDialog(true)
  }

  const handleSaveProduct = async () => {
    if (!editingProduct) return

    try {
      await apiService.updateProduct(editingProduct.id, editingProduct)
      setProducts(prev => 
        prev.map(p => 
          p.id === editingProduct.id ? editingProduct : p
        )
      )
      setShowEditDialog(false)
      setEditingProduct(null)
      setSelectedProductId(null)
    } catch (err) {
      console.error('Failed to update product:', err)
      alert('Erreur lors de la mise à jour du produit')
    }
  }

  const handleDeleteProduct = async () => {
    if (!editingProduct) return

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${editingProduct.name}" ?`)) {
      try {
        await apiService.deleteProduct(editingProduct.id)
        setProducts(prev => prev.filter(p => p.id !== editingProduct.id))
        setShowEditDialog(false)
        setEditingProduct(null)
        setSelectedProductId(null)
      } catch (err) {
        console.error('Failed to delete product:', err)
        alert('Erreur lors de la suppression du produit')
      }
    }
  }

  const getCardColor = (product: Product) => {
    const qty = product.current_quantity || 0
    const min = product.minimum_stock || 0
    const max = product.maximum_stock || (min * 3)

    if (qty <= min) return 'border-red-200 bg-red-50'
    if (qty <= max * 0.7) return 'border-yellow-200 bg-yellow-50'
    return 'border-green-200 bg-green-50'
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)))

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock L'Osteria</h1>
              <p className="text-gray-600">{filteredProducts.length} produits</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les stocks</option>
                <option value="low">Stock faible</option>
                <option value="medium">Stock moyen</option>
                <option value="good">Stock élevé</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className={`relative rounded-lg shadow-sm border-2 p-4 cursor-pointer transition-all hover:shadow-md ${getCardColor(product)} ${selectedProductId === product.id ? 'ring-2 ring-blue-400' : ''}`}
              onClick={() => handleCardClick(product)}
            >
              {/* Edit Button - appears when card is selected */}
              {selectedProductId === product.id && (
                <button
                  onClick={(e) => handleEditClick(product, e)}
                  className="absolute top-3 right-3 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}

              <div className="flex items-center justify-between">
                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {product.category?.name || 'Sans catégorie'}
                    </span>
                    <span className="text-sm text-gray-600">{product.unit}</span>
                    {(product.current_quantity || 0) <= (product.minimum_stock || 0) && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Stock faible
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-4" onClick={(e) => e.stopPropagation()}>
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchQuery || selectedCategory || stockFilter ? 'Aucun produit trouvé avec ces filtres' : 'Aucun produit trouvé'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {showEditDialog && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Modifier le produit</h2>
                <button
                  onClick={() => setShowEditDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit
                  </label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité actuelle
                  </label>
                  <input
                    type="number"
                    value={editingProduct.current_quantity || 0}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, current_quantity: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock minimum
                  </label>
                  <input
                    type="number"
                    value={editingProduct.minimum_stock || 0}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, minimum_stock: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unité
                  </label>
                  <input
                    type="text"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, unit: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6 pt-4 border-t">
                <button
                  onClick={handleDeleteProduct}
                  className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </button>

                <button
                  onClick={handleSaveProduct}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}