const mongoose = require('mongoose');

const tireSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required']
    },
    installationDate: {
      type: Date
    },
    installationKilometers: {
      type: Number,
      default: 0,
      min: [0, 'Installation kilometers cannot be negative']
    },
    currentKilometers: {
      type: Number,
      default: 0,
      min: [0, 'Current kilometers cannot be negative']
    },
    wearPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Wear percentage cannot be negative'],
      max: [100, 'Wear percentage cannot exceed 100']
    },
    status: {
      type: String,
      enum: ['Good', 'Warning', 'NeedReplacement'],
      default: 'Good'
    },
    ownerType: {
      type: String,
      enum: ['Truck', 'Trailer'],
      required: [true, 'Owner type is required']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'ownerType',
      required: [true, 'Owner reference is required']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tireSchema.index({ serialNumber: 1 });
tireSchema.index({ status: 1 });
tireSchema.index({ owner: 1, ownerType: 1 });

tireSchema.virtual('usageKilometers').get(function() {
  return this.currentKilometers - this.installationKilometers;
});

tireSchema.methods.updateWear = function(newKilometers) {
  if (newKilometers < this.currentKilometers) {
    throw new Error('New kilometers cannot be less than current kilometers');
  }
  
  this.currentKilometers = newKilometers;
  const usageKm = this.currentKilometers - this.installationKilometers;
  
  this.wearPercentage = Math.min((usageKm / 50000) * 100, 100);
  
  if (this.wearPercentage >= 80) {
    this.status = 'NeedReplacement';
  } else if (this.wearPercentage >= 60) {
    this.status = 'Warning';
  } else {
    this.status = 'Good';
  }
  
  return this.save();
};

module.exports = mongoose.model('Tire', tireSchema);
