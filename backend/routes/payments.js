const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/paymentController');

router.get('/monthly', auth, ctrl.monthly);
router.get('/',        auth, ctrl.getAll);
router.post('/',       auth, ctrl.create);

module.exports = router;
