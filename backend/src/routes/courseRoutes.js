const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { list, create, get, update, remove, enroll } = require('../controllers/courseController');
const { reorderSections, reorderLessonsInSection } = require('../controllers/courseController');

router.get('/', list);
router.get('/:id', get);
router.post('/', auth, authorize('instructor','admin'), create);
router.put('/:id', auth, authorize('instructor','admin'), update);
router.delete('/:id', auth, authorize('instructor','admin'), remove);
router.post('/:id/enroll', auth, enroll);
// Reorder sections within a course (body: sectionIds = [ordered ids])
router.post('/:id/sections/reorder', auth, authorize('instructor','admin'), reorderSections);
// Reorder lessons within a section (body: lessonIds = [ordered ids])
router.post('/sections/:id/lessons/reorder', auth, authorize('instructor','admin'), reorderLessonsInSection);

module.exports = router;
