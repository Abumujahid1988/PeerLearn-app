const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const ReportController = require('../controllers/reportController');

router.post('/', auth, ReportController.createReport);
router.get('/', auth, authorize('admin'), ReportController.listReports);
router.put('/:id/status', auth, authorize('admin'), ReportController.updateStatus);
router.delete('/:id', auth, authorize('admin'), ReportController.deleteReport);

module.exports = router;
