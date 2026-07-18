/**
 * create_admin.js — Creates the initial Administrator user if one doesn't exist
 * Run once: node prisma/create_admin.js
 */
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
});

async function main() {
  await client.connect();
  console.log('Connected to Neon DB');

  // Get the Administrator role ID
  const roleResult = await client.query(`SELECT id FROM roles WHERE role_name = 'Administrator'`);
  if (roleResult.rows.length === 0) {
    console.error('❌ Administrator role not found. Run seed_direct.js first.');
    process.exit(1);
  }
  const role_id = roleResult.rows[0].id;

  // Check if admin already exists
  const existingAdmin = await client.query(`SELECT id, email FROM users WHERE email = 'admin@pulse.dev'`);
  if (existingAdmin.rows.length > 0) {
    console.log(`ℹ️  Admin user already exists: ${existingAdmin.rows[0].email} (id: ${existingAdmin.rows[0].id})`);
    return;
  }

  // Create admin user
  const password_hash = await bcrypt.hash('Admin@123', 10);
  const result = await client.query(
    `INSERT INTO users (name, email, password_hash, role_id) VALUES ($1, $2, $3, $4) RETURNING id, email`,
    ['Admin User', 'admin@pulse.dev', password_hash, role_id]
  );

  console.log(`✅ Admin created: ${result.rows[0].email} (id: ${result.rows[0].id})`);
  console.log(`   Email:    admin@pulse.dev`);
  console.log(`   Password: Admin@123`);
  console.log(`   Role:     Administrator`);
}

main()
  .catch(err => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  })
  .finally(() => client.end());
