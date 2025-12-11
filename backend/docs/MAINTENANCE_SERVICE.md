# Maintenance Service Documentation

## Vue d'ensemble

Le service de maintenance gère les règles de maintenance périodique et les enregistrements de maintenance pour tous les types de véhicules (Trucks, Trailers, Tires).

## Architecture

```
maintenanceService
├── Règles de maintenance (Rules)
│   ├── CRUD des règles
│   ├── Activation/Désactivation
│   └── Filtrage par véhicule/type
│
├── Enregistrements (Records)
│   ├── Création/Modification
│   ├── Complétion/Annulation
│   └── Historique par véhicule
│
├── Vérifications
│   ├── Maintenance due par véhicule
│   ├── Toutes les maintenances dues
│   ├── Maintenances à venir
│   └── Maintenances en retard
│
└── Statistiques
    ├── Statistiques globales
    ├── Coûts par véhicule
    └── Rapports par type/statut
```

## Modèles de données

### MaintenanceRule

Définit les règles de maintenance périodique.

```javascript
{
  vehicleType: 'Truck' | 'Trailer' | 'Tire',
  vehicleId: ObjectId,
  maintenanceType: 'OilChange' | 'TireReplacement' | 'BrakeCheck',
  intervalKilometers: Number,
  intervalMonths: Number,
  estimatedCost: Number,
  description: String,
  isActive: Boolean
}
```

**Méthode isDue():**
```javascript
rule.isDue(currentKm, lastMaintenanceKm, lastMaintenanceDate)
// Retourne: { isDue, reason, kmOverdue, monthsOverdue }
```

### MaintenanceRecord

Enregistre les maintenances effectuées.

```javascript
{
  vehicleType: 'Truck' | 'Trailer' | 'Tire',
  vehicleId: ObjectId,
  maintenanceType: String,
  date: Date,
  kilometersAtMaintenance: Number,
  cost: Number,
  performedBy: String,
  workshop: String,
  description: String,
  partsReplaced: [{
    partName: String,
    partNumber: String,
    quantity: Number,
    cost: Number
  }],
  nextMaintenanceKilometers: Number,
  nextMaintenanceDate: Date,
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled',
  priority: 'Low' | 'Medium' | 'High' | 'Urgent',
  notes: String,
  createdBy: ObjectId
}
```

**Virtuals:**
- `totalCost`: Somme du coût + coûts des pièces
- `isOverdue`: Vérifie si la date de maintenance suivante est dépassée

**Méthodes:**
- `complete(completionData)`: Marquer comme terminée
- `cancel(reason)`: Annuler la maintenance

## Méthodes du Service

### Règles de Maintenance

#### `createRule(ruleData)`
Crée une nouvelle règle de maintenance.

```javascript
const rule = await maintenanceService.createRule({
  vehicleType: 'Truck',
  vehicleId: truckId,
  maintenanceType: 'OilChange',
  intervalKilometers: 15000,
  intervalMonths: 6,
  estimatedCost: 2500,
  description: 'Vidange moteur tous les 15000 km ou 6 mois'
});
```

#### `getAllRules(filters, options)`
Récupère toutes les règles avec pagination.

```javascript
const result = await maintenanceService.getAllRules(
  { vehicleType: 'Truck', isActive: true },
  { page: 1, limit: 10, sortBy: '-createdAt' }
);
// Retourne: { rules: [], pagination: { total, page, limit, pages } }
```

#### `getRuleById(ruleId)`
Récupère une règle par ID.

```javascript
const rule = await maintenanceService.getRuleById(ruleId);
```

#### `getRulesByVehicle(vehicleType, vehicleId)`
Récupère toutes les règles actives pour un véhicule.

```javascript
const rules = await maintenanceService.getRulesByVehicle('Truck', truckId);
```

#### `updateRule(ruleId, updateData)`
Met à jour une règle existante.

```javascript
const rule = await maintenanceService.updateRule(ruleId, {
  intervalKilometers: 20000,
  estimatedCost: 3000
});
```

#### `deleteRule(ruleId)`
Supprime une règle de maintenance.

```javascript
await maintenanceService.deleteRule(ruleId);
```

#### `toggleRuleStatus(ruleId, isActive)`
Active ou désactive une règle.

```javascript
const rule = await maintenanceService.toggleRuleStatus(ruleId, false);
```

### Enregistrements de Maintenance

#### `createRecord(recordData)`
Crée un nouvel enregistrement de maintenance.

