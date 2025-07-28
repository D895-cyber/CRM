import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, Download, Database, Package } from 'lucide-react';
import Modal from './Modal';

export default function DataImport({ user, showToast, onLogout }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importType, setImportType] = useState('spare-parts');
  const [modalOpen, setModalOpen] = useState(false);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [mapping, setMapping] = useState({
    partNumber: '',
    name: '',
    category: '',
    model: '',
    manufacturer: '',
    supplier: '',
    availableQuantity: '',
    unitPrice: ''
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in localStorage');
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.type === 'application/vnd.ms-excel') {
        setFile(selectedFile);
        setError('');
        setSuccess('');
        // Preview will be shown after mapping
      } else {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('importType', importType);
    formData.append('mapping', JSON.stringify(mapping));
    formData.append('updateExisting', updateExisting);

    try {
      const response = await axios.post('http://localhost:3000/api/import/spare-parts', formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(`Successfully imported ${response.data.imported} spare parts!`);
      if (response.data.skipped > 0) {
        setSuccess(`Successfully imported ${response.data.imported} spare parts! ${response.data.skipped} items were skipped.`);
      }
      if (response.data.errors && response.data.errors.length > 0) {
        const errorMessage = `Import completed with ${response.data.errors.length} errors:\n${response.data.errors.slice(0, 5).join('\n')}`;
        if (response.data.errors.length > 5) {
          errorMessage += `\n... and ${response.data.errors.length - 5} more errors`;
        }
        setError(errorMessage);
      }
      setFile(null);
      setPreview([]);
      showToast(`Imported ${response.data.imported} spare parts successfully!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Part Number': '003-004655-01',
        'Name': 'Projector Lamp',
        'Category': 'Lamp',
        'Model': 'CP2215',
        'Manufacturer': 'Epson',
        'Supplier': 'TechParts Inc',
        'Available Quantity': '10',
        'Unit Price': '150.00'
      },
      {
        'Part Number': '003-104029-01',
        'Name': 'Projector Filter',
        'Category': 'Filter',
        'Model': 'CP2220',
        'Manufacturer': 'Epson',
        'Supplier': 'TechParts Inc',
        'Available Quantity': '5',
        'Unit Price': '25.00'
      }
    ];

    const csvContent = [
      Object.keys(templateData[0]).join(','),
      ...templateData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spare-parts-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openMappingModal = () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    setModalOpen(true);
  };

  const closeMappingModal = () => {
    setModalOpen(false);
  };

  const handleMappingChange = (field, value) => {
    setMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateMapping = () => {
    const requiredFields = ['partNumber', 'name', 'category', 'model'];
    const missingFields = requiredFields.filter(field => !mapping[field]);
    
    if (missingFields.length > 0) {
      setError(`Please map the following required fields: ${missingFields.join(', ')}`);
      return false;
    }
    return true;
  };

  const confirmMapping = () => {
    if (!validateMapping()) return;
    
    // Here you would typically parse the Excel file and show preview
    // For now, we'll simulate with sample data
    setPreview([
      {
        partNumber: '003-004655-01',
        name: 'Projector Lamp',
        category: 'Lamp',
        model: 'CP2215',
        manufacturer: 'Epson',
        supplier: 'TechParts Inc',
        availableQuantity: 10,
        unitPrice: 150.00
      },
      {
        partNumber: '003-104029-01',
        name: 'Projector Filter',
        category: 'Filter',
        model: 'CP2220',
        manufacturer: 'Epson',
        supplier: 'TechParts Inc',
        availableQuantity: 5,
        unitPrice: 25.00
      }
    ]);
    
    closeMappingModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Navbar */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Data Import
                  </h1>
                  <p className="text-xs text-gray-500">Import spare parts from Excel</p>
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
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 text-sm"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Import Spare Parts</h2>
              <p className="text-gray-600">Upload Excel files to bulk import spare parts with model mappings</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={downloadTemplate}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-105 text-lg font-semibold flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Download Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Upload Excel File</h3>
                <p className="text-gray-600">Select your Excel file with spare parts data</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-green-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      {file ? file.name : 'Choose Excel file or drag here'}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Supports .xlsx and .xls files up to 10MB
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {file && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="updateExisting"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="updateExisting" className="text-sm font-medium text-gray-700">
                    Update existing parts (instead of skipping)
                  </label>
                </div>
                
                <button
                  onClick={openMappingModal}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <Database className="h-5 w-5" />
                  <span>Configure Column Mapping</span>
                </button>
                
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Package className="h-5 w-5" />
                  )}
                  <span>{loading ? 'Importing...' : 'Import Spare Parts'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Data Preview</h3>
                <p className="text-gray-600">Preview of imported data</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>

            {preview.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Ready to import {preview.length} items</span>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Part Number</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Model</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-800 font-medium">{item.partNumber}</td>
                          <td className="px-3 py-2 text-gray-700">{item.name}</td>
                          <td className="px-3 py-2 text-gray-700">{item.model}</td>
                          <td className="px-3 py-2 text-gray-700">{item.category}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 10 && (
                    <p className="text-gray-500 text-sm mt-2 text-center">
                      Showing first 10 of {preview.length} items
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No preview available</h3>
                <p className="text-gray-500">Upload a file and configure mapping to see preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mt-8 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl p-4 flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        )}

        {/* Column Mapping Modal */}
        <Modal isOpen={modalOpen} onClose={closeMappingModal} title="Configure Column Mapping">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm">
                Map your Excel columns to the spare parts fields. Required fields are marked with *.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Part Number *</label>
                <select 
                  value={mapping.partNumber} 
                  onChange={(e) => handleMappingChange('partNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select column</option>
                  <option value="A">Column A</option>
                  <option value="B">Column B</option>
                  <option value="C">Column C</option>
                  <option value="D">Column D</option>
                  <option value="E">Column E</option>
                  <option value="F">Column F</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <select 
                  value={mapping.name} 
                  onChange={(e) => handleMappingChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select column</option>
                  <option value="A">Column A</option>
                  <option value="B">Column B</option>
                  <option value="C">Column C</option>
                  <option value="D">Column D</option>
                  <option value="E">Column E</option>
                  <option value="F">Column F</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select 
                  value={mapping.category} 
                  onChange={(e) => handleMappingChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select column</option>
                  <option value="A">Column A</option>
                  <option value="B">Column B</option>
                  <option value="C">Column C</option>
                  <option value="D">Column D</option>
                  <option value="E">Column E</option>
                  <option value="F">Column F</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                <select 
                  value={mapping.model} 
                  onChange={(e) => handleMappingChange('model', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select column</option>
                  <option value="A">Column A</option>
                  <option value="B">Column B</option>
                  <option value="C">Column C</option>
                  <option value="D">Column D</option>
                  <option value="E">Column E</option>
                  <option value="F">Column F</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                <select 
                  value={mapping.manufacturer} 
                  onChange={(e) => handleMappingChange('manufacturer', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select column</option>
                  <option value="A">Column A</option>
                  <option value="B">Column B</option>
                  <option value="C">Column C</option>
                  <option value="D">Column D</option>
                  <option value="E">Column E</option>
                  <option value="F">Column F</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Quantity</label>
                <select 
                  value={mapping.availableQuantity} 
                  onChange={(e) => handleMappingChange('availableQuantity', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select column</option>
                  <option value="A">Column A</option>
                  <option value="B">Column B</option>
                  <option value="C">Column C</option>
                  <option value="D">Column D</option>
                  <option value="E">Column E</option>
                  <option value="F">Column F</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <button 
                type="button" 
                className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all font-medium" 
                onClick={closeMappingModal}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all font-semibold"
                onClick={confirmMapping}
              >
                Confirm Mapping
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
} 