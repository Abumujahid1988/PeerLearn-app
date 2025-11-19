import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

export default function Courses(){
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    api.get('/courses')
      .then(r=>{ if(mounted) setCourses(r.data) })
      .catch(err=>{ console.error('Failed to load courses', err) })
      .finally(()=>{ if(mounted) setLoading(false) });
    return ()=> mounted = false;
  },[]);

  if(loading) return <div>Loading courses...</div>;

  return (
    <div>
      <h2 className='text-2xl font-semibold mb-4'>Courses</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {courses.map(c=>{
          return (
            <div key={c._id} className='bg-white p-4 rounded shadow flex'>
              {c.thumbnail ? (
                <img src={c.thumbnail} alt={c.title} className='w-24 h-24 object-cover rounded mr-4' />
              ) : (
                <div className='w-24 h-24 bg-slate-100 rounded mr-4 flex items-center justify-center text-sm text-slate-500'>No image</div>
              )}
              <div className='flex-1'>
                <h3 className='font-semibold text-lg'>{c.title}</h3>
                <p className='text-sm text-slate-600'>By {c.instructor?.name || 'Unknown'}</p>
                <p className='mt-2 text-sm line-clamp-3'>{c.description}</p>
                <div className='mt-2 flex items-center justify-between'>
                  <div className='text-sm text-slate-700'>{c.difficulty} • {c.tags?.slice(0,3).join(', ')}</div>
                  <Link to={`/courses/${c._id}`} className='text-blue-600'>Open</Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
