import React, { useEffect, useState, useContext } from 'react';
function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
        <div className="mb-4 text-lg text-indigo-900 font-semibold">{message}</div>
        <div className="flex gap-4 justify-end">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded text-indigo-900">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 rounded text-white font-semibold">Remove</button>
        </div>
      </div>
    </div>
  );
}
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(() => () => {});
    const [confirmMessage, setConfirmMessage] = useState('');
  const { user, loading: authLoading } = useContext(AuthContext);
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stats');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [creatingUser, setCreatingUser] = useState(false);

  // Redirect if not admin (after auth is loaded)
  if (!authLoading && (!user || user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-slate-600">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/courses')
    ])
      .then(([statsRes, usersRes, coursesRes]) => {
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setCourses(coursesRes.data);
      })
      .catch(err => addToast('Failed to load admin data', 'error'))
      .finally(() => setLoading(false));
  }, [user, addToast]);

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers(users => users.map(u => u._id === id ? { ...u, role: newRole } : u));
      addToast('Role updated successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update role', 'error');
    }
  };

  const handleRemoveUser = async (id) => {
    setConfirmMessage('Are you sure you want to remove this user?');
    setConfirmAction(() => async () => {
      setConfirmOpen(false);
      try {
        await api.delete(`/admin/users/${id}`);
        const usersRes = await api.get('/admin/users');
        setUsers(usersRes.data);
        addToast('User removed successfully', 'success');
      } catch (err) {
        addToast(err.response?.data?.error || 'Failed to remove user', 'error');
      }
    });
    setConfirmOpen(true);
  };

  // Handler for creating a new user (moved out so it's accessible)
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await api.post('/admin/users', newUser);
      setUsers(users => [res.data, ...users]);
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      addToast('User created successfully', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to create user', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleRemoveCourse = async (id) => {
    setConfirmMessage('Are you sure you want to remove this course?');
    setConfirmAction(() => async () => {
      setConfirmOpen(false);
      try {
        await api.delete(`/admin/courses/${id}`);
        const coursesRes = await api.get('/admin/courses');
        setCourses(coursesRes.data);
        addToast('Course removed successfully', 'success');
      } catch (err) {
        addToast(err.response?.data?.error || 'Failed to remove course', 'error');
      }
    });
    setConfirmOpen(true);
  };

  if (!user || user.role !== 'admin') return <div className="p-8 text-center text-red-600">Access denied.</div>;
  if (loading) return <div className="p-8 text-center text-slate-500">Loading admin dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <ConfirmModal
        open={confirmOpen}
        message={confirmMessage}
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />
      <h2 className="text-3xl font-bold mb-6 text-indigo-900">Admin Dashboard</h2>
      <div className="mb-6 flex gap-4">
        <button onClick={() => setTab('stats')} className={`px-4 py-2 rounded ${tab==='stats'?'bg-indigo-600 text-white':'bg-slate-200 text-indigo-900'}`}>Platform Stats</button>
        <button onClick={() => setTab('users')} className={`px-4 py-2 rounded ${tab==='users'?'bg-indigo-600 text-white':'bg-slate-200 text-indigo-900'}`}>Users</button>
        <button onClick={() => setTab('courses')} className={`px-4 py-2 rounded ${tab==='courses'?'bg-indigo-600 text-white':'bg-slate-200 text-indigo-900'}`}>Courses</button>
      </div>
      {tab === 'stats' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow border p-6 text-center">
            <div className="text-2xl font-bold text-indigo-800">{stats.totalUsers}</div>
            <div className="text-slate-600 mt-2">Total Users</div>
          </div>
          <div className="bg-white rounded-xl shadow border p-6 text-center">
            <div className="text-2xl font-bold text-indigo-800">{stats.totalCourses}</div>
            <div className="text-slate-600 mt-2">Total Courses</div>
          </div>
          <div className="bg-white rounded-xl shadow border p-6 text-center">
            <div className="text-2xl font-bold text-indigo-800">{stats.totalEnrollments}</div>
            <div className="text-slate-600 mt-2">Total Enrollments</div>
          </div>
          <div className="bg-white rounded-xl shadow border p-6 text-center">
            <div className="text-2xl font-bold text-indigo-800">{stats.totalInstructors}</div>
            <div className="text-slate-600 mt-2">Instructors</div>
          </div>
          <div className="bg-white rounded-xl shadow border p-6 text-center">
            <div className="text-2xl font-bold text-indigo-800">{stats.totalStudents}</div>
            <div className="text-slate-600 mt-2">Students</div>
          </div>
        </div>
      )}
      {tab === 'users' && (
        <div className="overflow-x-auto">
          <div className="bg-white p-4 rounded mb-4 border">
            <h4 className="font-semibold mb-2">Create New User</h4>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input className="p-2 border rounded" placeholder="Name" value={newUser.name} onChange={e=>setNewUser(n=>({...n, name: e.target.value}))} required />
              <input className="p-2 border rounded" placeholder="Email" type="email" value={newUser.email} onChange={e=>setNewUser(n=>({...n, email: e.target.value}))} required />
              <input className="p-2 border rounded" placeholder="Password" type="password" value={newUser.password} onChange={e=>setNewUser(n=>({...n, password: e.target.value}))} required />
              <div className="flex gap-2">
                <select value={newUser.role} onChange={e=>setNewUser(n=>({...n, role: e.target.value}))} className="border rounded px-2">
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
                <button type="submit" disabled={creatingUser} className="px-3 py-2 bg-indigo-600 text-white rounded">{creatingUser ? 'Creating...' : 'Create User'}</button>
              </div>
            </form>
          </div>
          <table className="min-w-full border text-sm">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} className="border rounded px-2 py-1">
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleRemoveUser(u._id)} className="text-red-600 hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'courses' && (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Instructor</th>
                <th className="px-4 py-2 text-left">Enrollments</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id} className="border-b">
                  <td className="px-4 py-2">{c.title}</td>
                  <td className="px-4 py-2">{c.instructor?.name || 'Unknown'}</td>
                  <td className="px-4 py-2">{c.enrolledStudents?.length || 0}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleRemoveCourse(c._id)} className="text-red-600 hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
