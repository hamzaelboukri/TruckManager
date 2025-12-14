import { useEffect, useState } from 'react';
import { DriverLayout } from '../../layouts/DriverLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Truck, MapPin, Calendar, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import type { Route } from '../../types';
import { generateRoutePDF } from '../../utils/pdfGenerator';

interface Statistics {
  totalRoutes: number;
  completedRoutes: number;
  inProgressRoutes: number;
  plannedRoutes: number;
  totalDistance: number;
}

export const DriverDashboard = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalRoutes: 0,
    completedRoutes: 0,
    inProgressRoutes: 0,
    plannedRoutes: 0,
    totalDistance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDriverData();
  }, []);

  const handleDownloadPDF = (route: Route) => {
    try {
      const driverName = user?.name || 'Chauffeur';
      generateRoutePDF(route, driverName);
      toast.success('PDF téléchargé avec succès!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      
      // Get driver by user ID
      const driversResponse = await api.get('/drivers');
      const drivers = driversResponse.data.data || driversResponse.data || [];
      const driver = drivers.find(
        (d: any) => d.user?._id === user?.id
      );

      if (!driver) {
        console.log('No driver profile found for user:', user?.id);
        setRoutes([]);
        setLoading(false);
        return;
      }

      // Get driver's routes only (filtered by specific driver ID)
      console.log('Fetching routes for driver ID:', driver._id);
      const routesResponse = await api.get(`/routes?driver=${driver._id}&limit=100`);
      const driverRoutes = routesResponse.data.data || routesResponse.data || [];
      console.log('Routes response:', routesResponse.data);
      console.log('Driver ID:', driver._id, 'Routes count:', driverRoutes.length);
      
      // Sort routes by date (most recent first)
      const sortedRoutes = driverRoutes.sort((a: Route, b: Route) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      
      setRoutes(sortedRoutes);

      // Calculate statistics
      const stats = {
        totalRoutes: driverRoutes.length,
        completedRoutes: driverRoutes.filter((r: Route) => r.status === 'Completed').length,
        inProgressRoutes: driverRoutes.filter((r: Route) => r.status === 'InProgress').length,
        plannedRoutes: driverRoutes.filter((r: Route) => r.status === 'Planned').length,
        totalDistance: driverRoutes.reduce((sum: number, r: Route) => sum + (r.distance || 0), 0),
      };
      
      setStatistics(stats);
    } catch (error: any) {
      console.error('Error fetching driver data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Planned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'InProgress':
        return <Clock className="w-5 h-5" />;
      case 'Planned':
        return <Calendar className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <DriverLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout>
      <div>
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">Here's your driving overview</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Routes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {statistics.totalRoutes}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {statistics.plannedRoutes}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {statistics.inProgressRoutes}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {statistics.completedRoutes}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Distance</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {statistics.totalDistance.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">km</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Routes Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">My Routes</h2>
            <p className="text-sm text-gray-600 mt-1">All your assigned routes</p>
          </div>

          <div className="p-6">
            {routes.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No routes yet</h3>
                <p className="text-gray-600">You don't have any assigned routes at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {routes.map((route) => (
                  <div
                    key={route._id}
                    className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          route.status
                        )}`}
                      >
                        {getStatusIcon(route.status)}
                        {route.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(route.startDate)}
                      </span>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Departure</p>
                          <p className="text-gray-900 font-medium">{(route as any).departureLocation || route.startLocation?.address || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Arrival</p>
                          <p className="text-gray-900 font-medium">{(route as any).arrivalLocation || route.endLocation?.address || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Truck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Truck</p>
                          <p className="text-gray-900 font-medium">
                            {route.truck ? `${route.truck.brand} ${route.truck.model} - ${route.truck.registrationNumber}` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">Distance</p>
                          <p className="font-semibold text-gray-900">
                            {route.distance ? route.distance.toFixed(0) : 0} km
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">
                            {route.estimatedDuration ? route.estimatedDuration.toFixed(0) : 0} min
                          </p>
                        </div>
                      </div>

                      {route.cargo?.description && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-1">Cargo</p>
                          <p className="text-gray-900 text-sm">{route.cargo.description}</p>
                          {route.cargo.weight && (
                            <p className="text-sm text-gray-600 mt-1">Weight: {route.cargo.weight} kg</p>
                          )}
                        </div>
                      )}

                      {/* Download PDF Button */}
                      <div className="pt-4 border-t border-gray-200 mt-4">
                        <button
                          onClick={() => handleDownloadPDF(route)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger l'ordre de mission (PDF)
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DriverLayout>
  );
};
