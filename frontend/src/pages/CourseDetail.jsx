import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function CourseDetail(){
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(()=>{ api.get(`/courses/${id}`).then(r=>setCourse(r.data)).catch(()=>{}) },[id]);

  const enroll = async () => {
    if(!user){ alert('Please login'); return; }
    await api.post(`/courses/${id}/enroll`);
    alert('Enrolled!');
  };

  if(!course) return <div>Loading...</div>;
  return (
    <div className='space-y-4'>
      <div className='bg-white p-4 rounded shadow'>
        <h2 className='text-xl font-bold'>{course.title}</h2>
        <p className='text-sm text-slate-600'>{course.description}</p>
      </div>
      <div className='bg-white p-4 rounded shadow'>
        <h3 className='font-semibold mb-2'>Lessons</h3>
        <ul className='space-y-2'>
          {course.lessons?.map(l=><li key={l._id} className='p-2 border rounded'>{l.title}</li>)}
        </ul>
      </div>
      <div>
        <button onClick={enroll} className='px-3 py-1 bg-primary text-white rounded'>Enroll</button>
      </div>
    </div>
  )
}
