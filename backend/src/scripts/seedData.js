import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Driver from '../models/Driver.js';
import Truck from '../models/Truck.js';
import Trailer from '../models/Trailer.js';
import Tire from '../models/Tire.js';
import Route from '../models/Route.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import MaintenanceRule from '../models/MaintenanceRule.js';

dotenv.config();

// Moroccan cities for realistic routes
const cities = [
  { name: 'Casablanca', coords: { lat: 33.5731, lng: -7.5898 } },
  { name: 'Rabat', coords: { lat: 34.0209, lng: -6.8416 } },
  { name: 'Marrakech', coords: { lat: 31.6295, lng: -7.9811 } },
  { name: 'Fès', coords: { lat: 34.0181, lng: -5.0078 } },
  { name: 'Tanger', coords: { lat: 35.7595, lng: -5.8340 } },
  { name: 'Agadir', coords: { lat: 30.4278, lng: -9.5981 } },
  { name: 'Meknès', coords: { lat: 33.8935, lng: -5.5473 } },
  { name: 'Oujda', coords: { lat: 34.6867, lng: -1.9114 } },
  { name: 'Kenitra', coords: { lat: 34.2610, lng: -6.5802 } },
  { name: 'Tétouan', coords: { lat: 35.5889, lng: -5.3626 } }
];

