import React, { useState, useEffect } from 'react';
import { Users, Building, Package, Wrench } from 'lucide-react';
import axios from 'axios';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalSites: 0,
    totalEquipment: 0,
    totalSpareParts: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [clientsRes, sitesRes, equipmentRes, sparePartsRes] = await Promise.all([
        axios.get('/api/clients'),
        axios.get('/api/sites'),
        axios.get('/api/equipment'),
        axios.get('/api/spare-parts')
      ]);

      setStats({
        totalClients: clientsRes.data.length,
        totalSites: sitesRes.data.length,
        totalEquipment: equipmentRes.data.length,
        totalSpareParts: sparePartsRes.data.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Sites',
      value: stats.totalSites,
      icon: <Building className="h-6 w-6" />,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Equipment',
      value: stats.totalEquipment,
      icon: <Package className="h-6 w-6" />,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Total Spare Parts',
      value: stats.totalSpareParts,
      icon: <Wrench className="h-6 w-6" />,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} text-white`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 