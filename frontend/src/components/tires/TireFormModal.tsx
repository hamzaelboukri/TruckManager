import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { tireService } from '../../services/tireService';
import { truckService } from '../../services/truckService';
import { trailerService } from '../../services/trailerService';
import type { Tire, Truck, Trailer } from '../../types';
import { toast } from 'react-hot-toast';

interface TireFormModalProps {
  tire: Tire | null;
  onClose: () => void;
}

const TireFormModal = ({ tire, onClose }: TireFormModalProps) => {
  const [formData, setFormData] = useState({
    serialNumber: '',
    brand: '',
    model: '',
    size: '',
    position: '',
    ownerType: 'Truck' as 'Truck' | 'Trailer',
    vehicle: '',
    currentWearPercentage: 0,
    status: 'Good' as 'Good' | 'Warning' | 'NeedReplacement',
    purchaseDate: '',
    installationKilometers: 0,
    currentKilometers: 0,
  });

  const [vehicles, setVehicles] = useState<(Truck | Trailer)[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tire) {
      setFormData({
        serialNumber: tire.serialNumber,
        brand: tire.brand,
        model: tire.model,
        size: tire.size,
        position: tire.position,
        ownerType: tire.ownerType,
        vehicle: typeof tire.vehicle === 'string' ? tire.vehicle : tire.vehicle._id,
        currentWearPercentage: tire.currentWearPercentage,
        status: tire.status,
        purchaseDate: tire.purchaseDate 
          ? new Date(tire.purchaseDate).toISOString().split('T')[0] 
          : '',
        installationKilometers: tire.installationKilometers,
        currentKilometers: tire.currentKilometers,
      });
    }
  }, [tire]);

  useEffect(() => {
    fetchVehicles();
  }, [formData.ownerType]);

  const fetchVehicles = async () => {
    try {
      if (formData.ownerType === 'Truck') {
        const response = await truckService.getAllTrucks({ limit: 100 });
        setVehicles(response.data || []);
      } else {
        const response = await trailerService.getAllTrailers({ limit: 100 });
        setVehicles(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (tire) {
        await tireService.updateTire(tire._id, formData);
        toast.success('Pneu modifié avec succès');
      } else {
        await tireService.createTire(formData);
        toast.success('Pneu créé avec succès');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
      console.error('Error saving tire:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset vehicle selection when ownerType changes
    if (name === 'ownerType') {
      setFormData(prev => ({
        ...prev,
        ownerType: value as 'Truck' | 'Trailer',
        vehicle: '' // Reset vehicle selection
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['currentWearPercentage', 'installationKilometers', 'currentKilometers'].includes(name)
          ? Number(value)
          : value
      }));
    }
  };

  const tirePositions = [
    'Front Left',
    'Front Right',
    'Rear Left Inner',
    'Rear Left Outer',
    'Rear Right Inner',
    'Rear Right Outer',
    'Spare',
  ];

  const tireSizes = [
    '295/80R22.5',
    '315/80R22.5',
    '385/65R22.5',
    '425/65R22.5',
    '445/65R22.5',
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {tire ? 'Modifier le Pneu' : 'Ajouter un Pneu'}
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
            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de Série <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: TIRE-001"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marque <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Michelin"
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
                placeholder="Ex: X Multi D"
              />
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taille <span className="text-red-500">*</span>
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                {tireSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position <span className="text-red-500">*</span>
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                {tirePositions.map((position) => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            {/* Owner Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de Véhicule <span className="text-red-500">*</span>
              </label>
              <select
                name="ownerType"
                value={formData.ownerType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Truck">Camion</option>
                <option value="Trailer">Remorque</option>
              </select>
            </div>

            {/* Vehicle */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Véhicule <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un véhicule...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.registrationNumber} - {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Wear Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usure Actuelle (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="currentWearPercentage"
                value={formData.currentWearPercentage}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                État <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Good">Bon</option>
                <option value="Warning">Attention</option>
                <option value="NeedReplacement">À Remplacer</option>
              </select>
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

            {/* Installation Kilometers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kilométrage d'Installation <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="installationKilometers"
                value={formData.installationKilometers}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 50000"
              />
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
                placeholder="Ex: 65000"
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
              {loading ? 'Enregistrement...' : tire ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TireFormModal;
