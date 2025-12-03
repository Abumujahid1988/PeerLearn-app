import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function AssignmentAttempt() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useContext(AuthContext);
  
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  useEffect(() => {
    if (!assignment?.dueDate) return;
    const interval = setInterval(() => {
      const now = new Date();
      const due = new Date(assignment.dueDate);
      const diff = due - now;
      if (diff > 0) {
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        setTimeLeft(`${hours}h ${mins}m`);
      } else {
        setTimeLeft('Overdue');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [assignment]);

  const fetchData = async () => {
    try {
      const [assignRes, subRes] = await Promise.all([
        api.get(`/assignments/${assignmentId}`),
        api.get(`/assignments/${assignmentId}/submission`)
          .catch(() => null) // No submission yet is OK
      ]);

      setAssignment(assignRes.data);
      if (subRes?.data) {
        setSubmission(subRes.data);
        const answersMap = {};
        subRes.data.answers?.forEach(ans => {
          answersMap[ans.questionId] = ans.answer;
        });
        setAnswers(answersMap);
      }
    } catch (err) {
      addToast('Failed to load assignment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      const answerArray = assignment.questions.map(q => ({
        questionId: q._id,
        questionType: q.type,
        answer: answers[q._id] || ''
      }));

      const res = await api.post(`/assignments/${assignmentId}/submit`, {
        answers: answerArray,
        isSubmit: false
      });

      setSubmission(res.data);
      addToast('Draft saved', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Submit assignment? You cannot change your answers after submission.')) {
      return;
    }

    setSubmitting(true);
    try {
      const answerArray = assignment.questions.map(q => ({
        questionId: q._id,
        questionType: q.type,
        answer: answers[q._id] || ''
      }));

      const res = await api.post(`/assignments/${assignmentId}/submit`, {
        answers: answerArray,
        isSubmit: true
      });

      setSubmission(res.data);
      addToast('Assignment submitted successfully!', 'success');
      
      // Show score if all MCQ
      if (res.data.status === 'graded') {
        setTimeout(() => {
          addToast(`Your score: ${res.data.scorePercentage.toFixed(1)}%`, 'info');
        }, 500);
      }
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!assignment) return <div className="p-8 text-center text-red-600">Assignment not found</div>;

  const isSubmitted = submission?.status === 'submitted' || submission?.status === 'graded';
  const isGraded = submission?.status === 'graded';

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-6 rounded-lg">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
            <p className="text-indigo-100">{assignment.description}</p>
          </div>
          {timeLeft && (
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Clock size={18} />
              <span className="font-semibold">{timeLeft}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="opacity-80">Total Points</span>
            <p className="font-bold">{assignment.totalPoints}</p>
          </div>
          <div>
            <span className="opacity-80">Passing Score</span>
            <p className="font-bold">{assignment.passingScore}%</p>
          </div>
          <div>
            <span className="opacity-80">Questions</span>
            <p className="font-bold">{assignment.questions.length}</p>
          </div>
          <div>
            <span className="opacity-80">Status</span>
            <p className="font-bold">{isSubmitted ? 'Submitted' : 'Draft'}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {assignment.instructions && (
        <div className="mb-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
          <h3 className="font-semibold text-slate-900 mb-2">Instructions</h3>
          <p className="text-slate-700 whitespace-pre-wrap">{assignment.instructions}</p>
        </div>
      )}

      {/* Status Messages */}
      {isGraded && submission && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-lg flex items-start gap-3">
          <CheckCircle size={20} className="text-emerald-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-emerald-900">Graded</h4>
            <p className="text-emerald-800 mt-1">
              Your score: <span className="font-bold text-lg">{submission.scorePercentage.toFixed(1)}%</span>
              {submission.scorePercentage >= assignment.passingScore ? ' ✓ Passed' : ' ✗ Did not pass'}
            </p>
            {submission.feedback && (
              <div className="mt-2 p-3 bg-white rounded border border-emerald-200">
                <p className="text-sm text-slate-700"><strong>Feedback:</strong> {submission.feedback}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isSubmitted && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Submitted</h4>
            <p className="text-blue-800 text-sm mt-1">
              Submitted on {new Date(submission.submittedAt).toLocaleString()}
              {isGraded ? ' (Graded)' : ' (Pending grading)'}
            </p>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6 mb-6">
        {assignment.questions.map((q, idx) => (
          <div key={q._id} className="p-5 border border-slate-300 rounded-lg bg-white">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-900">
                  Question {idx + 1} <span className="text-sm text-slate-600">({q.points} points)</span>
                </h3>
                <p className="text-slate-700 mt-1">{q.question}</p>
              </div>
            </div>

            {q.type === 'mcq' && (
              <div className="space-y-2">
                {q.options?.map((opt, oIdx) => (
                  <label key={oIdx} className="flex items-center gap-3 p-3 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name={`q-${q._id}`}
                      checked={answers[q._id] === opt.text}
                      onChange={() => handleAnswerChange(q._id, opt.text)}
                      disabled={isSubmitted}
                      className="w-4 h-4"
                    />
                    <span className="text-slate-700">{opt.text}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'short-answer' && (
              <input
                type="text"
                value={answers[q._id] || ''}
                onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                disabled={isSubmitted}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your answer"
              />
            )}

            {q.type === 'essay' && (
              <textarea
                value={answers[q._id] || ''}
                onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                disabled={isSubmitted}
                rows={5}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Write your answer here..."
              />
            )}

            {q.type === 'file-upload' && (
              <div className="p-4 border-2 border-dashed border-slate-300 rounded text-center">
                <input
                  type="file"
                  disabled={isSubmitted}
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-2">Supported: PDF, DOC, Image files</p>
              </div>
            )}

            {/* Show feedback if graded */}
            {isGraded && submission?.answers.find(a => a.questionId === q._id.toString())?.feedback && (
              <div className="mt-3 p-3 bg-slate-100 rounded border-l-4 border-indigo-600">
                <p className="text-sm text-slate-700">
                  <strong>Feedback:</strong> {submission.answers.find(a => a.questionId === q._id.toString()).feedback}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      {!isSubmitted ? (
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            className="flex-1 px-6 py-3 bg-slate-300 text-slate-900 rounded-lg font-semibold hover:bg-slate-400"
          >
            Save as Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Assignment'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
        >
          Back to Course
        </button>
      )}
    </div>
  );
}
