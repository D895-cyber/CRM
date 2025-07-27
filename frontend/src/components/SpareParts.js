import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Download, RefreshCw, Eye, Edit, Trash2, 
  Calendar, Package, AlertCircle, CheckCircle, Clock, 
  ArrowUpDown, DollarSign, AlertTriangle, Settings
} from 'lucide-react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import LoadingSkeleton from './LoadingSkeleton';
import BackToTop from './BackToTop';

export default function SpareParts({ user, showToast, onLogout }) {
  const [spareParts, setSpareParts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, sparePartId: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('installationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    failed: 0,
    underRMA: 0,
    totalCost: 0
  });
  const navigate = useNavigate();

  const [form, setForm] = useState({
    partNumber: '',
    name: '',
    description: '',
    category: '',
    equipment: '',
    manufacturer: '',
    originalPartNumber: '',
    supplier: '',
    supplierPartNumber: '',
    quantityUsed: 1,
    unitCost: '',
    installationDate: new Date().toISOString().split('T')[0],
    installationNotes: '',
    replacementReason: 'Preventive Maintenance',
    failureDescription: '',
    hoursOfUse: '',
    warrantyStartDate: '',
    warrantyEndDate: '',
    warrantyProvider: '',
    expectedLifespan: '',
    expectedReplacementDate: '',
    purchaseDate: '',
    purchaseOrderNumber: '',
    invoiceNumber: '',
    notes: '',
    specifications: {
      dimensions: '',
      weight: '',
      material: '',
      compatibility: [],
      additionalSpecs: ''
    }
  });



  const fetchSpareParts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }

      const response = await axios.get('http://localhost:3000/api/spare-parts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpareParts(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
      } else {
        setError(err.response?.data?.message || 'Failed to fetch spare parts');
      }
    }
    setLoading(false);
  };

  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }

      const response = await axios.get('http://localhost:3000/api/equipment', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEquipment(response.data);
    } catch (err) {
      console.error('Failed to fetch equipment:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }

      const response = await axios.get('http://localhost:3000/api/spare-parts/stats/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchSpareParts();
    fetchEquipment();
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }

      const response = await axios.post('http://localhost:3000/api/spare-parts', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSpareParts([response.data, ...spareParts]);
      setModalOpen(false);
      resetForm();
      showToast('Spare part created successfully!', 'success');
      fetchStats();
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
      } else {
        showToast(err.response?.data?.message || 'Failed to create spare part', 'error');
      }
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }

      const response = await axios.put(`http://localhost:3000/api/spare-parts/${editingId}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSpareParts(spareParts.map(sp => sp._id === editingId ? response.data : sp));
      setEditingId(null);
      setModalOpen(false);
      resetForm();
      showToast('Spare part updated successfully!', 'success');
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
      } else {
        showToast(err.response?.data?.message || 'Failed to update spare part', 'error');
      }
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }

      await axios.delete(`http://localhost:3000/api/spare-parts/${confirmDialog.sparePartId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSpareParts(spareParts.filter(sp => sp._id !== confirmDialog.sparePartId));
      setConfirmDialog({ isOpen: false, sparePartId: null });
      showToast('Spare part deleted successfully!', 'success');
      fetchStats();
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
      } else {
        showToast(err.response?.data?.message || 'Failed to delete spare part', 'error');
      }
    }
  };

  const resetForm = () => {
    setForm({
      partNumber: '',
      name: '',
      description: '',
      category: '',
      equipment: '',
      manufacturer: '',
      originalPartNumber: '',
      supplier: '',
      supplierPartNumber: '',
      quantityUsed: 1,
      unitCost: '',
      installationDate: new Date().toISOString().split('T')[0],
      installationNotes: '',
      replacementReason: 'Preventive Maintenance',
      failureDescription: '',
      hoursOfUse: '',
      warrantyStartDate: '',
      warrantyEndDate: '',
      warrantyProvider: '',
      expectedLifespan: '',
      expectedReplacementDate: '',
      purchaseDate: '',
      purchaseOrderNumber: '',
      invoiceNumber: '',
      notes: '',
      specifications: {
        dimensions: '',
        weight: '',
        material: '',
        compatibility: [],
        additionalSpecs: ''
      }
    });
  };

  const openEditModal = (sparePart) => {
    setEditingId(sparePart._id);
    setForm({
      partNumber: sparePart.partNumber,
      name: sparePart.name,
      description: sparePart.description,
      category: sparePart.category,
      equipment: sparePart.equipment._id,
      manufacturer: sparePart.manufacturer,
      originalPartNumber: sparePart.originalPartNumber || '',
      supplier: sparePart.supplier || '',
      supplierPartNumber: sparePart.supplierPartNumber || '',
      quantityUsed: sparePart.quantityUsed,
      unitCost: sparePart.unitCost,
      installationDate: sparePart.installationDate ? new Date(sparePart.installationDate).toISOString().split('T')[0] : '',
      installationNotes: sparePart.installationNotes || '',
      replacementReason: sparePart.replacementReason,
      failureDescription: sparePart.failureDescription || '',
      hoursOfUse: sparePart.hoursOfUse || '',
      warrantyStartDate: sparePart.warrantyStartDate ? new Date(sparePart.warrantyStartDate).toISOString().split('T')[0] : '',
      warrantyEndDate: sparePart.warrantyEndDate ? new Date(sparePart.warrantyEndDate).toISOString().split('T')[0] : '',
      warrantyProvider: sparePart.warrantyProvider || '',
      expectedLifespan: sparePart.expectedLifespan || '',
      expectedReplacementDate: sparePart.expectedReplacementDate ? new Date(sparePart.expectedReplacementDate).toISOString().split('T')[0] : '',
      purchaseDate: sparePart.purchaseDate ? new Date(sparePart.purchaseDate).toISOString().split('T')[0] : '',
      purchaseOrderNumber: sparePart.purchaseOrderNumber || '',
      invoiceNumber: sparePart.invoiceNumber || '',
      notes: sparePart.notes || '',
      specifications: {
        dimensions: sparePart.specifications?.dimensions || '',
        weight: sparePart.specifications?.weight || '',
        material: sparePart.specifications?.material || '',
        compatibility: sparePart.specifications?.compatibility || [],
        additionalSpecs: sparePart.specifications?.additionalSpecs || ''
      }
    });
    setModalOpen(true);
  };

  const openViewModal = (sparePart) => {
    setViewingId(sparePart._id);
    setModalOpen(true);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      case 'Replaced': return 'bg-blue-100 text-blue-800';
      case 'Under RMA': return 'bg-yellow-100 text-yellow-800';
      case 'Returned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const filteredAndSortedSpareParts = spareParts
    .filter(sp => {
      const matchesSearch = 
        sp.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sp.equipment?.name && sp.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = filterStatus === 'All' || sp.status === filterStatus;
      const matchesCategory = filterCategory === 'All' || sp.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'partNumber':
          aVal = a.partNumber;
          bVal = b.partNumber;
          break;
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'installationDate':
          aVal = new Date(a.installationDate);
          bVal = new Date(b.installationDate);
          break;
        case 'totalCost':
          aVal = a.totalCost;
          bVal = b.totalCost;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a[sortBy];
          bVal = b[sortBy];
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  const categories = [...new Set(spareParts.map(sp => sp.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Spare Parts Management</h1>
                <p className="text-gray-600">Manage equipment spare parts and maintenance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Spare Parts Overview</h2>
              <p className="text-gray-600">Track and manage all equipment spare parts</p>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                resetForm();
                setModalOpen(true);
              }}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Spare Part</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Parts</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active</p>
                  <p className="text-3xl font-bold">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Failed</p>
                  <p className="text-3xl font-bold">{stats.failed}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Under RMA</p>
                  <p className="text-3xl font-bold">{stats.underRMA}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Cost</p>
                  <p className="text-3xl font-bold">₹{stats.totalCost?.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search spare parts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Failed">Failed</option>
              <option value="Replaced">Replaced</option>
              <option value="Under RMA">Under RMA</option>
              <option value="Returned">Returned</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={fetchSpareParts}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {/* Export functionality */}}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
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
          <LoadingSkeleton type="table" rows={8} />
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px]">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button onClick={() => handleSort('partNumber')} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                        <span>Part Number</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200 min-w-[200px]">
                      <button onClick={() => handleSort('name')} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                        <span>Part Name</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <span>Category</span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200 min-w-[200px]">
                      <span>Equipment</span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <span>Manufacturer</span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button onClick={() => handleSort('status')} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                        <span>Status</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button onClick={() => handleSort('totalCost')} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                        <span>Total Cost</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button onClick={() => handleSort('installationDate')} className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                        <span>Installation Date</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <span>RMA Status</span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <span>Warranty</span>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200 min-w-[180px]">
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedSpareParts.map((sparePart, index) => (
                    <tr key={sparePart._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                            <Package className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{sparePart.partNumber}</p>
                            <p className="text-sm text-gray-500">Qty: {sparePart.quantityUsed}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{sparePart.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[180px]">{sparePart.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {sparePart.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{sparePart.equipment?.name}</p>
                          <p className="text-sm text-gray-500">{sparePart.equipment?.serialNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{sparePart.manufacturer}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sparePart.status)}`}>
                          {sparePart.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">₹{sparePart.totalCost?.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">₹{sparePart.unitCost}/unit</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">
                            {new Date(sparePart.installationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {sparePart.rma ? (
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {sparePart.rma.status}
                            </span>
                            <span className="text-xs text-gray-500">#{sparePart.rma.caseNumber}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No RMA</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sparePart.isWarrantyActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {sparePart.warrantyStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openViewModal(sparePart)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(sparePart)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDialog({ isOpen: true, sparePartId: sparePart._id })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredAndSortedSpareParts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Spare Parts Found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first spare part</p>
                <button
                  onClick={() => {
                    setEditingId(null);
                    resetForm();
                    setModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Spare Part</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal for Create/Edit/View */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingId ? 'Edit Spare Part' : viewingId ? 'View Spare Part Details' : 'Add New Spare Part'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {viewingId ? (
              // View Mode
              <div className="space-y-6">
                {/* View content will be implemented */}
                <p className="text-gray-600">Detailed view coming soon...</p>
              </div>
            ) : (
              // Create/Edit Mode
              <form onSubmit={(e) => { e.preventDefault(); editingId ? handleUpdate() : handleCreate(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Part Number *</label>
                    <input
                      type="text"
                      value={form.partNumber}
                      onChange={(e) => setForm({...form, partNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Part Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({...form, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({...form, description: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Lamp">Lamp</option>
                      <option value="Filter">Filter</option>
                      <option value="Lens">Lens</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Software">Software</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Equipment *</label>
                    <select
                      value={form.equipment}
                      onChange={(e) => setForm({...form, equipment: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Equipment</option>
                      {equipment.map(eq => (
                        <option key={eq._id} value={eq._id}>
                          {eq.name} - {eq.serialNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer *</label>
                    <input
                      type="text"
                      value={form.manufacturer}
                      onChange={(e) => setForm({...form, manufacturer: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Original Part Number</label>
                    <input
                      type="text"
                      value={form.originalPartNumber}
                      onChange={(e) => setForm({...form, originalPartNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Used</label>
                    <input
                      type="number"
                      value={form.quantityUsed}
                      onChange={(e) => setForm({...form, quantityUsed: parseInt(e.target.value) || 1})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (₹) *</label>
                    <input
                      type="number"
                      value={form.unitCost}
                      onChange={(e) => setForm({...form, unitCost: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Installation Date</label>
                    <input
                      type="date"
                      value={form.installationDate}
                      onChange={(e) => setForm({...form, installationDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Replacement Reason</label>
                    <select
                      value={form.replacementReason}
                      onChange={(e) => setForm({...form, replacementReason: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Preventive Maintenance">Preventive Maintenance</option>
                      <option value="Corrective Maintenance">Corrective Maintenance</option>
                      <option value="Failure">Failure</option>
                      <option value="Upgrade">Upgrade</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    {editingId ? 'Update Spare Part' : 'Create Spare Part'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false, sparePartId: null })}
          onConfirm={handleDelete}
          title="Delete Spare Part"
          message="Are you sure you want to delete this spare part? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
      <BackToTop />
    </div>
  );
} 