```javascript
const record = await maintenanceService.createRecord({
  vehicleType: 'Truck',
  vehicleId: truckId,
  maintenanceType: 'OilChange',
  date: new Date(),
  kilometersAtMaintenance: 125000,
  cost: 2800,
  performedBy: 'Garage Mecanique Tanger',
  description: 'Vidange moteur complète',
  status: 'Completed',
  priority: 'Medium'
});
```

#### `getAllRecords(filters, options)`
Récupère tous les enregistrements avec pagination.

```javascript
const result = await maintenanceService.getAllRecords(
  { status: 'Completed', maintenanceType: 'OilChange' },
  { page: 1, limit: 10 }
);
```

#### `getRecordById(recordId)`
Récupère un enregistrement par ID.

```javascript
const record = await maintenanceService.getRecordById(recordId);
```

#### `getVehicleMaintenanceHistory(vehicleType, vehicleId, options)`
Récupère l'historique de maintenance d'un véhicule.

```javascript
const history = await maintenanceService.getVehicleMaintenanceHistory(
  'Truck',
  truckId,
  { page: 1, limit: 10 }
);
```

#### `updateRecord(recordId, updateData)`
Met à jour un enregistrement de maintenance.

```javascript
const record = await maintenanceService.updateRecord(recordId, {
  cost: 3200,
  notes: 'Remplacement filtre supplémentaire'
});
```

#### `completeRecord(recordId, completionData)`
Complète une maintenance planifiée.

```javascript
const record = await maintenanceService.completeRecord(recordId, {
  cost: 2800,
  notes: 'Maintenance terminée avec succès',
  partsReplaced: [
    { partName: 'Filtre à huile', quantity: 1, cost: 150 }
  ]
});
```

#### `cancelRecord(recordId, reason)`
Annule une maintenance planifiée.

```javascript
const record = await maintenanceService.cancelRecord(
  recordId,
  'Véhicule non disponible'
);
```

#### `deleteRecord(recordId)`
Supprime un enregistrement de maintenance.

```javascript
await maintenanceService.deleteRecord(recordId);
```

### Vérifications et Notifications

#### `checkDueMaintenance(vehicleType, vehicleId)`
Vérifie les maintenances dues pour un véhicule spécifique.

```javascript
const result = await maintenanceService.checkDueMaintenance('Truck', truckId);
// Retourne:
{
  vehicle: { _id, registrationNumber, currentKilometers, ... },
  dueMaintenances: [
    {
      rule: { maintenanceType, intervalKilometers, ... },
      lastMaintenance: { date, kilometersAtMaintenance, ... },
      isDue: true,
      reason: 'kilometers',
      kmOverdue: 2000,
      monthsOverdue: null
    }
  ],
  hasDueMaintenance: true
}
```

**Logique de vérification:**
- Compare les kilomètres actuels avec le dernier enregistrement + intervalle
- Compare la date actuelle avec la dernière maintenance + intervalle en mois
- Retourne `isDue: true` si l'un des deux critères est atteint

#### `checkAllDueMaintenance()`
Vérifie toutes les maintenances dues pour tous les véhicules.

```javascript
const allDue = await maintenanceService.checkAllDueMaintenance();
// Retourne un tableau de tous les véhicules nécessitant une maintenance
```

**Notes:**
- Parcourt tous les trucks, trailers et tires
- Gère les erreurs si certains services ne sont pas disponibles
- Utile pour les notifications quotidiennes

#### `getUpcomingMaintenance(days)`
Récupère les maintenances planifiées dans les X prochains jours.

```javascript
const upcoming = await maintenanceService.getUpcomingMaintenance(30);
// Retourne les maintenances avec nextMaintenanceDate dans les 30 prochains jours
```

#### `getOverdueMaintenance()`
Récupère toutes les maintenances en retard.

```javascript
const overdue = await maintenanceService.getOverdueMaintenance();
// Retourne les maintenances dont nextMaintenanceDate est dépassée
```

### Statistiques

#### `getMaintenanceStatistics(filters)`
Génère des statistiques globales de maintenance.

```javascript
const stats = await maintenanceService.getMaintenanceStatistics({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  vehicleType: 'Truck',
  maintenanceType: 'OilChange'
});

// Retourne:
{
  totalRecords: 156,
  costSummary: {
    totalCost: 425000,
    averageCost: 2724.36,
    minCost: 500,
    maxCost: 15000
  },
  byType: [
    { _id: 'OilChange', count: 52, totalCost: 145600 },
    { _id: 'TireReplacement', count: 48, totalCost: 192000 }
  ],
  byStatus: [
    { _id: 'Completed', count: 142 },
    { _id: 'Scheduled', count: 10 }
  ],
  filters: { startDate, endDate, ... }
}
```

#### `getVehicleMaintenanceCost(vehicleType, vehicleId, filters)`
Calcule le coût total de maintenance d'un véhicule.

