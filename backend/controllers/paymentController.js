const pool = require('../config/db');

// GET /api/payments
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT py.*, CONCAT(m.fname,' ',m.lname) AS member_name,
              p.package_name
       FROM Payment py
       JOIN Member m ON py.member_id = m.member_id
       JOIN Membership ms ON py.membership_id = ms.membership_id
       JOIN Package p ON ms.package_id = p.package_id
       ORDER BY py.payment_date DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments  — record a standalone payment renewal
exports.create = async (req, res) => {
  const { membership_id, member_id, amount, payment_type, transaction_ref } = req.body;
  if (!membership_id || !member_id || !amount)
    return res.status(400).json({ success: false, message: 'membership_id, member_id, amount required.' });
  try {
    const [result] = await pool.query(
      `INSERT INTO Payment (membership_id, member_id, amount, payment_type, transaction_ref)
       VALUES (?, ?, ?, ?, ?)`,
      [membership_id, member_id, amount, payment_type || 'Cash', transaction_ref || null]
    );
    res.status(201).json({ success: true, payment_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/monthly  — monthly revenue for chart
exports.monthly = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(payment_date,'%Y-%m') AS month,
              COUNT(*) AS count,
              SUM(amount) AS revenue
       FROM Payment WHERE status='Success'
       GROUP BY month ORDER BY month DESC LIMIT 12`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
