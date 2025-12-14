import { useState, useEffect } from 'react';
import { Plus, Wrench, Edit2, Trash2, Search, Calendar } from 'lucide-react';
import { maintenanceService } from '../../services/maintenanceService';
import type { MaintenanceRecord } from '../../services/maintenanceService';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import MaintenanceFormModal from '../../components/maintenance/MaintenanceFormModal';

const Maintenance = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchRecords();
  }, [statusFilter, priorityFilter, vehicleTypeFilter, currentPage]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params: any = { limit: itemsPerPage, page: currentPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (vehicleTypeFilter !== 'all') params.vehicleType = vehicleTypeFilter;
      
      const response = await maintenanceService.getAllRecords(params);
      setRecords(response.records || response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setTotalRecords(response.pagination?.total || 0);
    } catch (error) {
      toast.error('Erreur lors du chargement des maintenances');
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = () => {
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleEditRecord = (record: MaintenanceRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement de maintenance?')) return;

    try {
      await maintenanceService.deleteRecord(id);
      toast.success('Enregistrement supprimé avec succès');
      fetchRecords();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error('Error deleting maintenance record:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    fetchRecords();
  };

  const filteredRecords = records.filter(record => {
    const vehicleName = typeof record.vehicleId === 'object' && record.vehicleId?.registrationNumber 
      ? record.vehicleId.registrationNumber.toLowerCase()
      : '';
    const matchesSearch = 
      vehicleName.includes(searchTerm.toLowerCase()) ||
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.workshop && record.workshop.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'InProgress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'OilChange': 'Vidange',
      'TireReplacement': 'Remplacement Pneu',
      'TireRotation': 'Rotation Pneus',
      'BrakeCheck': 'Vérification Freins',
      'BrakeReplacement': 'Remplacement Freins',
      'GeneralInspection': 'Révision Générale',
      'EngineRepair': 'Réparation Moteur',
      'TransmissionRepair': 'Réparation Transmission',
      'SuspensionRepair': 'Réparation Suspension',
      'ElectricalRepair': 'Réparation Électrique',
      'BodyWork': 'Carrosserie',
      'Other': 'Autre'
    };
    return labels[type] || type;
  };

  const stats = {
    total: records.length,
    scheduled: records.filter(r => r.status === 'Scheduled').length,
    inProgress: records.filter(r => r.status === 'InProgress').length,
    completed: records.filter(r => r.status === 'Completed').length,
    urgent: records.filter(r => r.priority === 'Urgent').length,
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion de Maintenance</h1>
          <button
            onClick={handleCreateRecord}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Maintenance
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Wrench className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Planifiées</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">En Cours</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
              </div>
              <Wrench className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Terminées</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <Wrench className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
              </div>
              <Wrench className="w-10 h-10 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="Scheduled">Planifiée</option>
                <option value="InProgress">En Cours</option>
                <option value="Completed">Terminée</option>
                <option value="Cancelled">Annulée</option>
              </select>
            </div>
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes priorités</option>
                <option value="Low">Basse</option>
                <option value="Medium">Moyenne</option>
                <option value="High">Haute</option>
                <option value="Urgent">Urgente</option>
              </select>
            </div>
            <div>
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous véhicules</option>
                <option value="Truck">Camions</option>
                <option value="Trailer">Remorques</option>
                <option value="Tire">Pneus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun enregistrement trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record) => (
              <div key={record._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-10 h-10 text-blue-600" />
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {getMaintenanceTypeLabel(record.maintenanceType)}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {record.vehicleType} - {typeof record.vehicleId === 'object' && record.vehicleId?.registrationNumber 
                            ? record.vehicleId.registrationNumber 
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Date:</span>
                      <span className="font-semibold">{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Kilométrage:</span>
                      <span className="font-semibold">{record.kilometersAtMaintenance.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Coût:</span>
                      <span className="font-semibold">{record.cost.toLocaleString()} MAD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Effectué par:</span>
                      <span className="font-semibold">{record.performedBy}</span>
                    </div>
                    {record.workshop && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Atelier:</span>
                        <span className="font-semibold">{record.workshop}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{record.description}</p>
                  </div>

                  <div className="flex items-center justify-between mb-4 gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(record.status)}`}>
                      {record.status === 'Scheduled' ? 'Planifiée' : record.status === 'InProgress' ? 'En Cours' : record.status === 'Completed' ? 'Terminée' : 'Annulée'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(record.priority)}`}>
                      {record.priority === 'Low' ? 'Basse' : record.priority === 'Medium' ? 'Moyenne' : record.priority === 'High' ? 'Haute' : 'Urgente'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record._id)}
                      className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="px-4 py-2">
              Page {currentPage} sur {totalPages} ({totalRecords} maintenances)
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        )}

        {/* Maintenance Form Modal */}
        {isModalOpen && (
          <MaintenanceFormModal
            record={selectedRecord}
            onClose={handleModalClose}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Maintenance;
