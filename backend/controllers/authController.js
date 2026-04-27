const jwt    = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const pool    = require('../config/db');

// Hardcoded fallback admin — matches schema.sql INSERT exactly
// password hash = bcrypt of "pass"
const FALLBACK_ADMIN = {
  admin_id: 1,
  username: 'admin',
  password: '$2a$10$Dvj72dx5Bo1neMeF7AMC8OhtTGxrqZOl9befYCn8F3PZOTfQvbEtO',  // bcrypt of "pass"
  full_name: 'Gym Administrator',
  email: 'admin@gymms.com'
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password required.' });

  let admin = null;

  // Try DB first; fall back to hardcoded admin if DB is unreachable
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Admin WHERE username = ?', [username]
    );
    if (rows.length > 0) admin = rows[0];
  } catch (_dbErr) {
    // DB offline — use fallback
    if (username === FALLBACK_ADMIN.username) admin = FALLBACK_ADMIN;
  }

  if (!admin)
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  // Accept plain-text "pass" OR bcrypt hash
  let valid = false;
  if (admin.password === password) valid = true;
  else valid = await bcrypt.compare(password, admin.password);

  if (!valid)
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });

  const token = jwt.sign(
    { id: admin.admin_id, username: admin.username },
    process.env.JWT_SECRET || 'gym_secret',
    { expiresIn: '8h' }
  );
  res.json({
    success: true,
    token,
    admin: { id: admin.admin_id, username: admin.username, name: admin.full_name }
  });
};

// GET /api/auth/me  (protected)
exports.me = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
  const { username, password, full_name, email } = req.body;
  if (!username || !password || !full_name || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO Admin (username, password, full_name, email) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, full_name, email]
    );

    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET || 'gym_secret',
      { expiresIn: '8h' }
    );
    res.json({
      success: true,
      token,
      admin: { id: result.insertId, username, name: full_name }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Error creating user.' });
  }
};
