import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function Courses(){
  const [courses, setCourses] = useState([]);
  useEffect(()=>{ api.get('/courses').then(r=>setCourses(r.data)).catch(()=>{}) },[]);
  return (
    <div>
      <h2 className='text-2xl font-semibold mb-4'>Courses</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {courses.map(c=>(
          <div key={c._id} className='bg-white p-4 rounded shadow'>
            <h3 className='font-semibold'>{c.title}</h3>
            <p className='text-sm text-slate-600'>By {c.instructor?.name || 'Unknown'}</p>
            <p className='mt-2 text-sm'>{c.description}</p>
            <div className='mt-3'>
              <Link to={`/courses/${c._id}`} className='text-blue-600'>Open</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
