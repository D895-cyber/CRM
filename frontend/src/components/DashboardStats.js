import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, FileText, Calendar, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const DashboardStats = ({ user }) => {
  const [stats, setStats] = useState({
    totalVouchers: 0,
    totalClients: 0,
    totalEquipment: 0,
    totalSchedules: 0,
    pendingVouchers: 0,
    completedSchedules: 0,
    totalAmount: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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
      const totalVouchers = vouchers.length;
      const totalClients = clients.length;
      const totalEquipment = equipment.length;
      const totalSchedules = schedules.length;
      
      const pendingVouchers = vouchers.filter(v => v.status === 'Pending').length;
      const completedSchedules = schedules.filter(s => s.status === 'Completed').length;
      
      const totalAmount = vouchers.reduce((sum, v) => sum + (v.amount || 0), 0);
      
      // Calculate monthly growth (simplified)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const thisMonthVouchers = vouchers.filter(v => {
        const voucherDate = new Date(v.createdAt);
        return voucherDate.getMonth() === currentMonth && voucherDate.getFullYear() === currentYear;
      }).length;
      
      const lastMonthVouchers = vouchers.filter(v => {
        const voucherDate = new Date(v.createdAt);
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return voucherDate.getMonth() === lastMonth && voucherDate.getFullYear() === lastYear;
      }).length;
      
      const monthlyGrowth = lastMonthVouchers > 0 
        ? ((thisMonthVouchers - lastMonthVouchers) / lastMonthVouchers) * 100 
        : 0;

      setStats({
        totalVouchers,
        totalClients,
        totalEquipment,
        totalSchedules,
        pendingVouchers,
        completedSchedules,
        totalAmount,
        monthlyGrowth
      });

    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, bgColor }) => (
    <div className={`${bgColor} rounded-xl p-6 shadow-lg border border-gray-100`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(trendValue)}%
              </span>
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-12 ml-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Vouchers"
        value={stats.totalVouchers}
        icon={FileText}
        trend={stats.monthlyGrowth > 0 ? 'up' : 'down'}
        trendValue={stats.monthlyGrowth}
        color="bg-blue-500"
        bgColor="bg-white"
      />
      <StatCard
        title="Total Clients"
        value={stats.totalClients}
        icon={Users}
        color="bg-green-500"
        bgColor="bg-white"
      />
      <StatCard
        title="Total Equipment"
        value={stats.totalEquipment}
        icon={Calendar}
        color="bg-purple-500"
        bgColor="bg-white"
      />
      <StatCard
        title="Total Amount"
        value={`₹${stats.totalAmount.toLocaleString()}`}
        icon={DollarSign}
        color="bg-yellow-500"
        bgColor="bg-white"
      />
    </div>
  );
};

export default DashboardStats; 