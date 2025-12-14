import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { trailerService } from '../../services/trailerService';
import type { Trailer } from '../../types';
import { toast } from 'react-hot-toast';

interface TrailerFormModalProps {
  trailer: Trailer | null;
  onClose: () => void;
}

const TrailerFormModal = ({ trailer, onClose }: TrailerFormModalProps) => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    brand: '',
    model: '',
    type: 'Flatbed' as 'Flatbed' | 'Refrigerated' | 'Tanker' | 'Container' | 'Van' | 'Other',
    year: new Date().getFullYear(),
    maxCapacity: 0,
    currentKilometers: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    numberOfAxles: 2,
    status: 'Available' as 'Available' | 'InUse' | 'Maintenance' | 'OutOfService',
    condition: 'Good' as 'Excellent' | 'Good' | 'Fair' | 'Poor',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trailer) {
      setFormData({
        registrationNumber: trailer.registrationNumber,
        brand: trailer.brand || '',
        model: trailer.model || '',
        type: trailer.type,
        year: trailer.year,
        maxCapacity: trailer.maxCapacity,
        currentKilometers: trailer.currentKilometers,
        dimensions: trailer.dimensions || { length: 0, width: 0, height: 0 },
        numberOfAxles: trailer.numberOfAxles || 2,
        status: trailer.status,
        condition: trailer.condition || 'Good',
      });
    }
  }, [trailer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (trailer) {
        await trailerService.updateTrailer(trailer._id, formData);
        toast.success('Remorque modifiée avec succès');
      } else {
        await trailerService.createTrailer(formData);
        toast.success('Remorque créée avec succès');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
      console.error('Error saving trailer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimensionKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionKey]: Number(value)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['year', 'maxCapacity', 'currentKilometers', 'numberOfAxles'].includes(name)
          ? Number(value)
          : value
      }));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {trailer ? 'Modifier la Remorque' : 'Ajouter une Remorque'}
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
                placeholder="Ex: TRL-123"
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
                placeholder="Ex: Schmitz"
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
                placeholder="Ex: Cargobull"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Flatbed">Flatbed</option>
                <option value="Refrigerated">Réfrigéré</option>
                <option value="Tanker">Citerne</option>
                <option value="Container">Container</option>
                <option value="Van">Van</option>
                <option value="Other">Autre</option>
              </select>
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

            {/* Max Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacité Max (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 24000"
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
                placeholder="Ex: 80000"
              />
            </div>

            {/* Number of Axles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre d'Essieux <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="numberOfAxles"
                value={formData.numberOfAxles}
                onChange={handleChange}
                required
                min="1"
                max="5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Dimensions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions (mètres) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Longueur</label>
                  <input
                    type="number"
                    name="dimensions.length"
                    value={formData.dimensions.length}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 13.6"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Largeur</label>
                  <input
                    type="number"
                    name="dimensions.width"
                    value={formData.dimensions.width}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Hauteur</label>
                  <input
                    type="number"
                    name="dimensions.height"
                    value={formData.dimensions.height}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: 2.7"
                  />
                </div>
              </div>
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
                <option value="InUse">En Service</option>
                <option value="Maintenance">Maintenance</option>
                <option value="OutOfService">Hors Service</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Bon</option>
                <option value="Fair">Moyen</option>
                <option value="Poor">Mauvais</option>
              </select>
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
              {loading ? 'Enregistrement...' : trailer ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrailerFormModal;
