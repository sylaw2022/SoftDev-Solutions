import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/SoftDev Solutions/i);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /transform your business/i })).toBeVisible();
  });

  test('should display all service cards', async ({ page }) => {
    await page.goto('/');
    
    // Check for service cards
    await expect(page.getByText('Embedded Linux Firmware')).toBeVisible();
    await expect(page.getByText('Device Driver Development')).toBeVisible();
    await expect(page.getByText('AI Model Design & Development')).toBeVisible();
    await expect(page.getByText('FPGA Design & Development')).toBeVisible();
    await expect(page.getByText('Communication Systems Consulting')).toBeVisible();
  });

  test('should navigate to services page', async ({ page }) => {
    await page.goto('/');
    
    // Click on "View Our Services" button
    await page.getByRole('link', { name: /view our services/i }).click();
    
    // Should navigate to services page
    await expect(page).toHaveURL(/\/services/);
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/');
    
    // Click on "Get Started Today" button
    await page.getByRole('link', { name: /get started today/i }).first().click();
    
    // Should navigate to contact page
    await expect(page).toHaveURL(/\/contact/);
  });

  test('should display registration form', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to registration form section
    await page.getByRole('heading', { name: /get started today/i }).scrollIntoViewIfNeeded();
    
    // Check form fields
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/company name/i)).toBeVisible();
    await expect(page.getByLabel(/phone number/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that mobile menu button is visible
    const menuButton = page.locator('button').filter({ hasText: /menu/i }).or(
      page.locator('button[aria-label*="menu" i]')
    ).or(
      page.locator('svg').filter({ has: page.locator('path[d*="M4 6h16M4 12h16M4 18h16"]') })
    );
    
    // Main content should still be visible
    await expect(page.getByRole('heading', { name: /transform your business/i })).toBeVisible();
  });
});

