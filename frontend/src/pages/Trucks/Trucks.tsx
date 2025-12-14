import { useState, useEffect } from 'react';
import { Plus, Truck as TruckIcon, Edit2, Trash2, Search } from 'lucide-react';
import { truckService } from '../../services/truckService';
import type { Truck } from '../../types';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import TruckFormModal from '../../components/trucks/TruckFormModal';

const Trucks = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);

  useEffect(() => {
    fetchTrucks();
  }, [statusFilter]);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter, limit: 100 } : { limit: 100 };
      const response = await truckService.getAllTrucks(params);
      setTrucks(response.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des camions');
      console.error('Error fetching trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTruck = () => {
    setSelectedTruck(null);
    setIsModalOpen(true);
  };

  const handleEditTruck = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsModalOpen(true);
  };

  const handleDeleteTruck = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce camion?')) return;

    try {
      await truckService.deleteTruck(id);
      toast.success('Camion supprimé avec succès');
      fetchTrucks();
    } catch (error) {
      toast.error('Erreur lors de la suppression du camion');
      console.error('Error deleting truck:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTruck(null);
    fetchTrucks();
  };

  const filteredTrucks = trucks.filter(truck => {
    const matchesSearch = 
      truck.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.model.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'InUse': return 'bg-blue-100 text-blue-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'OutOfService': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const stats = {
    total: trucks.length,
    available: trucks.filter(t => t.status === 'Available').length,
    inUse: trucks.filter(t => t.status === 'InUse').length,
    maintenance: trucks.filter(t => t.status === 'Maintenance').length,
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Camions</h1>
          <button
            onClick={handleCreateTruck}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un Camion
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Camions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <TruckIcon className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Disponibles</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <TruckIcon className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">En Service</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inUse}</p>
              </div>
              <TruckIcon className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Maintenance</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
              </div>
              <TruckIcon className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par matricule, marque ou modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'Available', 'InUse', 'Maintenance', 'OutOfService'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status === 'all' ? 'Tous' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trucks Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredTrucks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun camion trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrucks.map((truck) => (
              <div key={truck._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <TruckIcon className="w-10 h-10 text-blue-600" />
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{truck.registrationNumber}</h3>
                        <p className="text-sm text-gray-500">{truck.brand} {truck.model}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Année:</span>
                      <span className="font-semibold">{truck.year}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Kilométrage:</span>
                      <span className="font-semibold">{truck.currentKilometers.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Carburant:</span>
                      <span className="font-semibold">{truck.currentFuelLevel}L / {truck.fuelCapacity}L</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Condition:</span>
                      <span className={`font-semibold ${getConditionColor(truck.condition)}`}>
                        {truck.condition}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(truck.status)}`}>
                      {truck.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTruck(truck)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteTruck(truck._id)}
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

        {/* Truck Form Modal */}
        {isModalOpen && (
          <TruckFormModal
            truck={selectedTruck}
            onClose={handleModalClose}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Trucks;
