import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { Pencil, Trash2, Plus } from 'lucide-react';
import './client.css'; // Custom CSS file
import { useNavigate } from 'react-router-dom';

export default function Clients({ user, showToast, onLogout }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState({ name: '', contact_person: '', email: '', phone: '', address: '' });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          showToast('Not authenticated. Please log in again.', 'error');
          setLoading(false);
          return;
        }
        const res = await axios.get('http://localhost:3000/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(res.data);
      } catch (err) {
        console.error('Failed to fetch clients:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          showToast('Authentication failed. Please log in again.', 'error');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          showToast('Failed to fetch clients', 'error');
        }
      }
      setLoading(false);
    };
    fetchClients();
  }, [showToast, navigate]);

  const openModal = (client = null) => {
    setEditingClient(client);
    setForm(client || { name: '', contact_person: '', email: '', phone: '', address: '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingClient(null);
    setForm({ name: '', contact_person: '', email: '', phone: '', address: '' });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingClient) {
        await axios.put(`http://localhost:3000/api/clients/${editingClient._id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast('Client updated!');
      } else {
        await axios.post('http://localhost:3000/api/clients', form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast('Client added!');
      }
      closeModal();
      const refreshToken = localStorage.getItem('token');
      if (refreshToken) {
        try {
          const res = await axios.get('http://localhost:3000/api/clients', {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          setClients(res.data);
        } catch (err) {
          console.error('Failed to refresh clients:', err.response?.data || err.message);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this client?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Client deleted!');
      const refreshToken = localStorage.getItem('token');
      if (refreshToken) {
        try {
          const res = await axios.get('http://localhost:3000/api/clients', {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });
          setClients(res.data);
        } catch (err) {
          console.error('Failed to refresh clients after delete:', err.response?.data || err.message);
        }
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
      <div className="client-container">
        <div className="client-header">
          <h2>Clients</h2>
          {user.role === 'Admin' && (
            <button className="client-add-btn" onClick={() => openModal()}>
              <Plus size={18} /> Add Client
            </button>
          )}
        </div>
        {loading ? (
          <div className="client-loading"></div>
        ) : (
          <div className="client-table-wrapper">
            <table className="client-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  {user.role === 'Admin' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client._id}>
                    <td>{client.name}</td>
                    <td>{client.contact_person}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.address}</td>
                    {user.role === 'Admin' && (
                      <td className="client-actions">
                        <button className="edit-btn" onClick={() => openModal(client)}>
                          <Pencil size={16} /> Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(client._id)}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Modal isOpen={modalOpen} onClose={closeModal} title={editingClient ? 'Edit Client' : 'Add Client'}>
          <form onSubmit={handleSubmit} className="client-form">
            {['name', 'contact_person', 'email', 'phone', 'address'].map(field => (
              <input
                key={field}
                name={field}
                placeholder={field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                value={form[field]}
                onChange={handleChange}
                required={field === 'name'}
                className="client-input"
              />
            ))}
            <div className="form-buttons">
              <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button type="submit" className="submit-btn">{editingClient ? 'Update' : 'Add'} Client</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
