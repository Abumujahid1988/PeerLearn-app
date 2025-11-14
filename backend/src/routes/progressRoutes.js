const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { get, update } = require('../controllers/progressController');

router.get('/:courseId', auth, get);
router.post('/:courseId', auth, update);

module.exports = router;
