import { test, expect } from '@playwright/test';

// Helper function to generate unique test email
function generateTestEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `e2e-db-test-${timestamp}-${random}@example.com`;
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
  const response = await fetch(`${baseURL}/api/register?search=${encodeURIComponent(email)}`);
  const data = await response.json();
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

// Helper function to get all users
async function getAllUsers(baseURL: string) {
  const response = await fetch(`${baseURL}/api/register`);
  const data = await response.json();
  return data.users || [];
}

test.describe('Database Operations - Real Database Tests', () => {
  const testUsers: Array<{ id: number; email: string }> = [];

  // Cleanup: Delete all test users after all tests
  test.afterAll(async ({ baseURL }) => {
    if (baseURL) {
      console.log(`[Cleanup] Cleaning up ${testUsers.length} test users...`);
      for (const testUser of testUsers) {
        try {
          await deleteUserViaAPI(baseURL, testUser.id);
          console.log(`[Cleanup] ✓ Deleted test user: ${testUser.email} (ID: ${testUser.id})`);
        } catch (error) {
          console.error(`[Cleanup] ✗ Failed to delete test user ${testUser.email} (ID: ${testUser.id}):`, error);
        }
      }
      console.log('[Cleanup] Cleanup completed');
    }
  });

  test('should create user in database', async ({ baseURL }) => {
    if (!baseURL) {
      test.skip();
      return;
    }

    const testEmail = generateTestEmail();
    const testUserData = {
      firstName: 'Database',
      lastName: 'Test',
      email: testEmail,
      company: 'Database Test Company',
      phone: '+5555555555',
      message: 'Database operation test'
    };

    // Create user
    const createResponse = await createUserViaAPI(baseURL, testUserData);
    
    expect(createResponse.success).toBe(true);
    expect(createResponse.user).toBeDefined();
    expect(createResponse.user.id).toBeGreaterThan(0);
    expect(createResponse.user.email).toBe(testEmail);
    
    const userId = createResponse.user.id;
    testUsers.push({ id: userId, email: testEmail });
    
    // Verify user exists in database
    const userExists = await verifyUserInDatabase(baseURL, testEmail);
    expect(userExists).toBe(true);
  });

  test('should retrieve user from database', async ({ baseURL }) => {
    if (!baseURL) {
      test.skip();
      return;
    }

    const testEmail = generateTestEmail();
    const testUserData = {
      firstName: 'Retrieve',
      lastName: 'Test',
      email: testEmail,
      company: 'Retrieve Test Company',
      phone: '+6666666666',
    };

    // Create user
    const createResponse = await createUserViaAPI(baseURL, testUserData);
    const userId = createResponse.user.id;
    testUsers.push({ id: userId, email: testEmail });
    
    // Retrieve user
    const user = await getUserByEmail(baseURL, testEmail);
    
    expect(user).toBeDefined();
    expect(user.id).toBe(userId);
    expect(user.email).toBe(testEmail);
    expect(user.firstName).toBe(testUserData.firstName);
    expect(user.lastName).toBe(testUserData.lastName);
    expect(user.company).toBe(testUserData.company);
    expect(user.phone).toBe(testUserData.phone);
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
      phone: '+7777777777',
    };

    // Create user
    const createResponse = await createUserViaAPI(baseURL, testUserData);
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

  test('should handle deletion of non-existent user', async ({ baseURL }) => {
    if (!baseURL) {
      test.skip();
      return;
    }

    // Try to delete a non-existent user
    const nonExistentId = 999999;
    const deleteResponse = await deleteUserViaAPI(baseURL, nonExistentId);
    
    expect(deleteResponse.success).toBeUndefined();
    expect(deleteResponse.error).toBe('User not found');
  });

  test('should verify user count increases after creation', async ({ baseURL }) => {
    if (!baseURL) {
      test.skip();
      return;
    }

    // Get initial user count
    const initialUsers = await getAllUsers(baseURL);
    const initialCount = initialUsers.length;
    
    // Create a new user
    const testEmail = generateTestEmail();
    const testUserData = {
      firstName: 'Count',
      lastName: 'Test',
      email: testEmail,
      company: 'Count Test Company',
      phone: '+8888888888',
    };

    const createResponse = await createUserViaAPI(baseURL, testUserData);
    const userId = createResponse.user.id;
    testUsers.push({ id: userId, email: testEmail });
    
    // Get updated user count
    const updatedUsers = await getAllUsers(baseURL);
    const updatedCount = updatedUsers.length;
    
    // Verify count increased
    expect(updatedCount).toBe(initialCount + 1);
  });

  test('should verify user count decreases after deletion', async ({ baseURL }) => {
    if (!baseURL) {
      test.skip();
      return;
    }

    // Create a user
    const testEmail = generateTestEmail();
    const testUserData = {
      firstName: 'Count',
      lastName: 'Decrease',
      email: testEmail,
      company: 'Count Decrease Test Company',
      phone: '+9999999999',
    };

    const createResponse = await createUserViaAPI(baseURL, testUserData);
    const userId = createResponse.user.id;
    
    // Get count after creation
    const usersAfterCreate = await getAllUsers(baseURL);
    const countAfterCreate = usersAfterCreate.length;
    
    // Delete user
    await deleteUserViaAPI(baseURL, userId);
    
    // Get count after deletion
    const usersAfterDelete = await getAllUsers(baseURL);
    const countAfterDelete = usersAfterDelete.length;
    
    // Verify count decreased
    expect(countAfterDelete).toBe(countAfterCreate - 1);
  });
});

