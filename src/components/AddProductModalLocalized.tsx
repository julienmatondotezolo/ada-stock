'use client'

import { useState, useEffect } from 'react'
import { X, Package } from 'lucide-react'
import { useLocale } from './LocaleProvider'

interface Category {
  id: string
  name: string
  name_nl: string
  name_fr: string
  name_en: string
}

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (product: any) => void
}

const categoryKeys = [
  'vegetables',
  'fruits', 
  'dairy',
  'meat',
  'seafood',
  'drygoods',
  'oils',
  'herbs',
  'beverages',
  'frozen',
  'other'
]

const unitKeys = [
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

export function AddProductModalLocalized({ isOpen, onClose, onAdd }: AddProductModalProps) {
  const { t } = useLocale()
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    minStock: '',
    unit: 'kg'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryMapping, setCategoryMapping] = useState<{ [key: string]: string }>({})

  // Fetch categories from API
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
      const response = await fetch(`http://${hostname}:3055/api/v1/categories`)
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
        
        // Create mapping from category names to UUIDs
        const mapping: { [key: string]: string } = {}
        data.data.forEach((cat: Category) => {
          mapping[cat.name] = cat.id
        })
        setCategoryMapping(mapping)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = t('modal.productNameRequired')
    if (!formData.category) newErrors.category = t('modal.categoryRequired')
    if (!formData.quantity || parseInt(formData.quantity) < 0) newErrors.quantity = t('modal.validQuantityRequired')
    if (!formData.minStock || parseInt(formData.minStock) < 0) newErrors.minStock = t('modal.validMinStockRequired')
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Add product
    onAdd({
      name: formData.name.trim(),
      category: formData.category,
      category_id: categoryMapping[formData.category] || categories[0]?.id, // Map to UUID, default to first category
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
            <h2 className="text-ada-xl font-bold text-ada-text-primary">{t('modal.addNewProduct')}</h2>
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
              {t('modal.productName')} *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('modal.productNamePlaceholder')}
              className={`input-stock ${errors.name ? 'border-ada-error' : ''}`}
            />
            {errors.name && <p className="text-ada-error text-ada-sm mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              {t('product.category')} *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`input-stock ${errors.category ? 'border-ada-error' : ''}`}
            >
              <option value="">{t('modal.selectCategory')}</option>
              {categoryKeys.map(categoryKey => (
                <option key={categoryKey} value={categoryKey}>
                  {t(`categories.${categoryKey}`)}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-ada-error text-ada-sm mt-1">{errors.category}</p>}
          </div>

          {/* Current Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              {t('modal.currentQuantity')} *
            </label>
            <input
              type="number"
              id="quantity"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder="0"
              min="0"
              className={`input-stock text-2xl text-center font-bold ${errors.quantity ? 'border-ada-error' : ''}`}
            />
            {errors.quantity && <p className="text-ada-error text-ada-sm mt-1">{errors.quantity}</p>}
          </div>

          {/* Minimum Stock */}
          <div>
            <label htmlFor="minStock" className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              {t('modal.minStockLevel')} *
            </label>
            <input
              type="number"
              id="minStock"
              value={formData.minStock}
              onChange={(e) => handleInputChange('minStock', e.target.value)}
              placeholder="0"
              min="0"
              className={`input-stock text-2xl text-center font-bold ${errors.minStock ? 'border-ada-error' : ''}`}
            />
            <p className="text-ada-xs text-ada-text-muted mt-1">
              {t('modal.alertsHelpText')}
            </p>
            {errors.minStock && <p className="text-ada-error text-ada-sm mt-1">{errors.minStock}</p>}
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="unit" className="block text-ada-sm font-medium text-ada-text-primary mb-2">
              {t('product.unit')} *
            </label>
            <select
              id="unit"
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              className="input-stock"
            >
              {unitKeys.map(unitKey => (
                <option key={unitKey} value={unitKey}>
                  {t(`units.${unitKey}`)} ({unitKey})
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-stock-secondary flex-1"
            >
              {t('product.cancel')}
            </button>
            <button
              type="submit"
              className="btn-stock-primary flex-1"
            >
              {t('modal.addProduct')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Also export as default to ensure proper import
export default AddProductModalLocalized