const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { list, get, unenroll } = require('../controllers/enrollmentController');

router.get('/', auth, authorize('admin','instructor'), list);
router.get('/:id', auth, get);
router.delete('/:id', auth, unenroll);

module.exports = router;
