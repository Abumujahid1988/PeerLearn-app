import api from './axios';

// Get progress for a course (returns { percentage, completedLessons })
export async function getCourseProgress(courseId) {
  const r = await api.get(`/progress/${courseId}`);
  return r.data;
}

// Get progress for multiple courses in parallel
export async function getAllProgress(courseIds) {
  const results = await Promise.all(
    courseIds.map(id =>
      api.get(`/progress/${id}`).then(r => ({ courseId: id, ...r.data })).catch(() => ({ courseId: id, percentage: 0, completedLessons: [] }))
    )
  );
  // Returns array of { courseId, percentage, completedLessons }
  return results;
}
