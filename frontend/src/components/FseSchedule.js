import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FseSchedule({ user, showToast, onLogout }) {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [reportForm, setReportForm] = useState({
    remarks: '',
    photos: []
  });
  const [fseReports, setFseReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notDoneReason, setNotDoneReason] = useState('');
  const [reportError, setReportError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'FSE') {
      navigate('/dashboard');
      return;
    }
    fetchSchedules();
    fetchFseReports();
    // eslint-disable-next-line
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setLoading(false);
        return;
      }
      const res = await axios.get(`http://localhost:3000/api/schedule/fse/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(res.data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Failed to fetch schedules: ' + (err.response?.data?.message || err.message));
      }
    }
    setLoading(false);
  };

  // NEW: Fetch FSE's reports
  const fetchFseReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get(`http://localhost:3000/api/schedule/reports/fse/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFseReports(res.data);
    } catch (err) {
      console.error('Failed to fetch FSE reports:', err.response?.data || err.message);
    }
  };

  const handleMarkDone = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/schedule/${id}/status`, { status: 'Completed' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Schedule marked as completed!', 'success');
      fetchSchedules();
    } catch (error) {
      showToast('Failed to update schedule status', 'error');
    }
  };

  const handleNotDone = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/schedule/${id}/status`, { 
        status: 'Not Done',
        notDoneReason: notDoneReason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Schedule marked as not done!', 'success');
      setNotDoneReason('');
      fetchSchedules();
    } catch (error) {
      showToast('Failed to update schedule status', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const openReportModal = (s) => {
    setSelectedSchedule(s);
    setReportForm({ remarks: '', photos: [] });
    setReportError('');
  };
  const closeReportModal = () => setSelectedSchedule(null);

  const handleReportChange = e => setReportForm({ ...reportForm, [e.target.name]: e.target.value });
  const handleReportPhotoChange = e => setReportForm({ ...reportForm, photos: Array.from(e.target.files) });
  const handleReportRemarkChange = (idx, value) => {
    const remarks = [...reportForm.remarks];
    remarks[idx] = value;
    setReportForm({ ...reportForm, remarks });
  };
  const addReportRemark = () => setReportForm({ ...reportForm, remarks: [...reportForm.remarks, ''] });

  const handleReportSubmit = async (e, s) => {
    e.preventDefault();
    setReportError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setReportError('Not authenticated. Please log in again.');
        return;
      }
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        ...reportForm,
        schedule: s._id,
        date: s.date,
      }));
      reportForm.photos.forEach(file => formData.append('photos', file));
      await axios.post('http://localhost:3000/api/schedule/report', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      closeReportModal();
      fetchSchedules();
      showToast && showToast('Report submitted!');
    } catch (err) {
      console.error('Failed to submit report:', err.response?.data || err.message);
      if (err.response?.status === 401) {
        setReportError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setReportError(err.response?.data?.message || 'Failed to submit report');
      }
    }
  };

  // Helper: Check if report exists for a schedule
  const hasReport = (scheduleId) => fseReports.some(r => r.schedule && r.schedule._id === scheduleId);

  return (
    <div>
      {/* FSE Navigation Bar */}
      <nav className="flex items-center justify-between bg-white shadow px-6 py-4 mb-8 border-b border-gray-100">
        <div className="flex gap-4">
          <button
            className="text-lg font-bold text-teal-700 hover:text-blue-700 transition"
            onClick={() => navigate('/fse-schedule')}
          >
            My Jobs
          </button>
          <button
            className="text-lg font-bold text-indigo-700 hover:text-blue-700 transition"
            onClick={() => navigate('/my-reports')}
          >
            My Reports
          </button>
        </div>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">My Service Jobs</h2>
        </div>
        {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-teal-50 to-indigo-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold">Equipment</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Site</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Date</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Status</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Notes</th>
                  <th className="px-5 py-3 text-sm font-bold text-center">Actions</th>
                  <th className="px-5 py-3 text-sm font-bold text-center">Report</th> {/* NEW */}
                </tr>
              </thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s._id} className="even:bg-gray-50 hover:bg-teal-50 transition-colors">
                    <td className="px-5 py-3 font-medium">{s.equipment?.serialNumber}</td>
                    <td className="px-5 py-3">{s.site?.name}</td>
                    <td className="px-5 py-3">{s.date ? s.date.substring(0,10) : ''}</td>
                    <td className="px-5 py-3">{s.status}</td>
                    <td className="px-5 py-3">{s.notes}</td>
                    <td className="px-5 py-3 flex gap-2 justify-center">
                      {s.status !== 'Completed' && s.status !== 'Cancelled' ? (
                        hasReport(s._id) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Report Submitted</span>
                        ) : (
                          <>
                            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" onClick={() => handleMarkDone(s._id)}>Mark Done</button>
                            <button className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" onClick={() => handleNotDone(s._id)}>Not Done</button>
                            <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all" onClick={() => openReportModal(s)}>Submit Report</button>
                          </>
                        )
                      ) : s.status === 'Completed' ? (
                        <span className="text-green-700 font-bold">Completed</span>
                      ) : (
                        <span className="text-red-700 font-bold">Not Done</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {hasReport(s._id) && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✔</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Service Report Modal */}
      {selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-indigo-100 relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={closeReportModal}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-indigo-600">Service Report</h3>
            <form onSubmit={e => handleReportSubmit(e, selectedSchedule)} className="flex flex-col gap-4">
              <input name="cinemaName" placeholder="Cinema Name" value={reportForm.cinemaName} onChange={handleReportChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              <input name="address" placeholder="Address" value={reportForm.address} onChange={handleReportChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              <input name="contactDetails" placeholder="Contact Details" value={reportForm.contactDetails} onChange={handleReportChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              <input name="engineerVisited" placeholder="Engineer Visited" value={reportForm.engineerVisited} onChange={handleReportChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              <input name="projectorModel" placeholder="Projector Model" value={reportForm.projectorModel} onChange={handleReportChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              <input name="serialNo" placeholder="Serial No" value={reportForm.serialNo} onChange={handleReportChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              <input name="lampModel" placeholder="Lamp Model" value={reportForm.lampModel} onChange={handleReportChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              <input name="lampHours" placeholder="Lamp Hours" value={reportForm.lampHours} onChange={handleReportChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              <label className="font-semibold">Remarks/Observations</label>
              {reportForm.remarks.map((remark, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={remark}
                    onChange={e => handleReportRemarkChange(idx, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  {idx === reportForm.remarks.length - 1 && (
                    <button type="button" className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600" onClick={addReportRemark}>+</button>
                  )}
                </div>
              ))}
              <label className="font-semibold">Upload Photos</label>
              <input type="file" multiple onChange={handleReportPhotoChange} className="w-full" />
              {reportError && <div className="text-red-600 text-center font-medium mt-2">{reportError}</div>}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" className="bg-gray-200 px-5 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={closeReportModal}>Cancel</button>
                <button type="submit" className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 