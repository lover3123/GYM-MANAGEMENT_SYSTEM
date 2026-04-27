const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/membershipController');

router.get('/expiring', auth, ctrl.expiring);
router.get('/',         auth, ctrl.getAll);
router.post('/',        auth, ctrl.create);
router.put('/:id',      auth, ctrl.update);

module.exports = router;
