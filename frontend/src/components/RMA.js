import { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';

export default function RMA({ user, showToast, onLogout }) {
  const [rmas, setRMAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ caseNumber: '', client: '', equipment: '', reason: '' });
  const [inspectingId, setInspectingId] = useState(null);
  const [inspectNotes, setInspectNotes] = useState('');
  const [statusModal, setStatusModal] = useState({ open: false, id: null, status: '', statusUpdate: '' });
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  // Helper to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch RMA list from backend
  useEffect(() => {
    const fetchRMAs = async () => {
      setLoading(true);
      setError('');
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      
      try {
        const res = await axios.get('http://localhost:3000/api/rma', {
          headers: getAuthHeaders(),
        });
        setRMAs(res.data);
      } catch (err) {
        console.error('RMA fetch error:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Redirect to login if token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Failed to fetch RMA requests: ' + (err.response?.data?.message || err.message));
        }
      }
      setLoading(false);
    };
    fetchRMAs();
  }, [navigate]);

  const openModal = () => {
    setForm({ caseNumber: '', client: '', equipment: '', reason: '' });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Create new RMA
  const handleCreate = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:3000/api/rma', form, {
        headers: getAuthHeaders(),
      });
      setRMAs([...rmas, res.data]);
      closeModal();
      showToast('RMA request created!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create RMA');
    }
  };

  // Update RMA status and statusUpdate
  const handleStatus = async (id, status, statusUpdate) => {
    setError('');
    try {
      const res = await axios.put(`http://localhost:3000/api/rma/${id}`, { status, statusUpdate }, {
        headers: getAuthHeaders(),
      });
      setRMAs(rmas.map(rma => rma._id === id ? res.data : rma));
      showToast('RMA status updated!');
    } catch (err) {
      setError('Failed to update RMA status');
    }
  };

  // Inspect and close RMA
  const handleInspect = async id => {
    setError('');
    try {
      const res = await axios.put(`http://localhost:3000/api/rma/${id}`, { status: 'Closed', inspected: true, inspectNotes }, {
        headers: getAuthHeaders(),
      });
      setRMAs(rmas.map(rma => rma._id === id ? res.data : rma));
      setInspectingId(null);
      setInspectNotes('');
      showToast('RMA closed after inspection!');
    } catch (err) {
      setError('Failed to close RMA');
    }
  };

  // Status badge color
  const statusBadge = (status) => {
    let color = 'bg-gray-200 text-gray-700';
    if (status === 'Pending') color = 'bg-yellow-100 text-yellow-800';
    if (status === 'Shipped') color = 'bg-blue-100 text-blue-800';
    if (status === 'Closed') color = 'bg-green-100 text-green-800';
    return `px-3 py-1 rounded-full text-xs font-bold ${color}`;
  };

  // Open status update modal
  const openStatusModal = (id, currentStatus) => {
    setStatusModal({ open: true, id, status: currentStatus, statusUpdate: '' });
  };
  const closeStatusModal = () => setStatusModal({ open: false, id: null, status: '', statusUpdate: '' });

  const handleStatusUpdate = async e => {
    e.preventDefault();
    await handleStatus(statusModal.id, statusModal.status, statusModal.statusUpdate);
    closeStatusModal();
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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">RMA Management</h2>
          <button
            onClick={openModal}
            className="bg-gradient-to-r from-teal-500 to-green-400 text-white px-6 py-2 rounded-xl shadow hover:from-teal-600 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all text-lg font-semibold"
          >
            + New RMA
          </button>
        </div>
        {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-green-50 to-teal-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold">Case ID</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Client</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Equipment</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Status</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Status Update</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Requested</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Replacement</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Inspected</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Reason</th>
                  <th className="px-5 py-3 text-sm font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rmas.map(rma => (
                  <tr key={rma._id} className="even:bg-gray-50 hover:bg-green-50 transition-colors">
                    <td className="px-5 py-3 font-medium">{rma.caseNumber}</td>
                    <td className="px-5 py-3">{rma.client}</td>
                    <td className="px-5 py-3">{rma.equipment}</td>
                    <td className="px-5 py-3"><span className={statusBadge(rma.status)}>{rma.status}</span></td>
                    <td className="px-5 py-3">{rma.statusUpdate}</td>
                    <td className="px-5 py-3">{rma.requested && rma.requested.substring ? rma.requested.substring(0,10) : rma.requested}</td>
                    <td className="px-5 py-3">{rma.replacement ? rma.replacement.substring(0,10) : ''}</td>
                    <td className="px-5 py-3">{rma.inspected ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-gray-400">No</span>}</td>
                    <td className="px-5 py-3">{rma.reason}</td>
                    <td className="px-5 py-3 flex flex-col gap-2 items-center min-w-[140px]">
                      {rma.status !== 'Closed' && (
                        <>
                          <button className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all w-full" onClick={() => openStatusModal(rma._id, rma.status)}>Update Status</button>
                          {rma.status === 'Pending' && (
                            <button className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all w-full" onClick={() => handleStatus(rma._id, 'Shipped', rma.statusUpdate)}>Mark Shipped</button>
                          )}
                          {rma.status === 'Shipped' && !rma.inspected && (
                            <button className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all w-full" onClick={() => setInspectingId(rma._id)}>Inspect/Close</button>
                          )}
                        </>
                      )}
                      {rma.status === 'Closed' && <span className="text-green-700 font-bold">Closed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Modal isOpen={modalOpen} onClose={closeModal} title="Add RMA">
          <form onSubmit={handleCreate} className="space-y-4">
            <input name="caseNumber" placeholder="Case Number" value={form.caseNumber} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            <input name="client" placeholder="Client" value={form.client} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            <input name="equipment" placeholder="Equipment" value={form.equipment} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            <input name="reason" placeholder="Reason" value={form.reason} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={closeModal}>Cancel</button>
              <button type="submit" className="bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 shadow focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all">Create</button>
            </div>
          </form>
        </Modal>
        <Modal isOpen={!!inspectingId} onClose={() => setInspectingId(null)} title="Inspect & Close RMA">
          <div className="mb-4">Add inspection notes and close the RMA.</div>
          <textarea value={inspectNotes} onChange={e => setInspectNotes(e.target.value)} placeholder="Inspection notes..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all mb-4 min-h-[60px]" />
          <button onClick={() => handleInspect(inspectingId)} className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all">Mark Inspected & Close</button>
        </Modal>
        <Modal isOpen={statusModal.open} onClose={closeStatusModal} title="Update RMA Status">
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <select value={statusModal.status} onChange={e => setStatusModal(s => ({ ...s, status: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Closed">Closed</option>
            </select>
            <input
              type="text"
              placeholder="Status update message (e.g., Shipped on 2024-06-10 by DHL)"
              value={statusModal.statusUpdate}
              onChange={e => setStatusModal(s => ({ ...s, statusUpdate: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={closeStatusModal}>Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all">Update Status</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
} 