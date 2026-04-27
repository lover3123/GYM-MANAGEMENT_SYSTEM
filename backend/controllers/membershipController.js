const pool = require('../config/db');

// GET /api/memberships
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ms.*, CONCAT(m.fname,' ',m.lname) AS member_name,
              p.package_name, p.amount AS package_fee,
              t.name AS trainer_name
       FROM Membership ms
       JOIN Member m  ON ms.member_id  = m.member_id
       JOIN Package p ON ms.package_id = p.package_id
       LEFT JOIN Trainer t ON ms.trainer_id = t.trainer_id
       ORDER BY ms.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/memberships — enroll member in a package (calls stored procedure)
exports.create = async (req, res) => {
  const { fname, lname, email, contact, gender, dob, package_id, trainer_id, payment_type } = req.body;
  if (!fname || !email || !contact || !package_id)
    return res.status(400).json({ success: false, message: 'fname, email, contact, package_id required.' });
  try {
    const [result] = await pool.query(
      `CALL sp_enroll_member(?,?,?,?,?,?,?,?,?)`,
      [fname, lname || '', email, contact, gender || 'Male', dob || null,
       package_id, trainer_id || null, payment_type || 'Cash']
    );
    res.status(201).json({ success: true, data: result[0][0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/memberships/:id — update status / dates
exports.update = async (req, res) => {
  const { status, end_date, trainer_id } = req.body;
  try {
    await pool.query(
      `UPDATE Membership SET status=?, end_date=?, trainer_id=? WHERE membership_id=?`,
      [status, end_date, trainer_id || null, req.params.id]
    );
    res.json({ success: true, message: 'Membership updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/memberships/expiring  — expiring in next 7 days
exports.expiring = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ms.*, CONCAT(m.fname,' ',m.lname) AS member_name, m.contact,
              p.package_name
       FROM Membership ms
       JOIN Member m ON ms.member_id = m.member_id
       JOIN Package p ON ms.package_id = p.package_id
       WHERE ms.status='Active'
         AND ms.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       ORDER BY ms.end_date`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
