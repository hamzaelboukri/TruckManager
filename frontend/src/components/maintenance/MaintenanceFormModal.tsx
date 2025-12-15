import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { maintenanceService } from '../../services/maintenanceService';
import { truckService } from '../../services/truckService';
import { trailerService } from '../../services/trailerService';
import { tireService } from '../../services/tireService';
import type { MaintenanceRecord } from '../../services/maintenanceService';
import type { Truck, Trailer, Tire } from '../../types';
import { toast } from 'react-hot-toast';

interface MaintenanceFormModalProps {
  record: MaintenanceRecord | null;
  onClose: () => void;
}

const MaintenanceFormModal = ({ record, onClose }: MaintenanceFormModalProps) => {
  const [formData, setFormData] = useState({
    vehicleType: 'Truck' as 'Truck' | 'Trailer' | 'Tire',
    vehicleId: '',
    maintenanceType: 'GeneralInspection',
    date: new Date().toISOString().split('T')[0],
    kilometersAtMaintenance: 0,
    cost: 0,
    performedBy: '',
    workshop: '',
    description: '',
    nextMaintenanceKilometers: 0,
    nextMaintenanceDate: '',
    status: 'Scheduled' as 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    notes: '',
  });

  const [vehicles, setVehicles] = useState<(Truck | Trailer | Tire)[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        vehicleType: record.vehicleType,
        vehicleId: typeof record.vehicleId === 'string' ? record.vehicleId : record.vehicleId?._id || '',
        maintenanceType: record.maintenanceType,
        date: new Date(record.date).toISOString().split('T')[0],
        kilometersAtMaintenance: record.kilometersAtMaintenance,
        cost: record.cost,
        performedBy: record.performedBy,
        workshop: record.workshop || '',
        description: record.description,
        nextMaintenanceKilometers: record.nextMaintenanceKilometers || 0,
        nextMaintenanceDate: record.nextMaintenanceDate 
          ? new Date(record.nextMaintenanceDate).toISOString().split('T')[0]
          : '',
        status: record.status,
        priority: record.priority,
        notes: record.notes || '',
      });
    }
  }, [record]);

  useEffect(() => {
    fetchVehicles();
  }, [formData.vehicleType]);

  const fetchVehicles = async () => {
    try {
      if (formData.vehicleType === 'Truck') {
        const response = await truckService.getAllTrucks({ limit: 100 });
        setVehicles(response.data || []);
      } else if (formData.vehicleType === 'Trailer') {
        const response = await trailerService.getAllTrailers({ limit: 100 });
        setVehicles(response.data || []);
      } else {
        const response = await tireService.getAllTires({ limit: 100 });
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
      if (record) {
        await maintenanceService.updateRecord(record._id, formData);
        toast.success('Maintenance modifiée avec succès');
      } else {
        await maintenanceService.createRecord(formData);
        toast.success('Maintenance créée avec succès');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
      console.error('Error saving maintenance record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'vehicleType') {
      setFormData(prev => ({
        ...prev,
        vehicleType: value as 'Truck' | 'Trailer' | 'Tire',
        vehicleId: '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['kilometersAtMaintenance', 'cost', 'nextMaintenanceKilometers'].includes(name)
          ? Number(value)
          : value
      }));
    }
  };

  const maintenanceTypes = [
    { value: 'OilChange', label: 'Vidange' },
    { value: 'TireReplacement', label: 'Remplacement Pneu' },
    { value: 'TireRotation', label: 'Rotation Pneus' },
    { value: 'BrakeCheck', label: 'Vérification Freins' },
    { value: 'BrakeReplacement', label: 'Remplacement Freins' },
    { value: 'GeneralInspection', label: 'Révision Générale' },
    { value: 'EngineRepair', label: 'Réparation Moteur' },
    { value: 'TransmissionRepair', label: 'Réparation Transmission' },
    { value: 'SuspensionRepair', label: 'Réparation Suspension' },
    { value: 'ElectricalRepair', label: 'Réparation Électrique' },
    { value: 'BodyWork', label: 'Carrosserie' },
    { value: 'Other', label: 'Autre' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {record ? 'Modifier Maintenance' : 'Nouvelle Maintenance'}
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
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de Véhicule <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Truck">Camion</option>
                <option value="Trailer">Remorque</option>
                <option value="Tire">Pneu</option>
              </select>
            </div>

            {/* Vehicle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Véhicule <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicleId"
                value={formData.vehicleId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner...</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {formData.vehicleType === 'Tire' 
                      ? `${(vehicle as Tire).serialNumber} - ${(vehicle as Tire).position}`
                      : `${(vehicle as Truck | Trailer).registrationNumber} - ${(vehicle as Truck | Trailer).model}`
                    }
                  </option>
                ))}
              </select>
            </div>

            {/* Maintenance Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de Maintenance <span className="text-red-500">*</span>
              </label>
              <select
                name="maintenanceType"
                value={formData.maintenanceType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {maintenanceTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Kilometers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kilométrage <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="kilometersAtMaintenance"
                value={formData.kilometersAtMaintenance}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coût (MAD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Performed By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effectué par <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="performedBy"
                value={formData.performedBy}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom du technicien"
              />
            </div>

            {/* Workshop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Atelier
              </label>
              <input
                type="text"
                name="workshop"
                value={formData.workshop}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nom de l'atelier"
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
                <option value="Scheduled">Planifiée</option>
                <option value="InProgress">En Cours</option>
                <option value="Completed">Terminée</option>
                <option value="Cancelled">Annulée</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Low">Basse</option>
                <option value="Medium">Moyenne</option>
                <option value="High">Haute</option>
                <option value="Urgent">Urgente</option>
              </select>
            </div>

            {/* Next Maintenance Kilometers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prochain Kilométrage de Maintenance
              </label>
              <input
                type="number"
                name="nextMaintenanceKilometers"
                value={formData.nextMaintenanceKilometers}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Next Maintenance Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de Prochaine Maintenance
              </label>
              <input
                type="date"
                name="nextMaintenanceDate"
                value={formData.nextMaintenanceDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez les travaux effectués..."
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notes supplémentaires..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {loading ? 'Enregistrement...' : record ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceFormModal;
