import { useState } from 'react';
import axios from 'axios';

export default function UploadVoucherForm({ user, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [billFile, setBillFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('date', date);
      formData.append('description', description);
      if (billFile) formData.append('billFile', billFile);
      await axios.post('http://localhost:3000/api/vouchers', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Voucher uploaded successfully!');
      setAmount('');
      setDate('');
      setDescription('');
      setBillFile(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to upload voucher:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        setError(err.response?.data?.message || 'Failed to upload voucher');
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4 max-w-lg mx-auto mt-6">
      <h2 className="text-xl font-bold text-teal-700 mb-2">Upload Voucher</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bill Copy (image/pdf)</label>
        <input type="file" name="billFile" accept="image/*,application/pdf" onChange={e => setBillFile(e.target.files[0])} required className="block w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition">
        {loading ? 'Uploading...' : 'Upload Voucher'}
      </button>
      {error && <div className="text-red-600 text-center font-medium mt-2">{error}</div>}
      {success && <div className="text-green-600 text-center font-medium mt-2">{success}</div>}
    </form>
  );
} 