# Maintenance API Documentation

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Règles de maintenance](#règles-de-maintenance)
3. [Enregistrements de maintenance](#enregistrements-de-maintenance)
4. [Vérifications et notifications](#vérifications-et-notifications)
5. [Statistiques](#statistiques)
6. [Exemples d'utilisation](#exemples-dutilisation)

---

## Vue d'ensemble

L'API de maintenance permet de gérer les règles de maintenance périodique et les enregistrements de maintenance pour les véhicules (camions, remorques, pneus).

**Base URL**: `/api/v1/maintenance`

**Authentication**: Tous les endpoints nécessitent un token JWT valide.

**Autorisation**:
- **Admin**: Accès complet (création/modification/suppression des règles et enregistrements)
- **Driver**: Lecture seule pour les véhicules assignés

---

## Règles de maintenance

Les règles définissent les intervalles de maintenance (kilométrage et/ou temps).

### 1. Créer une règle de maintenance

```http
POST /api/v1/maintenance/rules
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "vehicleType": "Truck",
  "vehicleId": "675947d71a06c92b32c84e85",
  "maintenanceType": "OilChange",
  "intervalKilometers": 15000,
  "intervalMonths": 6,
  "estimatedCost": 2500,
  "description": "Vidange moteur tous les 15000 km ou 6 mois",
  "isActive": true
}
```

**Types de maintenance disponibles**:
- `OilChange`: Vidange
- `TireReplacement`: Remplacement pneu
- `BrakeCheck`: Vérification freins

**Types de véhicule**:
- `Truck`: Camion
- `Trailer`: Remorque
- `Tire`: Pneu

**Response (201)**:
```json
{
  "success": true,
  "message": "Maintenance rule created successfully",
  "data": {
    "_id": "675947d71a06c92b32c84e86",
    "vehicleType": "Truck",
    "vehicleId": {
      "_id": "675947d71a06c92b32c84e85",
      "registrationNumber": "ABC-123",
      "brand": "Mercedes"
    },
    "maintenanceType": "OilChange",
    "intervalKilometers": 15000,
    "intervalMonths": 6,
    "estimatedCost": 2500,
    "description": "Vidange moteur tous les 15000 km ou 6 mois",
    "isActive": true,
    "createdAt": "2025-12-11T14:30:00.000Z"
  }
}
```

### 2. Obtenir toutes les règles

```http
GET /api/v1/maintenance/rules?page=1&limit=10&vehicleType=Truck&isActive=true
Authorization: Bearer {token}
```

**Query Parameters**:
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre de résultats par page (défaut: 10)
- `sortBy`: Tri (défaut: -createdAt)
- `vehicleType`: Filtrer par type de véhicule
- `maintenanceType`: Filtrer par type de maintenance
- `isActive`: Filtrer par statut actif (true/false)

**Response (200)**:
```json
{
  "success": true,
  "rules": [
    {
      "_id": "675947d71a06c92b32c84e86",
      "vehicleType": "Truck",
      "vehicleId": {
        "_id": "675947d71a06c92b32c84e85",
        "registrationNumber": "ABC-123"
      },
      "maintenanceType": "OilChange",
      "intervalKilometers": 15000,
      "isActive": true
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### 3. Obtenir une règle par ID

```http
GET /api/v1/maintenance/rules/{ruleId}
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "675947d71a06c92b32c84e86",
    "vehicleType": "Truck",
    "vehicleId": {
      "_id": "675947d71a06c92b32c84e85",
      "registrationNumber": "ABC-123",
      "brand": "Mercedes"
    },
    "maintenanceType": "OilChange",
    "intervalKilometers": 15000,
    "intervalMonths": 6,
    "estimatedCost": 2500
  }
}
```

### 4. Obtenir les règles d'un véhicule

```http
GET /api/v1/maintenance/rules/vehicle/{vehicleType}/{vehicleId}
Authorization: Bearer {token}
```

**Exemple**:
```bash
curl -X GET "http://localhost:3000/api/v1/maintenance/rules/vehicle/Truck/675947d71a06c92b32c84e85" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200)**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "675947d71a06c92b32c84e86",
      "maintenanceType": "OilChange",
      "intervalKilometers": 15000,
      "isActive": true
    },
    {
      "_id": "675947d71a06c92b32c84e87",
      "maintenanceType": "BrakeCheck",
      "intervalKilometers": 30000,
      "isActive": true
    }
  ]
}
```

### 5. Mettre à jour une règle

```http
PUT /api/v1/maintenance/rules/{ruleId}
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "intervalKilometers": 20000,
  "estimatedCost": 3000,
  "description": "Vidange moteur tous les 20000 km"
}
```

### 6. Activer/Désactiver une règle

```http
PATCH /api/v1/maintenance/rules/{ruleId}/toggle
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "isActive": false
}
```

### 7. Supprimer une règle

```http
DELETE /api/v1/maintenance/rules/{ruleId}
Authorization: Bearer {token}
```

---

## Enregistrements de maintenance

Les enregistrements documentent les maintenances effectuées.

### 1. Créer un enregistrement

```http
POST /api/v1/maintenance/records
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "vehicleType": "Truck",
  "vehicleId": "675947d71a06c92b32c84e85",
  "maintenanceType": "OilChange",
  "date": "2025-12-11T10:00:00.000Z",
  "kilometersAtMaintenance": 125000,
  "cost": 2800,
  "performedBy": "Garage Mecanique Tanger",
  "workshop": "Tanger Automotive Center",
  "description": "Vidange moteur complète avec changement filtres",
  "partsReplaced": [
    {
      "partName": "Filtre à huile",
      "partNumber": "OF-12345",
      "quantity": 1,
      "cost": 150
    },
    {
      "partName": "Huile moteur 15W40",
      "partNumber": "OIL-5L-15W40",
      "quantity": 20,
      "cost": 2000
    }
  ],
  "nextMaintenanceKilometers": 140000,
  "nextMaintenanceDate": "2026-06-11T10:00:00.000Z",
  "status": "Completed",
  "priority": "Medium",
  "notes": "Maintenance effectuée selon les recommandations constructeur"
}
```

**Statuts disponibles**:
- `Scheduled`: Planifiée
- `InProgress`: En cours
- `Completed`: Terminée
- `Cancelled`: Annulée

**Priorités**:
- `Low`: Basse
- `Medium`: Moyenne
- `High`: Haute
- `Urgent`: Urgente

**Response (201)**:
```json
{
  "success": true,
  "message": "Maintenance record created successfully",
  "data": {
    "_id": "675947d71a06c92b32c84e88",
    "vehicleType": "Truck",
    "vehicleId": {
      "_id": "675947d71a06c92b32c84e85",
      "registrationNumber": "ABC-123"
    },
    "maintenanceType": "OilChange",
    "date": "2025-12-11T10:00:00.000Z",
    "kilometersAtMaintenance": 125000,
    "cost": 2800,
    "totalCost": 2950,
    "status": "Completed",
    "createdBy": {
      "_id": "675947d71a06c92b32c84e80",
      "name": "Admin User",
      "email": "admin@truckmanager.com"
    }
  }
}
```

### 2. Obtenir tous les enregistrements

```http
GET /api/v1/maintenance/records?page=1&limit=10&status=Completed
Authorization: Bearer {token}
```

**Query Parameters**:
- `page`, `limit`, `sortBy`: Pagination
- `vehicleType`: Filtrer par type de véhicule
- `maintenanceType`: Filtrer par type de maintenance
- `status`: Filtrer par statut
- `priority`: Filtrer par priorité

### 3. Obtenir l'historique d'un véhicule

```http
GET /api/v1/maintenance/records/vehicle/{vehicleType}/{vehicleId}?page=1&limit=10
Authorization: Bearer {token}
```

**Exemple**:
```bash
curl -X GET "http://localhost:3000/api/v1/maintenance/records/vehicle/Truck/675947d71a06c92b32c84e85" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200)**:
```json
{
  "success": true,
  "records": [
    {
      "_id": "675947d71a06c92b32c84e88",
      "maintenanceType": "OilChange",
      "date": "2025-12-11T10:00:00.000Z",
      "kilometersAtMaintenance": 125000,
      "cost": 2800,
      "status": "Completed",
      "createdBy": {
        "name": "Admin User"
      }
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### 4. Compléter une maintenance

```http
PATCH /api/v1/maintenance/records/{recordId}/complete
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "cost": 3200,
  "notes": "Maintenance terminée avec succès",
  "partsReplaced": [
    {
      "partName": "Filtre à huile",
      "quantity": 1,
      "cost": 150
    }
  ]
}
```

### 5. Annuler une maintenance

```http
PATCH /api/v1/maintenance/records/{recordId}/cancel
Authorization: Bearer {token}
Content-Type: application/json
```

**Body**:
```json
{
  "reason": "Véhicule non disponible - reprogrammer"
}
```

---

## Vérifications et notifications

### 1. Vérifier les maintenances dues pour un véhicule

```http
GET /api/v1/maintenance/check/{vehicleType}/{vehicleId}
Authorization: Bearer {token}
```

**Exemple**:
```bash
curl -X GET "http://localhost:3000/api/v1/maintenance/check/Truck/675947d71a06c92b32c84e85" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200)**:
```json
{
  "success": true,
  "vehicle": {
    "_id": "675947d71a06c92b32c84e85",
    "registrationNumber": "ABC-123",
    "currentKilometers": 135000
  },
  "dueMaintenances": [
    {
      "rule": {
        "_id": "675947d71a06c92b32c84e86",
        "maintenanceType": "OilChange",
        "intervalKilometers": 15000,
        "estimatedCost": 2500
      },
      "lastMaintenance": {
        "_id": "675947d71a06c92b32c84e88",
        "date": "2025-06-11T10:00:00.000Z",
        "kilometersAtMaintenance": 120000
      },
      "isDue": true,
      "reason": "kilometers",
      "kmOverdue": 0,
      "monthsOverdue": null
    }
  ],
  "hasDueMaintenance": true
}
```

