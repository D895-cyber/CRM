import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Attendance({ user, showToast, onLogout }) {
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportModal, setReportModal] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
    fetchAttendance(date);
    // eslint-disable-next-line
  }, [date]);

  const fetchAttendance = async (selectedDate) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/schedule/attendance?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(res.data);
    } catch (err) {
      setError('Failed to fetch attendance');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const openReportModal = async (job) => {
    setReportModal(job.jobId);
    setReportData(null);
    setReportError('');
    setReportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/schedule/report/${job.jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportData(res.data);
    } catch (err) {
      setReportError('No report found for this job.');
    }
    setReportLoading(false);
  };
  const closeReportModal = () => setReportModal(null);

  const handleDownloadPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Service Report', 14, 16);
    let y = 26;
    doc.setFontSize(12);
    doc.text(`Cinema Name: ${reportData.cinemaName || ''}`, 14, y); y += 8;
    doc.text(`Address: ${reportData.address || ''}`, 14, y); y += 8;
    doc.text(`Contact Details: ${reportData.contactDetails || ''}`, 14, y); y += 8;
    doc.text(`Engineer Visited: ${reportData.engineerVisited || ''}`, 14, y); y += 8;
    doc.text(`Projector Model: ${reportData.projectorModel || ''}`, 14, y); y += 8;
    doc.text(`Serial No: ${reportData.serialNo || ''}`, 14, y); y += 8;
    doc.text(`Lamp Model: ${reportData.lampModel || ''}`, 14, y); y += 8;
    doc.text(`Lamp Hours: ${reportData.lampHours || ''}`, 14, y); y += 8;
    // Equipment and Site names
    if (reportData.schedule && reportData.schedule.equipment && reportData.schedule.equipment.serialNumber) {
      doc.text(`Equipment: ${reportData.schedule.equipment.serialNumber}`, 14, y); y += 8;
    }
    if (reportData.schedule && reportData.schedule.site && reportData.schedule.site.name) {
      doc.text(`Site: ${reportData.schedule.site.name}`, 14, y); y += 8;
    }
    // Remarks
    if (reportData.remarks && reportData.remarks.length) {
      doc.text('Remarks/Observations:', 14, y); y += 8;
      reportData.remarks.forEach(r => { doc.text(`- ${r}`, 18, y); y += 8; });
    }
    // Photos (just show file names/paths, not images in PDF for simplicity)
    if (reportData.photos && reportData.photos.length) {
      doc.text('Photos:', 14, y); y += 8;
      reportData.photos.forEach(p => { doc.text(`- ${p}`, 18, y); y += 8; });
    }
    doc.save('service_report.pdf');
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
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">FSE Attendance</h2>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />
        </div>
        {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-green-50 to-teal-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold">FSE Name</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Email</th>
                  <th className="px-5 py-3 text-center text-sm font-bold">Jobs Scheduled</th>
                  <th className="px-5 py-3 text-center text-sm font-bold">Completed</th>
                  <th className="px-5 py-3 text-center text-sm font-bold">Not Done</th>
                  <th className="px-5 py-3 text-center text-sm font-bold">Pending</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Jobs Details</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(fse => (
                  <tr key={fse.email} className="even:bg-gray-50 hover:bg-green-50 transition-colors">
                    <td className="px-5 py-3 font-medium">{fse.name}</td>
                    <td className="px-5 py-3">{fse.email}</td>
                    <td className="px-5 py-3 text-center">{fse.jobsScheduled}</td>
                    <td className="px-5 py-3 text-center text-green-700 font-bold">{fse.completed}</td>
                    <td className="px-5 py-3 text-center text-red-700 font-bold">{fse.notDone}</td>
                    <td className="px-5 py-3 text-center text-yellow-700 font-bold">{fse.pending}</td>
                    <td className="px-5 py-3">
                      <ul className="list-disc ml-4">
                        {fse.jobs.map(job => (
                          <li key={job.jobId}>
                            <span className="font-semibold">{job.status}</span>
                            {job.equipment && ` | Equipment: ${job.equipment}`}
                            {job.site && ` | Site: ${job.site}`}
                            {job.notes && ` | Notes: ${job.notes}`}
                            <button className="ml-2 bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 text-xs" onClick={() => openReportModal(job)}>View Report</button>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-indigo-100 relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={closeReportModal}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-indigo-600">Service Report</h3>
            {reportLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : reportError ? (
              <div className="text-red-600 text-center font-medium mt-2">{reportError}</div>
            ) : reportData ? (
              <div className="space-y-2">
                <div><b>Cinema Name:</b> {reportData.cinemaName}</div>
                <div><b>Address:</b> {reportData.address}</div>
                <div><b>Contact Details:</b> {reportData.contactDetails}</div>
                <div><b>Engineer Visited:</b> {reportData.engineerVisited}</div>
                <div><b>Projector Model:</b> {reportData.projectorModel}</div>
                <div><b>Serial No:</b> {reportData.serialNo}</div>
                <div><b>Lamp Model:</b> {reportData.lampModel}</div>
                <div><b>Lamp Hours:</b> {reportData.lampHours}</div>
                <div><b>Equipment:</b> {reportData.schedule && reportData.schedule.equipment && reportData.schedule.equipment.serialNumber}</div>
                <div><b>Site:</b> {reportData.schedule && reportData.schedule.site && reportData.schedule.site.name}</div>
                <div><b>Remarks/Observations:</b>
                  <ul className="list-disc ml-6">
                    {reportData.remarks && reportData.remarks.map((r, idx) => <li key={idx}>{r}</li>)}
                  </ul>
                </div>
                <div><b>Photos:</b>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {reportData.photos && reportData.photos.map((photo, idx) => (
                      <img key={idx} src={`http://localhost:3000/${photo}`} alt="Report" className="w-32 h-32 object-cover rounded border" />
                    ))}
                  </div>
                </div>
                <button onClick={handleDownloadPDF} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Download PDF</button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
} 