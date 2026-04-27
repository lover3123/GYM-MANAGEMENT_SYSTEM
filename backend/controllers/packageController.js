const pool = require('../config/db');

// GET /api/packages
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Package ORDER BY amount');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/packages
exports.create = async (req, res) => {
  const { package_name, description, duration_months, amount } = req.body;
  if (!package_name || !amount)
    return res.status(400).json({ success: false, message: 'package_name and amount required.' });
  try {
    const [result] = await pool.query(
      `INSERT INTO Package (package_name, description, duration_months, amount)
       VALUES (?, ?, ?, ?)`,
      [package_name, description || null, duration_months || 1, amount]
    );
    res.status(201).json({ success: true, package_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/packages/:id
exports.update = async (req, res) => {
  const { package_name, description, duration_months, amount } = req.body;
  try {
    await pool.query(
      `UPDATE Package SET package_name=?, description=?, duration_months=?, amount=?
       WHERE package_id=?`,
      [package_name, description, duration_months, amount, req.params.id]
    );
    res.json({ success: true, message: 'Package updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/packages/:id
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM Package WHERE package_id=?', [req.params.id]);
    res.json({ success: true, message: 'Package deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
