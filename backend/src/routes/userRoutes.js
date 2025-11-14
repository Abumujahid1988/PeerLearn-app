const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getUsers, getUser, updateProfile } = require('../controllers/userController');

router.get('/', auth, getUsers);
router.get('/:id', auth, getUser);
router.put('/me', auth, updateProfile);

module.exports = router;
