const mysql2 = require('mysql2/promise');
require('dotenv').config();

// Use connection string (URI) if available, otherwise use individual parts
const poolConfig = process.env.DATABASE_URL 
  ? { 
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for Aiven/Cloud DBs
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'gym_management',
      port:     parseInt(process.env.DB_PORT) || 3306,
      ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : null,
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0
    };

const pool = mysql2.createPool(poolConfig);

module.exports = pool;
