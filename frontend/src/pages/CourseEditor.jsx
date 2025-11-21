import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CourseEditor(){
  const { user } = useAuth();
  const { addToast } = useToast();
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
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/courses')
      .then(r => {
        if (!mounted) return;
        // show only courses authored by this instructor/admin
        const myId = user?._id || user?.id;
        const mine = r.data.filter(c => {
          const instId = c.instructor?._id || c.instructor?.id || c.instructor;
          return String(instId) === String(myId);
        });
        setCourses(mine);
      })
      .catch(err => console.error('Failed to load courses', err))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  // Listen for section reorder events dispatched from CourseCard
  useEffect(() => {
    const handler = (e) => {
      const { courseId, sectionIds } = e.detail || {};
      if (courseId && Array.isArray(sectionIds)) reorderSections(courseId, sectionIds);
    };
    window.addEventListener('course-sections-reordered', handler);
    return () => window.removeEventListener('course-sections-reordered', handler);
  }, []);

  // Listen for lesson reorder events dispatched from SectionEditor
  useEffect(() => {
    const handler = (e) => {
      const { sectionId, lessonIds, courseId } = e.detail || {};
      if (sectionId && Array.isArray(lessonIds)) {
        // call API to persist lesson order for this section
        api.post(`/sections/${sectionId}/lessons/reorder`, { lessonIds })
          .then(async () => {
            // refresh course data for the affected course
            if (courseId) {
              const updated = await api.get(`/courses/${courseId}`);
              setCourses(prev => prev.map(c => c._id === courseId ? updated.data : c));
              addToast('Lessons reordered', 'success');
            }
          })
          .catch(err => {
            console.error('Lesson reorder failed', err);
            addToast(err.response?.data?.error || 'Lesson reorder failed', 'error');
          });
      }
    };
    window.addEventListener('section-lessons-reordered', handler);
    return () => window.removeEventListener('section-lessons-reordered', handler);
  }, [addToast]);

  const createCourse = async (e) => {
    e.preventDefault();
    try{
      setCreating(true);
      const payload = { title, description, category, difficulty, tags: tags.split(',').map(t=>t.trim()).filter(Boolean), price: Number(price), thumbnail };
      const r = await api.post('/courses', payload);
      setCourses(prev=>[r.data, ...prev]);
      // reset form
      setTitle(''); setDescription(''); setTags(''); setPrice(0); setThumbnail('');
      addToast('Course created successfully', 'success');
    }catch(err){
      console.error('Create course failed', err);
      addToast(err.response?.data?.error || 'Create course failed', 'error');
    }finally{ setCreating(false); }
  };

  // Add section
  const addSection = async (courseId, title, description) => {
    try{
      const r = await api.post('/sections', { courseId, title, description });
      // refresh courses list for that course
      const updated = await api.get(`/courses/${courseId}`);
      setCourses(prev => prev.map(c => c._id === courseId ? updated.data : c));
      addToast('Section added', 'success');
    }catch(err){
      console.error('Add section failed', err);
      addToast(err.response?.data?.error || 'Add section failed', 'error');
    }
  };

  // Add lesson
  const addLesson = async (courseId, sectionId, payload) => {
    try{
      const body = { courseId, sectionId, ...payload };
      await api.post('/lessons', body);
      const updated = await api.get(`/courses/${courseId}`);
      setCourses(prev => prev.map(c => c._id === courseId ? updated.data : c));
      addToast('Lesson added', 'success');
    }catch(err){
      console.error('Add lesson failed', err);
      addToast(err.response?.data?.error || 'Add lesson failed', 'error');
    }
  };

  // Reorder sections for a course
  const reorderSections = async (courseId, newSectionIds) => {
    try {
      await api.post(`/courses/${courseId}/sections/reorder`, { sectionIds: newSectionIds });
      const updated = await api.get(`/courses/${courseId}`);
      setCourses(prev => prev.map(c => c._id === courseId ? updated.data : c));
      addToast('Sections reordered', 'success');
    } catch (err) {
      console.error('Reorder failed', err);
      addToast(err.response?.data?.error || 'Reorder failed', 'error');
    }
  };

  if(!user) return <div>Please login as an instructor to access the editor.</div>;
  if(user && !['instructor','admin'].includes(user.role) ) return <div>Only instructors may access the course editor.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <h2 className="text-2xl font-bold mb-6 text-blue-900">Create a New Course</h2>
        <form onSubmit={createCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <textarea className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 min-h-20" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
            <input className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
            <input className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
          </div>
          <div className="space-y-4">
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <input className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Thumbnail URL" value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
            <input className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
            <button disabled={creating} className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-all duration-150 disabled:opacity-60 mt-2">{creating ? 'Creating...' : 'Create Course'}</button>
          </div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        <h2 className="text-xl font-bold mb-4 text-blue-900">Your Courses</h2>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No courses found. Create your first course above!</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div key={course._id} className="border rounded-lg p-4 shadow-sm bg-slate-50 flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-20 h-14 object-cover rounded" />}
                  <div>
                    <div className="font-semibold text-lg text-blue-800">{course.title}</div>
                    <div className="text-xs text-slate-500">{course.difficulty} &bull; {course.category}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-700 line-clamp-2">{course.description}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {course.tags?.map(tag => <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{tag}</span>)}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-blue-700">${course.price}</span>
                  <span className="text-xs text-slate-400">{course.sections?.length || 0} sections</span>
                </div>
                {/* Section list with drag-and-drop for ordering */}
                <div className="mt-3">
                  <Droppable droppableId={`sections-${course._id}`} type="SECTION">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {course.sections?.map((sec, index) => (
                          <Draggable key={sec._id} draggableId={String(sec._id)} index={index}>
                            {(draggableProvided) => (
                              <div ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} {...draggableProvided.dragHandleProps} className="mb-2">
                                <SectionEditor courseId={course._id} section={sec} onAddLesson={addLesson} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
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
        {course.sections?.length ? (
          <DragDropContext onDragEnd={(result) => {
            if (!result.destination) return;
            if (result.type !== 'SECTION') return;
            const newSections = Array.from(course.sections);
            const [moved] = newSections.splice(result.source.index, 1);
            newSections.splice(result.destination.index, 0, moved);
            // call API via custom event: emit custom event so parent can handle update
            const ev = new CustomEvent('course-sections-reordered', { detail: { courseId: course._id, sectionIds: newSections.map(s=>s._id) } });
            window.dispatchEvent(ev);
          }}>
            <Droppable droppableId={`sections-${course._id}`} type="SECTION">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {course.sections.map((sec, index) => (
                    <Draggable key={sec._id} draggableId={String(sec._id)} index={index}>
                      {(draggableProvided) => (
                        <div ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} {...draggableProvided.dragHandleProps} className='mb-2'>
                          <SectionEditor courseId={course._id} section={sec} onAddLesson={onAddLesson} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : <div className='text-sm text-slate-600'>No sections yet.</div>}
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
  
  // Reorder lessons within this section
  const onDragEndLesson = (result) => {
    if (!result.destination) return;
    const newLessons = Array.from(section.lessons || []);
    const [moved] = newLessons.splice(result.source.index, 1);
    newLessons.splice(result.destination.index, 0, moved);
    const ev = new CustomEvent('section-lessons-reordered', { detail: { sectionId: section._id, lessonIds: newLessons.map(l=>l._id), courseId } });
    window.dispatchEvent(ev);
  };

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
        <div className='mt-3'>
          <DragDropContext onDragEnd={onDragEndLesson}>
            <Droppable droppableId={`lessons-${section._id}`} type={`LESSON-${section._id}`}>
              {(provided) => (
                <ul ref={provided.innerRef} {...provided.droppableProps} className='space-y-2'>
                  {section.lessons.map((l, idx) => (
                    <Draggable key={l._id} draggableId={String(l._id)} index={idx}>
                      {(draggableProvided) => (
                        <li ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} {...draggableProvided.dragHandleProps} className='p-2 border rounded bg-white'>
                          {l.title}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : null}
    </div>
  );
}
