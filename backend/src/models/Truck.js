const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be after 1900'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required']
    },
    currentKilometers: {
      type: Number,
      default: 0,
      min: [0, 'Kilometers cannot be negative']
    },
    fuelCapacity: {
      type: Number,
      required: [true, 'Fuel capacity is required'],
      min: [0, 'Fuel capacity must be positive']
    },
    status: {
      type: String,
      enum: ['Available', 'InRoute', 'Maintenance', 'OutOfService'],
      default: 'Available'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

truckSchema.index({ registrationNumber: 1 });
truckSchema.index({ status: 1 });

truckSchema.virtual('routes', {
  ref: 'Route',
  localField: '_id',
  foreignField: 'truck'
});

truckSchema.virtual('maintenanceRecords', {
  ref: 'MaintenanceRule',
  localField: '_id',
  foreignField: 'vehicleId'
});

truckSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

truckSchema.methods.updateKilometers = function(kilometers) {
  if (kilometers < this.currentKilometers) {
    throw new Error('New kilometers cannot be less than current kilometers');
  }
  this.currentKilometers = kilometers;
  return this.save();
};

module.exports = mongoose.model('Truck', truckSchema);