### 2. Vérifier toutes les maintenances dues

```http
GET /api/v1/maintenance/check-all
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "vehicleType": "Truck",
      "vehicle": {
        "registrationNumber": "ABC-123"
      },
      "dueMaintenances": [
        {
          "rule": {
            "maintenanceType": "OilChange"
          },
          "isDue": true,
          "kmOverdue": 0
        }
      ]
    }
  ]
}
```

### 3. Maintenances à venir (30 prochains jours)

```http
GET /api/v1/maintenance/upcoming?days=30
Authorization: Bearer {token}
```

### 4. Maintenances en retard

```http
GET /api/v1/maintenance/overdue
Authorization: Bearer {token}
```

---

## Statistiques

### 1. Statistiques globales

```http
GET /api/v1/maintenance/statistics?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {token}
```

**Query Parameters**:
- `startDate`: Date de début (format: YYYY-MM-DD)
- `endDate`: Date de fin
- `vehicleType`: Filtrer par type de véhicule
- `maintenanceType`: Filtrer par type de maintenance

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "totalRecords": 156,
    "costSummary": {
      "totalCost": 425000,
      "averageCost": 2724.36,
      "minCost": 500,
      "maxCost": 15000
    },
    "byType": [
      {
        "_id": "OilChange",
        "count": 52,
        "totalCost": 145600
      },
      {
        "_id": "TireReplacement",
        "count": 48,
        "totalCost": 192000
      },
      {
        "_id": "BrakeCheck",
        "count": 56,
        "totalCost": 87400
      }
    ],
    "byStatus": [
      {
        "_id": "Completed",
        "count": 142
      },
      {
        "_id": "Scheduled",
        "count": 10
      },
      {
        "_id": "Cancelled",
        "count": 4
      }
    ],
    "filters": {
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.999Z"
    }
  }
}
```

### 2. Coût de maintenance d'un véhicule

```http
GET /api/v1/maintenance/cost/{vehicleType}/{vehicleId}?startDate=2025-01-01
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "success": true,
  "vehicleType": "Truck",
  "vehicleId": "675947d71a06c92b32c84e85",
  "data": {
    "totalCost": 28500,
    "averageCost": 2850,
    "maintenanceCount": 10
  }
}
```

---

## Exemples d'utilisation

### Workflow complet: Configuration et suivi de maintenance

#### 1. Créer une règle de vidange pour un camion

```bash
curl -X POST "http://localhost:3000/api/v1/maintenance/rules" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "Truck",
    "vehicleId": "675947d71a06c92b32c84e85",
    "maintenanceType": "OilChange",
    "intervalKilometers": 15000,
    "intervalMonths": 6,
    "estimatedCost": 2500,
    "description": "Vidange moteur tous les 15000 km ou 6 mois"
  }'