const truckBrands = ['Volvo', 'Mercedes-Benz', 'Scania', 'MAN', 'Renault', 'DAF', 'Iveco'];
const trailerTypes = ['Plateau', 'Frigo', 'Citerne', 'Bâché', 'Porte-conteneur'];
const driverNames = [
  'Mohammed Alami', 'Ahmed Bennani', 'Hassan Idrissi', 'Omar Fassi',
  'Youssef Tazi', 'Rachid Amrani', 'Karim Lazrak', 'Said Berrada',
  'Khalid Zaidi', 'Amine Mahjoubi'
];

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c);
}

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/truckmanager');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Driver.deleteMany({});
    await Truck.deleteMany({});
    await Trailer.deleteMany({});
    await Tire.deleteMany({});
    await Route.deleteMany({});
    await MaintenanceRecord.deleteMany({});
    await MaintenanceRule.deleteMany({});

    // Create Admin User
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin Principal',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'Admin',
      phone: '+212600000001'
    });
    const admin = await Admin.create({ user: adminUser._id });

    // Create Drivers
    console.log('Creating drivers...');
    const drivers = [];
    for (let i = 0; i < 10; i++) {
      const driverPassword = await bcrypt.hash('driver123', 10);
      const driverUser = await User.create({
        name: driverNames[i],
        email: `driver${i + 1}@mailinator.com`,
        password: driverPassword,
        role: 'Driver',
        phone: `+21260000${String(i + 10).padStart(4, '0')}`
      });
      
      const driver = await Driver.create({
        user: driverUser._id,
        licenseNumber: `DL${String(2024000 + i).padStart(8, '0')}`,
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2), // 2 years
        address: `${Math.floor(Math.random() * 200) + 1} Rue ${cities[i].name}`,
        emergencyContact: `+21260100${String(i + 1).padStart(4, '0')}`,
        emergencyContactName: `Contact ${driverNames[i].split(' ')[0]}`
      });
      drivers.push(driver);
    }

    // Create Trucks
    console.log('Creating trucks...');
    const trucks = [];
    for (let i = 0; i < 15; i++) {
      const brand = truckBrands[i % truckBrands.length];
      const year = 2018 + (i % 7);
      const truck = await Truck.create({
        registrationNumber: `TRK-${String(i + 1).padStart(3, '0')}`,
        model: `${brand}-${year}`,
        year,
        purchaseDate: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        currentKilometers: 50000 + Math.floor(Math.random() * 150000),
        fuelCapacity: 900 + (i % 5) * 50,
        status: ['Available', 'InRoute', 'Maintenance'][i % 3]
      });
      trucks.push(truck);
    }

    // Create Trailers
    console.log('Creating trailers...');
    const trailers = [];
    const validTrailerTypes = ['Flatbed', 'Refrigerated', 'Tanker', 'Container', 'Van', 'Other'];
    for (let i = 0; i < 10; i++) {
      const brand = truckBrands[i % truckBrands.length];
      const year = 2019 + (i % 6);
      const trailer = await Trailer.create({
        registrationNumber: `TRL-${String(i + 1).padStart(3, '0')}`,
        brand,
        model: `${brand} ${validTrailerTypes[i % validTrailerTypes.length]}`,
        year,
        purchaseDate: new Date(year, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        type: validTrailerTypes[i % validTrailerTypes.length],
        maxCapacity: 15000 + (i % 4) * 5000,
        currentKilometers: 30000 + Math.floor(Math.random() * 100000),
        status: ['Available', 'InUse', 'Maintenance'][i % 3]
      });
      trailers.push(trailer);
    }

    // Create Tires for Trucks and Trailers
    console.log('Creating tires...');
    const tirePositions = ['Front Left', 'Front Right', 'Rear Left Inner', 'Rear Left Outer', 'Rear Right Inner', 'Rear Right Outer'];
    const tireBrands = ['Michelin', 'Bridgestone', 'Continental', 'Goodyear', 'Pirelli'];
    
    for (const truck of trucks.slice(0, 10)) {
      for (let i = 0; i < 6; i++) {
        const purchaseDate = new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000);
        await Tire.create({
          serialNumber: `TRK${truck.registrationNumber.replace('TRK-', '')}T${i + 1}${String(Date.now()).slice(-6)}`,
          brand: tireBrands[Math.floor(Math.random() * tireBrands.length)],
          model: `HD-${Math.floor(Math.random() * 900) + 100}`,
          size: '295/80R22.5',
          position: tirePositions[i],
          purchaseDate,
          currentWearPercentage: Math.floor(Math.random() * 80),
          status: ['Good', 'Warning', 'NeedReplacement'][Math.floor(Math.random() * 3)],
          installationKilometers: Math.max(0, truck.currentKilometers - Math.floor(Math.random() * 40000)),
          currentKilometers: truck.currentKilometers,
          vehicle: truck._id,
          ownerType: 'Truck'
        });
      }
    }

    for (const trailer of trailers.slice(0, 5)) {
      for (let i = 0; i < 4; i++) {
        const purchaseDate = new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000);
        await Tire.create({
          serialNumber: `TRL${trailer.registrationNumber.replace('TRL-', '')}T${i + 1}${String(Date.now()).slice(-6)}`,
          brand: tireBrands[Math.floor(Math.random() * tireBrands.length)],
          model: `HD-${Math.floor(Math.random() * 900) + 100}`,
          size: '385/65R22.5',
          position: ['Rear Left', 'Rear Right', 'Spare 1', 'Spare 2'][i],
          purchaseDate,
          currentWearPercentage: Math.floor(Math.random() * 70),
          status: ['Good', 'Warning'][Math.floor(Math.random() * 2)],
          installationKilometers: Math.max(0, trailer.currentKilometers - Math.floor(Math.random() * 30000)),
          currentKilometers: trailer.currentKilometers,
          vehicle: trailer._id,
          ownerType: 'Trailer'
        });
      }
    }

    // Create Routes
    console.log('Creating routes...');
    const cargoTypes = [
      { desc: 'Marchandises générales', weight: 15000 },
      { desc: 'Produits alimentaires', weight: 12000 },
      { desc: 'Équipements électroniques', weight: 8000 },
      { desc: 'Matériaux de construction', weight: 20000 },
      { desc: 'Produits pharmaceutiques', weight: 5000 },
      { desc: 'Textiles et vêtements', weight: 10000 }
    ];

    for (let i = 0; i < 30; i++) {
      const fromCity = cities[Math.floor(Math.random() * cities.length)];
      let toCity = cities[Math.floor(Math.random() * cities.length)];
      while (toCity.name === fromCity.name) {
        toCity = cities[Math.floor(Math.random() * cities.length)];
      }

      const distance = calculateDistance(fromCity.coords.lat, fromCity.coords.lng, toCity.coords.lat, toCity.coords.lng);
      const cargo = cargoTypes[Math.floor(Math.random() * cargoTypes.length)];
      const truck = trucks[i % trucks.length];
      const trailer = i % 2 === 0 ? trailers[i % trailers.length] : null;
      const driver = drivers[i % drivers.length];
      
      const daysAgo = Math.floor(Math.random() * 60);
      const routeDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      let status;
      if (daysAgo > 30) status = 'Completed';
      else if (daysAgo > 15) status = Math.random() > 0.5 ? 'Completed' : 'InProgress';
      else if (daysAgo > 5) status = ['Planned', 'InProgress'][Math.floor(Math.random() * 2)];
      else status = 'Planned';

      const route = await Route.create({
        routeNumber: `RT${String(Date.now() + i).slice(-13)}`,
        driver: driver._id,
        truck: truck._id,
        trailer: trailer ? trailer._id : undefined,
        description: `Transport ${cargo.desc} de ${fromCity.name} vers ${toCity.name}`,
        departureLocation: `${fromCity.name}, Maroc`,
        departureCoords: fromCity.coords,
        arrivalLocation: `${toCity.name}, Maroc`,
        arrivalCoords: toCity.coords,
        distance,
        date: routeDate,
        status,
        departureKilometers: status !== 'Planned' ? truck.currentKilometers - distance : undefined,
        arrivalKilometers: status === 'Completed' ? truck.currentKilometers : undefined,
        fuelVolume: status === 'Completed' ? Math.round(distance * 0.35) : undefined,
        fuelCost: status === 'Completed' ? Math.round(distance * 0.35 * 14.5) : undefined,
        vehicleRemarks: status === 'Completed' && Math.random() > 0.7 ? 'Véhicule en bon état, aucun problème signalé' : undefined
      });
    }

    // Create Maintenance Rules
    console.log('Creating maintenance rules...');
    for (const truck of trucks.slice(0, 5)) {
      await MaintenanceRule.create({
        vehicleType: 'Truck',
        vehicleId: truck._id,
        maintenanceType: 'OilChange',
        intervalKilometers: 15000,
        intervalDays: 180,
        lastMaintenanceDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        lastMaintenanceKilometers: Math.max(0, truck.currentKilometers - 5000),
        isActive: true
      });

      await MaintenanceRule.create({
        vehicleType: 'Truck',
        vehicleId: truck._id,
        maintenanceType: 'BrakeCheck',
        intervalKilometers: 30000,
        intervalDays: 365,
        lastMaintenanceDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        lastMaintenanceKilometers: Math.max(0, truck.currentKilometers - 25000),
        isActive: true
      });
    }

    // Create Maintenance Records
    console.log('Creating maintenance records...');
    const maintenanceTypes = ['OilChange', 'TireReplacement', 'BrakeCheck'];
    const workshops = ['Garage Central Casablanca', 'Auto Service Rabat', 'Mecanique Express Marrakech', 'Atelier Pro Tanger'];

    for (let i = 0; i < 40; i++) {
      const vehicle = i % 2 === 0 ? trucks[i % trucks.length] : trailers[i % trailers.length];
      const vehicleType = i % 2 === 0 ? 'Truck' : 'Trailer';
      const daysAgo = Math.floor(Math.random() * 180);
      const maintenanceDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      const cost = 500 + Math.floor(Math.random() * 4500);
      const status = daysAgo > 30 ? 'Completed' : daysAgo > 15 ? ['Completed', 'InProgress'][Math.floor(Math.random() * 2)] : 'Scheduled';

      await MaintenanceRecord.create({
        vehicleType,
        vehicleId: vehicle._id,
        maintenanceType: maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)],
        date: maintenanceDate,
        kilometersAtMaintenance: Math.max(0, vehicle.currentKilometers - Math.floor(Math.random() * 10000)),
        cost,
        performedBy: `Technicien ${Math.floor(Math.random() * 10) + 1}`,
        workshop: workshops[Math.floor(Math.random() * workshops.length)],
        description: `Maintenance ${status === 'Completed' ? 'effectuée' : 'planifiée'} selon le planning`,
        status,
        priority: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        notes: status === 'Completed' ? 'Travail effectué conformément aux normes' : undefined,
        createdBy: admin._id
      });
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin users: 1`);
    console.log(`- Drivers: ${drivers.length}`);
    console.log(`- Trucks: ${trucks.length}`);
    console.log(`- Trailers: ${trailers.length}`);
    console.log(`- Tires: ${await Tire.countDocuments()}`);
    console.log(`- Routes: ${await Route.countDocuments()}`);
    console.log(`- Maintenance Rules: ${await MaintenanceRule.countDocuments()}`);
    console.log(`- Maintenance Records: ${await MaintenanceRecord.countDocuments()}`);
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Driver: driver1@mailinator.com / driver123 (and driver2-10)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

seedDatabase();
