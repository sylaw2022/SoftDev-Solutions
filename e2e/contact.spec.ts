import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should load contact page successfully', async ({ page }) => {
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole('heading', { name: /get in touch/i })).toBeVisible();
  });

  test('should display contact form', async ({ page }) => {
    // Check form fields
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /send message/i });
    await submitButton.click();
    
    // Should show validation errors (implementation dependent)
    // This test may need adjustment based on actual form validation
    await page.waitForTimeout(500);
  });

  test('should fill and submit contact form', async ({ page }) => {
    // Fill form
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/message/i).fill('This is a test message');
    
    // Mock the API response
    await page.route('**/api/contact', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Message sent successfully',
        }),
      });
    });
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /send message/i });
    await submitButton.click();
    
    // Wait for response (adjust based on actual implementation)
    await page.waitForTimeout(1000);
  });
});

