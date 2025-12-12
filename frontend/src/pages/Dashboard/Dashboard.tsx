import React, { useEffect, useState } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Truck, Package, Route as RouteIcon, Wrench } from 'lucide-react';
import { dashboardService, type DashboardStats } from '../../services/dashboardService';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStatistics();
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dashboardCards = stats ? [
    { 
      name: 'Camions Total', 
      value: (stats.trucks?.total || 0).toString(), 
      subtitle: `${stats.trucks?.available || 0} disponibles`,
      icon: Truck, 
      color: 'bg-blue-500' 
    },
    { 
      name: 'Remorques Total', 
      value: (stats.trailers?.total || 0).toString(), 
      subtitle: `${stats.trailers?.available || 0} disponibles`,
      icon: Package, 
      color: 'bg-green-500' 
    },
    { 
      name: 'Routes Actives', 
      value: (stats.routes?.active || 0).toString(), 
      subtitle: `${stats.routes?.total || 0} total`,
      icon: RouteIcon, 
      color: 'bg-yellow-500' 
    },
    { 
      name: 'En Maintenance', 
      value: (stats.trucks?.maintenance || 0).toString(), 
      subtitle: `${stats.maintenance?.inProgress || 0} camions`,
      icon: Wrench, 
      color: 'bg-red-500' 
    },
  ] : [];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

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
          {dashboardCards.map((stat) => (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
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
                      {stat.subtitle && (
                        <dd className="text-sm text-gray-600 mt-1">
                          {stat.subtitle}
                        </dd>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Truck Status Breakdown */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  État des Camions
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Disponibles</span>
                    <span className="font-semibold text-green-600">{stats.trucks.available}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">En Route</span>
                    <span className="font-semibold text-blue-600">{stats.trucks.inRoute}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">En Maintenance</span>
                    <span className="font-semibold text-orange-600">{stats.trucks.maintenance}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hors Service</span>
                    <span className="font-semibold text-red-600">{stats.trucks.outOfService}</span>
                  </div>
                </div>
              </div>

              {/* Routes Status */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  État des Routes
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Planifiées</span>
                    <span className="font-semibold text-purple-600">{stats.routes.planned || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">En Cours</span>
                    <span className="font-semibold text-yellow-600">{stats.routes.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Complétées</span>
                    <span className="font-semibold text-green-600">{stats.routes.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Annulées</span>
                    <span className="font-semibold text-red-600">{stats.routes.cancelled}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Fuel Analytics */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 shadow rounded-lg p-6 text-white">
                <h3 className="text-lg font-medium mb-4">Carburant Total</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Volume</span>
                    <span className="text-2xl font-bold">{stats.routes.totalFuel?.toFixed(0) || 0} L</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Coût</span>
                    <span className="text-2xl font-bold">{stats.routes.totalFuelCost?.toFixed(0) || 0} DH</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-400">
                    <div className="text-sm text-blue-100">Consommation Moyenne</div>
                    <div className="text-3xl font-bold">
                      {stats.routes.avgFuelConsumption?.toFixed(2) || 0} L/100km
                    </div>
                  </div>
                </div>
              </div>

              {/* Distance Analytics */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 shadow rounded-lg p-6 text-white">
                <h3 className="text-lg font-medium mb-4">Distance Parcourue</h3>
                <div className="space-y-2">
                  <div className="text-5xl font-bold mb-4">
                    {(stats.routes.totalDistance || 0).toLocaleString()} km
                  </div>
                  <div className="text-sm text-green-100">Routes Complétées</div>
                  <div className="text-2xl font-semibold">{stats.routes.completed}</div>
                  <div className="mt-4 pt-4 border-t border-green-400">
                    <div className="text-sm text-green-100">Distance Moyenne</div>
                    <div className="text-2xl font-bold">
                      {stats.routes.completed > 0 
                        ? ((stats.routes.totalDistance || 0) / stats.routes.completed).toFixed(0)
                        : 0} km
                    </div>
                  </div>
                </div>
              </div>

              {/* Fleet Efficiency */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 shadow rounded-lg p-6 text-white">
                <h3 className="text-lg font-medium mb-4">Efficacité de la Flotte</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-purple-100">Taux d'Utilisation</div>
                    <div className="text-3xl font-bold">
                      {stats.trucks.total > 0 
                        ? ((stats.trucks.inRoute / stats.trucks.total) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                  <div className="pt-3 border-t border-purple-400">
                    <div className="text-sm text-purple-100">Disponibilité</div>
                    <div className="text-3xl font-bold">
                      {stats.trucks.total > 0 
                        ? ((stats.trucks.available / stats.trucks.total) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                  <div className="pt-3 border-t border-purple-400">
                    <div className="text-sm text-purple-100">Coût Moyen/km</div>
                    <div className="text-2xl font-bold">
                      {stats.routes.totalDistance && stats.routes.totalDistance > 0
                        ? ((stats.routes.totalFuelCost || 0) / stats.routes.totalDistance).toFixed(2)
                        : 0} DH
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trailer Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                État des Remorques
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{stats.trailers.available}</div>
                  <div className="text-sm text-gray-600 mt-1">Disponibles</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{stats.trailers.inUse}</div>
                  <div className="text-sm text-gray-600 mt-1">En Utilisation</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{stats.trailers.maintenance}</div>
                  <div className="text-sm text-gray-600 mt-1">En Maintenance</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-600">{stats.trailers.total}</div>
                  <div className="text-sm text-gray-600 mt-1">Total</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};
