import React from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Truck, Package, Route as RouteIcon, Wrench } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Camions', value: '12', icon: Truck, color: 'bg-blue-500' },
    { name: 'Remorques', value: '8', icon: Package, color: 'bg-green-500' },
    { name: 'Routes Actives', value: '5', icon: RouteIcon, color: 'bg-yellow-500' },
    { name: 'Maintenances', value: '3', icon: Wrench, color: 'bg-red-500' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {user?.name}!
          </h1>
          <p className="text-gray-600">Tableau de bord - {user?.role}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Activité Récente
          </h2>
          <p className="text-gray-500">
            Aucune activité récente à afficher.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};