```javascript
const cost = await maintenanceService.getVehicleMaintenanceCost(
  'Truck',
  truckId,
  { startDate: '2025-01-01', endDate: '2025-12-31' }
);

// Retourne:
{
  totalCost: 28500,
  averageCost: 2850,
  maintenanceCount: 10
}
```

### Méthodes Utilitaires

#### `validateVehicleExists(vehicleType, vehicleId)`
Valide qu'un véhicule existe en appelant le service approprié.

```javascript
await maintenanceService.validateVehicleExists('Truck', truckId);
// Throw Error si le véhicule n'existe pas
```

#### `getVehicle(vehicleType, vehicleId)`
Récupère un véhicule (alias pour validateVehicleExists).

```javascript
const vehicle = await maintenanceService.getVehicle('Truck', truckId);
```

#### `getLastMaintenanceForEachType(vehicleType, vehicleId)`
Récupère la dernière maintenance complétée pour chaque type.

```javascript
const lastMaintenances = await maintenanceService.getLastMaintenanceForEachType(
  'Truck',
  truckId
);
// Retourne une Map: maintenanceType -> lastRecord
```

## Cas d'usage

### 1. Configuration initiale pour un nouveau camion

```javascript
const truckId = '675947d71a06c92b32c84e85';

const rules = [
  {
    vehicleType: 'Truck',
    vehicleId: truckId,
    maintenanceType: 'OilChange',
    intervalKilometers: 15000,
    intervalMonths: 6,
    estimatedCost: 2500,
    description: 'Vidange moteur'
  },
  {
    vehicleType: 'Truck',
    vehicleId: truckId,
    maintenanceType: 'BrakeCheck',
    intervalKilometers: 30000,
    intervalMonths: 12,
    estimatedCost: 1500,
    description: 'Vérification freins'
  },
  {
    vehicleType: 'Truck',
    vehicleId: truckId,
    maintenanceType: 'TireReplacement',
    intervalKilometers: 100000,
    intervalMonths: 24,
    estimatedCost: 8000,
    description: 'Remplacement pneus'
  }
];

for (const rule of rules) {
  await maintenanceService.createRule(rule);
}
```

### 2. Enregistrer une maintenance effectuée

```javascript
const record = await maintenanceService.createRecord({
  vehicleType: 'Truck',
  vehicleId: truckId,
  maintenanceType: 'OilChange',
  date: new Date(),
  kilometersAtMaintenance: 125000,
  cost: 2800,
  performedBy: 'Garage Mecanique Tanger',
  workshop: 'Tanger Automotive Center',
  description: 'Vidange moteur complète avec changement filtres',
  partsReplaced: [
    { partName: 'Filtre à huile', partNumber: 'OF-12345', quantity: 1, cost: 150 },
    { partName: 'Huile moteur 15W40', partNumber: 'OIL-5L', quantity: 20, cost: 2000 }
  ],
  nextMaintenanceKilometers: 140000,
  nextMaintenanceDate: new Date('2026-06-11'),
  status: 'Completed',
  priority: 'Medium'
});
```

### 3. Workflow de maintenance planifiée

```javascript
const recordId = await maintenanceService.createRecord({
  vehicleType: 'Truck',
  vehicleId: truckId,
  maintenanceType: 'BrakeCheck',
  date: new Date('2025-12-20'),
  kilometersAtMaintenance: 130000,
  performedBy: 'À définir',
  description: 'Vérification freins planifiée',
  status: 'Scheduled',
  priority: 'High'
});

await maintenanceService.completeRecord(recordId, {
  cost: 1500,
  performedBy: 'Garage Central',
  notes: 'Freins avant remplacés, arrière ajustés',
  partsReplaced: [
    { partName: 'Plaquettes frein avant', quantity: 4, cost: 800 }
  ]
});
```

### 4. Vérification quotidienne des maintenances

```javascript
const checkMaintenances = async () => {
  const allDue = await maintenanceService.checkAllDueMaintenance();
  
  for (const item of allDue) {
    console.log(`🔧 ${item.vehicle.registrationNumber} nécessite:`);
    
    for (const maintenance of item.dueMaintenances) {
      console.log(`  - ${maintenance.rule.maintenanceType}`);
      console.log(`    Raison: ${maintenance.reason}`);
      if (maintenance.kmOverdue > 0) {
        console.log(`    Retard: ${maintenance.kmOverdue} km`);
      }
      if (maintenance.monthsOverdue > 0) {
        console.log(`    Retard: ${maintenance.monthsOverdue} mois`);
      }
    }
  }
  
  const upcoming = await maintenanceService.getUpcomingMaintenance(7);
  console.log(`📅 ${upcoming.length} maintenances planifiées dans 7 jours`);
};

setInterval(checkMaintenances, 86400000);
```

