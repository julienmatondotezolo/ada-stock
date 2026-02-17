'use client'

import { useState, useEffect } from 'react'
import { X, Package } from 'lucide-react'
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

interface EditProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: number, updatedProduct: Partial<Product>) => void
}

export function EditProductModal({ product, isOpen, onClose, onUpdate }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    minStock: 0,
    unit: ''
  })
  const { t } = useLocale()

  const categories = [
    'vegetables', 'dairy', 'meat', 'fish', 'fruits', 'drygoods', 
    'spices', 'herbs', 'oils', 'beverages', 'frozen', 'canned'
  ]

  const units = [
    'kg', 'g', 'L', 'ml', 'pcs', 'pack', 'bottle', 'can', 
    'box', 'bag', 'bunch', 'jar'
  ]

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        minStock: product.minStock,
        unit: product.unit
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!product) return

    if (!formData.name.trim()) {
      alert(t('validation.nameRequired'))
      return
    }

    if (formData.quantity < 0) {
      alert(t('validation.quantityPositive'))
      return
    }

    if (formData.minStock < 0) {
      alert(t('validation.minStockPositive'))
      return
    }

    onUpdate(product.id, {
      name: formData.name.trim(),
      category: formData.category,
      quantity: formData.quantity,
      minStock: formData.minStock,
      unit: formData.unit
    })

    onClose()
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-ada-bg-secondary rounded-ada-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-ada-success rounded-lg flex items-center justify-center">
              <Package className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-ada-xl font-bold text-ada-text-primary">
                {t('modal.editProduct')}
              </h2>
              <p className="text-ada-sm text-ada-text-secondary">
                {t('modal.editProductDescription')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-ada-text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              {t('product.name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-stock"
              placeholder={t('placeholder.productName')}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              {t('product.category')} *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="input-stock"
              required
            >
              <option value="">{t('placeholder.selectCategory')}</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {t(`categories.${category}`) !== `categories.${category}` ? 
                    t(`categories.${category}`) : 
                    category}
                </option>
              ))}
            </select>
          </div>

          {/* Current Quantity */}
          <div>
            <label className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              {t('product.currentStock')} *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
              className="input-stock"
              min="0"
              required
            />
          </div>

          {/* Minimum Stock */}
          <div>
            <label className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              {t('product.minimumStock')} *
            </label>
            <input
              type="number"
              value={formData.minStock}
              onChange={(e) => handleInputChange('minStock', parseInt(e.target.value) || 0)}
              className="input-stock"
              min="0"
              required
            />
            <p className="mt-1 text-ada-xs text-ada-text-secondary">
              {t('help.minimumStock')}
            </p>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              {t('product.unit')} *
            </label>
            <select
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className="input-stock"
              required
            >
              <option value="">{t('placeholder.selectUnit')}</option>
              {units.map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-stock-secondary"
            >
              {t('product.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 btn-stock-primary"
            >
              {t('product.updateProduct')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}