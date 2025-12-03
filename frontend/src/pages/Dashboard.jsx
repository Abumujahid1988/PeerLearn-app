import React, { useEffect, useState, useContext } from 'react';
import { useEnrollment } from '../context/EnrollmentContext';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { getAllProgress } from '../api/progress';

export default function Dashboard() {
  const { enrollmentChanged } = useEnrollment();
  const { user, loading: authLoading } = useContext(AuthContext);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progressMap, setProgressMap] = useState({});

  const fetchMyCourses = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    api.get('/courses')
      .then(async r => {
        const filtered = r.data.filter(
          c => Array.isArray(c.enrolledStudents) && c.enrolledStudents.some(e => String(e._id || e) === String(user._id || user.id)) || String(c.instructor?._id) === String(user._id || user.id)
        );
        setMyCourses(filtered);
        // Fetch progress for all courses in parallel
        if (user.role === 'student' && filtered.length > 0) {
          const progressArr = await getAllProgress(filtered.map(c => c._id));
          const map = {};
          progressArr.forEach(p => { map[p.courseId] = p; });
          setProgressMap(map);
        } else {
          setProgressMap({});
        }
      })
      .catch(err => {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    fetchMyCourses();
    // Fetch analytics for instructors/admins
    if (user && ['instructor','admin'].includes(user.role)) {
      setAnalyticsLoading(true);
      api.get('/analytics/instructor')
        .then(r => setAnalytics(r.data.analytics || []))
        .catch(err => {
          console.error('Error fetching analytics:', err);
          setAnalytics([]);
        })
        .finally(() => setAnalyticsLoading(false));
    }
  }, [user, user?._id, enrollmentChanged, authLoading]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-4 md:p-10">
        {/* Error message display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Top: nav links centered, user info at right */}
        {/* User info aligned with navbar auth links, but not in navbar */}
        <div className="mb-10" style={{ position: 'relative', minHeight: '56px' }}>
          <div className="absolute right-8 top-0 flex items-center gap-3">
            <div className="flex flex-col items-end justify-center">
              <div className="font-bold text-blue-900">{user?.name || 'Abdullahi Abdulganiyu'}</div>
              <div className="text-xs text-slate-500">{user?.email || 'abumujahid555@gmail.com'}</div>
            </div>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center text-xl font-bold text-indigo-600 border-2 border-indigo-600">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
            )}
          </div>
          {/* Removed Refresh button to prevent UI overlap */}
        </div>

        {/* Student Learning Dashboard */}
        {user?.role === 'student' && (
          <>
            <h2 className="text-2xl font-bold text-blue-900 mb-6">My Learning Dashboard</h2>
            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading your courses...</div>
            ) : myCourses.length === 0 ? (
              <div className="text-center py-10 text-slate-500">You are not enrolled in any courses yet. <Link to="/courses" className="text-blue-600 hover:underline">Browse courses</Link></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCourses.map(c => (
                  <div key={c._id} className="bg-white rounded-xl shadow border border-slate-100 p-6 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      {c.thumbnail && <img src={c.thumbnail} alt={c.title} className="w-20 h-14 object-cover rounded" />}
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-blue-800">{c.title}</div>
                        <div className="text-xs text-slate-500">by {c.instructor?.name || 'Unknown'}</div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-700 line-clamp-2">{c.description}</div>
                    <div className="flex flex-wrap gap-1">
                      {c.tags?.slice(0, 2).map(tag => <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{tag}</span>)}
                    </div>
                    <div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-1">
                        {(() => {
                          const pct = progressMap[c._id]?.percentage ?? 0;
                          return <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${pct}%` }} />;
                        })()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {(() => {
                          const pct = progressMap[c._id]?.percentage ?? 0;
                          return `${pct}% complete • ${c.sections?.length || 0} sections`;
                        })()}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Link to={`/courses/${c._id}`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Explore</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Instructor/Admin Management Dashboard */}
        {['instructor', 'admin'].includes(user?.role) && (
          <>
            <h2 className="text-2xl font-bold text-blue-900 mb-6">{user?.role === 'admin' ? 'Platform Management' : 'My Courses'}</h2>
            {/* Analytics */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-indigo-800">Analytics</h3>
              {analyticsLoading ? (
                <div className="text-slate-500">Loading analytics...</div>
              ) : analytics.length === 0 ? (
                <div className="text-slate-500">No analytics available yet.</div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-slate-100">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Course</th>
                        <th className="px-4 py-3 text-left font-semibold">Enrollments</th>
                        <th className="px-4 py-3 text-left font-semibold">Completion Rate</th>
                        <th className="px-4 py-3 text-left font-semibold">Avg. Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.map(a => (
                        <tr key={a.courseId} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-blue-900">{a.title}</td>
                          <td className="px-4 py-3">{a.enrollmentCount}</td>
                          <td className="px-4 py-3">{a.completionRate}%</td>
                          <td className="px-4 py-3">{a.avgRating.toFixed(1)} <span className="text-yellow-500">★</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {/* Course Management Grid */}
            {loading ? (
              <div className="text-center py-10 text-slate-500">Loading courses...</div>
            ) : myCourses.length === 0 ? (
              <div className="text-center py-10 text-slate-500">{user?.role === 'admin' ? 'No courses to manage.' : 'You have not created any courses yet.'} <Link to="/editor" className="text-blue-600 hover:underline">Create one</Link></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCourses.map(c => (
                  <div key={c._id} className="bg-white rounded-xl shadow border border-slate-100 p-6 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-lg text-blue-800">{c.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{c.sections?.length || 0} sections • {c.enrolledStudents?.length || 0} students</div>
                      </div>
                      {c.thumbnail && <img src={c.thumbnail} alt={c.title} className="w-16 h-12 object-cover rounded ml-2" />}
                    </div>
                    <div className="text-sm text-slate-700 line-clamp-2">{c.description}</div>
                    <div className="flex gap-2 mt-2">
                      <Link to={`/courses/${c._id}`} className="flex-1 text-center px-3 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 text-sm">View</Link>
                      <Link to={`/editor?id=${c._id}`} className="flex-1 text-center px-3 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 text-sm">Edit</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