### 5. Génération de rapport mensuel

```javascript
const generateMonthlyReport = async (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const stats = await maintenanceService.getMaintenanceStatistics({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  });
  
  console.log(`📊 Rapport maintenance ${month}/${year}`);
  console.log(`Total maintenances: ${stats.totalRecords}`);
  console.log(`Coût total: ${stats.costSummary.totalCost} MAD`);
  console.log(`Coût moyen: ${stats.costSummary.averageCost} MAD`);
  
  console.log('\nPar type:');
  stats.byType.forEach(type => {
    console.log(`  ${type._id}: ${type.count} (${type.totalCost} MAD)`);
  });
  
  return stats;
};
```

### 6. Analyse des coûts par véhicule

```javascript
const analyzeVehicleCosts = async (vehicleType, vehicleId) => {
  const cost = await maintenanceService.getVehicleMaintenanceCost(
    vehicleType,
    vehicleId,
    {
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString()
    }
  );
  
  const vehicle = await maintenanceService.getVehicle(vehicleType, vehicleId);
  
  console.log(`💰 Coûts de maintenance ${vehicle.registrationNumber}`);
  console.log(`Total annuel: ${cost.totalCost} MAD`);
  console.log(`Nombre de maintenances: ${cost.maintenanceCount}`);
  console.log(`Coût moyen: ${cost.averageCost} MAD`);
  console.log(`Coût par km: ${(cost.totalCost / vehicle.currentKilometers).toFixed(2)} MAD/km`);
  
  return cost;
};
```

## Intégration avec Route Service

Le service de maintenance peut être intégré avec le système de routes pour vérifier automatiquement les maintenances avant de démarrer un trajet:

```javascript
const startRouteWithMaintenanceCheck = async (routeId) => {
  const route = await routeService.getRouteById(routeId);
  
  const truckCheck = await maintenanceService.checkDueMaintenance(
    'Truck',
    route.truck
  );
  
  if (truckCheck.hasDueMaintenance) {
    const urgentMaintenance = truckCheck.dueMaintenances.filter(
      m => m.kmOverdue > 5000 || m.monthsOverdue > 2
    );
    
    if (urgentMaintenance.length > 0) {
      throw new Error(
        `Maintenance urgente requise: ${urgentMaintenance.map(m => m.rule.maintenanceType).join(', ')}`
      );
    }
    
    console.warn('⚠️  Maintenance due:', truckCheck.dueMaintenances);
  }
  
  return await routeService.startRoute(routeId);
};
```

## Best Practices

### 1. Configuration des règles
- Définir des règles pour chaque type de véhicule dès l'acquisition
- Utiliser TOUJOURS les deux intervalles (km + mois) pour une couverture complète
- Ajuster les intervalles selon l'usage réel et les recommandations constructeur

### 2. Enregistrement des maintenances
- Créer l'enregistrement en status "Scheduled" avant la maintenance
- Compléter avec les détails réels après intervention
- Documenter les pièces remplacées pour l'historique

### 3. Vérifications régulières
- Exécuter `checkAllDueMaintenance()` quotidiennement (cron job)
- Envoyer des notifications 7 jours avant l'échéance
- Alerter immédiatement si dépassement > 5000 km ou 2 mois

### 4. Analyses
- Générer des rapports mensuels de coûts
- Identifier les véhicules coûteux en maintenance
- Optimiser les intervalles selon les données réelles

### 5. Performance
- Paginer les résultats pour les grandes flottes
- Utiliser les filtres pour limiter les requêtes
- Cacher les statistiques fréquemment consultées

## Erreurs courantes

### Véhicule non trouvé
```javascript
try {
  await maintenanceService.createRule({ vehicleId: invalidId, ... });
} catch (error) {
  // Error: Truck not found
}
```

### Règle non trouvée
```javascript
try {
  await maintenanceService.getRuleById(invalidId);
} catch (error) {
  // Error: Maintenance rule not found
}
```

### Type de véhicule invalide
```javascript
try {
  await maintenanceService.checkDueMaintenance('InvalidType', vehicleId);
} catch (error) {
  // Error: Invalid vehicle type
}
```

## Tests

Le service est entièrement testé. Pour exécuter les tests:

```bash
npm test src/tests/services/maintenance.service.test.js
```

Les tests couvrent:
- Création/Modification/Suppression de règles
- CRUD des enregistrements
- Vérification des maintenances dues
- Calcul des statistiques
- Gestion des erreurs
