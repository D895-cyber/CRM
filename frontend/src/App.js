import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Sites from './components/Sites';
import Equipment from './components/Equipment';
import RMA from './components/RMA';
import Users from './components/Users';
import Schedule from './components/Schedule';
import FseSchedule from './components/FseSchedule';
import Attendance from './components/Attendance';
import EquipmentReports from './components/EquipmentReports';
import WarrantyEW from './components/WarrantyEW';
import VoucherManagement from './components/VoucherManagement';
import VoucherReviewTable from './components/VoucherReviewTable';
// import other components as needed

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleLogout = () => setUser(null);

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLogin={user => setUser(user)} />}
      />
      <Route
        path="/signup"
        element={<Signup />}
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard user={user} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <PrivateRoute>
            <Clients user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/sites"
        element={
          <PrivateRoute>
            <Sites user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/equipment"
        element={
          <PrivateRoute>
            <Equipment user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      {/* Add RMA route if not present */}
      <Route
        path="/rma"
        element={
          <PrivateRoute>
            <RMA user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute>
            <Users user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <PrivateRoute>
            <Schedule user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/fse-schedule"
        element={
          <PrivateRoute>
            <FseSchedule user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <Attendance user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/equipment-reports"
        element={
          <PrivateRoute>
            <EquipmentReports user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/warranty-ew"
        element={
          <PrivateRoute>
            <WarrantyEW user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      {/* Voucher routes */}
      <Route
        path="/vouchers"
        element={
          <PrivateRoute>
            <VoucherManagement user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/voucher-review"
        element={
          <PrivateRoute>
            <VoucherReviewTable user={user} showToast={() => {}} onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      {/* Add more protected routes here, wrapped in <PrivateRoute> */}
      <Route
        path="/"
        element={localStorage.getItem('token') ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />
      <Route
        path="*"
        element={<Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;