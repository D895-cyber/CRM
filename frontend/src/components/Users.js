import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Users({ user, showToast, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  const openModal = () => {
    setForm({ name: '', email: '', password: '', role: '' });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async e => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/users', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeModal();
      fetchUsers();
      showToast && showToast('User added!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      showToast && showToast('User deleted!');
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-white shadow px-6 py-4 mb-8 border-b border-gray-100">
        <span
          className="text-2xl font-bold text-teal-700 cursor-pointer hover:text-blue-700 transition"
          onClick={() => navigate('/dashboard')}
        >
          CRM Dashboard
        </span>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium text-lg">{user?.name} ({user?.role})</span>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
      {/* Main content */}
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">User Management</h2>
          <button className="bg-gradient-to-r from-teal-500 to-pink-400 text-white px-5 py-2 rounded-xl shadow hover:from-teal-600 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-semibold" onClick={openModal}>+ Add User</button>
        </div>
        {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-pink-50 to-teal-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold">Name</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Email</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Role</th>
                  <th className="px-5 py-3 text-sm font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="even:bg-gray-50 hover:bg-pink-50 transition-colors">
                    <td className="px-5 py-3 font-medium">{u.name}</td>
                    <td className="px-5 py-3">{u.email}</td>
                    <td className="px-5 py-3">{u.role}</td>
                    <td className="px-5 py-3 flex gap-2 justify-center">
                      <button className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" onClick={() => handleDelete(u._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Add User Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-pink-100 relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={closeModal}>&times;</button>
              <h3 className="text-xl font-bold mb-4 text-pink-600">Add User</h3>
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all" />
                <select name="role" value={form.role} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none transition-all">
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="Service Coordinator">Service Coordinator</option>
                  <option value="FSE">FSE</option>
                  <option value="Client">Client</option>
                  <option value="QC Team">QC Team</option>
                </select>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="bg-pink-500 text-white px-5 py-2 rounded-lg hover:bg-pink-600 shadow focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all">Add User</button>
                </div>
                {error && <div className="text-red-600 text-center font-medium mt-2">{error}</div>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 