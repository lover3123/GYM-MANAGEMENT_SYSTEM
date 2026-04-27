const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const authCtrl   = require('../controllers/authController');

router.post('/login', authCtrl.login);
router.post('/signup', authCtrl.signup);
router.get('/me',    auth, authCtrl.me);

module.exports = router;
