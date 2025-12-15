import mongoose from 'mongoose';

const maintenanceRuleSchema = new mongoose.Schema(
    {
        maintenanceType: {
            type: String,
            enum: ['OilChange', 'TireReplacement', 'TireRotation', 'BrakeCheck', 'BrakeReplacement', 'GeneralInspection', 'EngineRepair', 'TransmissionRepair', 'SuspensionRepair', 'ElectricalRepair', 'BodyWork', 'Other'],
            required: [true, 'Maintenance type is required']
        },
        vehicleType: {
            type: String,
            enum: ['Truck', 'Trailer', 'Tire'],
            required: [true, 'Vehicle type is required']
        },
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'vehicleType'
        },
        intervalKilometers: {
            type: Number,
            min: [1, 'Interval must be positive']
        },
        intervalDays: {
            type: Number,
            min: [1, 'Interval days must be positive']
        },
        estimatedCost: {
            type: Number,
            min: [0, 'Cost cannot be negative'],
            default: 0
        },
        description: {
            type: String,
            trim: true,
            required: [true, 'Description is required']
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

maintenanceRuleSchema.index({ vehicleId: 1, vehicleType: 1 });
maintenanceRuleSchema.index({ maintenanceType: 1 });
maintenanceRuleSchema.index({ isActive: 1 });

maintenanceRuleSchema.statics.createRule = async function (ruleData) {
    const rule = new this(ruleData);
    return await rule.save();
};

maintenanceRuleSchema.methods.isDue = function (currentKilometers, lastMaintenanceKm, lastMaintenanceDate) {
    let isDue = false;
    let reason = [];
    let urgency = 'OK';
    
    if (this.intervalKilometers) {
        const kmSinceLastMaintenance = currentKilometers - lastMaintenanceKm;
        const kmRemaining = this.intervalKilometers - kmSinceLastMaintenance;
        
        if (kmSinceLastMaintenance >= this.intervalKilometers) {
            isDue = true;
            reason.push(`${kmSinceLastMaintenance - this.intervalKilometers} km de dépassement`);
            urgency = 'Urgent';
        } else if (kmRemaining < this.intervalKilometers * 0.1) {
            reason.push(`Plus que ${kmRemaining} km avant maintenance`);
            urgency = 'Soon';
        }
    }

    if (this.intervalDays) {
        const daysSinceMaintenance = Math.floor((Date.now() - new Date(lastMaintenanceDate)) / (1000 * 60 * 60 * 24));
        const daysRemaining = this.intervalDays - daysSinceMaintenance;
        
        if (daysSinceMaintenance >= this.intervalDays) {
            isDue = true;
            reason.push(`${daysSinceMaintenance - this.intervalDays} jours de dépassement`);
            urgency = 'Urgent';
        } else if (daysRemaining < this.intervalDays * 0.1) {
            reason.push(`Plus que ${daysRemaining} jours avant maintenance`);
            if (urgency !== 'Urgent') urgency = 'Soon';
        }
    }

    return {
        isDue,
        reason: reason.join(', ') || 'OK',
        urgency
    };
};

export default mongoose.model('MaintenanceRule', maintenanceRuleSchema);
