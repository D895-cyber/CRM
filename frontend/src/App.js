import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Sites from './components/Sites';
import Equipment from './components/Equipment';
import RMA from './components/RMA';
import MasterSpareParts from './components/MasterSpareParts';
import Users from './components/Users';
import Schedule from './components/Schedule';
import FseSchedule from './components/FseSchedule';
import Attendance from './components/Attendance';
import EquipmentReports from './components/EquipmentReports';
import WarrantyEW from './components/WarrantyEW';
import VoucherManagement from './components/VoucherManagement';
import VoucherReviewTable from './components/VoucherReviewTable';
import DataImport from './components/DataImport';
import SpareParts from './components/SpareParts';
import Toast from './components/Toast';
import MyReports from './components/MyReports';
// import other components as needed

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
  
  // Try to parse user data
  try {
    const user = JSON.parse(userStr);
    if (!user || !user.role) {
      console.error('PrivateRoute: Invalid user data:', user);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" />;
    }
  } catch (error) {
    console.error('PrivateRoute: Failed to parse user data:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      console.log('App: Loaded user from localStorage:', parsed);
      return parsed;
    } catch (error) {
      console.error('App: Failed to parse user from localStorage:', error);
      localStorage.removeItem('user');
      return null;
    }
  });

  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleLogout = () => setUser(null);

  return (
    <>
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}

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
              <Clients user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/sites"
          element={
            <PrivateRoute>
              <Sites user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <PrivateRoute>
              <Equipment user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        {/* Add RMA route if not present */}
        <Route
          path="/rma"
          element={
            <PrivateRoute>
              <RMA user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/master-spare-parts"
          element={
            <PrivateRoute>
              <MasterSpareParts user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Users user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <PrivateRoute>
              <Schedule user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/fse-schedule"
          element={
            <PrivateRoute>
              <FseSchedule user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute>
              <Attendance user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/equipment-reports"
          element={
            <PrivateRoute>
              <EquipmentReports user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/warranty-ew"
          element={
            <PrivateRoute>
              <WarrantyEW user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        {/* Voucher routes */}
        <Route
          path="/vouchers"
          element={
            <PrivateRoute>
              <VoucherManagement user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/voucher-review"
          element={
            <PrivateRoute>
              <VoucherReviewTable user={user} showToast={showToast} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
                <Route
            path="/data-import"
            element={
              <PrivateRoute>
                <DataImport user={user} showToast={showToast} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/spare-parts"
            element={
              <PrivateRoute>
                <SpareParts user={user} showToast={showToast} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-reports"
            element={
              <PrivateRoute>
                <MyReports user={user} showToast={showToast} onLogout={handleLogout} />
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
    </>
  );
}

export default App;