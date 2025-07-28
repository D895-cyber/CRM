import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, RefreshCw, Eye, Edit, Package, AlertCircle, CheckCircle, Clock, ArrowUpDown } from 'lucide-react';

export default function RMA({ user, showToast, onLogout }) {
  const [rmas, setRMAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRMA, setEditingRMA] = useState(null); // NEW: add editingRMA state
  const [submitting, setSubmitting] = useState(false);
  const [equipmentList, setEquipmentList] = useState([]); // NEW: equipment dropdown
  const [masterSparePartsList, setMasterSparePartsList] = useState([]); // NEW: master spare parts dropdown
  const [form, setForm] = useState({ 
    caseNumber: '', 
    client: '', 
    equipment: '', 
    sparePart: '', // NEW: spare part field
    reason: '', 
    failureDescription: '', 
    failureDate: '', 
    failureSymptoms: [], 
    failureCategory: '', 
    priority: 'Medium', 
    impact: 'Medium', 
    status: 'Pending',
    rmaType: 'Equipment' // NEW: RMA type field
  });
  const [inspectingId, setInspectingId] = useState(null);
  const [inspectNotes, setInspectNotes] = useState('');
  const [statusModal, setStatusModal] = useState({ open: false, id: null, status: '', statusUpdate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('requested');
  const [sortOrder, setSortOrder] = useState('desc');
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

  const fetchRMAs = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/rma', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRMAs(response.data);
    } catch (error) {
      console.error('Error fetching RMAs:', error);
      showToast('Failed to fetch RMAs', 'error');
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    fetchRMAs();
  }, [fetchRMAs]);

  // Fetch equipment list for dropdown
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/equipment', {
          headers: getAuthHeaders(),
        });
        setEquipmentList(res.data);
      } catch (err) {
        console.error('Failed to fetch equipment:', err);
      }
    };
    fetchEquipment();
  }, []);

  // Fetch master spare parts list for dropdown
  useEffect(() => {
    const fetchMasterSpareParts = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/master-spare-parts/active', {
          headers: getAuthHeaders(),
        });
        setMasterSparePartsList(res.data);
      } catch (err) {
        console.error('Failed to fetch master spare parts:', err);
      }
    };
    fetchMasterSpareParts();
  }, []);

  const openModal = (rma = null) => {
    setEditingRMA(rma);
    setForm(rma ? {
      caseNumber: rma.caseNumber || '',
      client: rma.client || '',
      equipment: rma.equipment || '',
      sparePart: rma.sparePart || '',
      reason: rma.reason || '',
      failureDescription: rma.failureDescription || '',
      failureDate: rma.failureDate || '',
      failureSymptoms: rma.failureSymptoms || [],
      failureCategory: rma.failureCategory || '',
      priority: rma.priority || 'Medium',
      impact: rma.impact || 'Medium',
      status: rma.status || 'Pending',
      rmaType: rma.rmaType || 'Equipment'
    } : {
      caseNumber: '', 
      client: '', 
      equipment: '', 
      sparePart: '', // NEW: spare part field
      reason: '', 
      failureDescription: '', 
      failureDate: '', 
      failureSymptoms: [], 
      failureCategory: '', 
      priority: 'Medium', 
      impact: 'Medium', 
      status: 'Pending',
      rmaType: 'Equipment' // NEW: RMA type field
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRMA(null);
    setForm({
      caseNumber: '', 
      client: '', 
      equipment: '', 
      sparePart: '', // NEW: spare part field
      reason: '', 
      failureDescription: '', 
      failureDate: '', 
      failureSymptoms: [], 
      failureCategory: '', 
      priority: 'Medium', 
      impact: 'Medium', 
      status: 'Pending',
      rmaType: 'Equipment' // NEW: RMA type field
    });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...form,
        createdBy: user.id || user._id,
        equipment: form.equipment || null,
        sparePart: form.sparePart || null
      };

      if (editingRMA) {
        await axios.put(`http://localhost:3000/api/rma/${editingRMA._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('RMA updated successfully!', 'success');
      } else {
        await axios.post('http://localhost:3000/api/rma', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('RMA created successfully!', 'success');
      }

      closeModal();
      fetchRMAs();
    } catch (error) {
      console.error('Error saving RMA:', error);
      setError(error.response?.data?.message || 'Failed to save RMA');
      showToast('Failed to save RMA', 'error');
    } finally {
      setSubmitting(false);
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
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleInspect = async (id) => {
    setError('');
    try {
      const res = await axios.put(`http://localhost:3000/api/rma/${id}`, { 
        inspected: true, 
        status: 'Closed',
        inspectNotes 
      }, {
        headers: getAuthHeaders(),
      });
      setRMAs(rmas.map(rma => rma._id === id ? res.data : rma));
      setInspectingId(null);
      setInspectNotes('');
      showToast('RMA inspected and closed!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to inspect RMA');
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    await handleStatus(statusModal.id, statusModal.status, statusModal.statusUpdate);
    closeStatusModal();
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium';
      case 'Shipped': return 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium';
      case 'Closed': return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium';
      default: return 'bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium';
    }
  };

  const priorityBadge = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'Low': return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  const openStatusModal = (id, currentStatus) => {
    setStatusModal({ open: true, id, status: currentStatus, statusUpdate: '' });
  };

  const closeStatusModal = () => setStatusModal({ open: false, id: null, status: '', statusUpdate: '' });

  // Filter and sort RMA data
  const filteredAndSortedRMAs = rmas
    .filter(rma => {
      const matchesSearch = 
        rma.caseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rma.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rma.equipment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rma.reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'All' || rma.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'requested' || sortBy === 'replacement') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    RMA Management
                  </h1>
                  <p className="text-sm text-gray-500">Return Merchandise Authorization</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">RMA Management System</h2>
              <p className="text-gray-600">Manage Return Merchandise Authorization requests and track warranty claims</p>
            </div>
            <button
              onClick={openModal}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/20 transition-all duration-300 transform hover:scale-105 text-lg font-semibold flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>New RMA</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search RMAs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Closed">Closed</option>
            </select>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh</span>
            </button>
            <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/20 flex justify-center items-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading RMA data...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px]">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button 
                        onClick={() => handleSort('caseNumber')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Case ID</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200 min-w-[200px]">
                      <button 
                        onClick={() => handleSort('client')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Client Name</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200 min-w-[150px]">
                      <button 
                        onClick={() => handleSort('equipment')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Equipment</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <span>Serial/Model</span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <span>Priority</span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button 
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Status</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200 min-w-[200px]">
                      <span>Status Update</span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button 
                        onClick={() => handleSort('requested')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Requested Date</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button 
                        onClick={() => handleSort('replacement')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Replacement Date</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <span>Inspected</span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200 min-w-[200px]">
                      <span>Reason</span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200 min-w-[200px]">
                      <span>Contact Info</span>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200 min-w-[180px]">
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedRMAs.map((rma, index) => (
                    <tr 
                      key={rma._id} 
                      className={`hover:bg-blue-50/50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {rma.caseNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium whitespace-nowrap">
                        {rma.client}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {rma.equipment?.name ? `${rma.equipment.name}${rma.equipment.serialNumber ? ` (${rma.equipment.serialNumber})` : ''}` : (typeof rma.equipment === 'string' ? rma.equipment : '-')}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        <div className="space-y-1">
                          <div>SN: {rma.serialNumber || 'N/A'}</div>
                          <div>Model: {rma.modelNumber || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={priorityBadge(rma.priority || 'Medium')}>
                          {rma.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={statusBadge(rma.status)}>{rma.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-[200px] truncate">
                        {rma.statusUpdate || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(rma.requested)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(rma.replacement)}
                      </td>
                      <td className="px-6 py-4">
                        {rma.inspected ? (
                          <span className="text-green-600 font-bold flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>No</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm max-w-[200px]">
                        {rma.reason}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        <div className="space-y-1">
                          <div className="font-medium">{rma.contactPerson || 'N/A'}</div>
                          <div>{rma.contactPhone || 'N/A'}</div>
                          <div className="truncate">{rma.contactEmail || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {rma.status !== 'Closed' && (
                            <>
                              <button 
                                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all text-sm font-medium flex items-center justify-center space-x-1" 
                                onClick={() => openStatusModal(rma._id, rma.status)}
                              >
                                <Edit className="h-3 w-3" />
                                <span>Update</span>
                              </button>
                              {rma.status === 'Pending' && (
                                <button 
                                  className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm font-medium flex items-center justify-center space-x-1" 
                                  onClick={() => handleStatus(rma._id, 'Shipped', rma.statusUpdate)}
                                >
                                  <Package className="h-3 w-3" />
                                  <span>Ship</span>
                                </button>
                              )}
                              {rma.status === 'Shipped' && !rma.inspected && (
                                <button 
                                  className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all text-sm font-medium flex items-center justify-center space-x-1" 
                                  onClick={() => setInspectingId(rma._id)}
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>Inspect</span>
                                </button>
                              )}
                            </>
                          )}
                          {rma.status === 'Closed' && (
                            <span className="text-green-700 font-bold text-sm flex items-center justify-center space-x-1">
                              <CheckCircle className="h-4 w-4" />
                              <span>Closed</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredAndSortedRMAs.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No RMA requests found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Modal for Add/Edit RMA */}
        <Modal isOpen={modalOpen} onClose={closeModal} title={editingRMA ? "Edit RMA" : "Create New RMA"}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Case Number *</label>
                <input 
                  name="caseNumber" 
                  placeholder="Enter case number" 
                  value={form.caseNumber} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RMA Type *</label>
                <select 
                  name="rmaType" 
                  value={form.rmaType} 
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Equipment">Equipment</option>
                  <option value="Spare Part">Spare Part</option>
                  <option value="Component">Component</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                <input 
                  name="client" 
                  placeholder="Enter client name" 
                  value={form.client} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              {form.rmaType === 'Equipment' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment</label>
                  <select 
                    name="equipment" 
                    value={form.equipment} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Equipment</option>
                    {equipmentList.map(equipment => (
                      <option key={equipment._id} value={equipment._id}>
                        {equipment.name} - {equipment.serialNumber || equipment.serial_number}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {form.rmaType === 'Spare Part' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spare Part</label>
                  <select 
                    name="sparePart" 
                    value={form.sparePart} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Spare Part</option>
                    {masterSparePartsList.map(part => (
                      <option key={part._id} value={part._id}>
                        {part.name} - {part.partNumber} ({part.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <input 
                  name="reason" 
                  placeholder="Enter reason for RMA" 
                  value={form.reason} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select 
                  name="priority" 
                  value={form.priority} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Failure Description</label>
              <textarea 
                name="failureDescription" 
                placeholder="Describe the issue in detail..." 
                value={form.failureDescription} 
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
              />
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <button 
                type="button" 
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all font-medium" 
                onClick={closeModal}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-semibold"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : (editingRMA ? 'Update' : 'Create')} RMA
              </button>
            </div>
          </form>
        </Modal>

        {/* Status Update Modal */}
        <Modal isOpen={statusModal.open} onClose={closeStatusModal} title="Update RMA Status">
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={statusModal.status} 
                onChange={e => setStatusModal(s => ({ ...s, status: e.target.value }))} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Update Message</label>
              <textarea
                placeholder="Add details about the status update (e.g., Shipped on 2024-06-10 by DHL)"
                value={statusModal.statusUpdate}
                onChange={e => setStatusModal(s => ({ ...s, statusUpdate: e.target.value }))}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>
            <div className="flex gap-4 justify-end pt-4">
              <button 
                type="button" 
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all font-medium" 
                onClick={closeStatusModal}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-semibold"
              >
                Update Status
              </button>
            </div>
          </form>
        </Modal>

        {/* Inspection Modal */}
        <Modal isOpen={!!inspectingId} onClose={() => setInspectingId(null)} title="Inspect & Close RMA">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm">Add inspection notes and close the RMA request.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inspection Notes</label>
              <textarea 
                value={inspectNotes} 
                onChange={e => setInspectNotes(e.target.value)} 
                placeholder="Enter detailed inspection notes..." 
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" 
              />
            </div>
            <div className="flex gap-4 justify-end pt-4">
              <button 
                onClick={() => setInspectingId(null)} 
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleInspect(inspectingId)} 
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition-all font-semibold"
              >
                Mark Inspected & Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
} 