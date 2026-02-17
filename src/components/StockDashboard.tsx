'use client'

import { AlertTriangle, Package, TrendingDown, Clock } from 'lucide-react'

interface Product {
  id: number
  name: string
  category: string
  quantity: number
  minStock: number
  unit: string
  lastUpdated: string
}

interface StockDashboardProps {
  products: Product[]
}

export function StockDashboard({ products }: StockDashboardProps) {
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

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-stock text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-ada-success bg-opacity-10 rounded-full mx-auto mb-3">
            <Package className="text-ada-success" size={24} />
          </div>
          <div className="text-ada-2xl font-bold text-ada-text-primary">{totalProducts}</div>
          <div className="text-ada-sm text-ada-text-secondary">Total Products</div>
        </div>

        <div className="card-stock text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-3">
            <AlertTriangle className="text-ada-error" size={24} />
          </div>
          <div className="text-ada-2xl font-bold text-ada-error">{lowStockProducts.length}</div>
          <div className="text-ada-sm text-ada-text-secondary">Low Stock</div>
        </div>

        <div className="card-stock text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3">
            <TrendingDown className="text-gray-600" size={24} />
          </div>
          <div className="text-ada-2xl font-bold text-gray-600">{outOfStockProducts.length}</div>
          <div className="text-ada-sm text-ada-text-secondary">Out of Stock</div>
        </div>

        <div className="card-stock text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
            <Clock className="text-ada-blue" size={24} />
          </div>
          <div className="text-ada-2xl font-bold text-ada-blue">{recentlyUpdated.length}</div>
          <div className="text-ada-sm text-ada-text-secondary">Updated Today</div>
        </div>
      </div>

      {/* Urgent Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="card-stock">
          <h3 className="text-ada-xl font-bold text-ada-text-primary mb-4 flex items-center">
            <AlertTriangle className="text-ada-error mr-2" size={24} />
            Urgent Attention Required
          </h3>
          
          <div className="space-y-3">
            {outOfStockProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-ada-md border border-red-200">
                <div>
                  <span className="font-medium text-ada-text-primary">{product.name}</span>
                  <div className="text-ada-sm text-ada-text-secondary">{product.category}</div>
                </div>
                <div className="qty-badge-low">OUT OF STOCK</div>
              </div>
            ))}
            
            {lowStockProducts.filter(p => p.quantity > 0).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-ada-md border border-yellow-200">
                <div>
                  <span className="font-medium text-ada-text-primary">{product.name}</span>
                  <div className="text-ada-sm text-ada-text-secondary">{product.category}</div>
                </div>
                <div className="text-right">
                  <div className="qty-badge-medium">{product.quantity} {product.unit}</div>
                  <div className="text-ada-xs text-ada-text-muted">Min: {product.minStock} {product.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories Overview */}
      <div className="card-stock">
        <h3 className="text-ada-xl font-bold text-ada-text-primary mb-4">Categories Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map(category => (
            <div key={category.name} className="p-4 bg-ada-bg-accent rounded-ada-md">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-ada-text-primary">{category.name}</h4>
                {category.lowStock > 0 && (
                  <div className="qty-badge-low">{category.lowStock} low</div>
                )}
              </div>
              
              <div className="text-ada-2xl font-bold text-ada-success">{category.products.length}</div>
              <div className="text-ada-sm text-ada-text-secondary">products</div>
              
              <div className="mt-3 space-y-1">
                {category.products.slice(0, 3).map(product => (
                  <div key={product.id} className="flex justify-between text-ada-sm">
                    <span className="text-ada-text-secondary truncate">{product.name}</span>
                    <span className={`font-medium ${
                      product.quantity <= product.minStock ? 'text-ada-error' : 'text-ada-success'
                    }`}>
                      {product.quantity} {product.unit}
                    </span>
                  </div>
                ))}
                {category.products.length > 3 && (
                  <div className="text-ada-xs text-ada-text-muted">
                    +{category.products.length - 3} more...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-stock">
        <h3 className="text-ada-xl font-bold text-ada-text-primary mb-4">Recent Activity</h3>
        
        {recentlyUpdated.length > 0 ? (
          <div className="space-y-3">
            {recentlyUpdated.slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-ada-bg-accent rounded-ada-md">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-ada-success rounded-full"></div>
                  <div>
                    <span className="font-medium text-ada-text-primary">{product.name}</span>
                    <div className="text-ada-sm text-ada-text-secondary">Updated today</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    product.quantity <= product.minStock ? 'stock-level-low' : 'stock-level-good'
                  }`}>
                    {product.quantity} {product.unit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-ada-text-muted">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>No products updated today</p>
          </div>
        )}
      </div>
    </div>
  )
}