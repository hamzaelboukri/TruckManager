import React, { useEffect, useState } from 'react';
import { DriverLayout } from '../../layouts/DriverLayout';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Calendar, Truck, Navigation, Package, Play, CheckCircle, Download } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { RouteProgressModal } from '../../components/routes/RouteProgressModal';
import { generateRoutePDF } from '../../utils/pdfGenerator';

export const DriverRoutes: React.FC = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const handleDownloadPDF = (route: any) => {
    try {
      const driverName = user?.name || 'Chauffeur';
      generateRoutePDF(route, driverName);
      toast.success('PDF téléchargé avec succès!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  useEffect(() => {
    const fetchDriverRoutes = async () => {
      if (user?.role === 'Driver' && user?.id) {
        try {
          // Get driver document by user ID
          const driversResponse = await api.get('/drivers');
          const drivers = driversResponse.data.data || driversResponse.data || [];
          const driver = drivers.find((d: any) => d.user?._id === user.id);
          
          if (!driver) {
            console.log('No driver profile found for user:', user.id);
            setRoutes([]);
            setLoading(false);
            return;
          }
          
          // Fetch routes for this specific driver only
          console.log('Fetching routes for driver ID:', driver._id);
          const routesResponse = await api.get(`/routes?driver=${driver._id}&limit=100&sort=-createdAt`);
          const fetchedRoutes = routesResponse.data.data || routesResponse.data || [];
          console.log('Driver routes response:', routesResponse.data);
          console.log('Routes fetched for driver:', fetchedRoutes.length);
          setRoutes(fetchedRoutes);
        } catch (error) {
          console.error('Error fetching driver routes:', error);
          toast.error('Erreur lors du chargement des routes');
          setRoutes([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchDriverRoutes();
  }, [user]);

  const statusColors = {
    Planned: 'bg-purple-100 text-purple-800 border-purple-200',
    InProgress: 'bg-blue-100 text-blue-800 border-blue-200',
    Completed: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusText = {
    Planned: 'Planifiée',
    InProgress: 'En cours',
    Completed: 'Terminée',
    Cancelled: 'Annulée'
  };

  const filteredRoutes = filter === 'all' 
    ? routes 
    : routes.filter(route => route.status === filter);

  const stats = {
    total: routes.length,
    planned: routes.filter(r => r.status === 'Planned').length,
    inProgress: routes.filter(r => r.status === 'InProgress').length,
    completed: routes.filter(r => r.status === 'Completed').length,
  };

  if (loading) {
    return (
      <DriverLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Routes</h1>
          <p className="text-gray-600">Gérez vos itinéraires de livraison</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Routes</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Navigation className="w-10 h-10 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Planifiées</p>
                <p className="text-3xl font-bold">{stats.planned}</p>
              </div>
              <Package className="w-10 h-10 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">En Cours</p>
                <p className="text-3xl font-bold">{stats.inProgress}</p>
              </div>
              <Truck className="w-10 h-10 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Terminées</p>
                <p className="text-3xl font-bold">{stats.completed}</p>
              </div>
              <MapPin className="w-10 h-10 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('Planned')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'Planned'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Planifiées
          </button>
          <button
            onClick={() => setFilter('InProgress')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'InProgress'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            En Cours
          </button>
          <button
            onClick={() => setFilter('Completed')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'Completed'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Terminées
          </button>
        </div>

        {/* Routes List */}
        {filteredRoutes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune route trouvée</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "Vous n'avez pas encore de routes assignées"
                : `Aucune route ${statusText[filter as keyof typeof statusText]?.toLowerCase()}`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRoutes.map((route) => (
              <div 
                key={route._id} 
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Section - Route Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-bold text-gray-900">{route.routeNumber}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[route.status as keyof typeof statusColors]}`}>
                        {statusText[route.status as keyof typeof statusText]}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Départ</p>
                          <p className="font-medium text-gray-900">{route.departureLocation}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Arrivée</p>
                          <p className="font-medium text-gray-900">{route.arrivalLocation}</p>
                        </div>
                      </div>
                    </div>

                    {route.description && (
                      <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-700 mb-1">Description:</p>
                        {route.description}
                      </div>
                    )}
                  </div>

                  {/* Right Section - Details */}
                  <div className="lg:text-right space-y-3 lg:min-w-[200px]">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Distance</p>
                      <p className="text-2xl font-bold text-blue-900">{route.distance} km</p>
                    </div>

                    {route.truck && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Truck className="w-4 h-4" />
                          <p className="text-sm font-medium">Camion</p>
                        </div>
                        <p className="text-sm text-gray-900">
                          {route.truck.brand} {route.truck.model}
                        </p>
                        <p className="text-xs text-gray-600">{route.truck.registrationNumber}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(route.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>

                    {/* Download PDF Button */}
                    <button
                      onClick={() => handleDownloadPDF(route)}
                      className="w-full mt-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>

                    {/* Action Button */}
                    {route.status === 'Planned' && (
                      <button
                        onClick={() => {
                          setSelectedRoute(route);
                          setShowProgressModal(true);
                        }}
                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
                      >
                        <Play className="w-4 h-4" />
                        Démarrer
                      </button>
                    )}
                    {route.status === 'InProgress' && (
                      <button
                        onClick={() => {
                          setSelectedRoute(route);
                          setShowProgressModal(true);
                        }}
                        className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Terminer
                      </button>
                    )}
                    {route.status === 'Completed' && (
                      <button
                        onClick={() => {
                          setSelectedRoute(route);
                          setShowProgressModal(true);
                        }}
                        className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 font-medium"
                      >
                        Voir Détails
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Route Progress Modal */}
      <RouteProgressModal
        isOpen={showProgressModal}
        onClose={() => {
          setShowProgressModal(false);
          setSelectedRoute(null);
        }}
        route={selectedRoute}
        onSuccess={() => {
          // Refresh routes after update
          const fetchDriverRoutes = async () => {
            try {
              const driversResponse = await api.get('/drivers');
              const drivers = driversResponse.data.data || driversResponse.data || [];
              const driver = drivers.find((d: any) => d.user?._id === user?.id);
              
              if (driver) {
                const routesResponse = await api.get(`/routes?driver=${driver._id}&limit=100&sort=-createdAt`);
                const fetchedRoutes = routesResponse.data.data || routesResponse.data || [];
                setRoutes(fetchedRoutes);
              }
            } catch (error) {
              console.error('Error refreshing routes:', error);
            }
          };
          fetchDriverRoutes();
        }}
      />
    </DriverLayout>
  );
};