```

#### 2. Vérifier si le camion nécessite une maintenance

```bash
curl -X GET "http://localhost:3000/api/v1/maintenance/check/Truck/675947d71a06c92b32c84e85" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Créer un enregistrement de maintenance

```bash
curl -X POST "http://localhost:3000/api/v1/maintenance/records" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleType": "Truck",
    "vehicleId": "675947d71a06c92b32c84e85",
    "maintenanceType": "OilChange",
    "kilometersAtMaintenance": 125000,
    "cost": 2800,
    "performedBy": "Garage Mecanique",
    "description": "Vidange moteur complète",
    "status": "Completed"
  }'
```

#### 4. Consulter l'historique de maintenance

```bash
curl -X GET "http://localhost:3000/api/v1/maintenance/records/vehicle/Truck/675947d71a06c92b32c84e85" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 5. Voir les statistiques globales

```bash
curl -X GET "http://localhost:3000/api/v1/maintenance/statistics?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Cas d'usage: Notification de maintenance due

```javascript
// Vérifier tous les véhicules nécessitant une maintenance
const checkMaintenance = async () => {
  const response = await fetch('http://localhost:3000/api/v1/maintenance/check-all', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  const { data } = await response.json();
  
  // Filtrer les maintenances urgentes (> 5000 km de retard)
  const urgent = data.filter(item => 
    item.dueMaintenances.some(m => m.kmOverdue > 5000)
  );
  
  // Envoyer des notifications pour les maintenances urgentes
  urgent.forEach(item => {
    console.log(`🚨 URGENT: ${item.vehicle.registrationNumber} nécessite une maintenance`);
  });
};
```

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide (données manquantes ou incorrectes) |
| 401 | Non authentifié (token manquant ou invalide) |
| 403 | Non autorisé (permissions insuffisantes) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur interne |

---

## Best Practices

1. **Créer des règles pour chaque type de véhicule**
   - Camions: Vidange, freins, révision générale
   - Remorques: Inspection suspension, freins
   - Pneus: Rotation, remplacement

2. **Utiliser les deux intervalles (km et mois)**
   - Permet de détecter les maintenances dues même si le véhicule roule peu

3. **Vérifier régulièrement les maintenances dues**
   - Appeler `/check-all` quotidiennement (via cron job)
   - Envoyer des notifications 7 jours avant l'échéance

4. **Documenter les pièces remplacées**
   - Facilite le suivi des coûts
   - Utile pour les garanties et l'historique

5. **Planifier les maintenances**
   - Créer des enregistrements avec status "Scheduled"
   - Les compléter ensuite avec les détails réels

6. **Analyser les statistiques**
   - Identifier les coûts élevés
   - Optimiser les intervalles de maintenance
