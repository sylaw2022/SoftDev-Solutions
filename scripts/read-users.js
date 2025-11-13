#!/usr/bin/env node

/**
 * Script to read user information from local PostgreSQL database
 * Usage: node scripts/read-users.js [options]
 * 
 * Options:
 *   --all          Show all users (default)
 *   --recent [N]   Show recent users (default: 30 days)
 *   --search TERM  Search users by name, email, or company
 *   --company NAME Filter by company name
 *   --limit N      Limit number of results
 *   --format json  Output as JSON
 */

const { Pool } = require('pg');
const path = require('path');

// Database connection configuration
const DATABASE_URL = process.env.DATABASE_URL || 
  process.env.POSTGRES_URL ||
  'postgresql://postgres:Sylaw1970@localhost:5433/postgres';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  all: args.includes('--all') || (!args.includes('--recent') && !args.includes('--search') && !args.includes('--company')),
  recent: args.includes('--recent'),
  recentDays: 30,
  search: null,
  company: null,
  limit: null,
  format: 'table'
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--recent' && args[i + 1] && !args[i + 1].startsWith('--')) {
    options.recentDays = parseInt(args[i + 1], 10) || 30;
    i++;
  } else if (args[i] === '--search' && args[i + 1]) {
    options.search = args[i + 1];
    options.all = false;
    options.recent = false;
    i++;
  } else if (args[i] === '--company' && args[i + 1]) {
    options.company = args[i + 1];
    options.all = false;
    options.recent = false;
    i++;
  } else if (args[i] === '--limit' && args[i + 1]) {
    options.limit = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--format' && args[i + 1]) {
    options.format = args[i + 1];
    i++;
  }
}

// Create database connection
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false
});

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Display users in table format
function displayUsersTable(users) {
  if (users.length === 0) {
    console.log('\nNo users found.\n');
    return;
  }

  console.log('\n' + '='.repeat(120));
  console.log(`Found ${users.length} user(s):`);
  console.log('='.repeat(120));
  
  users.forEach((user, index) => {
    console.log(`\n[User #${index + 1}]`);
    console.log(`  ID:           ${user.id}`);
    console.log(`  Name:         ${user.first_name} ${user.last_name}`);
    console.log(`  Email:        ${user.email}`);
    console.log(`  Company:      ${user.company}`);
    console.log(`  Phone:        ${user.phone}`);
    console.log(`  Message:      ${user.message || '(empty)'}`);
    console.log(`  Created:      ${formatDate(user.created_at)}`);
    console.log(`  Updated:      ${formatDate(user.updated_at)}`);
    console.log('-'.repeat(120));
  });
  
  console.log(`\nTotal: ${users.length} user(s)\n`);
}

// Display users in JSON format
function displayUsersJSON(users) {
  const output = users.map(user => ({
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    company: user.company,
    phone: user.phone,
    message: user.message || '',
    createdAt: user.created_at,
    updatedAt: user.updated_at
  }));
  
  console.log(JSON.stringify(output, null, 2));
}

// Main function
async function main() {
  try {
    console.log('Connecting to PostgreSQL database...');
    console.log(`Connection: ${DATABASE_URL.replace(/:[^:@]+@/, ':*****@')}`);
    
    let query;
    let params = [];
    
    if (options.search) {
      // Search users
      query = `
        SELECT * FROM users 
        WHERE first_name ILIKE $1 
           OR last_name ILIKE $1 
           OR email ILIKE $1 
           OR company ILIKE $1
        ORDER BY created_at DESC
      `;
      params = [`%${options.search}%`];
    } else if (options.company) {
      // Filter by company
      query = `
        SELECT * FROM users 
        WHERE company ILIKE $1
        ORDER BY created_at DESC
      `;
      params = [`%${options.company}%`];
    } else if (options.recent) {
      // Recent users
      query = `
        SELECT * FROM users 
        WHERE created_at >= NOW() - INTERVAL '${options.recentDays} days'
        ORDER BY created_at DESC
      `;
    } else {
      // All users
      query = 'SELECT * FROM users ORDER BY created_at DESC';
    }
    
    // Add limit if specified
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }
    
    // Execute query
    const result = await pool.query(query, params);
    const users = result.rows;
    
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalCount = parseInt(countResult.rows[0].count, 10);
    
    // Display results
    if (options.format === 'json') {
      displayUsersJSON(users);
    } else {
      console.log(`\nDatabase: postgres`);
      console.log(`Total users in database: ${totalCount}`);
      if (options.recent) {
        console.log(`Showing users from last ${options.recentDays} days:`);
      } else if (options.search) {
        console.log(`Search results for: "${options.search}"`);
      } else if (options.company) {
        console.log(`Users from company: "${options.company}"`);
      }
      displayUsersTable(users);
    }
    
  } catch (error) {
    console.error('\n❌ Error reading users from database:');
    console.error(error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure PostgreSQL is running:');
      console.error('   sudo systemctl status postgresql');
      console.error('   or');
      console.error('   sudo service postgresql status');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check your database credentials.');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Make sure the database "postgres" exists.');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
main();

