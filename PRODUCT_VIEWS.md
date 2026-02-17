# Product Views - AdaStock

## Overview

AdaStock now supports **two distinct view modes** for managing your restaurant inventory:

### 📋 List View
- **Compact table layout** for quick scanning
- **Status icons** showing stock health at a glance
- **Inline editing** for fast quantity updates
- **Quick stats** showing out-of-stock, low stock, and good stock counts
- Perfect for **inventory counts** and **bulk updates**

### 🃏 Card View  
- **Visual cards** with detailed product information
- **Stock level progress bars** and large quantity displays
- **Quick action buttons** for +1, -1, +10, -10 adjustments
- **Status badges** and **color-coded alerts**
- Perfect for **daily operations** and **visual management**

## Key Features

### 🔍 Advanced Search & Filtering
- **Real-time search** across product names and categories
- **Category filtering** (All, Vegetables, Dairy, etc.)
- **Stock status filtering** (All, Out of Stock, Low Stock, Good Stock)
- **Active filters display** with one-click removal
- **Automatic sorting** prioritizes urgent items (out of stock → low stock → good stock)

### ⚡ Quick Actions
- **+1/-1 buttons** for single unit adjustments
- **+10/-10 buttons** for bulk adjustments  
- **Inline editing** by clicking the edit icon
- **Touch-optimized** for mobile and tablet use
- **Smart validation** prevents negative quantities

### 📊 Smart Status System
- **Out of Stock** (Red) - Quantity = 0
- **Low Stock** (Yellow) - Quantity ≤ Minimum Stock Level
- **Good Stock** (Green) - Quantity > Minimum Stock Level
- **Visual indicators** with icons and color coding

### 📱 Mobile-First Design
- **Responsive grid** adapts to any screen size
- **Touch targets** meet 44px accessibility standards
- **Swipe-friendly** navigation and interactions
- **Safe areas** for modern mobile devices

## Component Architecture

```
ProductView (Master component)
├── ViewToggle (List/Card switcher)
├── Search & Filter controls
├── ProductListView (Table layout)
├── ProductCardView (Card layout)
└── Shared utilities & state
```

## Usage

The ProductView component automatically replaces the old ProductList:

```tsx
<ProductView 
  products={products}
  onUpdateQuantity={updateProductQuantity}
/>
```

**View switching** is handled internally - users can toggle between List and Card views using the toggle buttons in the interface.

## Perfect For L'Osteria

- **Morning inventory**: Use List view for quick counts
- **During service**: Use Card view for visual stock checks  
- **End of day**: Filter by "Low Stock" to plan tomorrow's orders
- **Mobile devices**: Both views work perfectly on phones and tablets

---

*Built with Ada Design System - Green primary theme for stock management*