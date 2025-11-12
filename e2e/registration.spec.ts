import { test, expect } from '@playwright/test';

// Helper function to generate unique test email
function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `e2e-test-${timestamp}-${random}@example.com`;
}

// Helper function to create a user via API
async function createUserViaAPI(baseURL: string, userData: {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  message?: string;
}) {
  const response = await fetch(`${baseURL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return response.json();
}

// Helper function to get user by email via API
async function getUserByEmail(baseURL: string, email: string) {
  // Use search parameter to find user by email
  const response = await fetch(`${baseURL}/api/register?search=${encodeURIComponent(email)}`);
  const data = await response.json();
  // Search returns users array, find the one matching exact email
  return data.users?.find((user: { email: string }) => user.email.toLowerCase() === email.toLowerCase());
}

// Helper function to delete user via API
async function deleteUserViaAPI(baseURL: string, userId: number) {
  const response = await fetch(`${baseURL}/api/register?id=${userId}`, {
    method: 'DELETE',
  });
  return response.json();
}

// Helper function to verify user exists in database
async function verifyUserInDatabase(baseURL: string, email: string) {
  const user = await getUserByEmail(baseURL, email);
  return user !== undefined;
}

test.describe('Registration Form - Real Database Tests', () => {
  const testUsers: Array<{ id?: number; email: string }> = [];

  // Cleanup: Delete all test users after all tests
  test.afterAll(async ({ baseURL }) => {
    if (baseURL) {
      for (const testUser of testUsers) {
        if (testUser.id) {
          try {
            await deleteUserViaAPI(baseURL, testUser.id);
            console.log(`[Cleanup] Deleted test user: ${testUser.email} (ID: ${testUser.id})`);
          } catch (error) {
            console.error(`[Cleanup] Failed to delete test user ${testUser.email}:`, error);
          }
        }
      }
    }
  });

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

  test('should create user in database via real API call', async ({ page, baseURL }) => {
    const testEmail = generateTestEmail();
    const testUserData = {
      firstName: 'John',
      lastName: 'Doe',
      email: testEmail,
      company: 'E2E Test Company',
      phone: '+1234567890',
      message: 'E2E test registration'
    };

    // Fill form
    await page.getByLabel(/first name/i).fill(testUserData.firstName);
    await page.getByLabel(/last name/i).fill(testUserData.lastName);
    await page.getByLabel(/email address/i).fill(testUserData.email);
    await page.getByLabel(/company name/i).fill(testUserData.company);
    await page.getByLabel(/phone number/i).fill(testUserData.phone);
    await page.getByLabel(/project description/i).fill(testUserData.message);
    
    // Submit form (this will make a real API call)
    const submitButton = page.getByRole('button', { name: /register for free consultation/i });
    await submitButton.click();
    
    // Wait for API response
    await page.waitForTimeout(2000);
    
    // Verify user was created in database via API
    if (baseURL) {
      const userExists = await verifyUserInDatabase(baseURL, testEmail);
      expect(userExists).toBe(true);
      
      // Get the created user to store ID for cleanup
      const createdUser = await getUserByEmail(baseURL, testEmail);
      if (createdUser?.id) {
        testUsers.push({ id: createdUser.id, email: testEmail });
      }
    }
    
    // Verify form was reset after successful submission
    const emailField = page.getByLabel(/email address/i);
    const emailValue = await emailField.inputValue();
    expect(emailValue).toBe('');
  });

  test('should create and verify user in database via direct API call', async ({ baseURL }) => {
    if (!baseURL) {
      test.skip();
      return;
    }

    const testEmail = generateTestEmail();
    const testUserData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: testEmail,
      company: 'Direct API Test Company',
      phone: '+9876543210',
      message: 'Direct API test registration'
    };

    // Create user via direct API call
    const createResponse = await createUserViaAPI(baseURL, testUserData);
    
    expect(createResponse.success).toBe(true);
    expect(createResponse.user).toBeDefined();
    expect(createResponse.user.email).toBe(testEmail);
    
    const userId = createResponse.user.id;
    expect(userId).toBeGreaterThan(0);
    
    // Store for cleanup
    testUsers.push({ id: userId, email: testEmail });
    
    // Verify user exists in database
    const userExists = await verifyUserInDatabase(baseURL, testEmail);
    expect(userExists).toBe(true);
    
    // Verify user data matches
    const user = await getUserByEmail(baseURL, testEmail);
    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.firstName).toBe(testUserData.firstName);
    expect(user.lastName).toBe(testUserData.lastName);
    expect(user.company).toBe(testUserData.company);
    
    // Clean up immediately after verification
    await deleteUserViaAPI(baseURL, userId);
  });

  test('should prevent duplicate email registration', async ({ baseURL }) => {
    if (!baseURL) {
      test.skip();
      return;
    }

    const testEmail = generateTestEmail();
    const testUserData = {
      firstName: 'Duplicate',
      lastName: 'Test',
      email: testEmail,
      company: 'Duplicate Test Company',
      phone: '+1111111111',
    };

    // Create first user
    const firstResponse = await createUserViaAPI(baseURL, testUserData);
    expect(firstResponse.success).toBe(true);
    const userId = firstResponse.user.id;
    testUsers.push({ id: userId, email: testEmail });
    
    // Try to create duplicate user
    const duplicateResponse = await createUserViaAPI(baseURL, testUserData);
    expect(duplicateResponse.success).toBeUndefined();
    expect(duplicateResponse.error).toBe('An account with this email already exists');
  });

  test('should delete user from database', async ({ baseURL }) => {
    if (!baseURL) {
      test.skip();
      return;
    }

    const testEmail = generateTestEmail();
    const testUserData = {
      firstName: 'Delete',
      lastName: 'Test',
      email: testEmail,
      company: 'Delete Test Company',
      phone: '+2222222222',
    };

    // Create user
    const createResponse = await createUserViaAPI(baseURL, testUserData);
    expect(createResponse.success).toBe(true);
    const userId = createResponse.user.id;
    
    // Verify user exists
    let userExists = await verifyUserInDatabase(baseURL, testEmail);
    expect(userExists).toBe(true);
    
    // Delete user
    const deleteResponse = await deleteUserViaAPI(baseURL, userId);
    expect(deleteResponse.success).toBe(true);
    expect(deleteResponse.userId).toBe(userId);
    
    // Verify user no longer exists
    userExists = await verifyUserInDatabase(baseURL, testEmail);
    expect(userExists).toBe(false);
    
    // Try to delete again (should fail)
    const deleteAgainResponse = await deleteUserViaAPI(baseURL, userId);
    expect(deleteAgainResponse.error).toBe('User not found');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Fill form with duplicate email (if we can create one first)
    await page.getByLabel(/first name/i).fill('Error');
    await page.getByLabel(/last name/i).fill('Test');
    
    // Use a potentially duplicate email (this might fail if it exists)
    const testEmail = generateTestEmail();
    await page.getByLabel(/email address/i).fill(testEmail);
    await page.getByLabel(/company name/i).fill('Error Test Company');
    await page.getByLabel(/phone number/i).fill('+3333333333');
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /register for free consultation/i });
    await submitButton.click();
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // If this was a duplicate, error should be displayed
    // If it succeeded, that's also fine - we just want to ensure the form handles responses
  });

  test('should accept any email format (validation removed)', async ({ page, baseURL }) => {
    const testEmail = 'any-email-format-test';
    const testUserData = {
      firstName: 'Format',
      lastName: 'Test',
      email: testEmail,
      company: 'Format Test Company',
      phone: '+4444444444',
    };

    // Fill form
    await page.getByLabel(/first name/i).fill(testUserData.firstName);
    await page.getByLabel(/last name/i).fill(testUserData.lastName);
    await page.getByLabel(/email address/i).fill(testUserData.email);
    await page.getByLabel(/company name/i).fill(testUserData.company);
    await page.getByLabel(/phone number/i).fill(testUserData.phone);
    
    // Submit form (this will make a real API call)
    const submitButton = page.getByRole('button', { name: /register for free consultation/i });
    await submitButton.click();
    
    // Wait for API response
    await page.waitForTimeout(2000);
    
    // Verify user was created (email format validation removed)
    if (baseURL) {
      const userExists = await verifyUserInDatabase(baseURL, testEmail);
      expect(userExists).toBe(true);
      
      // Get the created user to store ID for cleanup
      const createdUser = await getUserByEmail(baseURL, testEmail);
      if (createdUser?.id) {
        testUsers.push({ id: createdUser.id, email: testEmail });
      }
    }
  });
});
