import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';


export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.get('/courses')
      .then(r => {
        setMyCourses(
          r.data.filter(
            c => c.students?.includes(user.id) || String(c.instructor?._id) === String(user.id)
          )
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // Fetch analytics for instructors/admins
    if (['instructor','admin'].includes(user.role)) {
      setAnalyticsLoading(true);
      api.get('/analytics/instructor')
        .then(r => setAnalytics(r.data.analytics || []))
        .catch(() => setAnalytics([]))
        .finally(() => setAnalyticsLoading(false));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-4 md:p-10">
        {/* Top: nav links centered, user info at right */}
        {/* User info aligned with navbar auth links, but not in navbar */}
        <div className="mb-10" style={{ position: 'relative', minHeight: '56px' }}>
          <div className="absolute right-8 top-0 flex items-center gap-3">
            <div className="flex flex-col items-end justify-center">
              <div className="font-bold text-blue-900">{user?.name || 'Abdullahi Abdulganiyu'}</div>
              <div className="text-xs text-slate-500">{user?.email || 'abumujahid555@gmail.com'}</div>
            </div>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-700" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-xl font-bold text-blue-700 border-2 border-blue-700">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
            )}
          </div>
        </div>

        {/* Instructor Analytics */}
        {['instructor','admin'].includes(user.role) && (
          <div className="mb-10">
            <h3 className="text-xl font-bold mb-4 text-blue-800">Your Course Analytics</h3>
            {analyticsLoading ? (
              <div className="text-slate-500">Loading analytics...</div>
            ) : analytics.length === 0 ? (
              <div className="text-slate-500">No analytics available yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Course</th>
                      <th className="px-4 py-2 text-left">Enrollments</th>
                      <th className="px-4 py-2 text-left">Completion Rate</th>
                      <th className="px-4 py-2 text-left">Avg. Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map(a => (
                      <tr key={a.courseId} className="border-b">
                        <td className="px-4 py-2 font-semibold text-blue-900">{a.title}</td>
                        <td className="px-4 py-2">{a.enrollmentCount}</td>
                        <td className="px-4 py-2">{a.completionRate}%</td>
                        <td className="px-4 py-2">{a.avgRating.toFixed(1)} <span className="text-yellow-500">★</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Student/Instructor Course List */}
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading your courses...</div>
        ) : myCourses.length === 0 ? (
          <div className="text-center py-10 text-slate-500">You are not enrolled in any courses yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCourses.map(c => (
              <div key={c._id} className="bg-white rounded-xl shadow border border-slate-100 p-6 flex flex-col gap-2">
                <div className="flex items-center gap-4 mb-2">
                  {c.thumbnail && <img src={c.thumbnail} alt={c.title} className="w-20 h-14 object-cover rounded" />}
                  <div>
                    <div className="font-semibold text-lg text-blue-800">{c.title}</div>
                    <div className="text-xs text-slate-500">{c.difficulty} &bull; {c.category}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-700 line-clamp-2 mb-2">{c.description}</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {c.tags?.map(tag => <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{tag}</span>)}
                </div>
                {/* Progress bar (placeholder, replace with real progress if available) */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Progress: 60%</span>
                  <span>{c.sections?.length || 0} sections</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
