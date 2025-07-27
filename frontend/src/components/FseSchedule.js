import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FseSchedule({ user, showToast, onLogout }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingId, setMarkingId] = useState(null);
  const [notes, setNotes] = useState('');
  const [notDoneId, setNotDoneId] = useState(null);
  const [notDoneReason, setNotDoneReason] = useState('');
  const [reportModalId, setReportModalId] = useState(null);
  const [reportForm, setReportForm] = useState({ cinemaName: '', address: '', contactDetails: '', engineerVisited: '', projectorModel: '', serialNo: '', lampModel: '', lampHours: '', sections: [], imageEvaluation: [], testResults: [], remarks: [''] });
  const [reportPhotos, setReportPhotos] = useState([]);
  const [reportError, setReportError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'FSE') {
      navigate('/dashboard');
      return;
    }
    fetchSchedules();
    // eslint-disable-next-line
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/schedule/fse/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(res.data);
    } catch (err) {
      setError('Failed to fetch schedules');
    }
    setLoading(false);
  };

  const handleMarkDone = async (id) => {
    setMarkingId(id);
    setNotes('');
  };

  const handleSubmitDone = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/api/schedule/${id}/status`, { status: 'Completed', notes }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMarkingId(null);
      setNotes('');
      fetchSchedules();
      showToast && showToast('Marked as completed!');
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleNotDone = (id) => {
    setNotDoneId(id);
    setNotDoneReason('');
  };

  const handleSubmitNotDone = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/api/schedule/${id}/status`, { status: 'Cancelled', notes: notDoneReason }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotDoneId(null);
      setNotDoneReason('');
      fetchSchedules();
      showToast && showToast('Marked as not done!');
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const openReportModal = (s) => {
    setReportModalId(s._id);
    setReportForm({ cinemaName: '', address: '', contactDetails: '', engineerVisited: '', projectorModel: '', serialNo: '', lampModel: '', lampHours: '', sections: [], imageEvaluation: [], testResults: [], remarks: [''] });
    setReportPhotos([]);
    setReportError('');
  };
  const closeReportModal = () => setReportModalId(null);

  const handleReportChange = e => setReportForm({ ...reportForm, [e.target.name]: e.target.value });
  const handleReportPhotoChange = e => setReportPhotos(Array.from(e.target.files));
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
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        ...reportForm,
        schedule: s._id,
        date: s.date,
      }));
      reportPhotos.forEach(file => formData.append('photos', file));
      await axios.post('http://localhost:3000/api/schedule/report', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      closeReportModal();
      fetchSchedules();
      showToast && showToast('Report submitted!');
    } catch (err) {
      setReportError(err.response?.data?.message || 'Failed to submit report');
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
                        markingId === s._id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={notes}
                              onChange={e => setNotes(e.target.value)}
                              placeholder="Completion notes (optional)"
                              className="px-2 py-1 border border-gray-300 rounded"
                            />
                            <button className="bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all" onClick={() => handleSubmitDone(s._id)}>Submit</button>
                            <button className="bg-gray-300 text-black px-3 py-1.5 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={() => setMarkingId(null)}>Cancel</button>
                          </div>
                        ) : notDoneId === s._id ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={notDoneReason}
                              onChange={e => setNotDoneReason(e.target.value)}
                              placeholder="Reason for not done (required)"
                              className="px-2 py-1 border border-gray-300 rounded"
                              required
                            />
                            <button className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" onClick={() => handleSubmitNotDone(s._id)} disabled={!notDoneReason.trim()}>Submit</button>
                            <button className="bg-gray-300 text-black px-3 py-1.5 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all" onClick={() => setNotDoneId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all" onClick={() => handleMarkDone(s._id)}>Mark Done</button>
                            <button className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all" onClick={() => handleNotDone(s._id)}>Not Done</button>
                            <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all" onClick={() => openReportModal(s)}>Fill Service Report</button>
                          </>
                        )
                      ) : s.status === 'Completed' ? (
                        <span className="text-green-700 font-bold">Completed</span>
                      ) : (
                        <span className="text-red-700 font-bold">Not Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Service Report Modal */}
      {reportModalId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-indigo-100 relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={closeReportModal}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-indigo-600">Service Report</h3>
            <form onSubmit={e => handleReportSubmit(e, schedules.find(s => s._id === reportModalId))} className="flex flex-col gap-4">
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