import { Users, MapPin, Settings, RefreshCw, FileText, CalendarClock, CheckSquare, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  if (!user) return null; // or a loading spinner, or redirect
  const isRMAUser = user.role === 'Admin' || user.role === 'Manager';
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };
  const cards = [
    {
      key: 'clients',
      icon: <Users className="h-8 w-8 text-blue-600" />, 
      title: 'Clients',
      desc: 'Manage your clients and their details.',
    },
    {
      key: 'sites',
      icon: <MapPin className="h-8 w-8 text-green-600" />, 
      title: 'Sites',
      desc: 'View and manage client sites.',
    },
    {
      key: 'equipment',
      icon: <Settings className="h-8 w-8 text-teal-600" />, 
      title: 'Equipment',
      desc: 'Track and update equipment inventory.',
    },
    {
      key: 'voucher',
      icon: <FileText className="h-8 w-8 text-purple-600" />, 
      title: 'Vouchers',
      desc: 'Submit and track vouchers.',
      onClick: () => navigate('/vouchers'),
    },
  ];
  if (isRMAUser) {
    cards.push({
      key: 'rma',
      icon: <RefreshCw className="h-8 w-8 text-orange-600" />, 
      title: 'RMA',
      desc: 'Manage RMA requests and replacements.',
    });
  }
  if (user.role === 'Admin') {
    cards.push({
      key: 'users',
      icon: <Users className="h-8 w-8 text-pink-600" />, 
      title: 'Users',
      desc: 'Add or remove users (Admin only).',
    });
  }
  if (user.role === 'Admin' || user.role === 'Service Coordinator') {
    cards.push({
      key: 'schedule',
      icon: <CalendarClock className="h-8 w-8 text-indigo-600" />, 
      title: 'Schedule',
      desc: 'Assign and manage service jobs.',
    });
  }
  if (user.role === 'FSE') {
    cards.push({
      key: 'fse-schedule',
      icon: <CalendarClock className="h-8 w-8 text-indigo-600" />, 
      title: 'My Schedule',
      desc: 'View and complete your assigned jobs.',
    });
  }
  if (user.role === 'Admin') {
    cards.push({
      key: 'attendance',
      icon: <CheckSquare className="h-8 w-8 text-green-600" />, 
      title: 'FSE Attendance',
      desc: 'View FSE attendance by schedule.',
    });
  }
  if (user.role === 'Admin') {
    cards.push({
      key: 'equipment-reports',
      icon: <FileText className="h-8 w-8 text-orange-600" />, 
      title: 'Equipment Reports',
      desc: 'View and download reports by equipment.',
    });
  }
  if (user.role === 'Admin') {
    cards.push({
      key: 'warranty-ew',
      icon: <Shield className="h-8 w-8 text-blue-600" />, 
      title: 'Warranty & EW Tracking',
      desc: 'Track and renew equipment warranties.',
    });
  }
  if (user.role === 'Admin' || user.role === 'Manager') {
    cards.push({
      key: 'voucher-review',
      icon: <FileText className="h-8 w-8 text-red-600" />, 
      title: 'Voucher Review',
      desc: 'Review and approve all vouchers.',
      onClick: () => navigate('/voucher-review'),
    });
  }

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
      {/* Dashboard content */}
      <div className="max-w-5xl mx-auto mt-12 p-6">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center tracking-tight">CRM Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {cards.map(card => (
            <button
              key={card.key}
              onClick={card.onClick ? card.onClick : () => navigate('/' + card.key)}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center hover:shadow-2xl hover:-translate-y-1 transition-all group focus:outline-none"
            >
              <div className="mb-4 group-hover:scale-110 transition-transform">{card.icon}</div>
              <div className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-700">{card.title}</div>
              <div className="text-gray-500 text-center text-sm">{card.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 