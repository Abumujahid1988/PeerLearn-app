import React, { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import api from '../api/axios';

export default function AssignmentEditor({ assignment, onSave, onCancel }) {
  const [title, setTitle] = useState(assignment?.title || '');
  const [description, setDescription] = useState(assignment?.description || '');
  const [instructions, setInstructions] = useState(assignment?.instructions || '');
  const [dueDate, setDueDate] = useState(assignment?.dueDate ? assignment.dueDate.split('T')[0] : '');
  const [passingScore, setPassingScore] = useState(assignment?.passingScore || 60);
  const [allowLate, setAllowLate] = useState(assignment?.allowLateSubmission || false);
  const [latePenalty, setLatePenalty] = useState(assignment?.latePenalty || 10);
  const [questions, setQuestions] = useState(assignment?.questions || []);
  const [saving, setSaving] = useState(false);
  const [editingQIndex, setEditingQIndex] = useState(null);

  const addQuestion = () => {
    setQuestions([...questions, { type: 'mcq', question: '', options: [], points: 10, order: questions.length }]);
    setEditingQIndex(questions.length);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options = [...(updated[qIndex].options || []), { text: '', isCorrect: false }];
    setQuestions(updated);
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = { ...updated[qIndex].options[oIndex], [field]: value };
    setQuestions(updated);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title || questions.length === 0) {
      alert('Title and at least one question required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        description,
        instructions,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        passingScore,
        questions,
        allowLateSubmission: allowLate,
        latePenalty
      };

      if (assignment?._id) {
        await api.put(`/assignments/${assignment._id}`, payload);
      } else {
        // Will be called with sectionId from parent
        onSave(payload);
        return;
      }

      onSave(payload);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-indigo-900">{assignment ? 'Edit' : 'Create'} Assignment</h2>

      {/* Basic Info */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Assignment title"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Brief description"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Detailed instructions for students"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Passing Score (%)</label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              min={0}
              max={100}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer mt-6">
              <input
                type="checkbox"
                checked={allowLate}
                onChange={(e) => setAllowLate(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="ml-2 text-sm font-semibold text-slate-700">Allow Late Submission</span>
            </label>
          </div>
        </div>

        {allowLate && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Late Penalty (%)</label>
            <input
              type="number"
              value={latePenalty}
              onChange={(e) => setLatePenalty(Number(e.target.value))}
              min={0}
              max={100}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-indigo-900">Questions ({questions.length})</h3>
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={18} /> Add Question
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="p-4 border border-slate-300 rounded-lg bg-slate-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Question {idx + 1}</label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                    rows={2}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                    placeholder="Enter question"
                  />
                </div>
                <button
                  onClick={() => deleteQuestion(idx)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(idx, 'type', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="essay">Essay</option>
                    <option value="file-upload">File Upload</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={q.points}
                    onChange={(e) => updateQuestion(idx, 'points', Number(e.target.value))}
                    min={1}
                    className="w-full p-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </div>

              {/* MCQ Options */}
              {q.type === 'mcq' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Options</label>
                  <div className="space-y-2 mb-2">
                    {(q.options || []).map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOption(idx, oIdx, 'text', e.target.value)}
                          className="flex-1 p-2 border border-slate-300 rounded text-sm"
                          placeholder={`Option ${oIdx + 1}`}
                        />
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`correct-${idx}`}
                            checked={opt.isCorrect}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[idx].options.forEach((o, i) => {
                                o.isCorrect = i === oIdx && e.target.checked;
                              });
                              setQuestions(updated);
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-xs text-slate-600">Correct</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addOption(idx)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    + Add Option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Assignment'}
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-slate-300 text-slate-900 rounded-lg font-semibold hover:bg-slate-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
