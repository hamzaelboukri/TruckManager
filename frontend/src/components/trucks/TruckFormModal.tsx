import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { truckService } from '../../services/truckService';
import type { Truck } from '../../types';
import { toast } from 'react-hot-toast';

interface TruckFormModalProps {
  truck: Truck | null;
  onClose: () => void;
}

const TruckFormModal = ({ truck, onClose }: TruckFormModalProps) => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    model: '',
    year: new Date().getFullYear(),
    purchaseDate: '',
    status: 'Available' as 'Available' | 'InRoute' | 'Maintenance' | 'OutOfService',
    currentKilometers: 0,
    fuelCapacity: 0,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (truck) {
      setFormData({
        registrationNumber: truck.registrationNumber || '',
        model: truck.model || '',
        year: truck.year || new Date().getFullYear(),
        purchaseDate: truck.purchaseDate 
          ? new Date(truck.purchaseDate).toISOString().split('T')[0] 
          : '',
        status: truck.status || 'Available',
        currentKilometers: truck.currentKilometers || 0,
        fuelCapacity: truck.fuelCapacity || 0,
      });
    } else {
      // Reset form when creating new truck
      setFormData({
        registrationNumber: '',
        model: '',
        year: new Date().getFullYear(),
        purchaseDate: '',
        status: 'Available',
        currentKilometers: 0,
        fuelCapacity: 0,
      });
    }
  }, [truck]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (truck) {
        await truckService.updateTruck(truck._id, formData);
        toast.success('Camion modifié avec succès');
      } else {
        await truckService.createTruck(formData);
        toast.success('Camion créé avec succès');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
      console.error('Error saving truck:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['year', 'currentKilometers', 'fuelCapacity'].includes(name)
        ? Number(value)
        : value
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {truck ? 'Modifier le Camion' : 'Ajouter un Camion'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matricule <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: ABC-123"
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modèle <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: FH16"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Année <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1990"
                max={new Date().getFullYear() + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'Achat <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Available">Disponible</option>
                <option value="InRoute">En Route</option>
                <option value="Maintenance">Maintenance</option>
                <option value="OutOfService">Hors Service</option>
              </select>
            </div>

            {/* Current Kilometers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kilométrage Actuel <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="currentKilometers"
                value={formData.currentKilometers}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 150000"
              />
            </div>

            {/* Fuel Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité Carburant (L) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fuelCapacity"
                value={formData.fuelCapacity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 500"
              />
            </div>


          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : truck ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TruckFormModal;
