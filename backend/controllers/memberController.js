const pool = require('../config/db');

// GET /api/members
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, ms.status AS membership_status,
              p.package_name, t.name AS trainer_name
       FROM Member m
       LEFT JOIN Membership ms ON m.member_id = ms.member_id AND ms.status = 'Active'
       LEFT JOIN Package p    ON ms.package_id  = p.package_id
       LEFT JOIN Trainer t    ON ms.trainer_id  = t.trainer_id
       ORDER BY m.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/members/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, ms.membership_id, ms.start_date, ms.end_date, ms.status AS membership_status,
              p.package_name, p.amount AS package_fee,
              t.name AS trainer_name, t.phone AS trainer_phone
       FROM Member m
       LEFT JOIN Membership ms ON m.member_id = ms.member_id
       LEFT JOIN Package p    ON ms.package_id = p.package_id
       LEFT JOIN Trainer t    ON ms.trainer_id = t.trainer_id
       WHERE m.member_id = ?
       ORDER BY ms.membership_id DESC`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/members
exports.create = async (req, res) => {
  const { fname, lname, email, contact, gender, dob, address } = req.body;
  if (!fname || !lname || !email || !contact)
    return res.status(400).json({ success: false, message: 'fname, lname, email, contact required.' });
  try {
    const [result] = await pool.query(
      `INSERT INTO Member (fname, lname, email, contact, gender, dob, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fname, lname, email, contact, gender || 'Male', dob || null, address || null]
    );
    res.status(201).json({ success: true, member_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Email or contact already exists.' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/members/:id
exports.update = async (req, res) => {
  const { fname, lname, email, contact, gender, dob, address, status } = req.body;
  try {
    await pool.query(
      `UPDATE Member SET fname=?, lname=?, email=?, contact=?, gender=?, dob=?, address=?, status=?
       WHERE member_id=?`,
      [fname, lname, email, contact, gender, dob, address, status, req.params.id]
    );
    res.json({ success: true, message: 'Member updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/members/:id
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM Member WHERE member_id=?', [req.params.id]);
    res.json({ success: true, message: 'Member deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/members/stats  — dashboard stats
exports.stats = async (req, res) => {
  try {
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS total_members,
              SUM(status='Active') AS active_members,
              SUM(status='Inactive') AS inactive_members
       FROM Member`
    );
    const [[revenue]] = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total_revenue,
              COUNT(*) AS total_payments
       FROM Payment WHERE status='Success'`
    );
    const [[active_m]] = await pool.query(
      `SELECT COUNT(*) AS active_memberships FROM Membership WHERE status='Active'`
    );
    res.json({ success: true, data: { ...totals, ...revenue, ...active_m } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
