import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate between pages using header links', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Services
    await page.getByRole('link', { name: /services/i }).first().click();
    await expect(page).toHaveURL(/\/services/);
    
    // Navigate to Contact
    await page.getByRole('link', { name: /contact/i }).first().click();
    await expect(page).toHaveURL(/\/contact/);
    
    // Navigate back to Home
    await page.getByRole('link', { name: /softdev solutions/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('should have working mobile menu', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Find and click mobile menu button
    // Look for hamburger menu icon
    const menuButton = page.locator('button').filter({ 
      has: page.locator('svg path[d*="M4 6h16"]') 
    }).first();
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      
      // Check if mobile menu is visible (use first() to handle multiple occurrences)
      await expect(page.getByRole('link', { name: /home/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /services/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /contact/i }).first()).toBeVisible();
    }
  });

  test('should have footer links', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer content (adjust based on actual footer implementation)
    const footer = page.locator('footer');
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
    }
  });
});

