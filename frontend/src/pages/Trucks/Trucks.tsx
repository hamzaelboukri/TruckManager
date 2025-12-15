import { useState, useEffect } from 'react';
import { Plus, Truck as TruckIcon, Edit2, Trash2, Search, CircleDot, Wrench } from 'lucide-react';
import { truckService } from '../../services/truckService';
import { tireService } from '../../services/tireService';
import { maintenanceService } from '../../services/maintenanceService';
import type { Truck, Tire } from '../../types';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import TruckFormModal from '../../components/trucks/TruckFormModal';
import TireListModal from '../../components/trucks/TireListModal';

const Trucks = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [isTireModalOpen, setIsTireModalOpen] = useState(false);
  const [selectedTruckTires, setSelectedTruckTires] = useState<Tire[]>([]);
  const [selectedTruckInfo, setSelectedTruckInfo] = useState<{id: string, name: string} | null>(null);
  const [truckTires, setTruckTires] = useState<Record<string, Tire[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrucks, setTotalTrucks] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchTrucks();
  }, [statusFilter, currentPage]);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const params: any = { limit: itemsPerPage, page: currentPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await truckService.getAllTrucks(params);
      const trucksData = response.data || [];
      setTrucks(trucksData);
      setTotalPages(response.pages || 1);
      setTotalTrucks(response.total || 0);
      
      // Fetch tires for each truck
      const tiresMap: Record<string, Tire[]> = {};
      await Promise.all(
        trucksData.map(async (truck) => {
          try {
            const tiresResponse = await tireService.getTiresByVehicle(truck._id, 'Truck');
            tiresMap[truck._id] = tiresResponse.data || [];
          } catch (error) {
            tiresMap[truck._id] = [];
          }
        })
      );
      setTruckTires(tiresMap);
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

  const handleViewTires = (truck: Truck) => {
    setSelectedTruckTires(truckTires[truck._id] || []);
    setSelectedTruckInfo({ id: truck._id, name: truck.registrationNumber });
    setIsTireModalOpen(true);
  };

  const handleTireModalClose = () => {
    setIsTireModalOpen(false);
    setSelectedTruckTires([]);
    setSelectedTruckInfo(null);
  };

  const handleCheckMaintenance = async (truck: Truck) => {
    try {
      const result = await maintenanceService.checkDueMaintenance('Truck', truck._id, true);
      if (result && result.success !== false) {
        if (result.hasDueMaintenance) {
          const createdCount = result.createdRecords?.length || 0;
          if (createdCount > 0) {
            toast.success(`${createdCount} maintenance(s) créée(s) pour ${truck.registrationNumber}`);
          } else {
            toast.info(`${result.dueMaintenances?.length || 0} maintenance(s) en attente pour ${truck.registrationNumber}`);
          }
        } else {
          toast.success(`Aucune maintenance requise pour ${truck.registrationNumber}`);
        }
        fetchTrucks();
      } else {
        toast.success('Vérification terminée');
      }
    } catch (error: any) {
      console.error('Error checking maintenance:', error);
      toast.error(error?.response?.data?.message || 'Erreur lors de la vérification de maintenance');
    }
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

                  {/* Tires Section */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CircleDot className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Pneus ({truckTires[truck._id]?.length || 0})
                        </span>
                      </div>
                    </div>
                    {truckTires[truck._id]?.length > 0 ? (
                      <div className="space-y-1">
                        {truckTires[truck._id].slice(0, 3).map((tire) => (
                          <div key={tire._id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{tire.serialNumber}</span>
                            <span className="text-gray-500">{tire.position}</span>
                          </div>
                        ))}
                        {truckTires[truck._id].length > 3 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{truckTires[truck._id].length - 3} autres...
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Aucun pneu assigné</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(truck.status)}`}>
                      {truck.status}
                    </span>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleViewTires(truck)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <CircleDot className="w-4 h-4" />
                      Pneus
                    </button>
                    <button
                      onClick={() => handleCheckMaintenance(truck)}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                      title="Vérifier maintenance"
                    >
                      <Wrench className="w-4 h-4" />
                      Maintenance
                    </button>
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
              Page {currentPage} sur {totalPages} ({totalTrucks} camions)
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

        {/* Truck Form Modal */}
        {isModalOpen && (
          <TruckFormModal
            truck={selectedTruck}
            onClose={handleModalClose}
          />
        )}

        {/* Tire List Modal */}
        {isTireModalOpen && selectedTruckInfo && (
          <TireListModal
            vehicleName={selectedTruckInfo.name}
            vehicleType="Truck"
            tires={selectedTruckTires}
            onClose={handleTireModalClose}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Trucks;
