import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, FileText, Calendar, TrendingUp, Activity, AlertCircle } from 'lucide-react';

export default function RecentActivity({ user }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch recent vouchers and schedules
      const [vouchersRes, schedulesRes] = await Promise.all([
        axios.get('http://localhost:3000/api/vouchers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/schedule', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      const vouchers = vouchersRes.data.slice(0, 5);
      const schedules = schedulesRes.data.slice(0, 5);

      // Combine and format activities
      const allActivities = [
        ...vouchers.map(v => ({
          id: v._id,
          type: 'voucher',
          title: `Voucher submitted`,
          subtitle: `Amount: ₹${v.amount || 0}`,
          status: v.status,
          date: new Date(v.createdAt),
          icon: <FileText className="h-4 w-4" />
        })),
        ...schedules.map(s => ({
          id: s._id,
          type: 'schedule',
          title: `Schedule created`,
          subtitle: s.equipment?.name || 'Equipment',
          status: s.status,
          date: new Date(s.date),
          icon: <Calendar className="h-4 w-4" />
        }))
      ];

      // Sort by date (most recent first)
      allActivities.sort((a, b) => b.date - a.date);
      
      setActivities(allActivities.slice(0, 8));
      setError('');
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setError('Failed to load recent activity');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-amber-600 bg-amber-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          <p className="text-sm text-gray-500">Latest updates</p>
        </div>
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <Activity className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-3 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-red-700 text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Activities List */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className="group relative bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/80 transition-all duration-300 hover:shadow-lg"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Activity Icon */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {activity.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(activity.date)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 truncate">
                    {activity.subtitle}
                  </p>
                  
                  {activity.status && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            </div>
          ))
        )}
      </div>

      {/* View All Button */}
      {activities.length > 0 && (
        <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2">
          <TrendingUp className="h-4 w-4" />
          <span>View All Activity</span>
        </button>
      )}
    </div>
  );
} 