const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://neondb_owner:npg_SZke9pKUdr1y@ep-lively-surf-aodycewk.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
});

client.connect()
  .then(() => {
    console.log('Connected to Neon!');
    return client.query('SELECT * FROM users');
  })
  .then(res => {
    console.log('USERS IN NEON:', res.rows);
  })
  .catch(console.error)
  .finally(() => client.end());
