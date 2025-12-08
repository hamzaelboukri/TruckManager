const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
      uppercase: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

driverSchema.index({ user: 1 });
driverSchema.index({ licenseNumber: 1 });

driverSchema.virtual('assignedRoutes', {
  ref: 'Route',
  localField: '_id',
  foreignField: 'driver'
});

driverSchema.methods.viewAssignedRoutes = async function() {
  await this.populate('assignedRoutes');
  return this.assignedRoutes;
};

driverSchema.methods.downloadRoutePDF = async function(routeId) {
  return {
    routeId,
    driverId: this._id,
    message: 'PDF generation to be implemented'
  };
};

module.exports = mongoose.model('Driver', driverSchema);
