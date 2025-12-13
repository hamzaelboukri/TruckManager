import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { X, MapPin, Navigation, Calculator, Truck, User, Calendar } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const departureIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const arrivalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

interface LocationData {
  lat: number;
  lng: number;
  name: string;
}

// Component to handle map clicks
const MapClickHandler: React.FC<{
  onMapClick: (latlng: L.LatLng) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

export const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [step, setStep] = useState<'departure' | 'arrival' | 'details'>('departure');
  const [departure, setDeparture] = useState<LocationData | null>(
    initialData?.departureCoords 
      ? { ...initialData.departureCoords, name: initialData.departure }
      : null
  );
  const [arrival, setArrival] = useState<LocationData | null>(
    initialData?.arrivalCoords 
      ? { ...initialData.arrivalCoords, name: initialData.arrival }
      : null
  );
  
  const [formData, setFormData] = useState({
    truck: initialData?.truck || '',
    driver: initialData?.driver || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    estimatedDuration: initialData?.estimatedDuration || '',
  });

  const [distance, setDistance] = useState<number>(initialData?.distance || 0);
  const [fuelConsumption, setFuelConsumption] = useState<number>(initialData?.fuelConsumption || 0);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance);
  };

  // Reverse geocoding to get location name
  const getLocationName = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.address?.city || data.address?.town || data.address?.village || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleMapClick = async (latlng: L.LatLng) => {
    const locationName = await getLocationName(latlng.lat, latlng.lng);
    
    if (step === 'departure') {
      setDeparture({ lat: latlng.lat, lng: latlng.lng, name: locationName });
      setStep('arrival');
    } else if (step === 'arrival') {
      setArrival({ lat: latlng.lat, lng: latlng.lng, name: locationName });
      setStep('details');
    }
  };

  useEffect(() => {
    if (departure && arrival) {
      const dist = calculateDistance(departure.lat, departure.lng, arrival.lat, arrival.lng);
      setDistance(dist);
      
      // Calculate estimated fuel consumption (average: 25-30 L/100km for trucks)
      const avgConsumption = 27.5;
      const fuel = Math.round((dist * avgConsumption) / 100);
      setFuelConsumption(fuel);
      
      // Calculate estimated duration (average speed: 80 km/h)
      const avgSpeed = 80;
      const hours = Math.floor(dist / avgSpeed);
      const minutes = Math.round(((dist / avgSpeed) - hours) * 60);
      setFormData(prev => ({
        ...prev,
        estimatedDuration: `${hours}h ${minutes}m`
      }));
    }
  }, [departure, arrival]);

  const handleSave = () => {
    if (!departure || !arrival || !formData.truck || !formData.driver) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    const routeData = {
      departure: departure.name,
      arrival: arrival.name,
      departureCoords: { lat: departure.lat, lng: departure.lng },
      arrivalCoords: { lat: arrival.lat, lng: arrival.lng },
      distance,
      fuelConsumption,
      ...formData
    };

    onSave(routeData);
  };

  const resetSelection = () => {
    setDeparture(null);
    setArrival(null);
    setStep('departure');
    setDistance(0);
    setFuelConsumption(0);
  };

  if (!isOpen) return null;

  const center: [number, number] = departure
    ? [departure.lat, departure.lng]
    : [46.603354, 1.888334]; // Center of France

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {initialData ? 'Modifier la Route' : 'Créer une Nouvelle Route'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Steps Indicator */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'departure' ? 'bg-white/20' : 'bg-white/10'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${departure ? 'bg-green-500' : 'bg-white/30'}`}>
                {departure ? '✓' : '1'}
              </div>
              <span className="font-medium">Départ</span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'arrival' ? 'bg-white/20' : 'bg-white/10'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${arrival ? 'bg-green-500' : 'bg-white/30'}`}>
                {arrival ? '✓' : '2'}
              </div>
              <span className="font-medium">Arrivée</span>
            </div>
            
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'details' ? 'bg-white/20' : 'bg-white/10'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'details' ? 'bg-white' : 'bg-white/30'} ${step === 'details' ? 'text-blue-600' : 'text-white'}`}>
                3
              </div>
              <span className="font-medium">Détails</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Map Section */}
          <div className="flex-1 relative">
            <MapContainer
              center={center}
              zoom={departure && arrival ? 7 : 6}
              className="h-full w-full"
              style={{ minHeight: '400px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapClickHandler onMapClick={handleMapClick} />
              
              {departure && (
                <Marker position={[departure.lat, departure.lng]} icon={departureIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">Départ</p>
                      <p className="text-sm">{departure.name}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {arrival && (
                <Marker position={[arrival.lat, arrival.lng]} icon={arrivalIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">Arrivée</p>
                      <p className="text-sm">{arrival.name}</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {departure && arrival && (
                <Polyline
                  positions={[
                    [departure.lat, departure.lng],
                    [arrival.lat, arrival.lng]
                  ]}
                  color="#3b82f6"
                  weight={3}
                  dashArray="10, 10"
                />
              )}
            </MapContainer>
            
            {/* Map Instructions */}
            {step !== 'details' && (
              <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <MapPin className={`w-6 h-6 ${step === 'departure' ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {step === 'departure' ? 'Cliquez sur la carte pour sélectionner le point de départ' : 'Cliquez sur la carte pour sélectionner le point d\'arrivée'}
                    </p>
                    {departure && step === 'arrival' && (
                      <p className="text-sm text-gray-600">Départ: {departure.name}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          {step === 'details' && (
            <div className="lg:w-96 p-6 bg-gray-50 overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Détails de la Route</h3>
              
              {/* Route Summary */}
              <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Départ</p>
                      <p className="font-semibold text-gray-900">{departure?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pl-1">
                    <div className="w-px h-8 bg-gray-300 ml-1"></div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-1"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Arrivée</p>
                      <p className="font-semibold text-gray-900">{arrival?.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                      <Navigation className="w-4 h-4" />
                      <span className="text-2xl font-bold">{distance}</span>
                    </div>
                    <p className="text-xs text-gray-500">Kilomètres</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
                      <Calculator className="w-4 h-4" />
                      <span className="text-2xl font-bold">{fuelConsumption}</span>
                    </div>
                    <p className="text-xs text-gray-500">Litres (estimé)</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Truck className="w-4 h-4" />
                    Camion *
                  </label>
                  <input
                    type="text"
                    value={formData.truck}
                    onChange={(e) => setFormData({ ...formData, truck: e.target.value })}
                    placeholder="Ex: Volvo FH16 - ABC123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Chauffeur *
                  </label>
                  <input
                    type="text"
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    placeholder="Ex: Jean Dupont"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Durée Estimée
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    placeholder="Ex: 5h 30m"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={resetSelection}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
