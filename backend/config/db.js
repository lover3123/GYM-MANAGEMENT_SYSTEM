const mysql2 = require('mysql2/promise');
require('dotenv').config();

// Use connection string (URI) if available, otherwise use individual parts
const pool = process.env.DATABASE_URL 
  ? mysql2.createPool(process.env.DATABASE_URL)
  : mysql2.createPool({
      host:     process.env.DB_HOST     || 'localhost',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'gym_management',
      port:     parseInt(process.env.DB_PORT) || 3306,
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0
    });

module.exports = pool;
