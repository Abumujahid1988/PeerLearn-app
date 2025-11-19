import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function CourseEditor(){
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create course form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState(0);
  const [thumbnail, setThumbnail] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    api.get('/courses')
      .then(r=>{
        if(!mounted) return;
        // show only courses authored by this instructor/admin
        const myId = user?._id || user?.id;
        const mine = r.data.filter(c => {
          const instId = c.instructor?._id || c.instructor?.id || c.instructor;
          return String(instId) === String(myId);
        });
        setCourses(mine);
      })
      .catch(err=> console.error('Failed to load courses', err))
      .finally(()=>{ if(mounted) setLoading(false) });
    return ()=> mounted = false;
  },[user]);

  const createCourse = async (e) => {
    e.preventDefault();
    try{
      setCreating(true);
      const payload = { title, description, category, difficulty, tags: tags.split(',').map(t=>t.trim()).filter(Boolean), price: Number(price), thumbnail };
      const r = await api.post('/courses', payload);
      setCourses(prev=>[r.data, ...prev]);
      // reset form
      setTitle(''); setDescription(''); setTags(''); setPrice(0); setThumbnail('');
    }catch(err){
      console.error('Create course failed', err);
      alert(err.response?.data?.error || 'Create course failed');
    }finally{ setCreating(false); }
  };

  // Add section
  const addSection = async (courseId, title, description) => {
    try{
      const r = await api.post('/sections', { courseId, title, description });
      // refresh courses list for that course
      const updated = await api.get(`/courses/${courseId}`);
      setCourses(prev => prev.map(c => c._id === courseId ? updated.data : c));
    }catch(err){ console.error('Add section failed', err); alert(err.response?.data?.error || 'Add section failed'); }
  };

  // Add lesson
  const addLesson = async (courseId, sectionId, payload) => {
    try{
      const body = { courseId, sectionId, ...payload };
      await api.post('/lessons', body);
      const updated = await api.get(`/courses/${courseId}`);
      setCourses(prev => prev.map(c => c._id === courseId ? updated.data : c));
    }catch(err){ console.error('Add lesson failed', err); alert(err.response?.data?.error || 'Add lesson failed'); }
  };

  if(!user) return <div>Please login as an instructor to access the editor.</div>;
  if(user && !['instructor','admin'].includes(user.role) ) return <div>Only instructors may access the course editor.</div>;

  return (
    <div className='space-y-6'>
      <div className='bg-white p-6 rounded shadow'>
        <h2 className='text-xl font-bold mb-4'>Create Course</h2>
        <form onSubmit={createCourse} className='space-y-3'>
          <input className='w-full p-2 border rounded' placeholder='Title' value={title} onChange={e=>setTitle(e.target.value)} required />
          <textarea className='w-full p-2 border rounded' placeholder='Description' value={description} onChange={e=>setDescription(e.target.value)} required />
          <div className='flex gap-2'>
            <input className='flex-1 p-2 border rounded' placeholder='Category' value={category} onChange={e=>setCategory(e.target.value)} />
            <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className='p-2 border rounded'>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <input className='w-full p-2 border rounded' placeholder='Tags (comma separated)' value={tags} onChange={e=>setTags(e.target.value)} />
          <div className='flex gap-2'>
            <input className='flex-1 p-2 border rounded' placeholder='Thumbnail URL' value={thumbnail} onChange={e=>setThumbnail(e.target.value)} />
            <input className='w-32 p-2 border rounded' placeholder='Price' type='number' value={price} onChange={e=>setPrice(e.target.value)} />
          </div>
          <button disabled={creating} className='px-4 py-2 bg-blue-600 text-white rounded'>{creating ? 'Creating...' : 'Create Course'}</button>
        </form>
      </div>

      <div>
        <h3 className='text-lg font-semibold mb-2'>My Courses</h3>
        {loading ? <div>Loading...</div> : (
          <div className='space-y-4'>
            {courses.length === 0 && <div className='text-sm text-slate-600'>No courses yet.</div>}
            {courses.map(course => (
              <CourseCard key={course._id} course={course} onAddSection={addSection} onAddLesson={addLesson} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, onAddSection, onAddLesson }){
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDesc, setSectionDesc] = useState('');

  return (
    <div className='bg-white p-4 rounded shadow'>
      <div className='flex justify-between items-start'>
        <div>
          <h4 className='font-semibold text-lg'>{course.title}</h4>
          <div className='text-sm text-slate-600'>{course.description}</div>
        </div>
      </div>

      <div className='mt-3'>
        <button onClick={()=>setShowSectionForm(s=>!s)} className='px-3 py-1 bg-green-600 text-white rounded'>Add Section</button>
      </div>

      {showSectionForm && (
        <form onSubmit={e=>{ e.preventDefault(); onAddSection(course._id, sectionTitle, sectionDesc); setSectionTitle(''); setSectionDesc(''); setShowSectionForm(false); }} className='mt-3 space-y-2'>
          <input className='w-full p-2 border rounded' placeholder='Section title' value={sectionTitle} onChange={e=>setSectionTitle(e.target.value)} required />
          <textarea className='w-full p-2 border rounded' placeholder='Section description' value={sectionDesc} onChange={e=>setSectionDesc(e.target.value)} />
          <button className='px-3 py-1 bg-blue-600 text-white rounded'>Create Section</button>
        </form>
      )}

      <div className='mt-4'>
        {course.sections?.length ? course.sections.map(sec=> (
          <SectionEditor key={sec._id} courseId={course._id} section={sec} onAddLesson={onAddLesson} />
        )) : <div className='text-sm text-slate-600'>No sections yet.</div>}
      </div>
    </div>
  );
}

function SectionEditor({ courseId, section, onAddLesson }){
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');

  const submit = (e) =>{
    e.preventDefault();
    onAddLesson(courseId, section._id, { title, description, content, duration: Number(duration), videoUrl });
    setTitle(''); setDescription(''); setContent(''); setDuration(0); setVideoUrl(''); setShowLessonForm(false);
  };

  return (
    <div className='mt-3 p-3 border rounded'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='font-medium'>{section.title}</div>
          <div className='text-sm text-slate-600'>{section.description}</div>
        </div>
        <button onClick={()=>setShowLessonForm(s=>!s)} className='px-2 py-1 bg-indigo-600 text-white rounded'>Add Lesson</button>
      </div>

      {showLessonForm && (
        <form onSubmit={submit} className='mt-3 space-y-2'>
          <input className='w-full p-2 border rounded' placeholder='Lesson title' value={title} onChange={e=>setTitle(e.target.value)} required />
          <textarea className='w-full p-2 border rounded' placeholder='Lesson description' value={description} onChange={e=>setDescription(e.target.value)} />
          <textarea className='w-full p-2 border rounded' placeholder='Content (HTML/Markdown)' value={content} onChange={e=>setContent(e.target.value)} />
          <div className='flex gap-2'>
            <input className='p-2 border rounded flex-1' placeholder='Video URL' value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} />
            <input className='w-32 p-2 border rounded' placeholder='Duration (sec)' type='number' value={duration} onChange={e=>setDuration(e.target.value)} />
          </div>
          <button className='px-3 py-1 bg-blue-600 text-white rounded'>Create Lesson</button>
        </form>
      )}

      {section.lessons?.length ? (
        <ul className='mt-3 space-y-2'>
          {section.lessons.map(l => (
            <li key={l._id} className='p-2 border rounded'>{l.title}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
