import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';

export default function MasterSpareParts({ user, showToast, onLogout }) {
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [form, setForm] = useState({
    partNumber: '',
    name: '',
    category: '',
    model: '',
    version: '',
    availableQuantity: 0,
    unitPrice: '',
    reorderThreshold: 5,
    reorderQuantity: 10,
    supplier: '',
    manufacturer: '',
    supplierPartNumber: '',
    warehouseLocation: '',
    shelfLocation: '',
    status: 'Active',
    notes: ''
  });
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
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

  // Fetch spare parts list
  useEffect(() => {
    const fetchSpareParts = async () => {
      setLoading(true);
      setError('');
      
      try {
        const params = new URLSearchParams();
        if (filterStatus !== 'All') params.append('status', filterStatus);
        if (filterCategory !== 'All') params.append('category', filterCategory);
        if (searchTerm) params.append('search', searchTerm);
        
        const res = await axios.get(`http://localhost:3000/api/master-spare-parts?${params}`, {
          headers: getAuthHeaders(),
        });
        setSpareParts(res.data);
      } catch (err) {
        console.error('Failed to fetch spare parts:', err.response?.data || err.message);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setError('Failed to fetch spare parts: ' + (err.response?.data?.message || err.message));
        }
      }
      setLoading(false);
    };
    fetchSpareParts();
  }, [searchTerm, filterStatus, filterCategory, navigate]);

  const openModal = (part = null) => {
    setEditingPart(part);
    setForm(part ? {
      partNumber: part.partNumber || '',
      name: part.name || '',
      category: part.category || '',
      model: part.model || '',
      version: part.version || '',
      availableQuantity: part.availableQuantity || 0,
      unitPrice: part.unitPrice || '',
      reorderThreshold: part.reorderThreshold || 5,
      reorderQuantity: part.reorderQuantity || 10,
      supplier: part.supplier || '',
      manufacturer: part.manufacturer || '',
      supplierPartNumber: part.supplierPartNumber || '',
      warehouseLocation: part.warehouseLocation || '',
      shelfLocation: part.shelfLocation || '',
      status: part.status || 'Active',
      notes: part.notes || ''
    } : {
      partNumber: '',
      name: '',
      category: '',
      model: '',
      version: '',
      availableQuantity: 0,
      unitPrice: '',
      reorderThreshold: 5,
      reorderQuantity: 10,
      supplier: '',
      manufacturer: '',
      supplierPartNumber: '',
      warehouseLocation: '',
      shelfLocation: '',
      status: 'Active',
      notes: ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPart(null);
    setForm({
      partNumber: '',
      name: '',
      category: '',
      model: '',
      version: '',
      availableQuantity: 0,
      unitPrice: '',
      reorderThreshold: 5,
      reorderQuantity: 10,
      supplier: '',
      manufacturer: '',
      supplierPartNumber: '',
      warehouseLocation: '',
      shelfLocation: '',
      status: 'Active',
      notes: ''
    });
  };

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    try {
      if (editingPart) {
        await axios.put(`http://localhost:3000/api/master-spare-parts/${editingPart._id}`, form, {
          headers: getAuthHeaders(),
        });
        showToast('Spare part updated successfully!');
      } else {
        await axios.post('http://localhost:3000/api/master-spare-parts', form, {
          headers: getAuthHeaders(),
        });
        showToast('Spare part created successfully!');
      }
      closeModal();
      // Refresh the list
      const res = await axios.get('http://localhost:3000/api/master-spare-parts', {
        headers: getAuthHeaders(),
      });
      setSpareParts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save spare part');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this spare part?')) return;
    
    try {
      await axios.delete(`http://localhost:3000/api/master-spare-parts/${id}`, {
        headers: getAuthHeaders(),
      });
      showToast('Spare part deleted successfully!');
      setSpareParts(spareParts.filter(part => part._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete spare part');
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'Inactive': return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'Discontinued': return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  const stockBadge = (part) => {
    if (part.availableQuantity === 0) {
      return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
    } else if (part.availableQuantity <= part.reorderThreshold) {
      return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
    } else {
      return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  const stockText = (part) => {
    if (part.availableQuantity === 0) return 'Out of Stock';
    if (part.availableQuantity <= part.reorderThreshold) return 'Low Stock';
    return 'In Stock';
  };

  const filteredAndSortedSpareParts = spareParts
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const categories = ['Lamp', 'Board', 'Fan', 'Filter', 'Lens', 'Electronics', 'Mechanical', 'Optical', 'Other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Master Spare Parts
                  </h1>
                  <p className="text-sm text-gray-500">Centralized spare parts management</p>
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
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Master Spare Parts</h2>
              <p className="text-gray-600">Manage centralized spare parts inventory and track usage</p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-105 text-lg font-semibold flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Spare Part</span>
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
                placeholder="Search spare parts..."
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Discontinued">Discontinued</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="All">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 mb-6 flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/20 flex justify-center items-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading spare parts...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button 
                        onClick={() => handleSort('partNumber')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Part Number</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button 
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Name</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button 
                        onClick={() => handleSort('category')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Category</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <span>Model</span>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button 
                        onClick={() => handleSort('availableQuantity')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Stock</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <button 
                        onClick={() => handleSort('unitPrice')}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>Unit Price</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
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
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 border-b border-gray-200">
                      <span>Manufacturer</span>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 border-b border-gray-200">
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedSpareParts.map((part, index) => (
                    <tr 
                      key={part._id} 
                      className={`hover:bg-blue-50/50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {part.partNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {part.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {part.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {part.model} {part.version && `(${part.version})`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{part.availableQuantity}</span>
                          <span className={stockBadge(part)}>
                            {stockText(part)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {part.unitPrice ? `$${part.unitPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={statusBadge(part.status)}>
                          {part.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {part.manufacturer || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => openModal(part)}
                            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(part._id)}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all"
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
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No spare parts found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}

        {/* Modal for Add/Edit Spare Part */}
        <Modal isOpen={modalOpen} onClose={closeModal} title={editingPart ? "Edit Spare Part" : "Add New Spare Part"}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Number *</label>
                <input 
                  name="partNumber" 
                  placeholder="Enter part number" 
                  value={form.partNumber} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input 
                  name="name" 
                  placeholder="Enter part name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <input 
                  name="model" 
                  placeholder="Enter model" 
                  value={form.model} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Quantity *</label>
                <input 
                  name="availableQuantity" 
                  type="number"
                  placeholder="0" 
                  value={form.availableQuantity} 
                  onChange={handleChange} 
                  required 
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price</label>
                <input 
                  name="unitPrice" 
                  type="number"
                  step="0.01"
                  placeholder="0.00" 
                  value={form.unitPrice} 
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  name="status" 
                  value={form.status} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                <input 
                  name="manufacturer" 
                  placeholder="Enter manufacturer" 
                  value={form.manufacturer} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <input 
                  name="supplier" 
                  placeholder="Enter supplier" 
                  value={form.supplier} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Threshold</label>
                <input 
                  name="reorderThreshold" 
                  type="number"
                  placeholder="5" 
                  value={form.reorderThreshold} 
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Quantity</label>
                <input 
                  name="reorderQuantity" 
                  type="number"
                  placeholder="10" 
                  value={form.reorderQuantity} 
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea 
                name="notes" 
                placeholder="Enter any additional notes..." 
                value={form.notes} 
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
              >
                {editingPart ? 'Update' : 'Create'} Spare Part
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
} 