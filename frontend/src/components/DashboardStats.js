import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Users, Wrench, Calendar, FileText, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';

export default function DashboardStats({ user }) {
  const [stats, setStats] = useState({
    totalVouchers: 0,
    totalClients: 0,
    totalEquipment: 0,
    totalSchedules: 0,
    pendingVouchers: 0,
    completedSchedules: 0,
    totalAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch vouchers and clients (these should work for all users)
      const [vouchersRes, clientsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/vouchers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      let equipmentRes = { data: [] };
      let schedulesRes = { data: [] };

      // Try to fetch equipment and schedules (Admin/Manager only)
      try {
        equipmentRes = await axios.get('http://localhost:3000/api/equipment', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.log('Equipment access not available for this user role');
      }

      try {
        schedulesRes = await axios.get('http://localhost:3000/api/schedule', {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.log('Schedule access not available for this user role');
      }

      const vouchers = vouchersRes.data;
      const clients = clientsRes.data;
      const equipment = equipmentRes.data;
      const schedules = schedulesRes.data;

      // Calculate statistics
      const pendingVouchers = vouchers.filter(v => v.status === 'pending').length;
      const completedSchedules = schedules.filter(s => s.status === 'completed').length;
      const totalAmount = vouchers.reduce((sum, v) => sum + (v.amount || 0), 0);

      setStats({
        totalVouchers: vouchers.length,
        totalClients: clients.length,
        totalEquipment: equipment.length,
        totalSchedules: schedules.length,
        pendingVouchers,
        completedSchedules,
        totalAmount
      });
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const statCards = [
    {
      title: 'Total Vouchers',
      value: stats.totalVouchers,
      icon: <FileText className="h-6 w-6" />,
      gradient: 'from-blue-500 to-blue-600',
      trend: '+12%',
      trendUp: true,
      onClick: () => navigate('/vouchers')
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: <Users className="h-6 w-6" />,
      gradient: 'from-emerald-500 to-emerald-600',
      trend: '+8%',
      trendUp: true,
      onClick: () => navigate('/clients')
    },
    {
      title: 'Total Equipment',
      value: stats.totalEquipment,
      icon: <Wrench className="h-6 w-6" />,
      gradient: 'from-orange-500 to-orange-600',
      trend: '+15%',
      trendUp: true,
      onClick: () => navigate('/equipment')
    },
    {
      title: 'Total Schedules',
      value: stats.totalSchedules,
      icon: <Calendar className="h-6 w-6" />,
      gradient: 'from-purple-500 to-purple-600',
      trend: '+5%',
      trendUp: true,
      onClick: () => navigate('/schedule')
    },
    {
      title: 'Pending Vouchers',
      value: stats.pendingVouchers,
      icon: <Clock className="h-6 w-6" />,
      gradient: 'from-amber-500 to-amber-600',
      trend: '-3%',
      trendUp: false,
      onClick: () => navigate('/vouchers')
    },
    {
      title: 'Completed Jobs',
      value: stats.completedSchedules,
      icon: <CheckCircle className="h-6 w-6" />,
      gradient: 'from-green-500 to-green-600',
      trend: '+20%',
      trendUp: true,
      onClick: () => navigate('/schedule')
    },
    {
      title: 'Total Amount',
      value: `₹${stats.totalAmount.toLocaleString()}`,
      icon: <DollarSign className="h-6 w-6" />,
      gradient: 'from-indigo-500 to-indigo-600',
      trend: '+18%',
      trendUp: true,
      onClick: () => navigate('/vouchers')
    },
    {
      title: 'Active Operations',
      value: stats.totalSchedules - stats.completedSchedules,
      icon: <Activity className="h-6 w-6" />,
      gradient: 'from-pink-500 to-pink-600',
      trend: '+7%',
      trendUp: true,
      onClick: () => navigate('/schedule')
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-24 h-6 bg-gray-200 rounded"></div>
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-600">Key metrics and performance indicators</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2"
        >
          <Activity className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <button
            key={card.title}
            onClick={card.onClick}
            className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {card.icon}
                </div>
                <div className="flex items-center space-x-1">
                  {card.trendUp ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs font-semibold ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                  {card.value}
                </p>
              </div>
            </div>
            
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        ))}
      </div>
    </div>
  );
} 