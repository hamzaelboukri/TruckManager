import mongoose from 'mongoose';

const maintenanceRuleSchema = new mongoose.Schema(
  {
    maintenanceType: {
      type: String,
      enum: ['OilChange', 'TireReplacement', 'BrakeCheck'],
      required: [true, 'Maintenance type is required']
    },
    vehicleType: {
      type: String,
      enum: ['Truck', 'Trailer'],
      required: [true, 'Vehicle type is required']
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'vehicleType',
      required: [true, 'Vehicle ID is required']
    },
    intervalKilometers: {
      type: Number,
      required: [true, 'Interval kilometers is required'],
      min: [1, 'Interval must be positive']
    },
    intervalMonths: {
      type: Number,
      min: [1, 'Interval months must be positive']
    },
    estimatedCost: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },
    description: {
      type: String,
      trim: true
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

maintenanceRuleSchema.statics.createRule = async function(ruleData) {
  const rule = new this(ruleData);
  return await rule.save();
};

maintenanceRuleSchema.methods.isDue = async function() {
  const vehicle = await mongoose.model(this.vehicleType).findById(this.vehicleId);
  
  if (!vehicle) {
    throw new Error('Vehicle not found');
  }
  
  const lastMaintenance = vehicle.lastMaintenanceKilometers || 0;
  const kmSinceLastMaintenance = vehicle.currentKilometers - lastMaintenance;
  
  if (kmSinceLastMaintenance >= this.intervalKilometers) {
    return {
      isDue: true,
      reason: 'Kilometer interval reached',
      kmOverdue: kmSinceLastMaintenance - this.intervalKilometers
    };
  }
  
  if (this.intervalMonths) {
    const lastMaintenanceDate = vehicle.lastMaintenanceDate || vehicle.purchaseDate;
    const monthsSinceMaintenance = Math.floor(
      (Date.now() - lastMaintenanceDate) / (1000 * 60 * 60 * 24 * 30)
    );
    
    if (monthsSinceMaintenance >= this.intervalMonths) {
      return {
        isDue: true,
        reason: 'Time interval reached',
        monthsOverdue: monthsSinceMaintenance - this.intervalMonths
      };
    }
  }
  
  return { isDue: false };
};

export default mongoose.model('MaintenanceRule', maintenanceRuleSchema);
