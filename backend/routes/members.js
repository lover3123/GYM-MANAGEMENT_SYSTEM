const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/memberController');

router.get('/stats', auth, ctrl.stats);
router.get('/',      auth, ctrl.getAll);
router.get('/:id',   auth, ctrl.getOne);
router.post('/',     auth, ctrl.create);
router.put('/:id',   auth, ctrl.update);
router.delete('/:id',auth, ctrl.remove);

module.exports = router;
