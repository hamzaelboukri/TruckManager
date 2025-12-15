import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { maintenanceService } from '../../services/maintenanceService';

interface MaintenanceAlert {
  vehicleType: string;
  vehicleId: {
    _id: string;
    registrationNumber?: string;
    licensePlate?: string;
    identifier?: string;
    brand?: string;
    model?: string;
  };
  maintenanceType: string;
  description: string;
  reason: string;
  urgency: 'Urgent' | 'Soon' | 'OK';
  currentKilometers: number;
  estimatedCost: number;
}

const MaintenanceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    urgent: 0,
    soon: 0,
    total: 0
  });

  const maintenanceTypeLabels: { [key: string]: string } = {
    OilChange: 'Vidange',
    TireReplacement: 'Remplacement Pneu',
    TireRotation: 'Rotation Pneu',
    BrakeCheck: 'Vérification Freins',
    BrakeReplacement: 'Remplacement Freins',
    GeneralInspection: 'Révision Générale',
    EngineRepair: 'Réparation Moteur',
    TransmissionRepair: 'Réparation Transmission',
    SuspensionRepair: 'Réparation Suspension',
    ElectricalRepair: 'Réparation Électrique',
    BodyWork: 'Carrosserie',
    Other: 'Autre'
  };

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const response = await maintenanceService.checkAllDueMaintenance(false);
      
      if (response.success && response.dueMaintenances) {
        setAlerts(response.dueMaintenances);
        
        // Calculate stats
        const urgent = response.dueMaintenances.filter((a: MaintenanceAlert) => a.urgency === 'Urgent').length;
        const soon = response.dueMaintenances.filter((a: MaintenanceAlert) => a.urgency === 'Soon').length;
        
        setStats({
          urgent,
          soon,
          total: response.dueMaintenances.length
        });
      } else {
        setAlerts([]);
        setStats({ urgent: 0, soon: 0, total: 0 });
      }
    } catch (error: any) {
      console.error('Error loading alerts:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAllMaintenance = async () => {
    if (alerts.length === 0) {
      toast.success('Aucune maintenance à créer');
      return;
    }

    try {
      const response = await maintenanceService.checkAllRules();
      
      if (response.success) {
        toast.success(response.message || `${response.totalCreated} maintenance(s) créée(s) automatiquement`);
        loadAlerts(); // Reload to update the list
      }
    } catch (error: any) {
      console.error('Error creating maintenance:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création des maintenances');
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'Urgent':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'Soon':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getVehicleIdentifier = (alert: MaintenanceAlert) => {
    const vehicle = alert.vehicleId;
    if (!vehicle) return 'N/A';
    
    return vehicle.registrationNumber || vehicle.licensePlate || vehicle.identifier || 'N/A';
  };

  const getVehicleName = (alert: MaintenanceAlert) => {
    const vehicle = alert.vehicleId;
    if (!vehicle) return '';
    
    if (vehicle.brand && vehicle.model) {
      return `${vehicle.brand} ${vehicle.model}`;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alertes Maintenance</h1>
          <p className="text-gray-600 mt-1">Véhicules nécessitant une maintenance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAlerts}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          {alerts.length > 0 && (
            <button
              onClick={handleCreateAllMaintenance}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Créer Toutes les Maintenances
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-3xl font-bold text-gray-900">{stats.urgent}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bientôt</p>
              <p className="text-3xl font-bold text-gray-900">{stats.soon}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alertes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Bell className="w-12 h-12 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune alerte</h3>
            <p className="text-gray-600">Tous les véhicules sont à jour !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type Maintenance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Raison
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kilométrage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coût Estimé
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getUrgencyIcon(alert.urgency)}
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${getUrgencyColor(alert.urgency)}`}>
                          {alert.urgency}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                        {alert.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{getVehicleIdentifier(alert)}</div>
                        {getVehicleName(alert) && (
                          <div className="text-gray-500">{getVehicleName(alert)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {maintenanceTypeLabels[alert.maintenanceType] || alert.maintenanceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{alert.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.currentKilometers.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.estimatedCost} MAD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceAlerts;
