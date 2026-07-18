/**
 * seed_direct.js — Seeds the database using raw pg (bypasses Prisma connection pool issues)
 */
require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
  query_timeout: 30000,
});

async function main() {
  await client.connect();
  console.log('Connected to Neon DB');

  // Upsert roles
  const roles = ['Administrator', 'Project Manager', 'Team Member'];
  for (const role_name of roles) {
    await client.query(
      `INSERT INTO roles (role_name) VALUES ($1) ON CONFLICT (role_name) DO NOTHING`,
      [role_name]
    );
    console.log(`✔ Ensured role: ${role_name}`);
  }

  // Show current state
  const result = await client.query('SELECT * FROM roles ORDER BY id');
  console.log('\nRoles in DB:');
  result.rows.forEach(r => console.log(`  [${r.id}] ${r.role_name}`));
}

main()
  .then(() => {
    console.log('\n✅ Seed complete!');
  })
  .catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  })
  .finally(() => client.end());
