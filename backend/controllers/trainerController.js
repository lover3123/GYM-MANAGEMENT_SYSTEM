const pool = require('../config/db');

// GET /api/trainers
exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, COUNT(ms.membership_id) AS assigned_members
       FROM Trainer t
       LEFT JOIN Membership ms ON t.trainer_id = ms.trainer_id AND ms.status = 'Active'
       GROUP BY t.trainer_id ORDER BY t.trainer_id`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/trainers/:id
exports.getOne = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Trainer WHERE trainer_id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Trainer not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/trainers
exports.create = async (req, res) => {
  const { name, phone, email, speciality, salary, join_date } = req.body;
  if (!name || !phone)
    return res.status(400).json({ success: false, message: 'name and phone required.' });
  try {
    const [result] = await pool.query(
      `INSERT INTO Trainer (name, phone, email, speciality, salary, join_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, phone, email || null, speciality || null, salary || null, join_date || null]
    );
    res.status(201).json({ success: true, trainer_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/trainers/:id
exports.update = async (req, res) => {
  const { name, phone, email, speciality, salary, status } = req.body;
  try {
    await pool.query(
      `UPDATE Trainer SET name=?, phone=?, email=?, speciality=?, salary=?, status=?
       WHERE trainer_id=?`,
      [name, phone, email, speciality, salary, status, req.params.id]
    );
    res.json({ success: true, message: 'Trainer updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/trainers/:id
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM Trainer WHERE trainer_id=?', [req.params.id]);
    res.json({ success: true, message: 'Trainer deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
