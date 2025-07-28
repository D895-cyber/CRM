import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  BarChart3, 
  Activity, 
  Zap, 
  ChevronDown,
  Clock,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Star,
  Award,
  Target,
  Globe,
  Cpu,
  BarChart,
  Bell,
  RefreshCw,
  ArrowUpRight,
  Search
} from 'lucide-react';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';

export default function Dashboard({ user, showToast, onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Add null check for user object after all hooks
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      key: 'clients',
      title: 'Clients',
      desc: 'Manage client information',
      icon: <Globe className="h-6 w-6" />,
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700',
      onClick: () => navigate('/clients'),
      stats: '24 Active Clients',
      roles: ['Admin', 'Manager']
    },
    {
      key: 'equipment',
      title: 'Equipment',
      desc: 'Track equipment details',
      icon: <Cpu className="h-6 w-6" />,
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'from-green-600 to-green-700',
      onClick: () => navigate('/equipment'),
      stats: '156 Total Equipment',
      roles: ['Admin', 'Manager']
    },
    {
      key: 'spare-parts',
      title: 'Spare Parts',
      desc: 'Manage inventory',
      icon: <Target className="h-6 w-6" />,
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700',
      onClick: () => navigate('/spare-parts'),
      stats: '89 Available Parts',
      roles: ['Admin', 'Manager']
    },
    {
      key: 'schedule',
      title: 'Schedule',
      desc: 'Service scheduling',
      icon: <Award className="h-6 w-6" />,
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'from-orange-600 to-orange-700',
      onClick: () => navigate('/schedule'),
      stats: '12 Pending Tasks',
      roles: ['Admin', 'Manager']
    },
    {
      key: 'reports',
      title: 'Reports',
      desc: 'View analytics',
      icon: <BarChart className="h-6 w-6" />,
      gradient: 'from-red-500 to-red-600',
      hoverGradient: 'from-red-600 to-red-700',
      onClick: () => navigate('/equipment-reports'),
      stats: 'Monthly Analytics',
      roles: ['Admin', 'Manager']
    },
    {
      key: 'users',
      title: 'Users',
      desc: 'Manage team members',
      icon: <Zap className="h-6 w-6" />,
      gradient: 'from-indigo-500 to-indigo-600',
      hoverGradient: 'from-indigo-600 to-indigo-700',
      onClick: () => navigate('/users'),
      stats: '8 Team Members',
      roles: ['Admin']
    },
    {
      key: 'master-spare-parts',
      title: 'Master Spare Parts',
      desc: 'Centralized inventory',
      icon: <Target className="h-6 w-6" />,
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700',
      onClick: () => navigate('/master-spare-parts'),
      roles: ['Admin', 'Manager']
    },
    {
      key: 'data-import',
      title: 'Data Import',
      desc: 'Import spare parts from Excel',
      icon: <BarChart className="h-6 w-6" />,
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'from-green-600 to-emerald-700',
      onClick: () => navigate('/data-import'),
      roles: ['Admin']
    }
  ].filter(card => !card.roles || card.roles.includes(user?.role));

  const downloadTemplate = () => {
    const templateData = [
      {
        'Part Number': '003-004655-01',
        'Name': 'Projector Lamp',
        'Category': 'Lamp',
        'Model': 'CP2215',
        'Manufacturer': 'Epson',
        'Supplier': 'TechParts Inc',
        'Available Quantity': '10',
        'Unit Price': '150.00'
      },
      {
        'Part Number': '003-104029-01',
        'Name': 'Projector Filter',
        'Category': 'Filter',
        'Model': 'CP2220',
        'Manufacturer': 'Epson',
        'Supplier': 'TechParts Inc',
        'Available Quantity': '5',
        'Unit Price': '25.00'
      }
    ];

    const csvContent = [
      Object.keys(templateData[0]).join(','),
      ...templateData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spare-parts-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    navigate('/login');
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownItemClick = (action) => {
    setDropdownOpen(false);
    switch (action) {
      case 'system-status':
        // Scroll to system status section
        document.getElementById('system-status')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'quick-settings':
        // Scroll to quick settings section
        document.getElementById('quick-settings')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'performance':
        // Scroll to performance section
        document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* FSE Navigation Bar */}
      {user?.role === 'FSE' && (
        <nav className="flex items-center justify-between bg-white shadow px-6 py-4 mb-8 border-b border-gray-100">
          <div className="flex gap-4">
            <button className="text-lg font-bold text-teal-700 hover:text-blue-700 transition" onClick={() => navigate('/fse-schedule')}>My Jobs</button>
            <button className="text-lg font-bold text-indigo-700 hover:text-blue-700 transition" onClick={() => navigate('/my-reports')}>My Reports</button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium text-lg">{user?.name} ({user?.role})</span>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition" onClick={handleLogout}>Logout</button>
          </div>
        </nav>
      )}

      {/* Professional Navbar */}
      <nav className="bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                {/* Logo with Dropdown */}
                <div className="relative dropdown-container">
                  <button
                    onClick={handleDropdownToggle}
                    className="flex items-center space-x-4 hover:bg-gray-50 rounded-xl p-2 transition-all duration-300 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Field Service CRM
                      </h1>
                      <p className="text-sm text-gray-500 font-medium">Enterprise Management System</p>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-700">Quick Navigation</p>
                      </div>
                      <div className="py-2">
                        <button
                          onClick={() => handleDropdownItemClick('system-status')}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200"
                        >
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">System Status</p>
                            <p className="text-xs text-gray-500">View system health</p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleDropdownItemClick('quick-settings')}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200"
                        >
                          <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                            <Settings className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Quick Settings</p>
                            <p className="text-xs text-gray-500">Manage preferences</p>
                          </div>
                        </button>
                        <button
                          onClick={() => handleDropdownItemClick('performance')}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors duration-200"
                        >
                          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">Performance</p>
                            <p className="text-xs text-gray-500">View metrics</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden lg:flex relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search modules, reports, or data..."
                  className="w-80 pl-12 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm shadow-lg"
                />
              </div>
              <button className="relative p-3 text-gray-600 hover:text-gray-800 transition-colors bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </span>
              </button>
              <div className="flex items-center space-x-4 bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30 shadow-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-gray-800">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize font-medium">{user?.role || 'User'}</p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2 text-sm shadow-lg"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Section */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-300" />
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Welcome back</p>
                      <p className="text-white/80 text-xs">Last login: Today, 9:30 AM</p>
                    </div>
                  </div>
                  
                  <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                    Good morning, {user?.name || 'User'}! 👋
                  </h2>
                  <p className="text-blue-100 text-xl mb-6 max-w-2xl">
                    Your field service operations are running smoothly. Here's your comprehensive overview for today.
                  </p>
                  
                  {/* Quick Stats Row */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-300" />
                        <div>
                          <p className="text-2xl font-bold">24</p>
                          <p className="text-blue-100 text-sm">Active Services</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-yellow-300" />
                        <div>
                          <p className="text-2xl font-bold">8</p>
                          <p className="text-blue-100 text-sm">Pending Tasks</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-green-300" />
                        <div>
                          <p className="text-2xl font-bold">₹2.4M</p>
                          <p className="text-blue-100 text-sm">Monthly Revenue</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:ml-8 flex flex-col space-y-4">
                  <button className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-all">
                    <RefreshCw className="h-6 w-6" />
                  </button>
                  <button className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-all">
                    <Settings className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Quick Access Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/data-import')}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl hover:bg-white/30 transition-all font-semibold flex items-center space-x-3 shadow-lg"
                >
                  <BarChart className="h-5 w-5" />
                  <span>Import Data</span>
                </button>
                <button
                  onClick={downloadTemplate}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl hover:bg-white/30 transition-all font-semibold flex items-center space-x-3 shadow-lg"
                >
                  <BarChart className="h-5 w-5" />
                  <span>Download Template</span>
                </button>
                <button
                  onClick={() => navigate('/equipment-reports')}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl hover:bg-white/30 transition-all font-semibold flex items-center space-x-3 shadow-lg"
                >
                  <BarChart className="h-5 w-5" />
                  <span>View Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dashboard Stats */}
        <div className="mb-10">
          <DashboardStats user={user} />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Quick Actions */}
          <div className="xl:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">Quick Actions</h3>
                  <p className="text-gray-600 text-lg">Access your most used features and modules</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                  <button
                    key={card.key}
                    onClick={card.onClick}
                    className={`group relative overflow-hidden bg-gradient-to-br ${card.gradient} hover:${card.hoverGradient} text-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="mb-6 group-hover:scale-110 transition-transform duration-500">
                        {card.icon}
                      </div>
                      <div className="text-xl font-bold mb-3 group-hover:text-white transition-colors duration-300">
                        {card.title}
                      </div>
                      <div className="text-white/90 text-sm mb-4 group-hover:text-white transition-colors duration-300">
                        {card.desc}
                      </div>
                      <div className="text-white/70 text-xs font-medium group-hover:text-white/90 transition-colors duration-300">
                        {card.stats}
                      </div>
                    </div>
                    
                    {/* Hover Arrow */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                      <ArrowUpRight className="h-6 w-6" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity & Quick Stats */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Recent Activity</h3>
                  <p className="text-gray-600">Latest updates and notifications</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Activity className="h-7 w-7 text-white" />
                </div>
              </div>
              <RecentActivity user={user} />
            </div>


          </div>
        </div>


      </div>
    </div>
  );
} 