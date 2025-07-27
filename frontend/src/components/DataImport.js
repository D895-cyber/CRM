import React, { useState } from 'react';
import { Upload, FileText, Users, MapPin, Settings, Calendar, AlertCircle, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DataImport = ({ user, showToast, onLogout }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importType, setImportType] = useState('vouchers');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const importTypes = [
    {
      key: 'vouchers',
      label: 'Vouchers',
      icon: FileText,
      description: 'Import voucher data from Excel/CSV',
      template: 'voucher_template.csv'
    },
    {
      key: 'clients',
      label: 'Clients',
      icon: Users,
      description: 'Import client information',
      template: 'client_template.csv'
    },
    {
      key: 'sites',
      label: 'Sites',
      icon: MapPin,
      description: 'Import site locations',
      template: 'site_template.csv'
    },
    {
      key: 'equipment',
      label: 'Equipment',
      icon: Settings,
      description: 'Import equipment inventory',
      template: 'equipment_template.csv'
    },
    {
      key: 'schedules',
      label: 'Schedules',
      icon: Calendar,
      description: 'Import service schedules',
      template: 'schedule_template.csv'
    }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(fileExtension)) {
        setError('Please select a valid file type (CSV, XLSX, or XLS)');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    setLoading(true);
    setProgress(0);
    setError('');
    setResults(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', importType);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await axios.post('http://localhost:3000/api/import', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResults(response.data);
      showToast && showToast(`Successfully imported ${response.data.imported} records!`, 'success');
      
      // Reset form after successful import
      setTimeout(() => {
        setSelectedFile(null);
        setProgress(0);
        setResults(null);
      }, 3000);

    } catch (err) {
      console.error('Import failed:', err);
      setError(err.response?.data?.message || 'Import failed. Please check your file format.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = (templateName) => {
    // Create a sample template based on the import type
    let csvContent = '';
    
    switch (importType) {
      case 'vouchers':
        csvContent = 'fseName,amount,date,description,status\nJohn Doe,1500,2025-01-15,Service visit,Pending';
        break;
      case 'clients':
        csvContent = 'name,email,phone,address\nABC Company,abc@company.com,+1234567890,123 Main St';
        break;
      case 'sites':
        csvContent = 'name,address,clientId,contactPerson\nSite A,456 Oak Ave,client123,John Smith';
        break;
      case 'equipment':
        csvContent = 'serialNumber,model,siteId,installationDate\nEQ001,Model X,site123,2025-01-01';
        break;
      case 'schedules':
        csvContent = 'date,equipmentId,fseId,status\n2025-01-20,eq123,fse456,Pending';
        break;
      default:
        csvContent = 'column1,column2,column3\nvalue1,value2,value3';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = templateName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-2">Data Import</h2>
          <p className="text-gray-600">Import your existing data from Excel or CSV files</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {results && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <div>
              <span className="text-green-700 font-medium">Import completed successfully!</span>
              <p className="text-green-600 text-sm mt-1">
                Imported: {results.imported} records | Skipped: {results.skipped || 0} records
              </p>
            </div>
          </div>
        )}

        {/* Import Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Import Type</label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.key}
                  onClick={() => setImportType(type.key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    importType === type.key
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <IconComponent className={`w-5 h-5 mr-3 ${
                      importType === type.key ? 'text-teal-600' : 'text-gray-500'
                    }`} />
                    <div className="text-left">
                      <div className={`font-medium ${
                        importType === type.key ? 'text-teal-800' : 'text-gray-800'
                      }`}>
                        {type.label}
                      </div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Upload File</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
              </p>
              <p className="text-sm text-gray-500">CSV, XLSX, or XLS files only</p>
            </label>
          </div>
        </div>

        {/* Template Download */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-800">Need a template?</h4>
              <p className="text-sm text-blue-600">Download a sample file to see the required format</p>
            </div>
            <button
              onClick={() => downloadTemplate(`${importType}_template.csv`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Download Template
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Importing...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Import Button */}
        <div className="flex justify-center">
          <button
            onClick={handleImport}
            disabled={!selectedFile || loading}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              !selectedFile || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg'
            }`}
          >
            {loading ? 'Importing...' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataImport; 