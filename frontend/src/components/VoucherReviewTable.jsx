import { useEffect, useState } from 'react';
import axios from 'axios';

export default function VoucherReviewTable({ user }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fseFilter, setFseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line
  }, []);

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
        window.location.href = '/login';
      } else {
        setError('Failed to fetch vouchers: ' + (err.response?.data?.message || err.message));
      }
    }
    setLoading(false);
  };

  const handleVerify = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }
      await axios.put(`http://localhost:3000/api/vouchers/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVouchers();
    } catch (err) {
      console.error('Failed to verify voucher:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        setError('Failed to verify voucher: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handlePay = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        return;
      }
      await axios.put(`http://localhost:3000/api/vouchers/${id}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVouchers();
    } catch (err) {
      console.error('Failed to mark voucher as paid:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        setError('Failed to mark voucher as paid: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const statusBadge = (status) => {
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Verified') return 'bg-blue-100 text-blue-800';
    if (status === 'Paid') return 'bg-green-100 text-green-800';
    return 'bg-gray-200 text-gray-700';
  };

  // Filtering
  const filtered = vouchers.filter(v => {
    if (fseFilter && !((v.fseId?.name || v.fseName || '').toLowerCase().includes(fseFilter.toLowerCase()))) return false;
    if (statusFilter && v.status !== statusFilter) return false;
    if (dateFrom && (!v.date || v.date < dateFrom)) return false;
    if (dateTo && (!v.date || v.date > dateTo)) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fadeIn">
      <h2 className="text-2xl font-bold text-teal-700 mb-6">All Vouchers</h2>
      <div className="flex flex-wrap gap-4 mb-6">
        <input type="text" placeholder="FSE Name" value={fseFilter} onChange={e => setFseFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Paid">Paid</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
      </div>
      {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow bg-white">
          <table className="min-w-full table-auto">
            <thead className="bg-gradient-to-r from-green-50 to-teal-100 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 text-left text-sm font-bold">FSE Name</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Bill</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Amount</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Date</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Description</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Status</th>
                <th className="px-5 py-3 text-left text-sm font-bold">Submitted</th>
                <th className="px-5 py-3 text-sm font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v._id} className="even:bg-gray-50 hover:bg-green-50 transition-colors">
                  <td className="px-5 py-3">{v.fseId?.name || v.fseName}</td>
                  <td className="px-5 py-3">
                    <a href={`http://localhost:3000/${v.billFile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View</a>
                  </td>
                  <td className="px-5 py-3">₹{v.amount}</td>
                  <td className="px-5 py-3">{v.date && v.date.substring(0,10)}</td>
                  <td className="px-5 py-3">{v.description}</td>
                  <td className="px-5 py-3"><span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(v.status)}`}>{v.status}</span></td>
                  <td className="px-5 py-3">{v.createdAt && v.createdAt.substring(0,10)}</td>
                  <td className="px-5 py-3 flex gap-2 justify-center">
                    {v.status === 'Pending' && (
                      <button className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all" onClick={() => handleVerify(v._id)}>Verify</button>
                    )}
                    {v.status === 'Verified' && (
                      <button className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all" onClick={() => handlePay(v._id)}>Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 