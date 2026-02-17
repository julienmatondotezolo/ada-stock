import { Page, expect } from '@playwright/test';

/**
 * 🛠️ Test Helper Utilities for AdaStock E2E Tests
 * 
 * Common functions used across multiple test files to reduce duplication
 * and improve maintainability.
 */

export class AdaStockTestHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to app and wait for it to load
   */
  async navigateAndWaitForLoad() {
    await this.page.goto('/');
    await expect(this.page.locator('h1')).toContainText('AdaStock');
    await expect(this.page.locator('text=L\'Osteria Deerlijk')).toBeVisible();
    
    // Switch to Products view if not already there
    const productsTab = this.page.locator('button:has-text("Producten"), button:has-text("Products")');
    if (await productsTab.isVisible()) {
      await productsTab.click();
    }
    
    // Wait for products to load (either from API or mock data)
    await expect(this.page.locator('.product-card, tr').first()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Check if the app is in offline mode (backend down)
   */
  async isOfflineMode(): Promise<boolean> {
    const errorBanner = this.page.locator('text=API Connection Issue, text=offline mode, .bg-red-50');
    return await errorBanner.isVisible();
  }

  /**
   * Add a new product with specified details
   */
  async addProduct(productData: {
    name: string;
    category?: string;
    quantity?: string;
    minStock?: string;
    unit?: string;
  }) {
    console.log(`📦 Adding product: ${productData.name}`);
    
    // Click Add Product button
    const addButton = this.page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product"), button:has-text("Toevoegen")');
    await addButton.click();
    
    // Wait for modal to appear
    const modal = this.page.locator('[role="dialog"], .modal, .bg-white.rounded-lg.p-6');
    await expect(modal).toBeVisible();
    
    // Fill product name
    await this.page.fill('input[placeholder*="tomaten"], input[placeholder*="Fresh"], #product-name', productData.name);
    
    // Select category if provided
    if (productData.category) {
      const categorySelect = this.page.locator('select[name="category"], #category');
      await categorySelect.selectOption({ label: new RegExp(productData.category, 'i') });
    } else {
      // Default to first available category
      const categorySelect = this.page.locator('select[name="category"], #category');
      await categorySelect.selectOption({ index: 1 });
    }
    
    // Set quantity
    if (productData.quantity) {
      await this.page.fill('input[type="number"][placeholder="0"]', productData.quantity);
    } else {
      await this.page.fill('input[type="number"][placeholder="0"]', '1');
    }
    
    // Set minimum stock
    if (productData.minStock) {
      const minStockInputs = this.page.locator('input[type="number"]');
      await minStockInputs.nth(1).fill(productData.minStock);
    } else {
      const minStockInputs = this.page.locator('input[type="number"]');
      await minStockInputs.nth(1).fill('1');
    }
    
    // Select unit if provided
    if (productData.unit) {
      const unitSelect = this.page.locator('select:has(option[value*="kg"]), select:has(option[value*="L"])');
      if (await unitSelect.isVisible()) {
        await unitSelect.selectOption(productData.unit);
      }
    }
    
    // Save product
    await this.page.locator('button:has-text("toevoegen"), button:has-text("Add"), button[type="submit"]').click();
    
    // Wait for modal to close and product to appear
    await expect(modal).not.toBeVisible({ timeout: 10000 });
    
    // Verify product was added (look for the name in the page)
    await expect(this.page.locator(`text=${productData.name}`)).toBeVisible({ timeout: 5000 });
    
    console.log(`✅ Successfully added product: ${productData.name}`);
  }

  /**
   * Update product quantity using quick controls
   */
  async updateProductQuantity(productName: string, action: '+5' | '+1' | '-1' | '-5' | 'edit', newValue?: string) {
    console.log(`🔄 Updating quantity for ${productName}: ${action}`);
    
    // Find the product row/card
    const productContainer = this.page.locator(`text=${productName}`).locator('..').locator('..');
    
    if (action === 'edit') {
      // Direct edit
      const editBtn = productContainer.locator('button[title*="edit"], button:has-text("Edit"), .edit-button');
      await editBtn.click();
      
      const editInput = this.page.locator('input[type="number"]:focus, input.text-center.border-2');
      if (await editInput.isVisible() && newValue) {
        await editInput.fill(newValue);
        await this.page.keyboard.press('Enter');
      }
    } else {
      // Quick buttons
      const actionBtn = productContainer.locator(`button:has-text("${action}")`);
      await actionBtn.click();
    }
    
    // Wait for update to complete
    await this.page.waitForTimeout(1000);
    console.log(`✅ Updated quantity for ${productName}`);
  }

  /**
   * Delete a product by name
   */
  async deleteProduct(productName: string) {
    console.log(`🗑️ Deleting product: ${productName}`);
    
    // Find the product and its delete button
    const productContainer = this.page.locator(`text=${productName}`).locator('..').locator('..');
    const deleteBtn = productContainer.locator('button[title*="delete"], button:has-text("Delete"), button:has-text("Verwijderen"), .trash-icon');
    
    await deleteBtn.click();
    
    // Handle confirmation dialog if it appears
    const confirmDialog = this.page.locator('text=zeker dat je, text=sure that you, text=confirmé que');
    if (await confirmDialog.isVisible({ timeout: 3000 })) {
      await this.page.locator('button:has-text("Verwijderen"), button:has-text("Delete"), button:has-text("Confirm")').click();
    }
    
    // Wait for deletion to complete
    await this.page.waitForTimeout(2000);
    
    // Verify product is gone
    await expect(this.page.locator(`text=${productName}`)).not.toBeVisible({ timeout: 5000 });
    
    console.log(`✅ Successfully deleted product: ${productName}`);
  }

  /**
   * Switch application language
   */
  async switchLanguage(language: 'nl' | 'fr' | 'en') {
    console.log(`🌍 Switching to language: ${language}`);
    
    const langMap = {
      'nl': { flag: '🇳🇱', code: 'NL', text: 'Nederlands' },
      'fr': { flag: '🇫🇷', code: 'FR', text: 'Français' },
      'en': { flag: '🇬🇧', code: 'EN', text: 'English' }
    };
    
    const lang = langMap[language];
    
    // Find and click language switcher
    const langSwitcher = this.page.locator(`button:has-text("${lang.flag}"), button:has-text("${lang.code}"), select[name*="lang"]`);
    
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      
      // Select the target language
      const langOption = this.page.locator(`option[value="${language}"], button:has-text("${lang.flag}"), text=${lang.text}`);
      if (await langOption.isVisible()) {
        await langOption.click();
        
        // Wait for language to change
        await this.page.waitForTimeout(1000);
        console.log(`✅ Successfully switched to ${lang.text}`);
      }
    }
  }

  /**
   * Search for products
   */
  async searchProducts(searchTerm: string) {
    console.log(`🔍 Searching for: ${searchTerm}`);
    
    const searchInput = this.page.locator('input[placeholder*="Zoek"], input[placeholder*="Search"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(searchTerm);
      await this.page.waitForTimeout(1500); // Wait for debounced search
      
      const visibleProducts = this.page.locator('.product-card:visible, tr:visible');
      const count = await visibleProducts.count();
      console.log(`✅ Search returned ${count} results for '${searchTerm}'`);
      
      return count;
    }
    
    return 0;
  }

  /**
   * Filter products by category
   */
  async filterByCategory(category: string) {
    console.log(`🏷️ Filtering by category: ${category}`);
    
    const categoryFilter = this.page.locator('select[name*="category"], select:has(option:has-text("Alle"))');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ label: new RegExp(category, 'i') });
      await this.page.waitForTimeout(1500);
      console.log(`✅ Applied category filter: ${category}`);
    }
  }

  /**
   * Toggle between list and card view
   */
  async toggleView() {
    console.log('🔄 Toggling view mode');
    
    const viewToggle = this.page.locator('button:has-text("Lijst"), button:has-text("List"), button:has-text("Kaarten"), button:has-text("Cards")');
    if (await viewToggle.first().isVisible()) {
      await viewToggle.first().click();
      await this.page.waitForTimeout(1000);
      console.log('✅ Successfully toggled view');
    }
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await this.page.screenshot({ path: `test-results/${filename}`, fullPage: true });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  /**
   * Check if the app is responsive on current viewport
   */
  async checkResponsiveness() {
    const viewport = this.page.viewportSize();
    console.log(`📱 Checking responsiveness for ${viewport?.width}x${viewport?.height}`);
    
    // Check if critical elements are visible
    const criticalElements = [
      this.page.locator('h1'), // App title
      this.page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product")'), // Add button
    ];
    
    for (const element of criticalElements) {
      if (await element.isVisible()) {
        console.log('✅ Critical element visible');
      } else {
        console.log('⚠️ Critical element not visible');
      }
    }
    
    // Check for horizontal scroll (should be avoided)
    const bodyWidth = await this.page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = viewport?.width || 0;
    
    if (bodyWidth > viewportWidth + 20) { // 20px tolerance
      console.log(`⚠️ Horizontal scroll detected: body ${bodyWidth}px > viewport ${viewportWidth}px`);
      return false;
    } else {
      console.log('✅ No horizontal scroll detected');
      return true;
    }
  }

  /**
   * Generate test data for bulk operations
   */
  generateTestProducts(count: number = 5) {
    const categories = ['groenten', 'zuivel', 'vlees', 'kruiden', 'oliën'];
    const units = ['kg', 'L', 'pcs', 'bunch', 'pack'];
    const baseNames = [
      'Tomaten', 'Mozzarella', 'Basilicum', 'Olijfolie', 'Pasta',
      'Rucola', 'Parmesan', 'Balsamico', 'Pijnboompitten', 'Prosciutto'
    ];
    
    const products = [];
    
    for (let i = 0; i < count; i++) {
      products.push({
        name: `${baseNames[i % baseNames.length]} Test ${i + 1}`,
        category: categories[i % categories.length],
        quantity: String((i + 1) * 5),
        minStock: String((i + 1) * 2),
        unit: units[i % units.length]
      });
    }
    
    return products;
  }

  /**
   * Wait for API calls to complete
   */
  async waitForApiCalls() {
    // Wait for any pending API calls to complete
    await this.page.waitForTimeout(2000);
    
    // Wait for loading indicators to disappear
    const loadingIndicators = this.page.locator('.animate-spin, text=loading, text=Loading');
    if (await loadingIndicators.first().isVisible({ timeout: 1000 })) {
      await expect(loadingIndicators.first()).not.toBeVisible({ timeout: 10000 });
    }
  }
}

/**
 * Jessica's typical workflow patterns
 */
export const JessicaWorkflows = {
  /**
   * Morning inventory check - add new deliveries
   */
  morningDelivery: [
    { name: 'San Marzano Tomaten', category: 'groenten', quantity: '20', minStock: '5', unit: 'kg' },
    { name: 'Buffalo Mozzarella', category: 'zuivel', quantity: '12', minStock: '3', unit: 'pcs' },
    { name: 'Verse Basilicum', category: 'kruiden', quantity: '8', minStock: '2', unit: 'bunch' },
  ],

  /**
   * Lunch service - reduce quantities
   */
  lunchServiceUpdates: [
    { productName: 'Tomaten', action: '-5' as const },
    { productName: 'Mozzarella', action: '-1' as const },
    { productName: 'Basilicum', action: '-1' as const },
  ],

  /**
   * Evening cleanup - remove expired items
   */
  eveningCleanup: [
    'Expired Produce Item',
    'Old Dairy Product',
  ]
};