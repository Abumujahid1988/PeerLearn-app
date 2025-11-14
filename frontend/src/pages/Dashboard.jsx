import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

export default function Dashboard(){
  const { user } = useContext(AuthContext);
  const [myCourses, setMyCourses] = useState([]);

  useEffect(()=>{
    if(!user) return;
    api.get('/courses').then(r=>{
      setMyCourses(r.data.filter(c=> c.students?.includes(user.id) || String(c.instructor?._id) === String(user.id)));
    }).catch(()=>{});
  },[user]);

  return (
    <div>
      <h2 className='text-2xl font-semibold mb-4'>Dashboard</h2>
      <p>Welcome, {user?.name}</p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
        {myCourses.map(c=>(
          <div key={c._id} className='bg-white p-4 rounded shadow'>{c.title}</div>
        ))}
      </div>
    </div>
  )
}
