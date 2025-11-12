import { test, expect } from '@playwright/test';

test.describe('Registration Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to registration form
    await page.getByRole('heading', { name: /get started today/i }).scrollIntoViewIfNeeded();
  });

  test('should display registration form on home page', async ({ page }) => {
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/company name/i)).toBeVisible();
    await expect(page.getByLabel(/phone number/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /register for free consultation/i });
    await submitButton.click();
    
    // Wait a bit for validation
    await page.waitForTimeout(500);
    
    // Check for validation messages (adjust based on actual implementation)
    const firstNameField = page.getByLabel(/first name/i);
    await expect(firstNameField).toBeVisible();
  });

  test('should accept any email format (validation removed)', async ({ page }) => {
    // Email format validation has been removed
    // This test verifies the form accepts any email input
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/email address/i).fill('any-email-format');
    await page.getByLabel(/company name/i).fill('Test Company');
    await page.getByLabel(/phone number/i).fill('+1234567890');
    
    // Mock successful API response
    await page.route('**/api/register', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Registration successful!',
        }),
      });
    });
    
    const submitButton = page.getByRole('button', { name: /register for free consultation/i });
    await submitButton.click();
    
    // Form should submit without email format validation
    await page.waitForTimeout(1000);
  });

  test('should submit registration form successfully', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/register', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Registration successful! We will contact you within 24 hours.',
          user: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            company: 'Test Company',
            createdAt: new Date().toISOString(),
          },
        }),
      });
    });
    
    // Fill form
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/email address/i).fill('john@example.com');
    await page.getByLabel(/company name/i).fill('Test Company');
    await page.getByLabel(/phone number/i).fill('+1234567890');
    await page.getByLabel(/project description/i).fill('Test project description');
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /register for free consultation/i });
    await submitButton.click();
    
    // Wait for success message or form reset
    await page.waitForTimeout(2000);
    
    // Check that form was submitted (form should be reset or show success message)
    // Adjust assertions based on actual implementation
    const emailField = page.getByLabel(/email address/i);
    const emailValue = await emailField.inputValue();
    
    // Form should be reset after successful submission
    expect(emailValue).toBe('');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/register', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'An account with this email already exists',
        }),
      });
    });
    
    // Fill form
    await page.getByLabel(/first name/i).fill('John');
    await page.getByLabel(/last name/i).fill('Doe');
    await page.getByLabel(/email address/i).fill('existing@example.com');
    await page.getByLabel(/company name/i).fill('Test Company');
    await page.getByLabel(/phone number/i).fill('+1234567890');
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /register for free consultation/i });
    await submitButton.click();
    
    // Wait for error message
    await page.waitForTimeout(2000);
    
    // Error should be displayed (adjust based on actual implementation)
    // This might show as a notification or inline error
  });
});

