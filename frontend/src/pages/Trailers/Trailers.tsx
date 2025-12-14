import { useState, useEffect } from 'react';
import { Plus, TruckIcon, Edit2, Trash2, Search, CircleDot } from 'lucide-react';
import { trailerService } from '../../services/trailerService';
import { tireService } from '../../services/tireService';
import type { Trailer, Tire } from '../../types';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import TrailerFormModal from '../../components/trailers/TrailerFormModal';
import TireListModal from '../../components/trucks/TireListModal';

const Trailers = () => {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);
  const [isTireModalOpen, setIsTireModalOpen] = useState(false);
  const [selectedTrailerTires, setSelectedTrailerTires] = useState<Tire[]>([]);
  const [selectedTrailerInfo, setSelectedTrailerInfo] = useState<{id: string, name: string} | null>(null);
  const [trailerTires, setTrailerTires] = useState<Record<string, Tire[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrailers, setTotalTrailers] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchTrailers();
  }, [statusFilter, typeFilter, currentPage]);

  const fetchTrailers = async () => {
    try {
      setLoading(true);
      const params: any = { limit: itemsPerPage, page: currentPage };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      
      const response = await trailerService.getAllTrailers(params);
      const trailersData = response.data || [];
      setTrailers(trailersData);
      setTotalPages(response.pagination?.pages || 1);
      setTotalTrailers(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 1);
      setTotalTrailers(response.pagination?.total || 0);
      
      // Fetch tires for each trailer
      const tiresMap: Record<string, Tire[]> = {};
      await Promise.all(
        trailersData.map(async (trailer) => {
          try {
            const tiresResponse = await tireService.getTiresByVehicle(trailer._id, 'Trailer');
            tiresMap[trailer._id] = tiresResponse.data || [];
          } catch (error) {
            tiresMap[trailer._id] = [];
          }
        })
      );
      setTrailerTires(tiresMap);
    } catch (error) {
      toast.error('Erreur lors du chargement des remorques');
      console.error('Error fetching trailers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrailer = () => {
    setSelectedTrailer(null);
    setIsModalOpen(true);
  };

  const handleEditTrailer = (trailer: Trailer) => {
    setSelectedTrailer(trailer);
    setIsModalOpen(true);
  };

  const handleDeleteTrailer = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette remorque?')) return;

    try {
      await trailerService.deleteTrailer(id);
      toast.success('Remorque supprimée avec succès');
      fetchTrailers();
    } catch (error) {
      toast.error('Erreur lors de la suppression de la remorque');
      console.error('Error deleting trailer:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTrailer(null);
    fetchTrailers();
  };

  const handleViewTires = async (trailer: Trailer) => {
    try {
      const response = await tireService.getTiresByVehicle(trailer._id);
      setSelectedTrailerTires(response.data || []);
      setSelectedTrailerInfo({ id: trailer._id, name: trailer.registrationNumber });
      setIsTireModalOpen(true);
    } catch (error) {
      toast.error('Erreur lors du chargement des pneus');
      console.error('Error fetching tires:', error);
    }
  };

  const handleTireModalClose = () => {
    setIsTireModalOpen(false);
    setSelectedTrailerTires([]);
    setSelectedTrailerInfo(null);
  };

  const filteredTrailers = trailers.filter(trailer => {
    const matchesSearch = 
      trailer.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trailer.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trailer.model.toLowerCase().includes(searchTerm.toLowerCase());
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
    total: trailers.length,
    available: trailers.filter(t => t.status === 'Available').length,
    inUse: trailers.filter(t => t.status === 'InUse').length,
    maintenance: trailers.filter(t => t.status === 'Maintenance').length,
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Remorques</h1>
          <button
            onClick={handleCreateTrailer}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter une Remorque
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Remorques</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'Available', 'InUse', 'Maintenance', 'OutOfService'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status === 'all' ? 'Tous' : status}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'Flatbed', 'Refrigerated', 'Tanker', 'Container', 'Van'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    typeFilter === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type === 'all' ? 'Tous Types' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trailers Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredTrailers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucune remorque trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrailers.map((trailer) => (
              <div key={trailer._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <TruckIcon className="w-10 h-10 text-blue-600" />
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{trailer.registrationNumber}</h3>
                        <p className="text-sm text-gray-500">{trailer.brand} {trailer.model}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Type:</span>
                      <span className="font-semibold">{trailer.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Année:</span>
                      <span className="font-semibold">{trailer.year}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Capacité Max:</span>
                      <span className="font-semibold">{trailer.maxCapacity} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Kilométrage:</span>
                      <span className="font-semibold">{trailer.currentKilometers.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Dimensions:</span>
                      <span className="font-semibold">
                        {trailer.dimensions?.length && trailer.dimensions?.width && trailer.dimensions?.height
                          ? `${trailer.dimensions.length}×${trailer.dimensions.width}×${trailer.dimensions.height}m`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Condition:</span>
                      <span className={`font-semibold ${getConditionColor(trailer.condition || 'Good')}`}>
                        {trailer.condition || 'Good'}
                      </span>
                    </div>
                  </div>

                  {/* Tires Section */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CircleDot className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">
                          Pneus ({trailerTires[trailer._id]?.length || 0})
                        </span>
                      </div>
                    </div>
                    {trailerTires[trailer._id]?.length > 0 ? (
                      <div className="space-y-1">
                        {trailerTires[trailer._id].slice(0, 3).map((tire) => (
                          <div key={tire._id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{tire.serialNumber}</span>
                            <span className="text-gray-500">{tire.position}</span>
                          </div>
                        ))}
                        {trailerTires[trailer._id].length > 3 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{trailerTires[trailer._id].length - 3} autres...
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Aucun pneu assigné</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(trailer.status)}`}>
                      {trailer.status}
                    </span>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleViewTires(trailer)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CircleDot className="w-4 h-4" />
                      Pneus
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTrailer(trailer)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteTrailer(trailer._id)}
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
              Page {currentPage} sur {totalPages} ({totalTrailers} remorques)
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

        {/* Trailer Form Modal */}
        {isModalOpen && (
          <TrailerFormModal
            trailer={selectedTrailer}
            onClose={handleModalClose}
          />
        )}

        {/* Tire List Modal */}
        {isTireModalOpen && selectedTrailerInfo && (
          <TireListModal
            vehicleName={selectedTrailerInfo.name}
            vehicleType="Trailer"
            tires={selectedTrailerTires}
            onClose={handleTireModalClose}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Trailers;
