import { useState, useEffect } from 'react';
import { Plus, Settings, Edit2, Trash2, ToggleLeft, ToggleRight, Info, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import { api } from '../../services/api';
import { maintenanceService } from '../../services/maintenanceService';

interface MaintenanceRule {
  _id: string;
  vehicleType: 'Truck' | 'Trailer' | 'Tire';
  vehicleId?: string;
  maintenanceType: string;
  description: string;
  intervalKilometers?: number;
  intervalDays?: number;
  estimatedCost?: number;
  isActive: boolean;
  createdAt: string;
}

const MaintenanceRules = () => {
  const [rules, setRules] = useState<MaintenanceRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<MaintenanceRule | null>(null);
  const [formData, setFormData] = useState({
    vehicleType: 'Truck',
    maintenanceType: 'OilChange',
    description: '',
    intervalKilometers: '',
    intervalDays: '',
    estimatedCost: '',
    isActive: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance/rules');
      setRules(response.data.rules || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des règles');
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = () => {
    setSelectedRule(null);
    setFormData({
      vehicleType: 'Truck',
      maintenanceType: 'OilChange',
      description: '',
      intervalKilometers: '',
      intervalDays: '',
      estimatedCost: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: MaintenanceRule) => {
    setSelectedRule(rule);
    setFormData({
      vehicleType: rule.vehicleType,
      maintenanceType: rule.maintenanceType,
      description: rule.description,
      intervalKilometers: rule.intervalKilometers?.toString() || '',
      intervalDays: rule.intervalDays?.toString() || '',
      estimatedCost: rule.estimatedCost?.toString() || '',
      isActive: rule.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.intervalKilometers && !formData.intervalDays) {
      toast.error('Veuillez définir au moins un intervalle (km ou jours)');
      return;
    }

    try {
      const data: any = {
        vehicleType: formData.vehicleType,
        maintenanceType: formData.maintenanceType,
        description: formData.description,
        isActive: formData.isActive
      };

      if (formData.intervalKilometers) {
        data.intervalKilometers = parseInt(formData.intervalKilometers);
      }
      if (formData.intervalDays) {
        data.intervalDays = parseInt(formData.intervalDays);
      }
      if (formData.estimatedCost) {
        data.estimatedCost = parseFloat(formData.estimatedCost);
      }

      if (selectedRule) {
        await api.put(`/maintenance/rules/${selectedRule._id}`, data);
        toast.success('Règle mise à jour avec succès');
      } else {
        await api.post('/maintenance/rules', data);
        toast.success('Règle créée avec succès');
      }
      setIsModalOpen(false);
      fetchRules();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erreur lors de la sauvegarde';
      toast.error(errorMessage);
      console.error('Error saving rule:', error);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette règle?')) return;
    try {
      await api.delete(`/maintenance/rules/${id}`);
      toast.success('Règle supprimée avec succès');
      fetchRules();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting rule:', error);
    }
  };

  const handleToggleActive = async (rule: MaintenanceRule) => {
    try {
      await api.patch(`/maintenance/rules/${rule._id}/toggle`, { isActive: !rule.isActive });
      toast.success(`Règle ${!rule.isActive ? 'activée' : 'désactivée'}`);
      fetchRules();
    } catch (error) {
      toast.error('Erreur lors de la modification');
      console.error('Error toggling rule:', error);
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
    { value: 'Other', label: 'Autre' }
  ];

  const handleCheckAllRules = async () => {
    try {
      const result = await maintenanceService.checkAllRules();
      
      if (result && result.success) {
        if (result.totalCreated > 0) {
          toast.success(`${result.totalCreated} maintenance(s) créée(s) automatiquement`);
        } else {
          toast.success('Tous les véhicules sont à jour');
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Erreur lors de la vérification';
      toast.error(errorMessage);
      console.error('Error checking rules:', error);
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Règles de Maintenance</h1>
          <div className="flex gap-2">
            <button
              onClick={handleCheckAllRules}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Vérifier Règles
            </button>
            <button
              onClick={handleCreateRule}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Règle
            </button>
          </div>
        </div>

  

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Règles</p>
                <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
              </div>
              <Settings className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Actives</p>
                <p className="text-2xl font-bold text-green-600">{rules.filter(r => r.isActive).length}</p>
              </div>
              <Settings className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Inactives</p>
                <p className="text-2xl font-bold text-gray-600">{rules.filter(r => !r.isActive).length}</p>
              </div>
              <Settings className="w-10 h-10 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Rules List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : rules.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune règle de maintenance</p>
            <p className="text-gray-400 text-sm mt-2">Créez des règles pour automatiser la maintenance</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Véhicule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maintenance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intervalle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coût Estimé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule._id} className={!rule.isActive ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rule.vehicleType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {maintenanceTypes.find(t => t.value === rule.maintenanceType)?.label || rule.maintenanceType}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{rule.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rule.intervalKilometers && <div>{rule.intervalKilometers.toLocaleString()} km</div>}
                      {rule.intervalDays && <div>{rule.intervalDays} jours</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rule.estimatedCost ? `${rule.estimatedCost} DH` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className="flex items-center gap-1"
                      >
                        {rule.isActive ? (
                          <>
                            <ToggleRight className="w-6 h-6 text-green-600" />
                            <span className="text-sm text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                            <span className="text-sm text-gray-400">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {selectedRule ? 'Modifier la Règle' : 'Nouvelle Règle'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type de Véhicule</label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Truck">Camion</option>
                        <option value="Trailer">Remorque</option>
                        <option value="Tire">Pneu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type de Maintenance</label>
                      <select
                        value={formData.maintenanceType}
                        onChange={(e) => setFormData({ ...formData, maintenanceType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        {maintenanceTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Intervalle (km)</label>
                      <input
                        type="number"
                        value={formData.intervalKilometers}
                        onChange={(e) => setFormData({ ...formData, intervalKilometers: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 10000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Intervalle (jours)</label>
                      <input
                        type="number"
                        value={formData.intervalDays}
                        onChange={(e) => setFormData({ ...formData, intervalDays: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 90"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coût Estimé (DH)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Règle Active</label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {selectedRule ? 'Mettre à jour' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MaintenanceRules;
