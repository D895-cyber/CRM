import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function EquipmentReports({ user, showToast, onLogout }) {
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [detailsModal, setDetailsModal] = useState(null);
  const [detailsReport, setDetailsReport] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
    fetchEquipment();
    // eslint-disable-next-line
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/clients');
      let allEquipment = [];
      for (const client of res.data) {
        const sitesRes = await axios.get(`http://localhost:3000/api/clients/${client._id}/sites`);
        for (const site of sitesRes.data) {
          const eqRes = await axios.get(`http://localhost:3000/api/sites/${site._id}/equipment`);
          for (const eq of eqRes.data) {
            allEquipment.push({ ...eq, site });
          }
        }
      }
      setEquipmentList(allEquipment);
    } catch (err) {
      setError('Failed to fetch equipment');
    }
  };

  const fetchReports = async (equipmentId) => {
    setLoading(true);
    setReports([]);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/schedule/reports/equipment/${equipmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      setError('Failed to fetch reports');
    }
    setLoading(false);
  };

  const handleEquipmentChange = e => {
    setSelectedEquipment(e.target.value);
    if (e.target.value) fetchReports(e.target.value);
    else setReports([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const handleDownloadPDF = (report) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Service Report', 14, 16);
    let y = 26;
    doc.setFontSize(12);
    doc.text(`Cinema Name: ${report.cinemaName || ''}`, 14, y); y += 8;
    doc.text(`Address: ${report.address || ''}`, 14, y); y += 8;
    doc.text(`Contact Details: ${report.contactDetails || ''}`, 14, y); y += 8;
    doc.text(`Engineer Visited: ${report.engineerVisited || ''}`, 14, y); y += 8;
    doc.text(`Projector Model: ${report.projectorModel || ''}`, 14, y); y += 8;
    doc.text(`Serial No: ${report.serialNo || ''}`, 14, y); y += 8;
    doc.text(`Lamp Model: ${report.lampModel || ''}`, 14, y); y += 8;
    doc.text(`Lamp Hours: ${report.lampHours || ''}`, 14, y); y += 8;
    if (report.schedule && report.schedule.equipment && report.schedule.equipment.serialNumber) {
      doc.text(`Equipment: ${report.schedule.equipment.serialNumber}`, 14, y); y += 8;
    }
    if (report.schedule && report.schedule.site && report.schedule.site.name) {
      doc.text(`Site: ${report.schedule.site.name}`, 14, y); y += 8;
    }
    if (report.remarks && report.remarks.length) {
      doc.text('Remarks/Observations:', 14, y); y += 8;
      report.remarks.forEach(r => { doc.text(`- ${r}`, 18, y); y += 8; });
    }
    if (report.photos && report.photos.length) {
      doc.text('Photos:', 14, y); y += 8;
      report.photos.forEach(p => { doc.text(`- ${p}`, 18, y); y += 8; });
    }
    doc.save('service_report.pdf');
  };

  const openDetailsModal = (report) => {
    setDetailsModal(report._id);
    setDetailsReport(report);
  };
  const closeDetailsModal = () => setDetailsModal(null);

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
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex-1">Equipment Reports</h2>
          <select value={selectedEquipment} onChange={handleEquipmentChange} className="px-4 py-2 border border-gray-300 rounded-lg w-full max-w-xs focus:ring-2 focus:ring-orange-500 outline-none transition-all">
            <option value="">Select Equipment (Serial Number)</option>
            {equipmentList.map(eq => (
              <option key={eq._id} value={eq._id}>{eq.serialNumber} ({eq.site?.name})</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <input type="text" placeholder="Search FSE name or status" value={search} onChange={e => setSearch(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all">
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Not Done</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
        </div>
        {error && <div className="text-red-600 text-center font-medium mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-lg bg-white">
            <table className="min-w-full table-auto">
              <thead className="bg-gradient-to-r from-orange-50 to-teal-100 sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-bold">Equipment</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Date</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">FSE</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Status</th>
                  <th className="px-5 py-3 text-left text-sm font-bold">Download PDF</th>
                </tr>
              </thead>
              <tbody>
                {reports
                  .filter(r => {
                    const fseName = (r.fse && r.fse.name ? r.fse.name : '').toLowerCase();
                    const status = r.schedule && r.schedule.status ? r.schedule.status : '';
                    const matchesSearch = !search || fseName.includes(search.toLowerCase()) || status.toLowerCase().includes(search.toLowerCase());
                    const matchesStatus = !statusFilter || status === statusFilter;
                    const reportDate = r.date ? new Date(r.date) : null;
                    const matchesDateFrom = !dateFrom || (reportDate && reportDate >= new Date(dateFrom));
                    const matchesDateTo = !dateTo || (reportDate && reportDate <= new Date(dateTo));
                    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
                  })
                  .map(r => (
                    <tr key={r._id} className="even:bg-gray-50 hover:bg-orange-50 transition-colors">
                      <td className="px-5 py-3 font-medium">{r.schedule && r.schedule.equipment && r.schedule.equipment.serialNumber}</td>
                      <td className="px-5 py-3">{r.date ? new Date(r.date).toLocaleDateString() : ''}</td>
                      <td className="px-5 py-3">{r.fse && r.fse.name}</td>
                      <td className="px-5 py-3">{r.schedule && r.schedule.status}</td>
                      <td className="px-5 py-3 flex gap-2">
                        <button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700" onClick={() => handleDownloadPDF(r)}>Download PDF</button>
                        <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700" onClick={() => openDetailsModal(r)}>View Details</button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Details Modal */}
      {detailsModal && detailsReport && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-indigo-100 relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={closeDetailsModal}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-indigo-600">Service Report Details</h3>
            <div className="space-y-2">
              <div><b>Cinema Name:</b> {detailsReport.cinemaName}</div>
              <div><b>Address:</b> {detailsReport.address}</div>
              <div><b>Contact Details:</b> {detailsReport.contactDetails}</div>
              <div><b>Engineer Visited:</b> {detailsReport.engineerVisited}</div>
              <div><b>Projector Model:</b> {detailsReport.projectorModel}</div>
              <div><b>Serial No:</b> {detailsReport.serialNo}</div>
              <div><b>Lamp Model:</b> {detailsReport.lampModel}</div>
              <div><b>Lamp Hours:</b> {detailsReport.lampHours}</div>
              <div><b>Equipment:</b> {detailsReport.schedule && detailsReport.schedule.equipment && detailsReport.schedule.equipment.serialNumber}</div>
              <div><b>Site:</b> {detailsReport.schedule && detailsReport.schedule.site && detailsReport.schedule.site.name}</div>
              <div><b>FSE:</b> {detailsReport.fse && detailsReport.fse.name}</div>
              <div><b>Status:</b> {detailsReport.schedule && detailsReport.schedule.status}</div>
              <div><b>Date:</b> {detailsReport.date ? new Date(detailsReport.date).toLocaleDateString() : ''}</div>
              <div><b>Remarks/Observations:</b>
                <ul className="list-disc ml-6">
                  {detailsReport.remarks && detailsReport.remarks.map((r, idx) => <li key={idx}>{r}</li>)}
                </ul>
              </div>
              <div><b>Photos:</b>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detailsReport.photos && detailsReport.photos.map((photo, idx) => (
                    <img key={idx} src={`http://localhost:3000/${photo}`} alt="Report" className="w-32 h-32 object-cover rounded border" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 