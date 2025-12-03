import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Edit2, Save, X } from 'lucide-react';

export default function SubmissionGrader() {
  const { assignmentId } = useParams();
  const { addToast } = useToast();
  const { user } = useContext(AuthContext);

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grades, setGrades] = useState({});
  const [feedback, setFeedback] = useState({});
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      const [assignRes, subRes] = await Promise.all([
        api.get(`/assignments/${assignmentId}`),
        api.get(`/assignments/${assignmentId}/submissions`)
      ]);

      setAssignment(assignRes.data);
      setSubmissions(subRes.data);
    } catch (err) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
    setEditing(null);
    const gMap = {};
    const fMap = {};
    submission.answers?.forEach(ans => {
      gMap[ans.questionId] = ans.pointsEarned || 0;
      fMap[ans.questionId] = ans.feedback || '';
    });
    setGrades(gMap);
    setFeedback(fMap);
  };

  const handleGradeChange = (questionId, value) => {
    setGrades(prev => ({ ...prev, [questionId]: Math.max(0, Math.min(value, getQuestionPoints(questionId))) }));
  };

  const handleFeedbackChange = (questionId, value) => {
    setFeedback(prev => ({ ...prev, [questionId]: value }));
  };

  const getQuestionPoints = (questionId) => {
    return assignment?.questions.find(q => q._id === questionId)?.points || 0;
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;

    setSaving(true);
    try {
      const totalPoints = Object.values(grades).reduce((a, b) => a + b, 0);
      const res = await api.put(`/assignments/${selectedSubmission._id}/grade`, {
        grades,
        feedback,
        totalPointsEarned: totalPoints
      });

      setSelectedSubmission(res.data);
      setSubmissions(prev =>
        prev.map(s => (s._id === selectedSubmission._id ? res.data : s))
      );
      setEditing(null);
      addToast('Grade saved successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to save grade', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!assignment) return <div className="p-8 text-center text-red-600">Assignment not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
        <p className="text-indigo-100">Grading Dashboard</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-300 rounded-lg">
            <div className="p-4 bg-indigo-50 border-b border-slate-300">
              <h2 className="font-bold text-slate-900">Submissions ({submissions.length})</h2>
            </div>
            <div className="divide-y divide-slate-300 max-h-[500px] overflow-y-auto">
              {submissions.map(sub => (
                <button
                  key={sub._id}
                  onClick={() => handleSelectSubmission(sub)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition ${
                    selectedSubmission?._id === sub._id ? 'bg-indigo-100' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 truncate">{sub.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {sub.status === 'graded' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded">
                            <CheckCircle size={12} /> Graded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            <AlertCircle size={12} /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                    {sub.scorePercentage !== undefined && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">
                          {sub.scorePercentage.toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grading Area */}
        <div className="lg:col-span-2">
          {selectedSubmission ? (
            <div className="bg-white border border-slate-300 rounded-lg">
              {/* Submission Info */}
              <div className="p-4 bg-indigo-50 border-b border-slate-300">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedSubmission.student?.name}</h3>
                    <p className="text-sm text-slate-600">
                      Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {selectedSubmission.scorePercentage !== undefined && (
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">
                          {selectedSubmission.scorePercentage.toFixed(1)}%
                        </p>
                        <p className="text-xs text-slate-600">
                          {selectedSubmission.totalPointsEarned} / {assignment.totalPoints} pts
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Answers */}
              <div className="p-6 space-y-6">
                {assignment.questions.map((q, idx) => {
                  const answer = selectedSubmission.answers?.find(
                    a => a.questionId === q._id.toString()
                  );

                  return (
                    <div key={q._id} className="p-4 bg-slate-50 border border-slate-300 rounded">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">
                            Q{idx + 1}: {q.question}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">Type: {q.type} | Max: {q.points} pts</p>
                        </div>
                        {q.type === 'mcq' && answer?.isCorrect !== undefined && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              answer.isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {answer.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        )}
                      </div>

                      {/* Student Answer */}
                      <div className="mb-4 p-3 bg-white border border-slate-300 rounded">
                        <p className="text-xs text-slate-600 font-semibold mb-1">Student Answer:</p>
                        {q.type === 'mcq' && (
                          <p className="text-slate-900">
                            {answer?.answer || 'No answer provided'}
                            {answer?.isCorrect === false && (
                              <>
                                <br />
                                <span className="text-xs text-slate-600">
                                  Correct: {q.options?.find(opt => opt.isCorrect)?.text}
                                </span>
                              </>
                            )}
                          </p>
                        )}
                        {(q.type === 'short-answer' || q.type === 'essay') && (
                          <p className="text-slate-900 whitespace-pre-wrap">{answer?.answer || 'No answer'}</p>
                        )}
                        {q.type === 'file-upload' && (
                          <p className="text-slate-600 text-sm">{answer?.answer || 'No file uploaded'}</p>
                        )}
                      </div>

                      {/* Grading (only for non-MCQ or manual review) */}
                      {q.type !== 'mcq' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Points Earned
                            </label>
                            {editing === q._id.toString() ? (
                              <input
                                type="number"
                                min="0"
                                max={q.points}
                                value={grades[q._id] || 0}
                                onChange={(e) => handleGradeChange(q._id, parseFloat(e.target.value))}
                                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            ) : (
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-900 font-semibold">
                                  {grades[q._id] || 0} / {q.points}
                                </p>
                                <button
                                  onClick={() => setEditing(q._id.toString())}
                                  className="text-indigo-600 hover:text-indigo-700"
                                >
                                  <Edit2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Feedback
                            </label>
                            {editing === q._id.toString() ? (
                              <textarea
                                value={feedback[q._id] || ''}
                                onChange={(e) => handleFeedbackChange(q._id, e.target.value)}
                                rows={3}
                                className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Add feedback..."
                              />
                            ) : (
                              <p className="text-sm text-slate-700 bg-white p-2 rounded border border-slate-300">
                                {feedback[q._id] || 'No feedback'}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show existing feedback */}
                      {answer?.feedback && (
                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded">
                          <p className="text-xs text-emerald-800">
                            <strong>Feedback:</strong> {answer.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Save Button */}
              {editing && (
                <div className="p-4 border-t border-slate-300 flex gap-3 bg-slate-50">
                  <button
                    onClick={handleSaveGrade}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Grade'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400"
                  >
                    <X size={18} /> Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-300 rounded-lg p-8 text-center text-slate-500">
              Select a submission to grade
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
