import { X, CircleDot } from 'lucide-react';
import type { Tire } from '../../types';

interface TireListModalProps {
  vehicleId: string;
  vehicleName: string;
  vehicleType: 'Truck' | 'Trailer';
  tires: Tire[];
  onClose: () => void;
}

const TireListModal = ({ vehicleId, vehicleName, vehicleType, tires, onClose }: TireListModalProps) => {
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pneus de {vehicleName}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {vehicleType === 'Truck' ? 'Camion' : 'Remorque'} • {tires.length} pneu(s)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {tires.length === 0 ? (
            <div className="text-center py-12">
              <CircleDot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun pneu assigné à ce véhicule</p>
              <p className="text-gray-400 text-sm mt-2">Ajoutez des pneus depuis la page Pneus</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tires.map((tire) => (
                <div key={tire._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CircleDot className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-bold text-gray-900">{tire.serialNumber}</h3>
                        <p className="text-xs text-gray-500">{tire.brand} {tire.model}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(tire.status)}`}>
                      {tire.status === 'Good' ? 'Bon' : tire.status === 'Warning' ? 'Attention' : 'À Remplacer'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Position:</span>
                      <span className="font-semibold text-sm">{tire.position}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Taille:</span>
                      <span className="font-semibold text-sm">{tire.size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Usure:</span>
                      <span className={`font-semibold text-sm ${getWearColor(tire.currentWearPercentage)}`}>
                        {tire.currentWearPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Kilométrage:</span>
                      <span className="font-semibold text-sm">{tire.currentKilometers.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Parcouru:</span>
                      <span className="font-semibold text-sm">
                        {(tire.currentKilometers - tire.installationKilometers).toLocaleString()} km
                      </span>
                    </div>
                  </div>

                  {/* Wear progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Usure</span>
                      <span>{tire.currentWearPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          tire.currentWearPercentage <= 30
                            ? 'bg-green-500'
                            : tire.currentWearPercentage <= 60
                            ? 'bg-yellow-500'
                            : tire.currentWearPercentage <= 80
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(tire.currentWearPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TireListModal;
