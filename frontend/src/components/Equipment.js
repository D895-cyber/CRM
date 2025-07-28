import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { useNavigate } from 'react-router-dom';

export default function Equipment({ user, showToast, onLogout }) {
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedSite, setSelectedSite] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    type: '', 
    serialNumber: '', 
    model: '', 
    manufacturer: '',
    client: '',
    site: '',
    installationDate: new Date().toISOString().split('T')[0],
    location: '',
    roomNumber: '',
    warrantyStatus: 'Under Warranty',
    warrantyStartDate: '',
    warrantyEndDate: '',
    warrantyProvider: '',
    warrantyNumber: '',
    status: 'Active',
    purchaseDate: '',
    purchasePrice: '',
    supplier: '',
    purchaseOrderNumber: '',
    notes: ''
  });
  const [search, setSearch] = useState("");
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
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for sites fetch');
        return;
      }
      axios.get(`http://localhost:3000/api/clients/${selectedClient}/sites`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setSites(res.data)).catch(err => {
        console.error('Failed to fetch sites:', err.response?.data || err.message);
      });
    } else {
      setSites([]);
      setSelectedSite('');
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedSite) {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for equipment fetch');
        setLoading(false);
        return;
      }
      axios.get(`http://localhost:3000/api/sites/${selectedSite}/equipment`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setEquipment(res.data);
        setLoading(false);
      }).catch(err => {
        console.error('Failed to fetch equipment:', err.response?.data || err.message);
        showToast('Failed to fetch equipment', 'error');
        setLoading(false);
      });
    } else {
      setEquipment([]);
    }
  }, [selectedSite, showToast]);

  const openModal = (eq = null) => {
    setEditingEquipment(eq);
    setForm(eq ? {
      name: eq.name || '',
      type: eq.type || '',
      serialNumber: eq.serialNumber || eq.serial_number || '',
      model: eq.model || '',
      manufacturer: eq.manufacturer || '',
      client: eq.client?._id || eq.client || selectedClient,
      site: eq.site?._id || eq.site || selectedSite,
      installationDate: eq.installationDate ? new Date(eq.installationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      location: eq.location || '',
      roomNumber: eq.roomNumber || '',
      warrantyStatus: eq.warrantyStatus || eq.warranty_status || 'Under Warranty',
      warrantyStartDate: eq.warrantyStartDate ? new Date(eq.warrantyStartDate).toISOString().split('T')[0] : '',
      warrantyEndDate: eq.warrantyEndDate ? new Date(eq.warrantyEndDate).toISOString().split('T')[0] : (eq.warranty_expiry ? new Date(eq.warranty_expiry).toISOString().split('T')[0] : ''),
      warrantyProvider: eq.warrantyProvider || '',
      warrantyNumber: eq.warrantyNumber || '',
      status: eq.status || 'Active',
      purchaseDate: eq.purchaseDate ? new Date(eq.purchaseDate).toISOString().split('T')[0] : '',
      purchasePrice: eq.purchasePrice || '',
      supplier: eq.supplier || '',
      purchaseOrderNumber: eq.purchaseOrderNumber || '',
      notes: eq.notes || ''
    } : { 
      name: '', 
      type: '', 
      serialNumber: '', 
      model: '', 
      manufacturer: '',
      client: selectedClient,
      site: selectedSite,
      installationDate: new Date().toISOString().split('T')[0],
      location: '',
      roomNumber: '',
      warrantyStatus: 'Under Warranty',
      warrantyStartDate: '',
      warrantyEndDate: '',
      warrantyProvider: '',
      warrantyNumber: '',
      status: 'Active',
      purchaseDate: '',
      purchasePrice: '',
      supplier: '',
      purchaseOrderNumber: '',
      notes: ''
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingEquipment(null);
    setForm({ 
      name: '', 
      type: '', 
      serialNumber: '', 
      model: '', 
      manufacturer: '',
      client: selectedClient,
      site: selectedSite,
      installationDate: new Date().toISOString().split('T')[0],
      location: '',
      roomNumber: '',
      warrantyStatus: 'Under Warranty',
      warrantyStartDate: '',
      warrantyEndDate: '',
      warrantyProvider: '',
      warrantyNumber: '',
      status: 'Active',
      purchaseDate: '',
      purchasePrice: '',
      supplier: '',
      purchaseOrderNumber: '',
      notes: ''
    });
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('🔍 Equipment form submitted');
    console.log('📝 Form data:', form);
    console.log('👤 User:', user);
    console.log('👤 User.id:', user?.id);
    console.log('👤 User._id:', user?._id);
    console.log('📍 Selected site:', selectedSite);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found, logging out');
        onLogout();
        return;
      }

      // Validate required fields
      if (!form.name || !form.type || !form.serialNumber || !form.model || !form.manufacturer) {
        console.log('❌ Validation failed - missing required fields');
        showToast('Please fill in all required fields (Name, Type, Serial Number, Model, Manufacturer)', 'error');
        return;
      }

      console.log('✅ Validation passed, preparing payload');

      // Prepare payload with proper date conversions
      const payload = {
        ...form,
        installationDate: form.installationDate ? new Date(form.installationDate) : new Date(),
        warrantyStartDate: form.warrantyStartDate ? new Date(form.warrantyStartDate) : null,
        warrantyEndDate: form.warrantyEndDate ? new Date(form.warrantyEndDate) : null,
        purchaseDate: form.purchaseDate ? new Date(form.purchaseDate) : null,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
        createdBy: user.id || user._id
      };

      console.log('📦 Payload prepared:', payload);

      if (editingEquipment) {
        console.log('🔄 Updating existing equipment');
        await axios.put(`http://localhost:3000/api/equipment/${editingEquipment._id}`, payload, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        showToast('Equipment updated successfully!', 'success');
      } else {
        console.log('➕ Adding new equipment');
        const response = await axios.post(`http://localhost:3000/api/sites/${selectedSite}/equipment`, payload, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        console.log('✅ Equipment added successfully:', response.data);
        showToast('Equipment added successfully!', 'success');
      }
      closeModal();
      
      // Refresh equipment list
      const refreshToken = localStorage.getItem('token');
      if (refreshToken && selectedSite) {
        console.log('🔄 Refreshing equipment list');
        axios.get(`http://localhost:3000/api/sites/${selectedSite}/equipment`, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        }).then(res => {
          console.log('✅ Equipment list refreshed:', res.data.length, 'items');
          setEquipment(res.data);
        }).catch(err => {
          console.error('❌ Failed to refresh equipment:', err.response?.data || err.message);
        });
      }
    } catch (err) {
      console.error('❌ Equipment submission error:', err);
      console.error('📝 Error details:', err.response?.data);
      
      if (err.response?.status === 401) {
        console.log('🔐 Unauthorized, logging out');
        onLogout();
      } else {
        const errorMessage = err.response?.data?.message || 'Error occurred';
        console.log('📝 Showing error toast:', errorMessage);
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this equipment?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }
      await axios.delete(`http://localhost:3000/api/equipment/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      showToast('Equipment deleted successfully!', 'success');
      
      // Refresh equipment list
      if (selectedSite) {
        axios.get(`http://localhost:3000/api/sites/${selectedSite}/equipment`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => setEquipment(res.data)).catch(err => {
          console.error('Failed to refresh equipment:', err.response?.data || err.message);
        });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        onLogout();
      } else {
        showToast(err.response?.data?.message || 'Error occurred', 'error');
      }
    }
  };

  // Warranty badge color
  const warrantyBadge = (status) => {
    switch (status) {
      case 'Under Warranty':
        return 'bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold';
      case 'Out of Warranty':
        return 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold';
      case 'Extended Warranty':
        return 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold';
      default:
        return 'bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold';
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
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-6">Equipment</h2>
        <div className="flex flex-col sm:flex-row gap-2 mb-6 items-center">
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg w-full max-w-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all">
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>{client.name}</option>
            ))}
          </select>
          {selectedClient && (
            <select value={selectedSite} onChange={e => setSelectedSite(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg w-full max-w-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all">
              <option value="">Select Site</option>
              {sites.map(site => (
                <option key={site._id} value={site._id}>{site.name}</option>
              ))}
            </select>
          )}
          {selectedSite && user.role === 'Admin' && (
            <button className="bg-gradient-to-r from-teal-500 to-green-400 text-white px-5 py-2 rounded-xl shadow hover:from-teal-600 hover:to-green-500 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all font-semibold" onClick={() => openModal()}>+ Add Equipment</button>
          )}
        </div>
        {/* Search input */}
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Search by Serial Number"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg w-full max-w-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all"
          />
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
                  <th className="px-5 py-3 text-left text-sm font-bold">Serial Number</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Model</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Type</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Warranty Status</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Warranty Expiry</th>
                  {user.role === 'Admin' && <th className="px-5 py-3 text-sm font-bold text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {equipment
                 .filter(eq => (eq.serialNumber || eq.serial_number) && (eq.serialNumber || eq.serial_number).toLowerCase().includes(search.toLowerCase()))
                 .map(eq => (
                  <tr key={eq._id} className="even:bg-gray-50 hover:bg-green-50 transition-colors">
                    <td className="px-5 py-3 font-medium">{eq.name}</td>
                    <td className="px-5 py-3">{eq.serialNumber || eq.serial_number}</td>
                    <td className="px-5 py-3">{eq.model}</td>
                    <td className="px-5 py-3">{eq.type}</td>
                    <td className="px-5 py-3"><span className={warrantyBadge(eq.warrantyStatus || eq.warranty_status)}>{eq.warrantyStatus || eq.warranty_status}</span></td>
                    <td className="px-5 py-3">{(eq.warrantyEndDate ? new Date(eq.warrantyEndDate).toISOString().split('T')[0] : '') || (eq.warranty_expiry ? new Date(eq.warranty_expiry).toISOString().split('T')[0] : '')}</td>
                    {user.role === 'Admin' && (
                      <td className="px-5 py-3 flex gap-2 justify-center">
                        <button className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all" onClick={() => openModal(eq)}>Edit</button>
                        <button className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" onClick={() => handleDelete(eq._id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Modal isOpen={modalOpen} onClose={closeModal} title={editingEquipment ? 'Edit Equipment' : 'Add Equipment'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Essential Fields Only */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                name="name" 
                placeholder="Equipment Name *" 
                value={form.name} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
              />
              <input 
                name="type" 
                placeholder="Equipment Type *" 
                value={form.type} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
              />
              <input 
                name="serialNumber" 
                placeholder="Serial Number *" 
                value={form.serialNumber} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
              />
              <input 
                name="model" 
                placeholder="Model *" 
                value={form.model} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
              />
              <input 
                name="manufacturer" 
                placeholder="Manufacturer *" 
                value={form.manufacturer} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
              />
              <input 
                name="location" 
                placeholder="Location" 
                value={form.location} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
              />
              <input 
                name="installationDate" 
                type="date" 
                value={form.installationDate} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
              />
              <select 
                name="warrantyStatus" 
                value={form.warrantyStatus} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              >
                <option value="Under Warranty">Under Warranty</option>
                <option value="Out of Warranty">Out of Warranty</option>
                <option value="Extended Warranty">Extended Warranty</option>
              </select>
              <input 
                name="warrantyEndDate" 
                type="date" 
                placeholder="Warranty End Date" 
                value={form.warrantyEndDate} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all" 
              />
              <select 
                name="status" 
                value={form.status} 
                onChange={handleChange} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Out of Service">Out of Service</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            
            {/* Optional Notes Field */}
            <textarea 
              name="notes" 
              placeholder="Notes (Optional)" 
              value={form.notes} 
              onChange={handleChange} 
              rows="2" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            ></textarea>
            
            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button 
                type="button" 
                className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" 
                onClick={closeModal}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 shadow focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                onClick={() => {
                  console.log('🔘 Add Equipment button clicked');
                  console.log('📝 Current form state:', form);
                  console.log('👤 User object:', user);
                  console.log('📍 Selected site:', selectedSite);
                }}
              >
                {editingEquipment ? 'Update' : 'Add'} Equipment
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
} 