import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CourseEditor(){
  const { user } = useAuth();
  const { addToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit course form
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [tags, setTags] = useState('');
  const [price, setPrice] = useState(0);
  const [thumbnail, setThumbnail] = useState('');
  const [resourceLinks, setResourceLinks] = useState([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/courses')
      .then(r => {
        if (!mounted) return;
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

  const createCourse = async (e) => {
    e.preventDefault();
    try{
      setCreating(true);
      const payload = { title, description, category, difficulty, tags: tags.split(',').map(t=>t.trim()).filter(Boolean), price: Number(price), thumbnail, resourceLinks };
      
      let r;
      if (editingId) {
        // Update existing course
        r = await api.put(`/courses/${editingId}`, payload);
        setCourses(prev => prev.map(c => c._id === editingId ? r.data : c));
        addToast('Course updated successfully', 'success');
        setEditingId(null);
      } else {
        // Create new course
        r = await api.post('/courses', payload);
        setCourses(prev=>[r.data, ...prev]);
        addToast('Course created successfully', 'success');
      }
      
      setTitle(''); setDescription(''); setTags(''); setPrice(0); setThumbnail(''); setResourceLinks([]);
      setCategory('General'); setDifficulty('Beginner');
    }catch(err){
      console.error('Course operation failed', err);
      addToast(err.response?.data?.error || 'Course operation failed', 'error');
    }finally{ setCreating(false); }
  };

  const startEdit = (course) => {
    setEditingId(course._id);
    setTitle(course.title);
    setDescription(course.description);
    setCategory(course.category || 'General');
    setDifficulty(course.difficulty || 'Beginner');
    setTags(course.tags?.join(', ') || '');
    setPrice(course.price || 0);
    setThumbnail(course.thumbnail || '');
    setResourceLinks(course.resourceLinks || []);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle(''); setDescription(''); setTags(''); setPrice(0); setThumbnail(''); setResourceLinks([]);
    setCategory('General'); setDifficulty('Beginner');
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      setCourses(prev => prev.filter(c => c._id !== courseId));
      addToast('Course deleted', 'success');
    } catch (err) {
      console.error('Delete failed', err);
      addToast(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  const addSection = async (courseId, sectionTitle, sectionDescription) => {
    try{
      const r = await api.post('/sections', { courseId, title: sectionTitle, description: sectionDescription });
      const updated = await api.get(`/courses/${courseId}`);
      setCourses(prev => prev.map(c => c._id === courseId ? updated.data : c));
      addToast('Section added', 'success');
    }catch(err){
      console.error('Add section failed', err);
      addToast(err.response?.data?.error || 'Add section failed', 'error');
    }
  };

  const addLesson = async (courseId, sectionId, lessonData) => {
    try{
      const body = { courseId, sectionId, ...lessonData };
      await api.post('/lessons', body);
      const updated = await api.get(`/courses/${courseId}`);
      setCourses(prev => prev.map(c => c._id === courseId ? updated.data : c));
      addToast('Lesson added', 'success');
    }catch(err){
      console.error('Add lesson failed', err);
      addToast(err.response?.data?.error || 'Add lesson failed', 'error');
    }
  };

  if(!user) return <div className="text-center py-10">Please login as an instructor to access the editor.</div>;
  if(user && !['instructor','admin'].includes(user.role) ) return <div className="text-center py-10">Only instructors may access the course editor.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <h2 className="text-2xl font-bold mb-6 text-blue-900">{editingId ? 'Edit Course' : 'Create a New Course'}</h2>
        <form onSubmit={createCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <textarea className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 min-h-20" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
            <input className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
            <input className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
            {/* Resource Links Editor */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-blue-800">Course Resources</h4>
              {resourceLinks.map((res, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-center">
                  <input type="text" className="p-2 border rounded w-1/3" placeholder="Label" value={res.label} onChange={e => {
                    const links = [...resourceLinks];
                    links[idx].label = e.target.value;
                    setResourceLinks(links);
                  }} />
                  <input type="text" className="p-2 border rounded w-1/2" placeholder="URL" value={res.url} onChange={e => {
                    const links = [...resourceLinks];
                    links[idx].url = e.target.value;
                    setResourceLinks(links);
                  }} />
                  <select value={res.type} onChange={e => {
                    const links = [...resourceLinks];
                    links[idx].type = e.target.value;
                    setResourceLinks(links);
                  }} className="p-2 border rounded">
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="link">Link</option>
                  </select>
                  <button type="button" className="text-red-600 px-2" onClick={() => setResourceLinks(resourceLinks.filter((_, i) => i !== idx))}>✕</button>
                </div>
              ))}
              <button type="button" className="px-3 py-1 bg-blue-100 text-blue-700 rounded" onClick={() => setResourceLinks([...resourceLinks, { label: '', url: '', type: 'link' }])}>+ Add Resource</button>
            </div>
          </div>
          <div className="space-y-4">
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <input className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Thumbnail URL" value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
            <input className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
            <div className="flex gap-2">
              <button disabled={creating} className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-all duration-150 disabled:opacity-60">{creating ? 'Saving...' : (editingId ? 'Update Course' : 'Create Course')}</button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="flex-1 py-3 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all duration-150">Cancel</button>
              )}
            </div>
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
          <div className="grid md:grid-cols-1 gap-6">
            {courses.map(course => (
              <div key={course._id} className="border rounded-lg p-6 shadow-sm bg-slate-50">
                <div className="flex items-start gap-4 mb-4">
                  {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="w-24 h-20 object-cover rounded" />}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-blue-800">{course.title}</h3>
                    <p className="text-xs text-slate-500">{course.difficulty} • {course.category}</p>
                    <p className="text-sm text-slate-700 mt-1">{course.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {course.tags?.map(tag => <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{tag}</span>)}
                    </div>
                    <div className="text-sm font-bold text-blue-700 mt-2">${course.price}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(course)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Edit</button>
                    <button onClick={() => deleteCourse(course._id)} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Delete</button>
                  </div>
                </div>

                {/* Sections list */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-blue-800">Sections ({course.sections?.length || 0})</h4>
                    <AddSectionForm courseId={course._id} onAdd={(title, desc) => addSection(course._id, title, desc)} />
                  </div>
                  {course.sections?.length ? (
                    <div className="space-y-2">
                      {course.sections.map((section, idx) => (
                        <div key={section._id} className="bg-white p-3 rounded border border-slate-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium text-slate-900">{idx + 1}. {section.title}</h5>
                              <p className="text-xs text-slate-600">{section.description}</p>
                            </div>
                          </div>

                          {/* Lessons list */}
                          {section.lessons?.length ? (
                            <div className="mt-2 ml-4 space-y-1 border-l pl-3">
                              {section.lessons.map((lesson, lIdx) => (
                                <div key={lesson._id} className="text-sm text-slate-700">
                                  {lIdx + 1}. {lesson.title} {lesson.duration ? `(${lesson.duration}s)` : ''}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 italic mt-2">No lessons yet</div>
                          )}

                          {/* Add lesson button */}
                          <AddLessonForm 
                            courseId={course._id} 
                            sectionId={section._id} 
                            onAdd={(data) => addLesson(course._id, section._id, data)} 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 italic">No sections yet. Add one above.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddSectionForm({ courseId, onAdd }) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handle = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title, desc);
      setTitle('');
      setDesc('');
      setShow(false);
    }
  };

  return (
    <div>
      <button onClick={() => setShow(!show)} className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
        {show ? '✕' : '+ Section'}
      </button>
      {show && (
        <form onSubmit={handle} className="mt-2 space-y-2 p-3 bg-green-50 rounded border border-green-200">
          <input className="w-full p-2 border rounded text-sm" placeholder="Section title" value={title} onChange={e => setTitle(e.target.value)} required />
          <textarea className="w-full p-2 border rounded text-sm" placeholder="Section description" value={desc} onChange={e => setDesc(e.target.value)} />
          <button className="px-3 py-1 bg-green-600 text-white rounded text-sm">Add Section</button>
        </form>
      )}
    </div>
  );
}

function AddLessonForm({ courseId, sectionId, onAdd }) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);

  const handle = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({ title, description, content, videoUrl, duration: Number(duration) });
      setTitle('');
      setDescription('');
      setContent('');
      setVideoUrl('');
      setDuration(0);
      setShow(false);
    }
  };

  return (
    <div>
      <button onClick={() => setShow(!show)} className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 mt-2">
        {show ? '✕' : '+ Lesson'}
      </button>
      {show && (
        <form onSubmit={handle} className="mt-2 space-y-2 p-3 bg-indigo-50 rounded border border-indigo-200">
          <input className="w-full p-2 border rounded text-sm" placeholder="Lesson title" value={title} onChange={e => setTitle(e.target.value)} required />
          <textarea className="w-full p-2 border rounded text-sm" placeholder="Lesson description" value={description} onChange={e => setDescription(e.target.value)} />
          <textarea className="w-full p-2 border rounded text-sm" placeholder="Content (HTML/Markdown)" value={content} onChange={e => setContent(e.target.value)} />
          <input className="w-full p-2 border rounded text-sm" placeholder="Video URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
          <input className="w-full p-2 border rounded text-sm" placeholder="Duration (seconds)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
          <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Add Lesson</button>
        </form>
      )}
    </div>
  );
}
