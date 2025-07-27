import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Wrench, Calendar, Upload, Download, Bell, BarChart3, FileText, Settings, Zap, Target } from 'lucide-react';

export default function QuickActions({ user }) {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Add Voucher',
      description: 'Create a new expense voucher',
      icon: <Plus className="h-6 w-6" />,
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'from-blue-600 to-blue-700',
      onClick: () => navigate('/vouchers'),
      roles: ['Admin', 'Manager', 'FSE']
    },
    {
      title: 'Add Client',
      description: 'Register a new client',
      icon: <UserPlus className="h-6 w-6" />,
      gradient: 'from-emerald-500 to-emerald-600',
      hoverGradient: 'from-emerald-600 to-emerald-700',
      onClick: () => navigate('/clients'),
      roles: ['Admin', 'Manager']
    },
    {
      title: 'Add Equipment',
      description: 'Register new equipment',
      icon: <Wrench className="h-6 w-6" />,
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'from-orange-600 to-orange-700',
      onClick: () => navigate('/equipment'),
      roles: ['Admin', 'Manager']
    },
    {
      title: 'Create Schedule',
      description: 'Schedule a service job',
      icon: <Calendar className="h-6 w-6" />,
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'from-purple-600 to-purple-700',
      onClick: () => navigate('/schedule'),
      roles: ['Admin', 'Service Coordinator']
    },
    {
      title: 'Import Data',
      description: 'Import from Excel/CSV',
      icon: <Upload className="h-6 w-6" />,
      gradient: 'from-cyan-500 to-cyan-600',
      hoverGradient: 'from-cyan-600 to-cyan-700',
      onClick: () => navigate('/data-import'),
      roles: ['Admin', 'Manager']
    },
    {
      title: 'Export Reports',
      description: 'Download reports',
      icon: <Download className="h-6 w-6" />,
      gradient: 'from-indigo-500 to-indigo-600',
      hoverGradient: 'from-indigo-600 to-indigo-700',
      onClick: () => navigate('/equipment-reports'),
      roles: ['Admin', 'Manager']
    },
    {
      title: 'Notifications',
      description: 'View all notifications',
      icon: <Bell className="h-6 w-6" />,
      gradient: 'from-pink-500 to-pink-600',
      hoverGradient: 'from-pink-600 to-pink-700',
      onClick: () => navigate('/notifications'),
      roles: ['Admin', 'Manager', 'FSE']
    },
    {
      title: 'View Reports',
      description: 'Analytics & reports',
      icon: <BarChart3 className="h-6 w-6" />,
      gradient: 'from-violet-500 to-violet-600',
      hoverGradient: 'from-violet-600 to-violet-700',
      onClick: () => navigate('/reports'),
      roles: ['Admin', 'Manager']
    }
  ];

  const filteredActions = actions.filter(action => 
    action.roles.includes(user.role)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
          <p className="text-gray-600">Common tasks and shortcuts</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <Zap className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {filteredActions.map((action, index) => (
          <button
            key={action.title}
            onClick={action.onClick}
            className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20`}
            style={{
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  {action.icon}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors duration-300">
                  {action.description}
                </p>
              </div>
            </div>
            
            {/* Hover Arrow */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Target className="h-3 w-3 text-white" />
              </div>
            </div>
            
            {/* Gradient Overlay on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.hoverGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredActions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Quick Actions Available</h3>
          <p className="text-gray-500">Quick actions will appear here based on your role and permissions.</p>
        </div>
      )}
    </div>
  );
} 