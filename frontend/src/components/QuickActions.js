import React from 'react';
import { Plus, FileText, Calendar, Users, Settings, Upload, Download, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ user }) => {
  const navigate = useNavigate();

  const actions = [
    {
      key: 'add-voucher',
      icon: Plus,
      title: 'Add Voucher',
      description: 'Create a new voucher',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => navigate('/vouchers'),
      roles: ['Admin', 'Manager', 'FSE']
    },
    {
      key: 'add-client',
      icon: Users,
      title: 'Add Client',
      description: 'Register a new client',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => navigate('/clients'),
      roles: ['Admin', 'Manager']
    },
    {
      key: 'add-equipment',
      icon: Settings,
      title: 'Add Equipment',
      description: 'Register new equipment',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => navigate('/equipment'),
      roles: ['Admin', 'Manager']
    },
    {
      key: 'create-schedule',
      icon: Calendar,
      title: 'Create Schedule',
      description: 'Schedule a service job',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => navigate('/schedule'),
      roles: ['Admin', 'Service Coordinator']
    },
    {
      key: 'import-data',
      icon: Upload,
      title: 'Import Data',
      description: 'Import from Excel/CSV',
      color: 'bg-teal-500 hover:bg-teal-600',
      onClick: () => navigate('/data-import'),
      roles: ['Admin']
    },
    {
      key: 'export-reports',
      icon: Download,
      title: 'Export Reports',
      description: 'Download reports',
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => {
        // TODO: Implement export functionality
        alert('Export functionality coming soon!');
      },
      roles: ['Admin', 'Manager']
    },
    {
      key: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'View all notifications',
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => {
        // TODO: Implement notifications
        alert('Notifications coming soon!');
      },
      roles: ['Admin', 'Manager', 'FSE']
    },
    {
      key: 'view-reports',
      icon: FileText,
      title: 'View Reports',
      description: 'Analytics & reports',
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => navigate('/equipment-reports'),
      roles: ['Admin']
    }
  ];

  // Filter actions based on user role
  const userActions = actions.filter(action => 
    action.roles.includes(user?.role)
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.key}
              onClick={action.onClick}
              className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              <div className="flex flex-col items-center text-center">
                <IconComponent className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{action.title}</span>
                <span className="text-xs opacity-90 mt-1">{action.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions; 