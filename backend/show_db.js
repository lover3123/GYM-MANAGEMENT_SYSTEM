const pool = require('./config/db');

async function showDatabase() {
  try {
    console.log('Connecting to database...');
    
    // 1. Get all tables
    const [tables] = await pool.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('No tables found in the database.');
      process.exit(0);
    }

    console.log(`\nFound ${tables.length} tables. Fetching contents...\n`);

    // 2. Loop through each table and fetch its contents
    for (const row of tables) {
      const tableName = Object.values(row)[0];
      console.log(`=========================================`);
      console.log(`TABLE: ${tableName}`);
      console.log(`=========================================`);
      
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length === 0) {
        console.log('(Empty table)\n');
      } else {
        console.table(rows);
        console.log('\n');
      }
    }
    
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error querying the database:');
    console.error(err.message);
    console.error('\nPlease ensure your MySQL server is running and the credentials in backend/.env are correct.');
    process.exit(1);
  }
}

showDatabase();
