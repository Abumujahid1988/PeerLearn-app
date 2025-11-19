import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import CourseDiscussion from '../components/CourseDiscussion';
import { useToast } from '../context/ToastContext';

export default function CourseDetail(){
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    api.get(`/courses/${id}`)
      .then(r=>{ if(mounted) setCourse(r.data) })
      .catch(err=>{ console.error('Failed to load course', err) })
      .finally(()=>{ if(mounted) setLoading(false) });
    return ()=> mounted = false;
  },[id]);

  const enroll = async () => {
    if(!user){ addToast('Please login to enroll', 'error'); return; }
    try{
      setEnrolling(true);
      const r = await api.post(`/courses/${id}/enroll`);
      // update UI - returned enrollment and course
      if(r.data && r.data.course) setCourse(r.data.course);
      addToast('Enrolled successfully', 'success');
    }catch(err){
      console.error('Enroll error', err);
      addToast(err.response?.data?.error || 'Enroll failed', 'error');

    }finally{ setEnrolling(false); }
  };

  if(loading) return <div>Loading...</div>;
  if(!course) return <div>Course not found</div>;

  const isEnrolled = course.enrolledStudents?.some(s => s === (user?._id || user?.id));

  return (
    <div className='space-y-4'>
      <div className='bg-white p-4 rounded shadow'>
        <div className='flex items-start gap-4'>
          {course.thumbnail ? <img src={course.thumbnail} alt={course.title} className='w-40 h-28 object-cover rounded' /> : null}
          <div>
            <h2 className='text-2xl font-bold'>{course.title}</h2>
            <p className='text-sm text-slate-600'>{course.description}</p>
            <div className='mt-2 text-sm text-slate-700'>{course.difficulty} • {course.tags?.join(', ')}</div>
          </div>
        </div>
      </div>

      <div className='bg-white p-4 rounded shadow'>
        <h3 className='font-semibold mb-2'>Sections & Lessons</h3>
        {course.sections?.length ? (
          course.sections.map(section => (
            <div key={section._id} className='mb-4'>
              <h4 className='font-medium'>{section.title}</h4>
              <p className='text-sm text-slate-600'>{section.description}</p>
              <ul className='mt-2 space-y-2'>
                {section.lessons?.map(lesson => (
                  <li key={lesson._id} className='p-2 border rounded flex justify-between'>
                    <div>
                      <div className='font-medium'>{lesson.title}</div>
                      <div className='text-sm text-slate-600'>{lesson.duration ? `${Math.ceil(lesson.duration/60)} min` : ''}</div>
                    </div>
                    <div className='text-sm text-slate-500'>{lesson.videoUrl ? 'Video' : lesson.attachments?.length ? 'Attachments' : ''}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className='text-sm text-slate-600'>No sections yet.</div>
        )}
      </div>

      <div>
        <button onClick={enroll} disabled={enrolling || isEnrolled} className={`px-3 py-1 rounded ${isEnrolled ? 'bg-gray-400 text-white' : 'bg-blue-600 text-white'}`}>
          {isEnrolled ? 'Enrolled' : (enrolling ? 'Enrolling...' : 'Enroll')}
        </button>
      </div>
      
      <div>
        <CourseDiscussion courseId={id} />
      </div>
    </div>
  )
}
