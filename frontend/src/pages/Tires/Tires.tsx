import { useState, useEffect } from 'react';
import { Plus, CircleDot, Edit2, Trash2, Search } from 'lucide-react';
import { tireService } from '../../services/tireService';
import type { Tire } from '../../types';
import { toast } from 'react-hot-toast';
import { MainLayout } from '../../layouts/MainLayout';
import TireFormModal from '../../components/tires/TireFormModal';

const Tires = () => {
  const [tires, setTires] = useState<Tire[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ownerTypeFilter, setOwnerTypeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null);

  useEffect(() => {
    fetchTires();
  }, [statusFilter, ownerTypeFilter]);

  const fetchTires = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (ownerTypeFilter !== 'all') params.ownerType = ownerTypeFilter;
      
      const response = await tireService.getAllTires(params);
      setTires(response.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des pneus');
      console.error('Error fetching tires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTire = () => {
    setSelectedTire(null);
    setIsModalOpen(true);
  };

  const handleEditTire = (tire: Tire) => {
    setSelectedTire(tire);
    setIsModalOpen(true);
  };

  const handleDeleteTire = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce pneu?')) return;

    try {
      await tireService.deleteTire(id);
      toast.success('Pneu supprimé avec succès');
      fetchTires();
    } catch (error) {
      toast.error('Erreur lors de la suppression du pneu');
      console.error('Error deleting tire:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTire(null);
    fetchTires();
  };

  const filteredTires = tires.filter(tire => {
    const matchesSearch = 
      tire.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tire.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tire.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tire.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return 'bg-green-100 text-green-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'NeedReplacement': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWearColor = (wear: number) => {
    if (wear <= 30) return 'text-green-600';
    if (wear <= 60) return 'text-yellow-600';
    if (wear <= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const stats = {
    total: tires.length,
    good: tires.filter(t => t.status === 'Good').length,
    warning: tires.filter(t => t.status === 'Warning').length,
    needReplacement: tires.filter(t => t.status === 'NeedReplacement').length,
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Pneus</h1>
          <button
            onClick={handleCreateTire}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un Pneu
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Pneus</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <CircleDot className="w-10 h-10 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Bon État</p>
                <p className="text-2xl font-bold text-green-600">{stats.good}</p>
              </div>
              <CircleDot className="w-10 h-10 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Attention</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
              </div>
              <CircleDot className="w-10 h-10 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">À Remplacer</p>
                <p className="text-2xl font-bold text-red-600">{stats.needReplacement}</p>
              </div>
              <CircleDot className="w-10 h-10 text-red-400" />
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
                placeholder="Rechercher par numéro de série, marque, modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'Good', 'Warning', 'NeedReplacement'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status === 'all' ? 'Tous' : status === 'Good' ? 'Bon' : status === 'Warning' ? 'Attention' : 'À Remplacer'}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'Truck', 'Trailer'].map((type) => (
                <button
                  key={type}
                  onClick={() => setOwnerTypeFilter(type)}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    ownerTypeFilter === type
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {type === 'all' ? 'Tous Types' : type === 'Truck' ? 'Camion' : 'Remorque'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tires Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredTires.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CircleDot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun pneu trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTires.map((tire) => (
              <div key={tire._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CircleDot className="w-10 h-10 text-blue-600" />
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{tire.serialNumber}</h3>
                        <p className="text-sm text-gray-500">{tire.brand} {tire.model}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Taille:</span>
                      <span className="font-semibold">{tire.size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Position:</span>
                      <span className="font-semibold">{tire.position}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Type:</span>
                      <span className="font-semibold">{tire.ownerType === 'Truck' ? 'Camion' : 'Remorque'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Usure:</span>
                      <span className={`font-semibold ${getWearColor(tire.currentWearPercentage)}`}>
                        {tire.currentWearPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Kilométrage:</span>
                      <span className="font-semibold">{tire.currentKilometers.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Installation:</span>
                      <span className="font-semibold">{tire.installationKilometers.toLocaleString()} km</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(tire.status)}`}>
                      {tire.status === 'Good' ? 'Bon' : tire.status === 'Warning' ? 'Attention' : 'À Remplacer'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditTire(tire)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteTire(tire._id)}
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

        {/* Tire Form Modal */}
        {isModalOpen && (
          <TireFormModal
            tire={selectedTire}
            onClose={handleModalClose}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Tires;
