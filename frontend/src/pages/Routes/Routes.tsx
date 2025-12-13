import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import {
  Plus,
  MapPin,
  Calendar,
  Truck,
  Route as RouteIcon,
  Navigation,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Fuel,
  RefreshCw
} from 'lucide-react';
import { MapModal } from '../../components/routes/MapModal';
import { routeService } from '../../services/routeService';
import toast from 'react-hot-toast';

interface RouteData {
  _id?: string;
  id?: string;
  routeNumber?: string;
  departure: string;
  arrival: string;
  distance: number;
  estimatedDuration: string;
  fuelConsumption?: number;
  fuelVolume?: number;
  truck: string | any;
  driver: string | any;
  status: 'Planned' | 'InProgress' | 'Completed' | 'Cancelled';
  createdAt?: string;
  departureCoords?: { lat: number; lng: number };
  arrivalCoords?: { lat: number; lng: number };
}

export const Routes: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    totalDistance: 0,
    totalFuel: 0
  });

  // Fetch routes from backend
  useEffect(() => {
    fetchRoutes();
    fetchStatistics();
  }, [filterStatus]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await routeService.getAllRoutes({
        limit: 100,
        sort: '-createdAt',
        ...(filterStatus !== 'all' && { status: filterStatus })
      });
      
      setRoutes(response.routes || []);
    } catch (error: any) {
      console.error('Error fetching routes:', error);
      toast.error('Erreur lors du chargement des routes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const statistics = await routeService.getRouteStatistics();
      setStats({
        total: statistics.total,
        inProgress: statistics.byStatus.InProgress || 0,
        completed: statistics.byStatus.Completed || 0,
        totalDistance: statistics.totalDistance,
        totalFuel: statistics.totalFuel
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      Planned: 'bg-blue-100 text-blue-700 border-blue-200',
      InProgress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Completed: 'bg-green-100 text-green-700 border-green-200',
      Cancelled: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status: string) => {
    const texts = {
      Planned: 'Planifiée',
      InProgress: 'En cours',
      Completed: 'Terminée',
      Cancelled: 'Annulée'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const handleCreateRoute = async (routeData: any) => {
    try {
      await routeService.createRoute({
        ...routeData,
        status: 'Planned' as const
      });
      
      toast.success('Route créée avec succès!');
      setShowModal(false);
      fetchRoutes();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error creating route:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la route');
    }
  };

  const handleUpdateRoute = async (routeData: any) => {
    if (!selectedRoute?._id) return;
    
    try {
      await routeService.updateRoute(selectedRoute._id, routeData);
      toast.success('Route mise à jour avec succès!');
      setShowModal(false);
      setSelectedRoute(null);
      fetchRoutes();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error updating route:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette route?')) {
      return;
    }

    try {
      await routeService.deleteRoute(routeId);
      toast.success('Route supprimée avec succès!');
      fetchRoutes();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error deleting route:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const filteredRoutes = routes.filter(route => {
    const truckName = typeof route.truck === 'string' ? route.truck : route.truck?.registrationNumber || '';
    const driverName = typeof route.driver === 'string' ? route.driver : route.driver?.name || '';
    
    const matchesSearch = 
      (route.routeNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      route.departure.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.arrival.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truckName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driverName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Routes</h1>
              <p className="text-gray-600">Planifiez et suivez vos itinéraires de transport</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchRoutes}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
              <button
                onClick={() => {
                  setSelectedRoute(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
              >
                <Plus className="w-5 h-5" />
                Créer une Route
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <RouteIcon className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-sm text-gray-600">Total Routes</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.inProgress}</span>
            </div>
            <p className="text-sm text-gray-600">En Cours</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Navigation className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.completed}</span>
            </div>
            <p className="text-sm text-gray-600">Terminées</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalDistance.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600">KM Total</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Fuel className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalFuel}</span>
            </div>
            <p className="text-sm text-gray-600">L Carburant</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par numéro, départ, arrivée, camion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="Planned">Planifiées</option>
                <option value="InProgress">En cours</option>
                <option value="Completed">Terminées</option>
                <option value="Cancelled">Annulées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-12 rounded-xl shadow-md text-center">
              <RefreshCw className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement...</h3>
              <p className="text-gray-600">Récupération des routes</p>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-md text-center">
              <RouteIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune route trouvée</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== 'all'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Commencez par créer votre première route'}
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Créer une Route
                </button>
              )}
            </div>
          ) : (
            filteredRoutes.map((route) => {
              const routeId = route._id || route.id || '';
              const truckName = typeof route.truck === 'string' 
                ? route.truck 
                : `${route.truck?.brand || ''} ${route.truck?.model || ''} - ${route.truck?.registrationNumber || ''}`.trim();
              const driverName = typeof route.driver === 'string'
                ? route.driver
                : route.driver?.name || 'Non assigné';
              
              return (
                <div
                  key={routeId}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Route Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{route.routeNumber || 'N/A'}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(route.status)}`}>
                              {getStatusText(route.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {route.createdAt ? new Date(route.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {route.estimatedDuration}
                            </span>
                          </div>
                        </div>
                      </div>

                    {/* Route Path */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div className="w-0.5 h-8 bg-gray-300"></div>
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          </div>
                          <div className="flex-1">
                            <div className="mb-3">
                              <p className="text-sm text-gray-500">Départ</p>
                              <p className="font-semibold text-gray-900">{route.departure}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Arrivée</p>
                              <p className="font-semibold text-gray-900">{route.arrival}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:block h-20 w-px bg-gray-200"></div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-gray-900">{route.distance} km</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Fuel className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-gray-900">{route.fuelVolume || route.fuelConsumption || 0} L</span>
                        </div>
                      </div>
                    </div>

                    {/* Truck & Driver */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">{truckName || 'Non assigné'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></span>
                        <span className="text-gray-600">{driverName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedRoute(route);
                        setShowModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                      title="Voir sur la carte"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Voir</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoute(route);
                        setShowModal(true);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Modifier</span>
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(routeId)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>

      {/* Map Modal */}
      {showModal && (
        <MapModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedRoute(null);
          }}
          onSave={selectedRoute ? handleUpdateRoute : handleCreateRoute}
          initialData={selectedRoute}
        />
      )}
    </MainLayout>
  );
};
