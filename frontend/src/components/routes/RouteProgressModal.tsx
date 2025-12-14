import React, { useState } from 'react';
import { X, Navigation, MapPin, Fuel } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface RouteProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: any;
  onSuccess: () => void;
}

export const RouteProgressModal: React.FC<RouteProgressModalProps> = ({
  isOpen,
  onClose,
  route,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    departureKilometers: route?.departureKilometers || '',
    arrivalKilometers: route?.arrivalKilometers || '',
    fuelVolume: route?.fuelVolume || '',
    fuelCost: route?.fuelCost || '',
    vehicleRemarks: route?.vehicleRemarks || ''
  });

  const handleStartRoute = async () => {
    if (!formData.departureKilometers) {
      toast.error('Veuillez entrer les kilomètres de départ');
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/routes/${route._id}/start`, {
        departureKilometers: Number(formData.departureKilometers)
      });
      toast.success('Route démarrée avec succès!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error starting route:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du démarrage de la route');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRoute = async () => {
    if (!formData.arrivalKilometers) {
      toast.error('Veuillez entrer les kilomètres d\'arrivée');
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/routes/${route._id}/complete`, {
        arrivalKilometers: Number(formData.arrivalKilometers),
        fuelVolume: Number(formData.fuelVolume) || 0,
        fuelCost: Number(formData.fuelCost) || 0,
        vehicleRemarks: formData.vehicleRemarks
      });
      toast.success('Route terminée avec succès!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error completing route:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la finalisation de la route');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isPlanned = route?.status === 'Planned';
  const isInProgress = route?.status === 'InProgress';
  const calculatedDistance = formData.arrivalKilometers && formData.departureKilometers
    ? Number(formData.arrivalKilometers) - Number(formData.departureKilometers)
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold">
            {isPlanned && 'Démarrer la Route'}
            {isInProgress && 'Terminer la Route'}
            {route?.status === 'Completed' && 'Détails de la Route'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Route Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Numéro de Route</p>
                <p className="font-semibold text-gray-900">{route?.routeNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Départ</p>
                  <p className="text-sm font-medium text-gray-900">{route?.departureLocation}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Arrivée</p>
                  <p className="text-sm font-medium text-gray-900">{route?.arrivalLocation}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Distance Estimée</p>
              <p className="font-semibold text-gray-900">{route?.distance?.toFixed(0)} km</p>
            </div>
          </div>

          {/* Start Route Form */}
          {isPlanned && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilomètres de Départ *
                </label>
                <input
                  type="number"
                  value={formData.departureKilometers}
                  onChange={(e) => setFormData({ ...formData, departureKilometers: e.target.value })}
                  placeholder="Ex: 125000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Entrez le kilométrage actuel du camion au départ
                </p>
              </div>
            </div>
          )}

          {/* Complete Route Form */}
          {isInProgress && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilomètres de Départ
                </label>
                <input
                  type="number"
                  value={route?.departureKilometers || ''}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilomètres d'Arrivée *
                </label>
                <input
                  type="number"
                  value={formData.arrivalKilometers}
                  onChange={(e) => setFormData({ ...formData, arrivalKilometers: e.target.value })}
                  placeholder="Ex: 125280"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={route?.departureKilometers || 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Entrez le kilométrage actuel du camion à l'arrivée
                </p>
              </div>

              {calculatedDistance !== null && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium">Distance Réelle Calculée</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {calculatedDistance.toFixed(0)} km
                  </p>
                  {route?.distance && (
                    <p className="text-xs text-blue-600 mt-1">
                      Différence avec estimation: {(calculatedDistance - route.distance).toFixed(0)} km
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Fuel className="w-4 h-4 inline mr-1" />
                    Volume Carburant (L)
                  </label>
                  <input
                    type="number"
                    value={formData.fuelVolume}
                    onChange={(e) => setFormData({ ...formData, fuelVolume: e.target.value })}
                    placeholder="Ex: 45"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coût Carburant (DH)
                  </label>
                  <input
                    type="number"
                    value={formData.fuelCost}
                    onChange={(e) => setFormData({ ...formData, fuelCost: e.target.value })}
                    placeholder="Ex: 500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarques sur le Véhicule
                </label>
                <textarea
                  value={formData.vehicleRemarks}
                  onChange={(e) => setFormData({ ...formData, vehicleRemarks: e.target.value })}
                  placeholder="Problèmes, observations, état du véhicule..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Completed Route View */}
          {route?.status === 'Completed' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Km Départ</p>
                  <p className="text-lg font-semibold">{route?.departureKilometers}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Km Arrivée</p>
                  <p className="text-lg font-semibold">{route?.arrivalKilometers}</p>
                </div>
              </div>
              
              {route?.departureKilometers && route?.arrivalKilometers && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 font-medium">Distance Réelle Parcourue</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {(route.arrivalKilometers - route.departureKilometers).toFixed(0)} km
                  </p>
                </div>
              )}

              {route?.fuelVolume > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Carburant</p>
                    <p className="font-semibold">{route?.fuelVolume} L</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coût</p>
                    <p className="font-semibold">{route?.fuelCost} DH</p>
                  </div>
                </div>
              )}

              {route?.vehicleRemarks && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Remarques</p>
                  <p className="text-gray-900">{route?.vehicleRemarks}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              {route?.status === 'Completed' ? 'Fermer' : 'Annuler'}
            </button>
            {isPlanned && (
              <button
                onClick={handleStartRoute}
                disabled={loading || !formData.departureKilometers}
                className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Démarrage...' : 'Démarrer la Route'}
              </button>
            )}
            {isInProgress && (
              <button
                onClick={handleCompleteRoute}
                disabled={loading || !formData.arrivalKilometers}
                className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Finalisation...' : 'Terminer la Route'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
