const jwt  = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ success: false, message: 'No token provided.' });

  const token = header.split(' ')[1];
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET || 'gym_secret');
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};
