import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema(
    {
        vehicleType: {
            type: String,
            enum: ['Truck', 'Trailer', 'Tire'],
            required: [true, 'Vehicle type is required']
        },
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'vehicleType',
            required: [true, 'Vehicle ID is required']
        },
        maintenanceType: {
            type: String,
            enum: [
                'OilChange',           // Vidange
                'TireReplacement',     // Remplacement pneu
                'TireRotation',        // Rotation pneus
                'BrakeCheck',          // Vérification freins
                'BrakeReplacement',    // Remplacement freins
                'GeneralInspection',   // Révision générale
                'EngineRepair',        // Réparation moteur
                'TransmissionRepair',  // Réparation transmission
                'SuspensionRepair',    // Réparation suspension
                'ElectricalRepair',    // Réparation électrique
                'BodyWork',            // Carrosserie
                'Other'                // Autre
            ],
            required: [true, 'Maintenance type is required']
        },
        date: {
            type: Date,
            default: Date.now,
            required: [true, 'Maintenance date is required']
        },
        kilometersAtMaintenance: {
            type: Number,
            required: [true, 'Kilometers at maintenance is required'],
            min: [0, 'Kilometers cannot be negative']
        },
        cost: {
            type: Number,
            default: 0,
            min: [0, 'Cost cannot be negative']
        },
        performedBy: {
            type: String,
            trim: true,
            required: [true, 'Performer name is required']
        },
        workshop: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            required: [true, 'Description is required']
        },
        partsReplaced: [{
            partName: {
                type: String,
                trim: true
            },
            partNumber: {
                type: String,
                trim: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            cost: {
                type: Number,
                min: 0
            }
        }],
        nextMaintenanceKilometers: {
            type: Number,
            min: [0, 'Next maintenance kilometers cannot be negative']
        },
        nextMaintenanceDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled'],
            default: 'Scheduled'
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium'
        },
        notes: {
            type: String,
            trim: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator is required']
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Index pour recherche rapide
maintenanceRecordSchema.index({ vehicleId: 1, vehicleType: 1 });
maintenanceRecordSchema.index({ maintenanceType: 1 });
maintenanceRecordSchema.index({ date: -1 });
maintenanceRecordSchema.index({ status: 1 });
maintenanceRecordSchema.index({ priority: 1 });

// Virtuals
maintenanceRecordSchema.virtual('totalCost').get(function () {
    const partsCost = this.partsReplaced.reduce((sum, part) => sum + (part.cost || 0), 0);
    return this.cost + partsCost;
});

maintenanceRecordSchema.virtual('isOverdue').get(function () {
    if (this.status === 'Completed' || this.status === 'Cancelled') {
        return false;
    }
    return this.nextMaintenanceDate && new Date() > this.nextMaintenanceDate;
});

// Méthodes statiques
maintenanceRecordSchema.statics.getUpcomingMaintenance = async function (days = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.find({
        status: { $in: ['Scheduled', 'InProgress'] },
        nextMaintenanceDate: {
            $gte: new Date(),
            $lte: futureDate
        }
    })
        .populate('vehicleId')
        .populate('createdBy', 'name email')
        .sort('nextMaintenanceDate');
};

maintenanceRecordSchema.statics.getOverdueMaintenance = async function () {
    return await this.find({
        status: { $in: ['Scheduled', 'InProgress'] },
        nextMaintenanceDate: { $lt: new Date() }
    })
        .populate('vehicleId')
        .populate('createdBy', 'name email')
        .sort('nextMaintenanceDate');
};

// Méthodes d'instance
maintenanceRecordSchema.methods.complete = async function (completionData) {
    this.status = 'Completed';
    if (completionData.cost !== undefined) {
        this.cost = completionData.cost;
    }
    if (completionData.notes) {
        this.notes = completionData.notes;
    }
    if (completionData.partsReplaced) {
        this.partsReplaced = completionData.partsReplaced;
    }
    
    return await this.save();
};

maintenanceRecordSchema.methods.cancel = async function (reason) {
    this.status = 'Cancelled';
    this.notes = reason ? `Cancelled: ${reason}` : 'Cancelled';
    return await this.save();
};

export default mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
