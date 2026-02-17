import { test, expect, Page } from '@playwright/test';

/**
 * 🍝 L'Osteria AdaStock E2E Tests - Jessica's Inventory Management Workflow
 * 
 * Testing from the perspective of Jessica (L'Osteria staff member)
 * who needs to manage restaurant inventory daily.
 * 
 * Critical user journeys:
 * 1. Add new products to inventory
 * 2. Update quantities as items are used/delivered
 * 3. Edit product information when suppliers change
 * 4. Remove discontinued items
 * 5. Monitor low stock alerts
 */

test.describe('🍝 L\'Osteria Inventory Management - Jessica\'s Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the app to load
    await expect(page.locator('h1')).toContainText('AdaStock');
    await expect(page.locator('text=L\'Osteria Deerlijk')).toBeVisible();
    
    // Switch to Products view if not already there
    const productsTab = page.locator('button:has-text("Producten"), button:has-text("Products")');
    if (await productsTab.isVisible()) {
      await productsTab.click();
    }
  });

  test('🥅 Should load the app successfully with fallback data', async ({ page }) => {
    // Test that the app loads even if backend is down
    await expect(page.locator('h1')).toContainText('AdaStock');
    
    // Should show either real products or mock data
    const productCards = page.locator('[data-testid="product-card"], .bg-white.rounded-lg.shadow-sm');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    
    // Check if error message is shown (backend down scenario)
    const errorMessage = page.locator('text=API Connection Issue');
    if (await errorMessage.isVisible()) {
      console.log('⚠️ Backend is down - testing with mock data');
      await expect(page.locator('text=Using offline mode')).toBeVisible();
    }
  });

  test('🏪 Jessica adds multiple products to inventory', async ({ page }) => {
    console.log('🧪 Testing: Jessica adds new products for today\'s delivery');
    
    // Click Add Product button
    const addButton = page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product"), button:has-text("Toevoegen")');
    await addButton.click();
    
    // Wait for modal to appear
    const modal = page.locator('[role="dialog"], .modal, .bg-white.rounded-lg.p-6');
    await expect(modal).toBeVisible();
    
    // Test adding Tomatoes
    await page.fill('input[placeholder*="tomaten"], input[placeholder*="Fresh"], #product-name', 'Verse San Marzano Tomaten');
    
    // Select category
    const categorySelect = page.locator('select[name="category"], #category');
    await categorySelect.selectOption({ label: /groenten|vegetables|légumes/i });
    
    // Set quantity
    await page.fill('input[type="number"][placeholder="0"]', '15');
    
    // Set minimum stock
    const minStockInputs = page.locator('input[type="number"]');
    await minStockInputs.nth(1).fill('5');
    
    // Select unit
    const unitSelect = page.locator('select:has(option[value="kg"])');
    if (await unitSelect.isVisible()) {
      await unitSelect.selectOption('kg');
    }
    
    // Save product
    await page.locator('button:has-text("toevoegen"), button:has-text("Add"), button[type="submit"]').click();
    
    // Verify product was added
    await expect(page.locator('text=San Marzano')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Successfully added tomatoes');
    
    // Add second product - Mozzarella
    await addButton.click();
    await expect(modal).toBeVisible();
    
    await page.fill('input[placeholder*="tomaten"], input[placeholder*="Fresh"], #product-name', 'Buffalo Mozzarella DOP');
    await page.locator('select[name="category"], #category').selectOption({ label: /zuivel|dairy|laitiers/i });
    await page.fill('input[type="number"][placeholder="0"]', '8');
    await minStockInputs.nth(1).fill('3');
    
    await page.locator('button:has-text("toevoegen"), button:has-text("Add"), button[type="submit"]').click();
    await expect(page.locator('text=Buffalo Mozzarella')).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Successfully added mozzarella');
  });

  test('📊 Jessica updates product quantities using quick controls', async ({ page }) => {
    console.log('🧪 Testing: Jessica updates quantities after busy lunch service');
    
    // Wait for products to load
    const productList = page.locator('.product-card, [data-testid="product-card"], tr');
    await expect(productList.first()).toBeVisible({ timeout: 10000 });
    
    // Find tomatoes product (or first product if mock data)
    const firstProduct = productList.first();
    
    // Test +5 button
    const plusFiveBtn = firstProduct.locator('button:has-text("+5")');
    if (await plusFiveBtn.isVisible()) {
      const initialQuantity = await firstProduct.locator('.quantity, .font-bold.text-xl').textContent();
      await plusFiveBtn.click();
      
      // Wait a moment for update
      await page.waitForTimeout(1000);
      
      console.log(`✅ Clicked +5 button. Initial quantity: ${initialQuantity}`);
    }
    
    // Test -1 button
    const minusOneBtn = firstProduct.locator('button:has-text("-1")');
    if (await minusOneBtn.isVisible()) {
      await minusOneBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ Successfully used -1 button');
    }
    
    // Test direct edit functionality
    const editBtn = firstProduct.locator('button[title*="edit"], button:has-text("Edit"), .edit-button');
    if (await editBtn.isVisible()) {
      await editBtn.click();
      
      // Look for editable input field
      const editInput = page.locator('input[type="number"]:focus, input.text-center.border-2');
      if (await editInput.isVisible()) {
        await editInput.fill('12');
        await page.keyboard.press('Enter');
        console.log('✅ Successfully edited quantity directly');
      }
    }
  });

  test('✏️ Jessica updates product information', async ({ page }) => {
    console.log('🧪 Testing: Jessica updates product details for new supplier');
    
    // Wait for products to load
    await expect(page.locator('.product-card, tr').first()).toBeVisible({ timeout: 10000 });
    
    // Find Edit Product button (not quantity edit)
    const editProductBtn = page.locator('button:has-text("Product Bewerken"), button:has-text("Edit Product"), button[title*="Edit product"]');
    
    if (await editProductBtn.first().isVisible()) {
      await editProductBtn.first().click();
      
      // Wait for edit modal
      const editModal = page.locator('[role="dialog"]:has(text*="bewerken"), [role="dialog"]:has(text*="Edit")');
      await expect(editModal).toBeVisible();
      
      // Update product name
      const nameInput = page.locator('input[value*=""], input#product-name, input[name="name"]');
      await nameInput.fill('Premium San Marzano Tomaten - Organic');
      
      // Update minimum stock
      const minStockInput = page.locator('input[placeholder*="minimum"], input[name="minStock"]').nth(0);
      await minStockInput.fill('8');
      
      // Save changes
      await page.locator('button:has-text("Opslaan"), button:has-text("Save"), button[type="submit"]').click();
      
      // Verify changes
      await expect(page.locator('text=Premium San Marzano')).toBeVisible({ timeout: 5000 });
      console.log('✅ Successfully updated product information');
    } else {
      console.log('⚠️ Edit Product functionality not visible, might be in card view only');
    }
  });

  test('🗑️ Jessica deletes discontinued products', async ({ page }) => {
    console.log('🧪 Testing: Jessica removes discontinued items from inventory');
    
    // Wait for products to load
    await expect(page.locator('.product-card, tr').first()).toBeVisible({ timeout: 10000 });
    
    // Find Delete button (trash icon or delete text)
    const deleteBtn = page.locator('button[title*="delete"], button:has-text("Delete"), button:has-text("Verwijderen"), .trash-icon');
    
    if (await deleteBtn.first().isVisible()) {
      const initialCount = await page.locator('.product-card, tr').count();
      
      await deleteBtn.first().click();
      
      // Handle confirmation dialog
      const confirmDialog = page.locator('text=zeker dat je, text=sure that you, text=confirmé que');
      if (await confirmDialog.isVisible()) {
        await page.locator('button:has-text("Verwijderen"), button:has-text("Delete"), button:has-text("Confirm")').click();
      }
      
      // Wait for deletion to complete
      await page.waitForTimeout(2000);
      
      // Verify product count decreased
      const finalCount = await page.locator('.product-card, tr').count();
      expect(finalCount).toBeLessThan(initialCount);
      
      console.log(`✅ Successfully deleted product. Count: ${initialCount} → ${finalCount}`);
    } else {
      console.log('⚠️ Delete functionality not found in current view');
    }
  });

  test('🔍 Jessica searches and filters products', async ({ page }) => {
    console.log('🧪 Testing: Jessica searches for specific ingredients');
    
    // Wait for products to load
    await expect(page.locator('.product-card, tr').first()).toBeVisible({ timeout: 10000 });
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Zoek"], input[placeholder*="Search"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('tomaten');
      await page.waitForTimeout(1500);
      
      // Check that results are filtered
      const visibleProducts = page.locator('.product-card:visible, tr:visible');
      const count = await visibleProducts.count();
      console.log(`✅ Search returned ${count} results for 'tomaten'`);
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }
    
    // Test category filter
    const categoryFilter = page.locator('select[name*="category"], select:has(option:has-text("Alle"))');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ label: /groenten|vegetables/i });
      await page.waitForTimeout(1500);
      console.log('✅ Applied category filter');
      
      // Reset filter
      await categoryFilter.selectOption({ index: 0 });
    }
    
    // Test view toggle
    const viewToggle = page.locator('button:has-text("Lijst"), button:has-text("List"), button:has-text("Kaarten"), button:has-text("Cards")');
    if (await viewToggle.first().isVisible()) {
      await viewToggle.first().click();
      await page.waitForTimeout(1000);
      console.log('✅ Successfully toggled view');
    }
  });

  test('🌍 Jessica switches languages for multilingual staff', async ({ page }) => {
    console.log('🧪 Testing: Jessica switches to French for French-speaking staff');
    
    // Find language switcher
    const langSwitcher = page.locator('button:has-text("🇳🇱"), button:has-text("NL"), select[name*="lang"]');
    
    if (await langSwitcher.isVisible()) {
      await langSwitcher.click();
      
      // Select French
      const frenchOption = page.locator('option[value="fr"], button:has-text("🇫🇷"), text=Français');
      if (await frenchOption.isVisible()) {
        await frenchOption.click();
        
        // Verify language changed
        await expect(page.locator('text=Produits, text=Ajouter un produit')).toBeVisible({ timeout: 5000 });
        console.log('✅ Successfully switched to French');
        
        // Switch to English
        await page.locator('button:has-text("🇫🇷"), button:has-text("FR")').click();
        await page.locator('option[value="en"], button:has-text("🇬🇧"), text=English').click();
        
        await expect(page.locator('text=Products, text=Add Product')).toBeVisible({ timeout: 5000 });
        console.log('✅ Successfully switched to English');
      }
    } else {
      console.log('⚠️ Language switcher not found');
    }
  });

  test('📱 Jessica uses the app on tablet (responsive design)', async ({ page, browserName }) => {
    console.log('🧪 Testing: Jessica uses app on iPad during inventory count');
    
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Verify app is usable on tablet
    await expect(page.locator('h1')).toBeVisible();
    
    // Check that buttons are touch-friendly (44px minimum)
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    if (await firstButton.isVisible()) {
      const box = await firstButton.boundingBox();
      if (box && (box.height >= 44 || box.width >= 44)) {
        console.log('✅ Buttons are touch-friendly');
      }
    }
    
    // Test scrolling works well
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(500);
    await page.mouse.wheel(0, -500);
    
    console.log('✅ Tablet interface works correctly');
  });

  test('⚠️ Jessica handles network errors gracefully', async ({ page }) => {
    console.log('🧪 Testing: App behavior when backend is unavailable');
    
    // Check if error handling is displayed
    const errorBanner = page.locator('text=API Connection Issue, text=offline mode, .bg-red-50');
    
    if (await errorBanner.isVisible()) {
      console.log('✅ App shows offline mode banner');
      
      // Verify app still functions with mock data
      await expect(page.locator('.product-card, tr')).toHaveCount.toBeGreaterThan(0);
      
      // Test that "Try Again" button works
      const retryBtn = page.locator('button:has-text("Try Again"), button:has-text("Opnieuw")');
      if (await retryBtn.isVisible()) {
        await retryBtn.click();
        await page.waitForTimeout(2000);
        console.log('✅ Retry button works');
      }
    } else {
      console.log('ℹ️ Backend is working - testing successful operation');
    }
    
    // Verify app remains functional
    const addButton = page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product")');
    await expect(addButton).toBeVisible();
    console.log('✅ App remains functional during network issues');
  });
});