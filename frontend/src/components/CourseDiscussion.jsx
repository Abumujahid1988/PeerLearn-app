import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CourseDiscussion({ courseId }){
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const { addToast } = useToast();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    api.get(`/discussions/course/${courseId}`)
      .then(r => { if(mounted) setThreads(r.data || []); })
      .catch(err => { console.error('Failed to load threads', err); addToast('Failed to load discussions', 'error'); })
      .finally(()=> { if(mounted) setLoading(false); });
    return ()=> mounted = false;
  },[courseId]);

  const submitThread = async (e) =>{
    e.preventDefault();
    if(!user){ addToast('Please login to post a thread', 'error'); navigate('/login'); return; }
    if(!title.trim() || !content.trim()){ addToast('Please add title and content', 'error'); return; }
    try{
      setPosting(true);
      // optimistic
      const temp = { _id: `temp-${Date.now()}`, title, content, author: { name: user.name || user.email || 'You' }, comments: [], createdAt: new Date().toISOString(), pending: true };
      setThreads(t => [temp, ...t]);
      const res = await api.post(`/discussions/course/${courseId}`, { title, content });
      // replace temp with server thread
      setThreads(t => t.map(x => x._id === temp._id ? res.data : x));
      setTitle(''); setContent('');
      addToast('Thread created', 'success');
    }catch(err){
      console.error('Create thread failed', err);
      setThreads(t => t.filter(x => !x._id.startsWith('temp-')));
      addToast(err.response?.data?.error || 'Failed to create thread', 'error');
    }finally{ setPosting(false); }
  };

  const addComment = async (threadId, text, resetCb) =>{
    if(!text || !text.trim()){ addToast('Comment cannot be empty', 'error'); return; }
    const tempComment = { _id: `c-temp-${Date.now()}`, content: text, author: { name: 'You' }, createdAt: new Date().toISOString(), pending: true };
    setThreads(t => t.map(th => th._id === threadId ? { ...th, comments: [...(th.comments||[]), tempComment] } : th));
    try{
      const res = await api.post(`/discussions/${threadId}/comments`, { content: text });
      setThreads(t => t.map(th => th._id === threadId ? { ...th, comments: th.comments.map(c => c._id === tempComment._id ? res.data : c) } : th));
      resetCb && resetCb();
      addToast('Comment added', 'success');
    }catch(err){
      console.error('Add comment failed', err);
      setThreads(t => t.map(th => th._id === threadId ? { ...th, comments: th.comments.filter(c => c._id !== tempComment._id) } : th));
      addToast(err.response?.data?.error || 'Failed to add comment', 'error');
    }
  };


  if(loading) return <div className="p-6 text-center text-slate-500">Loading discussions...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
      <h3 className="font-bold text-lg mb-4 text-blue-900">Course Discussions</h3>
      <form onSubmit={submitThread} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Thread title" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400" />
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Write your question or comment..." className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 min-h-20" rows={3} />
        <div className="md:col-span-2 flex justify-end">
          <button disabled={posting} className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-all duration-150 disabled:opacity-60">{posting ? 'Posting...' : 'Post Thread'}</button>
        </div>
      </form>

      {threads.length === 0 ? (
        <div className="text-center py-8 text-slate-500">No discussions yet. Start the conversation.</div>
      ) : (
        <ul className="space-y-6">
          {threads.map(thread => (
            <li key={thread._id} className="border rounded-lg p-4 bg-slate-50">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div>
                  <div className="font-semibold text-blue-800 text-lg">{thread.title}</div>
                  <div className="text-xs text-slate-500 mb-1">by {thread.author?.name || thread.author?.email} &bull; {new Date(thread.createdAt).toLocaleString()}</div>
                  <div className="mt-1 text-sm text-slate-700">{thread.content}</div>
                </div>
              </div>
              <div className="mt-4">
                <CommentsList thread={thread} onAdd={(text, reset)=>addComment(thread._id, text, reset)} user={user} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentsList({ thread, onAdd, user }){
  const [text, setText] = useState('');
  const navigate = useNavigate();
  return (
    <div className='mt-2'>
      <ul className='space-y-2'>
        {(thread.comments||[]).map(c => (
          <li key={c._id} className='text-sm p-2 bg-slate-50 rounded'>
            <div className='text-xs text-slate-500'>{c.author?.name || c.author?.email} • {new Date(c.createdAt).toLocaleString()}</div>
            <div className='mt-1'>{c.content}</div>
          </li>
        ))}
      </ul>
      {user ? (
        <form onSubmit={(e)=>{ e.preventDefault(); onAdd(text, ()=>setText('')); }} className='mt-2 flex gap-2'>
          <input value={text} onChange={e=>setText(e.target.value)} placeholder='Write a reply...' className='flex-1 border rounded p-2' />
          <button type='submit' className='px-3 py-1 bg-indigo-600 text-white rounded'>Reply</button>
        </form>
      ) : (
        <div className='mt-2 text-sm text-slate-600'>
          <span>Please </span>
          <button onClick={()=>navigate('/login')} className='underline text-blue-600'>login</button>
          <span> to reply.</span>
        </div>
      )}
    </div>
  );
}
