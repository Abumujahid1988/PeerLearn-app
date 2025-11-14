const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { list, create, get, update, remove, enroll } = require('../controllers/courseController');

router.get('/', list);
router.get('/:id', get);
router.post('/', auth, authorize('instructor','admin'), create);
router.put('/:id', auth, authorize('instructor','admin'), update);
router.delete('/:id', auth, authorize('instructor','admin'), remove);
router.post('/:id/enroll', auth, enroll);

module.exports = router;
