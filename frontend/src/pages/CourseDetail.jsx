import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import CourseDiscussion from '../components/CourseDiscussion';
import ChatRoom from '../components/ChatRoom';
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
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { addToast('Please login to review', 'error'); return; }
    const isEnrolled = course?.enrolledStudents?.some(s => s === (user?._id || user?.id));
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

  const isEnrolled = course.enrolledStudents?.some(s => s === (user?._id || user?.id));

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
          </div>
        </div>
      </div>
      {/* Review form and list */}
      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        <h3 className="font-semibold mb-4 text-blue-900">Course Reviews</h3>
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

      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        <h3 className="font-semibold mb-4 text-blue-900">Sections & Lessons</h3>
        {course.sections?.length ? (
          course.sections.map(section => (
            <div key={section._id} className="mb-6">
              <h4 className="font-medium text-blue-800">{section.title}</h4>
              <p className="text-sm text-slate-600 mb-2">{section.description}</p>
              <ul className="mt-2 space-y-2">
                {section.lessons?.map(lesson => {
                  // Placeholder: replace with real completion logic if available
                  const completed = lesson.completedBy?.includes(user?._id || user?.id);
                  return (
                    <li key={lesson._id} className="p-4 border rounded-lg flex flex-col md:flex-row md:justify-between md:items-center bg-slate-50 gap-2">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={completed} readOnly className="accent-blue-600 w-5 h-5" />
                        <div>
                          <div className="font-semibold text-blue-900 text-base">{lesson.title}</div>
                          <div className="text-xs text-slate-500">{lesson.duration ? `${Math.ceil(lesson.duration/60)} min` : ''}</div>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2">
                        {lesson.videoUrl && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Video</span>}
                        {lesson.attachments?.length > 0 && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{lesson.attachments.length} Attachment{lesson.attachments.length > 1 ? 's' : ''}</span>}
                        {completed && <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs ml-2">Completed</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        ) : (
          <div className="text-sm text-slate-600">No sections yet.</div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={reportCourse}
          className="px-4 py-2 rounded-lg font-semibold shadow bg-red-600 hover:bg-red-700 text-white"
        >
          Report
        </button>
        <button
          onClick={enroll}
          disabled={enrolling || isEnrolled}
          className={`px-6 py-2 rounded-lg font-semibold shadow transition-all duration-150 ${isEnrolled ? 'bg-gray-400 text-white' : 'bg-blue-700 hover:bg-blue-800 text-white'} ${enrolling ? 'opacity-60' : ''}`}
        >
          {isEnrolled ? 'Enrolled' : (enrolling ? 'Enrolling...' : 'Enroll')}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        <CourseDiscussion courseId={id} />
      </div>
      <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
        <ChatRoom courseId={id} />
      </div>
    </div>
  );
}
