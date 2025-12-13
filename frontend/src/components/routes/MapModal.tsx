import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { X, MapPin, Truck, User, Calendar, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { api } from '../../services/api';

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
  const [selectingPoint, setSelectingPoint] = useState<'departure' | 'arrival' | null>('departure');
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
    truckId: initialData?.truckId || '',
    driver: initialData?.driver || '',
    driverId: initialData?.driverId || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    description: initialData?.description || '',
  });

  const [distance, setDistance] = useState<number>(initialData?.distance || 0);
  
  // Search states
  const [truckSearch, setTruckSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [trucks, setTrucks] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
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
    if (!selectingPoint) return;
    
    const locationName = await getLocationName(latlng.lat, latlng.lng);
    
    if (selectingPoint === 'departure') {
      setDeparture({ lat: latlng.lat, lng: latlng.lng, name: locationName });
    } else {
      setArrival({ lat: latlng.lat, lng: latlng.lng, name: locationName });
    }
    
    setSelectingPoint(null);
  };

  useEffect(() => {
    if (departure && arrival) {
      const dist = calculateDistance(departure.lat, departure.lng, arrival.lat, arrival.lng);
      setDistance(dist);
    }
  }, [departure, arrival]);

  // Fetch trucks from backend
  useEffect(() => {
    const fetchTrucks = async () => {
      if (truckSearch.length >= 2) {
        try {
          const response = await api.get('/trucks?limit=50');
          const allTrucks = response.data.data || [];
          
          // Filter trucks by brand, model, or registration number
          const filtered = allTrucks.filter((truck: any) => {
            const searchLower = truckSearch.toLowerCase();
            return (
              truck.brand?.toLowerCase().includes(searchLower) ||
              truck.model?.toLowerCase().includes(searchLower) ||
              truck.registrationNumber?.toLowerCase().includes(searchLower)
            );
          });
          
          setTrucks(filtered);
          setShowTruckDropdown(filtered.length > 0);
        } catch (error) {
          console.error('Error fetching trucks:', error);
        }
      } else {
        setTrucks([]);
        setShowTruckDropdown(false);
      }
    };

    const debounce = setTimeout(fetchTrucks, 300);
    return () => clearTimeout(debounce);
  }, [truckSearch]);

  // Fetch drivers from backend
  useEffect(() => {
    const fetchDrivers = async () => {
      if (driverSearch.length >= 2) {
        try {
          // Get all drivers with populated user data
          const driversResponse = await api.get('/drivers');
          const allDrivers = driversResponse.data.data || [];
          
          // Filter drivers by user name or email
          const searchLower = driverSearch.toLowerCase();
          const filtered = allDrivers
            .filter((driver: any) => {
              const userName = driver.user?.name?.toLowerCase() || '';
              const userEmail = driver.user?.email?.toLowerCase() || '';
              return userName.includes(searchLower) || userEmail.includes(searchLower);
            })
            .map((driver: any) => ({
              _id: driver.user?._id,
              name: driver.user?.name || 'N/A',
              email: driver.user?.email || 'N/A',
              driverId: driver._id
            }));
          
          setDrivers(filtered);
          setShowDriverDropdown(filtered.length > 0);
        } catch (error) {
          console.error('Error fetching drivers:', error);
        }
      } else {
        setDrivers([]);
        setShowDriverDropdown(false);
      }
    };

    const debounce = setTimeout(fetchDrivers, 300);
    return () => clearTimeout(debounce);
  }, [driverSearch]);

  const handleSave = () => {
    if (!departure || !arrival || !formData.truckId || !formData.driverId || !formData.description) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    const routeData = {
      departureLocation: departure.name,
      arrivalLocation: arrival.name,
      departureCoords: { lat: departure.lat, lng: departure.lng },
      arrivalCoords: { lat: arrival.lat, lng: arrival.lng },
      distance,
      truck: formData.truckId,
      driver: formData.driverId,
      description: formData.description,
      date: formData.date,
    };

    onSave(routeData);
  };

  if (!isOpen) return null;

  const center: [number, number] = departure
    ? [departure.lat, departure.lng]
    : [46.603354, 1.888334]; // Center of France

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {initialData ? 'Modifier la Route' : 'Créer une Nouvelle Route'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Map Section */}
          <div className="flex-1 relative">
            <MapContainer center={center} zoom={6} className="h-full w-full" style={{ minHeight: '400px' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} />
              
              {departure && (
                <Marker position={[departure.lat, departure.lng]} icon={departureIcon}>
                  <Popup><strong>Départ:</strong> {departure.name}</Popup>
                </Marker>
              )}
              
              {arrival && (
                <Marker position={[arrival.lat, arrival.lng]} icon={arrivalIcon}>
                  <Popup><strong>Arrivée:</strong> {arrival.name}</Popup>
                </Marker>
              )}
              
              {departure && arrival && (
                <Polyline
                  positions={[[departure.lat, departure.lng], [arrival.lat, arrival.lng]]}
                  color="#3b82f6"
                  weight={3}
                  dashArray="10, 10"
                />
              )}
            </MapContainer>
          </div>

          {/* Form Section */}
          <div className="lg:w-96 p-6 bg-gray-50 overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Informations de la Route</h3>
            
            {/* Location Selection */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectingPoint('departure')}
                className={`w-full p-3 rounded-lg border-2 text-left transition ${
                  selectingPoint === 'departure' 
                    ? 'border-green-500 bg-green-50' 
                    : departure 
                    ? 'border-green-200 bg-white' 
                    : 'border-gray-300 bg-white hover:border-green-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Point de départ</p>
                    <p className="font-semibold text-gray-900">{departure?.name || 'Cliquez pour sélectionner'}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectingPoint('arrival')}
                className={`w-full p-3 rounded-lg border-2 text-left transition ${
                  selectingPoint === 'arrival' 
                    ? 'border-red-500 bg-red-50' 
                    : arrival 
                    ? 'border-red-200 bg-white' 
                    : 'border-gray-300 bg-white hover:border-red-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Point d'arrivée</p>
                    <p className="font-semibold text-gray-900">{arrival?.name || 'Cliquez pour sélectionner'}</p>
                  </div>
                </div>
              </button>

              {distance > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{distance} km</p>
                  <p className="text-xs text-gray-600">Distance totale</p>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Truck Search */}
              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Truck className="w-4 h-4" />
                  Camion *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={truckSearch || formData.truck}
                    onChange={(e) => {
                      setTruckSearch(e.target.value);
                      setFormData({ ...formData, truck: e.target.value });
                    }}
                    onFocus={() => truckSearch.length >= 2 && setShowTruckDropdown(true)}
                    placeholder="Rechercher un camion..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                
                {/* Truck Dropdown */}
                {showTruckDropdown && trucks.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {trucks.map((truck) => (
                      <button
                        key={truck._id}
                        type="button"
                        onClick={() => {
                          const truckName = `${truck.brand} ${truck.model} - ${truck.registrationNumber}`;
                          setFormData({ ...formData, truck: truckName, truckId: truck._id });
                          setTruckSearch(truckName);
                          setShowTruckDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 transition flex items-center gap-3"
                      >
                        <Truck className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{truck.brand} {truck.model}</p>
                          <p className="text-xs text-gray-500">{truck.registrationNumber} • {truck.status}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Driver Search */}
              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Chauffeur *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={driverSearch || formData.driver}
                    onChange={(e) => {
                      setDriverSearch(e.target.value);
                      setFormData({ ...formData, driver: e.target.value });
                    }}
                    onFocus={() => driverSearch.length >= 2 && setShowDriverDropdown(true)}
                    placeholder="Rechercher un chauffeur..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
                
                {/* Driver Dropdown */}
                {showDriverDropdown && drivers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {drivers.map((driver) => (
                      <button
                        key={driver._id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, driver: driver.name, driverId: driver.driverId });
                          setDriverSearch(driver.name);
                          setShowDriverDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-blue-50 transition flex items-center gap-3"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">{driver.name}</p>
                          <p className="text-xs text-gray-500">{driver.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la route..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleSave}
              disabled={!departure || !arrival || !formData.truckId || !formData.driverId || !formData.description}
              className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enregistrer la Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
