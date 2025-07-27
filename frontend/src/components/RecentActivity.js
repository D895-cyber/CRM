import React, { useState, useEffect } from 'react';
import { Clock, FileText, User, Calendar, TrendingUp } from 'lucide-react';
import axios from 'axios';

const RecentActivity = ({ user }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch recent vouchers
      const vouchersRes = await axios.get('http://localhost:3000/api/vouchers?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch recent schedules
      const schedulesRes = await axios.get('http://localhost:3000/api/schedule?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Combine and format activities
      const voucherActivities = vouchersRes.data.map(v => ({
        id: v._id,
        type: 'voucher',
        title: `Voucher submitted by ${v.fseName}`,
        description: `Amount: ₹${v.amount} - ${v.description}`,
        date: new Date(v.createdAt),
        status: v.status,
        icon: FileText
      }));

      const scheduleActivities = schedulesRes.data.map(s => ({
        id: s._id,
        type: 'schedule',
        title: `Schedule created for ${s.equipment?.serialNumber || 'Equipment'}`,
        description: `Site: ${s.site?.name || 'Unknown'} - Date: ${s.date}`,
        date: new Date(s.createdAt),
        status: s.status,
        icon: Calendar
      }));

      const allActivities = [...voucherActivities, ...scheduleActivities]
        .sort((a, b) => b.date - a.date)
        .slice(0, 10);

      setActivities(allActivities);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
      case 'Completed':
        return 'text-green-600 bg-green-100';
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        <TrendingUp className="w-5 h-5 text-teal-600" />
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <IconComponent className="w-4 h-4 text-teal-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">
                      {formatDate(activity.date)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentActivity; 