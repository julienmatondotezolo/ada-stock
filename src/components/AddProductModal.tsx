'use client'

import { useState } from 'react'
import { X, Package } from 'lucide-react'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (product: any) => void
}

const categories = [
  'Vegetables',
  'Fruits', 
  'Dairy',
  'Meat & Poultry',
  'Seafood',
  'Dry Goods',
  'Oils & Vinegars',
  'Herbs & Spices',
  'Beverages',
  'Frozen',
  'Other'
]

const units = [
  'kg',
  'g', 
  'L',
  'ml',
  'pcs',
  'bunch',
  'pack',
  'bottle',
  'can',
  'box'
]

export function AddProductModal({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    minStock: '',
    unit: 'kg'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = 'Valid quantity is required'
    if (!formData.minStock || parseInt(formData.minStock) < 0) newErrors.minStock = 'Valid minimum stock is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Add product
    onAdd({
      name: formData.name.trim(),
      category: formData.category,
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock),
      unit: formData.unit
    })

    // Reset form
    setFormData({
      name: '',
      category: '',
      quantity: '',
      minStock: '',
      unit: 'kg'
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-ada-bg-secondary rounded-ada-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-ada-success bg-opacity-10 rounded-full flex items-center justify-center">
              <Package className="text-ada-success" size={20} />
            </div>
            <h2 className="text-ada-xl font-bold text-ada-text-primary">Add New Product</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ada-bg-accent rounded-ada-md transition-colors touch-optimize"
          >
            <X size={20} className="text-ada-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Fresh Tomatoes"
              className={`input-stock ${errors.name ? 'border-ada-error' : ''}`}
            />
            {errors.name && <p className="text-ada-error text-ada-sm mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`input-stock ${errors.category ? 'border-ada-error' : ''}`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-ada-error text-ada-sm mt-1">{errors.category}</p>}
          </div>

          {/* Current Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              Current Quantity *
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                id="quantity"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="0"
                min="0"
                className={`input-stock flex-1 ${errors.quantity ? 'border-ada-error' : ''}`}
              />
              <select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                className="input-stock w-20"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            {errors.quantity && <p className="text-ada-error text-ada-sm mt-1">{errors.quantity}</p>}
          </div>

          {/* Minimum Stock */}
          <div>
            <label htmlFor="minStock" className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              Minimum Stock Level *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                id="minStock"
                value={formData.minStock}
                onChange={(e) => handleInputChange('minStock', e.target.value)}
                placeholder="0"
                min="0"
                className={`input-stock flex-1 ${errors.minStock ? 'border-ada-error' : ''}`}
              />
              <span className="text-ada-sm text-ada-text-secondary">{formData.unit}</span>
            </div>
            <p className="text-ada-xs text-ada-text-muted mt-1">
              You'll get alerts when stock falls below this level
            </p>
            {errors.minStock && <p className="text-ada-error text-ada-sm mt-1">{errors.minStock}</p>}
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-stock-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-stock-primary flex-1"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}