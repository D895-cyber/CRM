import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function WarrantyEW({ user, showToast, onLogout }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [renewModalId, setRenewModalId] = useState(null);
  const [renewExpiry, setRenewExpiry] = useState('');
  const [renewNotes, setRenewNotes] = useState('');
  const [renewError, setRenewError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('WarrantyEW - User role:', user?.role);
    console.log('WarrantyEW - User object:', user);
    console.log('WarrantyEW - Token exists:', !!localStorage.getItem('token'));
    
    if (!user) {
      console.log('WarrantyEW - No user object, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (user.role !== 'Admin' && user.role !== 'Service Coordinator') {
      console.log('WarrantyEW - Access denied, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }
    console.log('WarrantyEW - Access granted, fetching equipment');
    fetchEquipment();
    // eslint-disable-next-line
  }, []);

  const fetchEquipment = async () => {
    setLoading(true);
    setError('');
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    console.log('WarrantyEW - Token exists:', !!token);
    
    if (!token) {
      setError('Not authenticated. Please log in again.');
      setLoading(false);
      return;
    }
    
    try {
      console.log('WarrantyEW - Making API call to warranty endpoint');
      const res = await axios.get('http://localhost:3000/api/schedule/equipment/warranty', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('WarrantyEW - API call successful, data:', res.data);
      setEquipment(res.data);
    } catch (err) {
      console.error('Equipment fetch error:', err.response?.data || err.message);
      console.log('WarrantyEW - Error status:', err.response?.status);
      console.log('WarrantyEW - Error message:', err.response?.data?.message);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        // Redirect to login if token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('Access denied. You need Admin or Service Coordinator role to view this page.');
        // Don't redirect to login for 403, just show error
      } else {
        setError('Failed to fetch equipment: ' + (err.response?.data?.message || err.message));
      }
    }
    setLoading(false);
  };

  const openRenewModal = (id) => {
    setRenewModalId(id);
    setRenewExpiry('');
    setRenewNotes('');
    setRenewError('');
  };
  const closeRenewModal = () => setRenewModalId(null);

  const handleRenew = async (id) => {
    setRenewError('');
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setRenewError('Not authenticated. Please log in again.');
      return;
    }
    
    try {
      await axios.post(`http://localhost:3000/api/schedule/equipment/${id}/renew-ew`, {
        ew_expiry: renewExpiry,
        notes: renewNotes
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeRenewModal();
      fetchEquipment();
      showToast && showToast('EW renewed!');
    } catch (err) {
      console.error('Renew EW error:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setRenewError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setRenewError(err.response?.data?.message || 'Failed to renew EW');
      }
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
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fadeIn">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex-1">Warranty & EW Tracking</h2>
          <input type="text" placeholder="Search by serial/model/site" value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg w-full max-w-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
        </div>
        {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-blue-50 to-teal-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold">Serial Number</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Model</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Warranty Status</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Warranty Expiry</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">EW Status</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">EW Expiry</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">EW History</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {equipment
                  .filter(eq => {
                    const s = search.toLowerCase();
                    return (
                      !search ||
                      (eq.serialNumber && eq.serialNumber.toLowerCase().includes(s)) ||
                      (eq.model && eq.model.toLowerCase().includes(s))
                    );
                  })
                  .map(eq => (
                    <tr key={eq._id} className="even:bg-gray-50 hover:bg-blue-50 transition-colors">
                      <td className="px-5 py-3 font-medium">{eq.serialNumber}</td>
                      <td className="px-5 py-3">{eq.model}</td>
                      <td className="px-5 py-3">{eq.warrantyStatus}</td>
                      <td className="px-5 py-3">{eq.warrantyEndDate ? new Date(eq.warrantyEndDate).toLocaleDateString() : ''}</td>
                      <td className="px-5 py-3">{eq.ewStatus}</td>
                      <td className="px-5 py-3">{eq.ewEndDate ? new Date(eq.ewEndDate).toLocaleDateString() : ''}</td>
                      <td className="px-5 py-3">
                        <ul className="list-disc ml-4">
                          {eq.ewHistory && eq.ewHistory.map((h, idx) => (
                            <li key={idx}>
                              {h.renewalDate && `Renewed: ${new Date(h.renewalDate).toLocaleDateString()}`}<br />
                              {h.ewExpiry && `EW Expiry: ${new Date(h.ewExpiry).toLocaleDateString()}`}<br />
                              {h.notes && `Notes: ${h.notes}`}<br />
                              {h.renewedBy && h.renewedBy.name && `By: ${h.renewedBy.name}`}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-5 py-3">
                        <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700" onClick={() => openRenewModal(eq._id)}>Renew EW</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Renew EW Modal */}
        {renewModalId && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-blue-100 relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={closeRenewModal}>&times;</button>
              <h3 className="text-xl font-bold mb-4 text-blue-600">Renew Extended Warranty</h3>
              <input type="date" value={renewExpiry} onChange={e => setRenewExpiry(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-4" />
              <textarea value={renewNotes} onChange={e => setRenewNotes(e.target.value)} placeholder="Notes (optional)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-4" />
              {renewError && <div className="text-red-600 text-center font-medium mt-2">{renewError}</div>}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={closeRenewModal}>Cancel</button>
                <button type="button" className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" onClick={() => handleRenew(renewModalId)} disabled={!renewExpiry}>Renew</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 