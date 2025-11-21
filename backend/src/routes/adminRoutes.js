const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const courseController = require('../controllers/courseController');

// Platform stats
router.get('/stats', auth, authorize('admin'), adminController.getPlatformStats);

// User management
router.get('/users', auth, authorize('admin'), userController.getUsers);
router.post('/users', auth, authorize('admin'), adminController.createUser);
router.put('/users/:id/role', auth, authorize('admin'), adminController.setUserRole);
router.delete('/users/:id', auth, authorize('admin'), adminController.removeUser);

// Course management
router.get('/courses', auth, authorize('admin'), courseController.list);
router.delete('/courses/:id', auth, authorize('admin'), courseController.remove);
// (Optionally add admin-level course update route if needed)

module.exports = router;
