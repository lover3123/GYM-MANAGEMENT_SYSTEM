const mysql2 = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const pool = mysql2.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'gym_management',
  port:     parseInt(process.env.DB_PORT) || 3306,
  // Enable SSL for Aiven/Cloud (if not localhost)
  ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' 
    ? { rejectUnauthorized: false } 
    : null,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0
});

module.exports = pool;
