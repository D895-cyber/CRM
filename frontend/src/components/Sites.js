import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';

export default function Sites({ user, showToast, onLogout }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', region: '', contact_person: '', phone: '', email: '' });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for clients fetch');
      return;
    }
    axios.get('http://localhost:3000/api/clients', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setClients(res.data)).catch(err => {
      console.error('Failed to fetch clients:', err.response?.data || err.message);
    });
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for sites fetch');
        setLoading(false);
        return;
      }
      axios.get(`http://localhost:3000/api/clients/${selectedClient}/sites`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setSites(res.data);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch sites:', err.response?.data || err.message);
        showToast('Failed to fetch sites', 'error');
        setLoading(false);
      });
    } else {
      setSites([]);
    }
  }, [selectedClient, showToast]);

  const openModal = (site = null) => {
    setEditingSite(site);
    setForm(site || { name: '', address: '', region: '', contact_person: '', phone: '', email: '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSite(null);
    setForm({ name: '', address: '', region: '', contact_person: '', phone: '', email: '' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingSite) {
        await axios.put(`http://localhost:3000/api/sites/${editingSite._id}`, form, { headers: { Authorization: `Bearer ${token}` } });
        showToast('Site updated!');
      } else {
        await axios.post(`http://localhost:3000/api/clients/${selectedClient}/sites`, form, { headers: { Authorization: `Bearer ${token}` } });
        showToast('Site added!');
      }
      closeModal();
      const refreshToken = localStorage.getItem('token');
      if (refreshToken) {
        axios.get(`http://localhost:3000/api/clients/${selectedClient}/sites`, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        }).then(res => setSites(res.data)).catch(err => {
          console.error('Failed to refresh sites:', err.response?.data || err.message);
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this site?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/sites/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Site deleted!');
      const refreshToken = localStorage.getItem('token');
      if (refreshToken) {
        axios.get(`http://localhost:3000/api/clients/${selectedClient}/sites`, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        }).then(res => setSites(res.data)).catch(err => {
          console.error('Failed to refresh sites after delete:', err.response?.data || err.message);
        });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
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
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-6">Sites</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-6 items-center">
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg w-full max-w-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all">
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>{client.name}</option>
            ))}
          </select>
          {selectedClient && user.role === 'Admin' && (
            <button className="bg-gradient-to-r from-teal-500 to-green-400 text-white px-5 py-2 rounded-xl shadow hover:from-teal-600 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-semibold" onClick={() => openModal()}>+ Add Site</button>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-green-50 to-teal-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold">Name</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Region</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Address</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Contact Person</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Phone</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Email</th>
                  {user.role === 'Admin' && <th className="px-5 py-3 text-sm font-bold text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {sites.map(site => (
                  <tr key={site._id} className="even:bg-gray-50 hover:bg-green-50 transition-colors">
                    <td className="px-5 py-3 font-medium">{site.name}</td>
                    <td className="px-5 py-3">{site.region}</td>
                    <td className="px-5 py-3">{site.address}</td>
                    <td className="px-5 py-3">{site.contact_person}</td>
                    <td className="px-5 py-3">{site.phone}</td>
                    <td className="px-5 py-3">{site.email}</td>
                    {user.role === 'Admin' && (
                      <td className="px-5 py-3 flex gap-2 justify-center">
                        <button className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all" onClick={() => openModal(site)}>Edit</button>
                        <button className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" onClick={() => handleDelete(site._id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Modal isOpen={modalOpen} onClose={closeModal} title={editingSite ? 'Edit Site' : 'Add Site'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            <input name="region" placeholder="Region" value={form.region} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            <input name="contact_person" placeholder="Contact Person" value={form.contact_person} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={closeModal}>Cancel</button>
              <button type="submit" className="bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 shadow focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all">{editingSite ? 'Update' : 'Add'} Site</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
} 