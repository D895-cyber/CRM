import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MyReports({ user, showToast, onLogout }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      const res = await axios.get(`http://localhost:3000/api/schedule/reports/fse/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      setError('Failed to fetch reports: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  return (
    <div>
      {/* FSE Navigation Bar */}
      <nav className="flex items-center justify-between bg-white shadow px-6 py-4 mb-8 border-b border-gray-100">
        <div className="flex gap-4">
          <button
            className="text-lg font-bold text-teal-700 hover:text-blue-700 transition"
            onClick={() => window.location.href = '/fse-schedule'}
          >
            My Jobs
          </button>
          <button
            className="text-lg font-bold text-indigo-700 hover:text-blue-700 transition"
            onClick={() => window.location.href = '/my-reports'}
          >
            My Reports
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium text-lg">{user?.name} ({user?.role})</span>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              if (onLogout) onLogout();
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-2xl border border-gray-100 animate-fadeIn">
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-6">My Submitted Reports</h2>
        {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No reports submitted yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-teal-50 to-indigo-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold">Date</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Equipment</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Site</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Cinema</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Remarks</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Photos</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id} className="even:bg-gray-50 hover:bg-teal-50 transition-colors">
                    <td className="px-5 py-3">{r.date ? new Date(r.date).toLocaleDateString() : ''}</td>
                    <td className="px-5 py-3">{r.schedule?.equipment?.serialNumber}</td>
                    <td className="px-5 py-3">{r.schedule?.site?.name}</td>
                    <td className="px-5 py-3">{r.cinemaName}</td>
                    <td className="px-5 py-3">
                      {Array.isArray(r.remarks) ? r.remarks.filter(Boolean).join(', ') : r.remarks}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-2">
                        {r.photos && r.photos.length > 0 ? r.photos.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt="Report" className="w-16 h-16 object-cover rounded border border-gray-200" />
                          </a>
                        )) : <span className="text-gray-400">No photos</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 