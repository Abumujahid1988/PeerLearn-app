import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminReports(){
  const { user } = useAuth();
  const { addToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!user || user.role !== 'admin') return;
    setLoading(true);
    api.get('/reports')
      .then(r=> setReports(r.data || []))
      .catch(err=> console.error('Failed to load reports', err))
      .finally(()=> setLoading(false));
  },[user]);

  const updateStatus = async (id, status) => {
    try{
      await api.put(`/reports/${id}/status`, { status });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      addToast('Status updated', 'success');
    }catch(err){
      console.error('Update status failed', err);
      addToast(err.response?.data?.error || 'Update failed', 'error');
    }
  };

  const remove = async (id) => {
    if(!window.confirm('Delete this report?')) return;
    try{
      await api.delete(`/reports/${id}`);
      setReports(prev => prev.filter(r => r._id !== id));
      addToast('Report deleted', 'success');
    }catch(err){
      console.error('Delete failed', err);
      addToast(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  if(!user) return <div className='p-6'>Please login as admin.</div>;
  if(user.role !== 'admin') return <div className='p-6'>Access denied. Admins only.</div>;

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-4'>
      <h2 className='text-2xl font-bold text-blue-900'>Reports</h2>
      {loading ? <div>Loading...</div> : (
        <div className='space-y-4'>
          {reports.length === 0 && <div className='text-slate-500'>No reports found.</div>}
          {reports.map(r => (
            <div key={r._id} className='bg-white p-4 rounded shadow border'>
              <div className='flex justify-between items-start gap-4'>
                <div>
                  <div className='text-sm text-slate-500'>Reporter: {r.reporter?.name || r.reporter}</div>
                  <div className='font-semibold text-blue-900'>{r.targetType} — {r.targetId}</div>
                  <div className='text-sm text-slate-700 mt-2'>{r.reason}</div>
                </div>
                <div className='flex flex-col gap-2 items-end'>
                  <div className='text-xs text-slate-500'>Status: <span className='font-semibold'>{r.status}</span></div>
                  <div className='flex gap-2'>
                    <button onClick={()=>updateStatus(r._id, 'in-review')} className='px-2 py-1 bg-yellow-500 text-white rounded text-sm'>In Review</button>
                    <button onClick={()=>updateStatus(r._id, 'resolved')} className='px-2 py-1 bg-green-600 text-white rounded text-sm'>Resolve</button>
                    <button onClick={()=>remove(r._id)} className='px-2 py-1 bg-red-600 text-white rounded text-sm'>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
