import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import CourseDiscussion from '../components/CourseDiscussion';
import ChatRoom from '../components/ChatRoom';
import DOMPurify from 'dompurify';
import { useToast } from '../context/ToastContext';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const [showResources, setShowResources] = useState(false);
  const modalRef = useRef(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [marking, setMarking] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [contentViewed, setContentViewed] = useState(false);
  const contentRef = useRef(null);
  const videoElRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const ytScriptLoadedRef = useRef(false);

  // focus modal and handle Escape to close
  useEffect(() => {
    if (!showResources) return;
    const el = modalRef.current;
    if (el) el.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') setShowResources(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showResources]);

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    api.get(`/courses/${id}`)
      .then(r=>{ if(mounted) setCourse(r.data) })
      .catch(err=>{ console.error('Failed to load course', err) })
      .finally(()=>{ if(mounted) setLoading(false) });
    // Fetch reviews
    api.get(`/reviews/courses/${id}/reviews`)
      .then(r => {
        if (mounted) {
          setReviews(r.data.reviews || []);
          setAvgRating(r.data.rating || 0);
          if (user) {
            const mine = (r.data.reviews || []).find(rv => rv.student === (user._id || user.id));
            if (mine) {
              setMyRating(mine.rating);
              setMyComment(mine.comment || '');
            } else {
              setMyRating(0);
              setMyComment('');
            }
          }
        }
      })
      .catch(err => { console.error('Failed to load reviews', err); });
    return ()=> mounted = false;
  },[id, user]);

  // Load progress (completed lessons) for enrolled students
  useEffect(() => {
    let mounted = true;
    if (!user || user?.role !== 'student') return;
    if (!course) return;
    const enrolled = Array.isArray(course?.enrolledStudents) && course.enrolledStudents.some(e => String(e._id || e) === String(user?._id || user?.id));
    if (!enrolled) return;
    api.get(`/progress/${id}`)
      .then(r => {
        if (!mounted) return;
        const ids = (r.data.completedLessons || []).map(l => (l._id || l));
        setCompletedLessons(ids);
      })
      .catch(err => { /* ignore silently */ });
    return () => mounted = false;
  }, [course, id, user]);
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { addToast('Please login to review', 'error'); return; }
    const isEnrolled = Array.isArray(course?.enrolledStudents) && course.enrolledStudents.some(e => String(e._id || e) === String(user?._id || user?.id));
    if (!isEnrolled) { addToast('Only enrolled students can review', 'error'); return; }
    if (!myRating || myRating < 1 || myRating > 5) { addToast('Please select a rating (1-5)', 'error'); return; }
    setReviewSubmitting(true);
    try {
      const r = await api.post(`/reviews/courses/${id}/reviews`, { rating: myRating, comment: myComment });
      setReviews(r.data.reviews || []);
      setAvgRating(r.data.rating || 0);
      addToast('Review submitted', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit review', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

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

  const selectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setContentViewed(false);
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Track when student scrolls through content (70% viewed = ready to mark complete)
  useEffect(() => {
    if (!contentRef.current) return;
    const el = contentRef.current;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight * 0.7) {
        setContentViewed(true);
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [selectedLesson]);

  const markLessonComplete = useCallback(async (lessonId) => {
    if (!user) { addToast('Please login to mark complete', 'error'); return; }
    // prevent duplicate calls
    if (marking) return;
    if (completedLessons.includes(lessonId)) return;
    setMarking(true);
    const wasCompleted = completedLessons.includes(lessonId);
    if (!wasCompleted) setCompletedLessons(prev => [...prev, lessonId]);
    try {
      const r = await api.post(`/progress/${id}`, { lessonId });
      // backend may return updated completedLessons array and percentage
      const ids = (r.data?.completedLessons || []).map(l => (l._id || l));
      if (ids && ids.length) setCompletedLessons(ids);
      addToast('Marked as completed', 'success');
    } catch (err) {
      console.error('Mark complete failed:', err.response?.data || err.message || err);
      // revert optimistic update
      if (!wasCompleted) setCompletedLessons(prev => prev.filter(x => x !== lessonId));
      const serverMsg = err.response?.data?.error || err.response?.data || err.message || 'Failed to mark complete';
      addToast(serverMsg, 'error');
    } finally {
      setMarking(false);
    }
  }, [user, completedLessons, id, addToast]);

  // Attach video end listeners for HTML5 video and YouTube iframe API
  useEffect(() => {
    // cleanup previous YT player if any
    if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
      try { ytPlayerRef.current.destroy(); } catch(e){}
      ytPlayerRef.current = null;
    }

    // remove any existing HTML5 listener
    const v = videoElRef.current;
    let htmlOnEnded;
    if (v) {
      htmlOnEnded = () => {
        if (!selectedLesson) return;
        const lid = selectedLesson._id || selectedLesson;
        if (!completedLessons.includes(lid)) markLessonComplete(lid);
      };
      v.addEventListener('ended', htmlOnEnded);
    }

    // If selectedLesson is a YouTube URL, try to wire the IFrame API
    const isYouTube = selectedLesson?.videoUrl && (selectedLesson.videoUrl.includes('youtube') || selectedLesson.videoUrl.includes('youtu.be'));
    let playerCreated = false;

    const createYTPlayer = () => {
      try {
        const id = `yt-player-${selectedLesson._id}`;
        if (window.YT && window.YT.Player) {
          ytPlayerRef.current = new window.YT.Player(id, {
            events: {
              onStateChange: (ev) => {
                // 0 = ended
                if (ev.data === window.YT.PlayerState.ENDED) {
                  const lid = selectedLesson._id || selectedLesson;
                  if (!completedLessons.includes(lid)) markLessonComplete(lid);
                }
              }
            }
          });
          playerCreated = true;
        }
      } catch (e) {
        console.error('YT player creation failed', e);
      }
    };

    if (isYouTube) {
      if (window.YT && window.YT.Player) {
        createYTPlayer();
      } else if (!ytScriptLoadedRef.current) {
        // load script
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.async = true;
        window.onYouTubeIframeAPIReady = () => {
          ytScriptLoadedRef.current = true;
          createYTPlayer();
        };
        document.body.appendChild(s);
      } else {
        // script is loading, set a timeout to try again shortly
        const to = setTimeout(() => { createYTPlayer(); }, 800);
        return () => clearTimeout(to);
      }
    }

    return () => {
      if (v && htmlOnEnded) v.removeEventListener('ended', htmlOnEnded);
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try { ytPlayerRef.current.destroy(); } catch(e){}
        ytPlayerRef.current = null;
      }
      if (isYouTube) {
        try { delete window.onYouTubeIframeAPIReady; } catch(e){}
      }
    };
  }, [selectedLesson, markLessonComplete]);

  const reportCourse = async () => {
    if (!user) { addToast('Please login to report', 'error'); return; }
    const reason = window.prompt('Why are you reporting this course? (brief)');
    if (!reason) return;
    try {
      await api.post('/reports', { targetType: 'course', targetId: id, reason });
      addToast('Report submitted. Admins will review it.', 'success');
    } catch (err) {
      console.error('Report failed', err);
      addToast(err.response?.data?.error || 'Failed to submit report', 'error');
    }
  };

  if(loading) return <div className="text-center py-10 text-lg text-slate-500">Loading...</div>;
  if(!course) return <div className="text-center py-10 text-lg text-red-500">Course not found</div>;

  const isEnrolled = Array.isArray(course?.enrolledStudents) && course.enrolledStudents.some(e => String(e._id || e) === String(user?._id || user?.id));
  const isInstructor = String(course?.instructor?._id) === String(user?._id || user?.id);
  const showStudentContent = user?.role === 'student' && isEnrolled;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4 md:p-8">
      <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {course.thumbnail && (
            <img src={course.thumbnail} alt={course.title} className="w-44 h-32 object-cover rounded-lg border" />
          )}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">{course.title}</h2>
            <p className="text-base text-slate-700 mb-2">{course.description}</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {course.tags?.map(tag => <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{tag}</span>)}
            </div>
            <div className="text-sm text-slate-600 mb-1">{course.difficulty} &bull; {course.category}</div>
            <div className="font-bold text-blue-700 text-lg">${course.price}</div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-xl">★</span>
                <span className="font-semibold text-blue-900">{avgRating.toFixed(1)}</span>
                <span className="text-slate-500 text-sm">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            </div>
            {/* Resource CTA: show button for enrolled students only */}
            {course.resourceLinks?.length > 0 && showStudentContent && (
              <button
                onClick={() => setShowResources(true)}
                className="mt-4 w-full md:inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
              >
                Click to explore
              </button>
            )}
            {course.resourceLinks?.length > 0 && !showStudentContent && user?.role === 'student' && (
              <div className="mt-4 w-full md:flex md:items-center md:gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1 text-sm text-slate-600">Resources are available for enrolled students.</div>
                <button onClick={enroll} disabled={enrolling} className="mt-2 md:mt-0 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 whitespace-nowrap">
                  {enrolling ? 'Enrolling...' : 'Enroll now'}
                </button>
              </div>
            )}
            {course.resourceLinks?.length > 0 && !user && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600">
                <Link to="/login" className="text-blue-600 hover:underline font-semibold">Login</Link> to access course resources.
              </div>
            )}

            {/* Resources Modal */}
            {showResources && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowResources(false)} />
                  <div ref={modalRef} tabIndex={-1} className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-lg shadow-lg p-6 outline-none">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold text-blue-800">Course Resources</h4>
                    <button onClick={() => setShowResources(false)} className="text-slate-600 hover:text-slate-800">Close</button>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-auto">
                      {course.resourceLinks.map((res, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <span className="text-lg">
                                {res.type === 'pdf' ? '📄' : res.type === 'video' ? '🎬' : res.type === 'audio' ? '🎧' : '🔗'}
                              </span>
                              <span>{res.label}</span>
                            </div>
                            <div className="text-xs text-slate-400">{res.type}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">Open</a>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Reviews removed from here and will be reinserted after curriculum */}

      {/* Sections & Lessons - Students only */}
      {user?.role === 'student' && (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-2">Course Curriculum</h3>
          <p className="text-slate-600">{course.sections?.length || 0} sections • {course.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0) || 0} lessons</p>
        </div>

        {course.sections?.length ? (
          <div className="space-y-6 flex flex-col items-center">
            {/* Row 1: Sections list (accordion cards in a horizontal scrollable container) */}
            <div className="overflow-x-auto w-full flex justify-center">
              <div className="flex gap-4 pb-2 justify-center">
                {course.sections.map((section, sectionIdx) => {
                  const isExpanded = expandedSections[section._id] !== false;
                  const sectionLessons = section.lessons || [];
                  const sectionCompleted = sectionLessons.filter(l => completedLessons.includes(l._id || l)).length;
                  const sectionProgress = Math.round((sectionCompleted / (sectionLessons.length || 1)) * 100);

                  return (
                    <button
                      key={section._id}
                      onClick={() => toggleSection(section._id)}
                      className="flex-shrink-0 w-72 p-5 bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg border border-blue-200 hover:shadow-lg hover:border-blue-400 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-2xl">{isExpanded ? '📂' : '📁'}</span>
                          <div className="text-left flex-1">
                            <div className="font-bold text-blue-900 text-sm line-clamp-1">{section.title}</div>
                            <div className="text-xs text-slate-500">
                              {sectionLessons.length === 0 && 'No lessons'}
                              {sectionLessons.length === 1 && 'Lesson 1'}
                              {sectionLessons.length > 1 && Array.from({length: sectionLessons.length}, (_,i) => `Lesson ${i+1}`).join(', ')}
                            </div>
                          </div>
                        </div>
                        <span className="text-slate-400 text-lg">{isExpanded ? '▼' : '▶'}</span>
                      </div>
                      <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${sectionProgress}%` }} />
                      </div>
                      <div className="text-xs text-blue-600 font-semibold mt-2">{sectionProgress}% Complete</div>

                      {/* Section lessons preview - visible when expanded */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-blue-200 space-y-2">
                          {sectionLessons.length ? (
                            sectionLessons.slice(0, 3).map(lesson => {
                              const isCompleted = completedLessons.includes(lesson._id || lesson);
                              const isSelected = selectedLesson && (selectedLesson._id === lesson._id);
                              return (
                                <div
                                  key={lesson._id}
                                  role="button"
                                  tabIndex={0}
                                  className={`w-full text-left text-xs px-2 py-1 rounded flex items-center gap-2 transition-colors cursor-pointer ${isSelected ? 'bg-blue-100 border border-blue-400' : 'hover:bg-slate-100'}`}
                                  onClick={e => { e.stopPropagation(); selectLesson(lesson); }}
                                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); selectLesson(lesson); } }}
                                >
                                  {isCompleted ? (
                                    <span className="text-green-600 text-sm">✓</span>
                                  ) : (
                                    <span className="text-slate-400 text-sm">○</span>
                                  )}
                                  <span className={isCompleted ? 'text-slate-500 line-through' : 'text-slate-700'}>{lesson.title}</span>
                                </div>
                              );
                            })
                          ) : null}
                          {sectionLessons.length > 3 && <div className="text-xs text-slate-500">+{sectionLessons.length - 3} more</div>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Lesson viewer - stacked vertically (video, content, attachments in rows) */}
            <div className="mt-8 w-full flex justify-center">
              {!selectedLesson ? (
                <div className="h-80 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border-2 border-dashed border-slate-300">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <div className="text-slate-600 font-medium">Select a lesson to begin learning</div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden max-w-3xl mx-auto">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 border-b border-blue-800">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold mb-2">{selectedLesson.title}</h4>
                        {selectedLesson.description && <p className="text-blue-100 text-sm">{selectedLesson.description}</p>}
                      </div>
                      <div className="flex-shrink-0">
                        {completedLessons.includes(selectedLesson._id || selectedLesson) ? (
                          <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap">
                            <span>✓</span> Completed
                          </div>
                        ) : contentViewed ? (
                          <button
                            disabled={marking}
                            onClick={() => markLessonComplete(selectedLesson._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-60 whitespace-nowrap"
                          >
                            {marking ? 'Saving...' : '✓ Mark Complete'}
                          </button>
                        ) : (
                          <div className="bg-slate-400 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
                            👀 Read to continue
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedLesson.duration && <div className="text-xs text-blue-200">⏱ {Math.ceil(selectedLesson.duration/60)} minutes</div>}
                  </div>

                  {/* Content - stacked rows: video, text, attachments */}
                  <div className="p-6 space-y-6">
                    {/* Row 1: Video */}
                    {selectedLesson.videoUrl && (
                      <div className="w-full">
                        <div className="mb-3 font-semibold text-blue-900 text-sm">📹 Video</div>
                        <div className="w-full bg-black rounded-lg overflow-hidden shadow-sm">
                          {selectedLesson.videoUrl.includes('youtube') || selectedLesson.videoUrl.includes('youtu.be') ? (
                            <div className="aspect-video">
                              <iframe
                                id={`yt-player-${selectedLesson._id}`}
                                title="lesson-video"
                                src={(function(url){try{const u=new URL(url);let vid=''; if(u.hostname.includes('youtu.be')) vid = u.pathname.slice(1); if(u.hostname.includes('youtube')) vid = u.searchParams.get('v'); if(vid) return `https://www.youtube.com/embed/${vid}?rel=0&enablejsapi=1&origin=${location.origin}`;}catch(e){} return url;})(selectedLesson.videoUrl)}
                                className="w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                              />
                            </div>
                          ) : (
                            <video ref={videoElRef} controls src={selectedLesson.videoUrl} className="w-full" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Row 2: Content */}
                    {selectedLesson.content && (
                      <div className="w-full">
                        <div className="mb-3 font-semibold text-blue-900 text-sm">📖 Lesson Content</div>
                        <div ref={contentRef} className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 overflow-auto max-h-96">
                          <div className="prose prose-sm max-w-none">
                            <div className="text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedLesson.content || '') }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Row 3: Attachments */}
                    {selectedLesson.attachments?.length > 0 && (
                      <div className="w-full">
                        <div className="mb-3 font-semibold text-blue-900 text-sm">📎 Attachments ({selectedLesson.attachments.length})</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedLesson.attachments.map((a, idx) => (
                            <a
                              key={idx}
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-4 border border-slate-200 rounded-lg bg-gradient-to-r from-slate-50 to-white hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-3 group"
                            >
                              <div className="text-3xl flex-shrink-0">{a.type === 'pdf' ? '📄' : a.type === 'video' ? '🎥' : a.type === 'image' ? '🖼️' : '📎'}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-900 text-sm truncate">{a.name || `Attachment ${idx+1}`}</div>
                                <div className="text-xs text-slate-500">{a.type?.toUpperCase() || 'File'}</div>
                              </div>
                              <div className="text-blue-600 font-bold text-lg flex-shrink-0 group-hover:text-blue-700">↗</div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {!selectedLesson.videoUrl && !selectedLesson.content && !selectedLesson.attachments?.length && (
                      <div className="text-center py-8 text-slate-500">No content available for this lesson</div>
                    )}
                  </div>

                  {/* Footer progress */}
                  {!completedLessons.includes(selectedLesson._id || selectedLesson) && (
                    <div className="border-t bg-slate-50 p-4">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex-1">
                          <div className="bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${contentViewed ? 'bg-green-500' : 'bg-blue-400'}`}
                              style={{ width: contentViewed ? '100%' : '40%' }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-600 whitespace-nowrap">{contentViewed ? '✓ Ready' : '👀 Reading...'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <div className="text-4xl mb-2">📚</div>
            <div>No sections or lessons available yet. Check back soon!</div>
          </div>
        )}
      </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={reportCourse}
          className="px-4 py-2 rounded-lg font-semibold shadow bg-red-600 hover:bg-red-700 text-white"
        >
          Report
        </button>
        {user?.role === 'student' && (
          <button
            onClick={enroll}
            disabled={enrolling || isEnrolled}
            className={`px-6 py-2 rounded-lg font-semibold shadow transition-all duration-150 ${isEnrolled ? 'bg-green-600 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'} ${enrolling ? 'opacity-60' : ''}`}
          >
            {isEnrolled ? 'Enrolled' : (enrolling ? 'Enrolling...' : 'Enroll')}
          </button>
        )}
      </div>
      {user?.role === 'student' && (
      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        {/* Course Reviews - moved below curriculum */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-blue-900">Course Reviews</h3>
          <p className="text-sm text-slate-600">Average rating: <strong className="text-blue-700">{avgRating || 0}</strong> • {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        </div>
        {isEnrolled && user && (
          <form onSubmit={handleReviewSubmit} className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-sm mr-2">Your Rating:</span>
              {[1,2,3,4,5].map(star => (
                <button type="button" key={star} onClick={()=>setMyRating(star)} className={star <= myRating ? 'text-yellow-500 text-2xl' : 'text-gray-300 text-2xl'} aria-label={`Rate ${star}`}>
                  ★
                </button>
              ))}
            </div>
            <input
              type="text"
              value={myComment}
              onChange={e=>setMyComment(e.target.value)}
              placeholder="Write a review (optional)"
              className="flex-1 p-2 border border-slate-300 rounded"
              maxLength={200}
            />
            <button type="submit" disabled={reviewSubmitting} className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-60">
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
        <div className="space-y-4">
          {reviews.length === 0 && <div className="text-slate-500">No reviews yet.</div>}
          {reviews.map((r, idx) => (
            <div key={idx} className="border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">{'★'.repeat(r.rating)}<span className="text-gray-300">{'★'.repeat(5-r.rating)}</span></span>
                <span className="font-semibold text-blue-900 text-sm">{r.student?.name || 'User'}</span>
                <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.comment && <div className="text-slate-700 text-sm mt-1">{r.comment}</div>}
            </div>
          ))}
        </div>
      </div>
      )}
      {user?.role === 'student' && (
      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        <CourseDiscussion courseId={id} />
      </div>
      )}
      {user?.role === 'student' && (
      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        <ChatRoom courseId={id} />
      </div>
      )}
    </div>
  );
}
