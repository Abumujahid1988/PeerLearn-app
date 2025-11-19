const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { create, update, remove, reorder } = require('../controllers/sectionController');

router.post('/', auth, authorize('instructor','admin'), create);
router.put('/:id', auth, authorize('instructor','admin'), update);
router.delete('/:id', auth, authorize('instructor','admin'), remove);
router.post('/reorder', auth, authorize('instructor','admin'), reorder);

module.exports = router;
