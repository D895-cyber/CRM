import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UploadVoucherForm from './UploadVoucherForm';
import MyVouchers from './MyVouchers';

export default function VoucherManagement({ user, showToast, onLogout }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'upload'
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const fetchVouchers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      const res = await axios.get('http://localhost:3000/api/vouchers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVouchers(res.data);
    } catch (err) {
      console.error('Failed to fetch vouchers:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Failed to fetch vouchers: ' + (err.response?.data?.message || err.message));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleVoucherUploaded = () => {
    fetchVouchers();
    setActiveTab('list');
    if (showToast) showToast('Voucher uploaded successfully!');
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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Voucher Management</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'list'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              My Vouchers
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'upload'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Upload Voucher
            </button>
            {user?.role === 'Admin' || user?.role === 'Manager' ? (
              <button
                onClick={() => navigate('/voucher-review')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                Review All Vouchers
              </button>
            ) : null}
          </div>
        </div>

        {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}

        {activeTab === 'list' ? (
          <MyVouchers 
            user={user} 
            vouchers={vouchers} 
            loading={loading} 
            error={error} 
            fetchVouchers={fetchVouchers}
          />
        ) : (
          <UploadVoucherForm 
            user={user} 
            onSuccess={handleVoucherUploaded}
          />
        )}
      </div>
    </div>
  );
} 