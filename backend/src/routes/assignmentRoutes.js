const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createAssignment,
  getAssignmentsBySection,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeAssignment,
  getStudentSubmission,
  getAssignmentSubmissions,
  getAssignmentStats
} = require('../controllers/assignmentController');

const router = express.Router();

// Public routes
// List assignments by section should be public so course pages can show assignments even without auth
router.get('/section/:sectionId', getAssignmentsBySection);
router.get('/:assignmentId', getAssignment);

// Protected routes (authenticated users)
router.use(authMiddleware);

// Assignment management (instructor)
router.post('/', createAssignment);
router.put('/:assignmentId', updateAssignment);
router.delete('/:assignmentId', deleteAssignment);

// Submission routes
router.post('/:assignmentId/submit', submitAssignment);
router.get('/:assignmentId/submission', getStudentSubmission);
router.get('/:assignmentId/submissions', getAssignmentSubmissions);
router.put('/:submissionId/grade', gradeAssignment);

// Statistics
router.get('/course/:courseId/stats', getAssignmentStats);

module.exports = router;
