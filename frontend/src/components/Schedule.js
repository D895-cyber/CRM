import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Schedule({ user, showToast, onLogout }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ equipmentId: '', siteId: '', fseId: '', date: '', notes: '' });
  const [error, setError] = useState('');
  const [equipmentList, setEquipmentList] = useState([]);
  const [siteList, setSiteList] = useState([]);
  const [fseList, setFseList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'Admin' && user.role !== 'Service Coordinator') {
      navigate('/dashboard');
      return;
    }
    fetchSchedules();
    fetchEquipment();
    fetchSites();
    fetchFSEs();
    // eslint-disable-next-line
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      const res = await axios.get('http://localhost:3000/api/schedule', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(res.data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Failed to fetch schedules');
      }
    }
    setLoading(false);
  };

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for equipment fetch');
        return;
      }
      const res = await axios.get('http://localhost:3000/api/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Flatten all equipment from all sites for selection
      let allEquipment = [];
      let allSites = [];
      for (const client of res.data) {
        const sitesRes = await axios.get(`http://localhost:3000/api/clients/${client._id}/sites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        for (const site of sitesRes.data) {
          allSites.push(site);
          const eqRes = await axios.get(`http://localhost:3000/api/sites/${site._id}/equipment`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          for (const eq of eqRes.data) {
            allEquipment.push({ ...eq, site });
          }
        }
      }
      setEquipmentList(allEquipment);
      setSiteList(allSites);
    } catch (err) {
      console.error('Failed to fetch equipment/sites:', err.response?.data || err.message);
      setError('Failed to fetch equipment/sites');
    }
  };

  const fetchSites = async () => {};

  const fetchFSEs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for FSE fetch');
        return;
      }
      const res = await axios.get('http://localhost:3000/api/users/role/FSE', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFseList(res.data);
    } catch (err) {
      console.error('Failed to fetch FSEs:', err.response?.data || err.message);
      setError('Failed to fetch FSEs');
    }
  };

  const openModal = () => {
    setForm({ equipmentId: '', siteId: '', fseId: '', date: '', notes: '' });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => {
      // If site changes, reset equipmentId
      if (name === 'siteId') {
        return { ...prev, siteId: value, equipmentId: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleAdd = async e => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/schedule', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeModal();
      fetchSchedules();
      showToast && showToast('Schedule created!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create schedule');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSchedules();
      showToast && showToast('Schedule deleted!');
    } catch (err) {
      setError('Failed to delete schedule');
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
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Service Scheduling</h2>
          <button className="bg-gradient-to-r from-indigo-500 to-teal-400 text-white px-5 py-2 rounded-xl shadow hover:from-indigo-600 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-semibold" onClick={openModal}>+ Add Schedule</button>
        </div>
        {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-indigo-50 to-teal-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold">Equipment</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Site</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">FSE</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Date</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Status</th>
                  <th className="px-5 py-3 text-sm font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s._id} className="even:bg-gray-50 hover:bg-indigo-50 transition-colors">
                    <td className="px-5 py-3 font-medium">{s.equipment?.serialNumber}</td>
                    <td className="px-5 py-3">{s.site?.name}</td>
                    <td className="px-5 py-3">{s.assignedFSE?.name}</td>
                    <td className="px-5 py-3">{s.date ? s.date.substring(0,10) : ''}</td>
                    <td className="px-5 py-3">{s.status}</td>
                    <td className="px-5 py-3 flex gap-2 justify-center">
                      <button className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" onClick={() => handleDelete(s._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Add Schedule Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-indigo-100 relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={closeModal}>&times;</button>
              <h3 className="text-xl font-bold mb-4 text-indigo-600">Add Schedule</h3>
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <select name="equipmentId" value={form.equipmentId} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                  <option value="">Select Equipment</option>
                  {equipmentList
                    .filter(eq => eq.site && eq.site._id === form.siteId)
                    .map(eq => (
                      <option key={eq._id} value={eq._id}>{eq.serialNumber} ({eq.site?.name})</option>
                    ))}
                </select>
                <select name="siteId" value={form.siteId} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                  <option value="">Select Site</option>
                  {siteList.map(site => (
                    <option key={site._id} value={site._id}>{site.name}</option>
                  ))}
                </select>
                <select name="fseId" value={form.fseId} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                  <option value="">Select FSE</option>
                  {fseList.map(fse => (
                    <option key={fse._id} value={fse._id}>{fse.name} ({fse.email})</option>
                  ))}
                </select>
                <input name="date" type="date" value={form.date} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                <textarea name="notes" placeholder="Notes (optional)" value={form.notes} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all">Add Schedule</button>
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