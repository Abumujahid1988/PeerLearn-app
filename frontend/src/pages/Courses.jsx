import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnrollment } from '../context/EnrollmentContext';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Courses() {
      const navigate = useNavigate();
    const { notifyEnrollment } = useEnrollment();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { user } = useContext(AuthContext);

  const fetchCourses = () => {
    setLoading(true);
    api.get('/courses')
      .then(r=> setCourses(r.data))
      .catch(err=>{
        console.error('Failed to load courses', err);
        addToast('Failed to load courses', 'error');
      })
      .finally(()=> setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const handleEnroll = async (courseId) => {
    if (!user) {
      addToast('Please login to enroll', 'error');
      return;
    }
    try {
      await api.post(`/courses/${courseId}/enroll`);
      addToast('Enrolled successfully', 'success');
      fetchCourses();
      notifyEnrollment();
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.error || 'Enroll failed', 'error');
    }
  };

  if(loading) return <div>Loading courses...</div>;

  return (
    <div>
      <h2 className='text-2xl font-semibold mb-4 text-indigo-700'>Courses</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {courses.map(c => {
          const isEnrolled = user && Array.isArray(c.enrolledStudents) && c.enrolledStudents.some(e => String(e._id || e) === String(user._id || user.id));
          return (
            <div key={c._id} className='bg-white p-4 rounded shadow flex'>
              {c.thumbnail ? (
                <img src={c.thumbnail} alt={c.title} className='w-24 h-24 object-cover rounded mr-4' />
              ) : (
                <div className='w-24 h-24 bg-slate-100 rounded mr-4 flex items-center justify-center text-sm text-slate-500'>No image</div>
              )}
              <div className='flex-1'>
                <h3 className='font-semibold text-lg text-slate-900'>{c.title}</h3>
                <p className='text-sm text-slate-600'>By {c.instructor?.name || 'Unknown'}</p>
                <p className='mt-2 text-sm line-clamp-3 text-slate-700'>{c.description}</p>
                <div className='mt-2 flex items-center justify-between'>
                  <div className='text-sm text-slate-700'>{c.difficulty}  {c.tags?.slice(0, 3).join(', ')}</div>
                </div>
                {/* Resource links (show a few small buttons) */}
                {c.resourceLinks?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.resourceLinks.slice(0, 3).map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs px-2 py-1 rounded ${res.type === 'pdf' ? 'bg-red-100 text-red-700' : res.type === 'video' ? 'bg-indigo-100 text-indigo-700' : res.type === 'audio' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
                      >
                        {res.label} {res.type === 'pdf' ? '📄' : res.type === 'video' ? '🎬' : res.type === 'audio' ? '🎧' : '🔗'}
                      </a>
                    ))}
                  </div>
                )}
                <div className='mt-2'>
                  {isEnrolled ? (
                    <Link
                      to={`/courses/${c._id}`}
                      className='px-4 py-2 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700'
                    >Explore Course</Link>
                  ) : (
                    <button
                      onClick={() => handleEnroll(c._id)}
                      className='px-4 py-2 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700'
                    >Enroll</button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
