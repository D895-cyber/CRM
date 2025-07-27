import React, { useState } from 'react';
import { Users, MapPin, Settings, RefreshCw, FileText, CalendarClock, CheckSquare, Shield, Upload, TrendingUp, Activity, Database, BarChart3, Bell, Download, Plus, UserPlus, Wrench, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RecentActivity from './RecentActivity';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const cards = [
    {
      key: 'users',
      icon: <Users className="h-6 w-6" />,
      title: 'Users',
      desc: 'Manage team members and roles',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700',
      onClick: () => navigate('/users'),
    },
    {
      key: 'clients',
      icon: <UserPlus className="h-6 w-6" />,
      title: 'Clients',
      desc: 'Manage client information',
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'from-emerald-600 to-emerald-700',
      onClick: () => navigate('/clients'),
    },
    {
      key: 'sites',
      icon: <MapPin className="h-6 w-6" />,
      title: 'Sites',
      desc: 'Manage client sites',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700',
      onClick: () => navigate('/sites'),
    },
    {
      key: 'equipment',
      icon: <Wrench className="h-6 w-6" />,
      title: 'Equipment',
      desc: 'Manage equipment inventory',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'from-orange-600 to-orange-700',
      onClick: () => navigate('/equipment'),
    },
    {
      key: 'schedule',
      icon: <Calendar className="h-6 w-6" />,
      title: 'Schedule',
      desc: 'Manage service schedules',
      gradient: 'from-indigo-500 to-indigo-600',
      hoverGradient: 'from-indigo-600 to-indigo-700',
      onClick: () => navigate('/schedule'),
    },
    {
      key: 'attendance',
      icon: <CheckSquare className="h-6 w-6" />,
      title: 'FSE Attendance',
      desc: 'Track field service attendance',
      gradient: 'from-teal-500 to-teal-600',
      hoverGradient: 'from-teal-600 to-teal-700',
      onClick: () => navigate('/attendance'),
    },
    {
      key: 'rma',
      icon: <Shield className="h-6 w-6" />,
      title: 'RMA',
      desc: 'Manage warranty claims',
      gradient: 'from-red-500 to-red-600',
      hoverGradient: 'from-red-600 to-red-700',
      onClick: () => navigate('/rma'),
    },
    {
      key: 'warranty',
      icon: <RefreshCw className="h-6 w-6" />,
      title: 'Warranty & EW',
      desc: 'Track warranty and extended warranty',
      gradient: 'from-pink-500 to-pink-600',
      hoverGradient: 'from-pink-600 to-pink-700',
      onClick: () => navigate('/warranty'),
    },
    {
      key: 'vouchers',
      icon: <FileText className="h-6 w-6" />,
      title: 'Vouchers',
      desc: 'Manage expense vouchers',
      gradient: 'from-cyan-500 to-cyan-600',
      hoverGradient: 'from-cyan-600 to-cyan-700',
      onClick: () => navigate('/vouchers'),
    },
  ];

  if (user.role === 'Admin') {
    cards.push({
      key: 'voucher-review',
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Voucher Review',
      desc: 'Review and approve vouchers',
      gradient: 'from-violet-500 to-violet-600',
      hoverGradient: 'from-violet-600 to-violet-700',
      onClick: () => navigate('/voucher-review'),
    });
  }

  if (user.role === 'Admin') {
    cards.push({
      key: 'data-import',
      icon: <Upload className="h-6 w-6" />,
      title: 'Data Import',
      desc: 'Import data from Excel/CSV files',
      gradient: 'from-amber-500 to-amber-600',
      hoverGradient: 'from-amber-600 to-amber-700',
      onClick: () => navigate('/data-import'),
    });
  }

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogout();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    CRM Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">Field Service Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Logout</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Welcome back, {user.name}! 👋
                </h2>
                <p className="text-gray-600 text-lg">
                  Here's what's happening with your field service operations today.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Activity className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="mb-8">
          <DashboardStats user={user} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions user={user} />
        </div>

        {/* Main Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main cards */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Quick Access</h3>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                  <button
                    key={card.key}
                    onClick={card.onClick}
                    className={`group relative overflow-hidden bg-gradient-to-br ${card.gradient} hover:${card.hoverGradient} text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                        {card.icon}
                      </div>
                      <div className="text-lg font-bold mb-2 group-hover:text-white transition-colors duration-300">
                        {card.title}
                      </div>
                      <div className="text-white/90 text-sm group-hover:text-white transition-colors duration-300">
                        {card.desc}
                      </div>
                    </div>
                    
                    {/* Hover Arrow */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 h-fit sticky top-24">
              <RecentActivity user={user} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 