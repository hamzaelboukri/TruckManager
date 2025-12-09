import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required']
    },
    truck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Truck',
      required: [true, 'Truck is required']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    routeNumber: {
      type: String,
      required: [true, 'Route number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    departureLocation: {
      type: String,
      required: [true, 'Departure location is required'],
      trim: true
    },
    arrivalLocation: {
      type: String,
      required: [true, 'Arrival location is required'],
      trim: true
    },
    distance: {
      type: Number,
      required: [true, 'Distance is required'],
      min: [0, 'Distance must be positive']
    },
    status: {
      type: String,
      enum: ['Planned', 'InProgress', 'Completed', 'Cancelled'],
      default: 'Planned'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

routeSchema.index({ driver: 1 });
routeSchema.index({ truck: 1 });
routeSchema.index({ routeNumber: 1 });
routeSchema.index({ status: 1 });

routeSchema.virtual('reports', {
  ref: 'Report',
  localField: '_id',
  foreignField: 'route'
});

routeSchema.methods.assignTruck = async function(truckId) {
  const Truck = mongoose.model('Truck');
  const truck = await Truck.findById(truckId);
  
  if (!truck) {
    throw new Error('Truck not found');
  }
  
  if (truck.status !== 'Available') {
    throw new Error('Truck is not available');
  }
  
  this.truck = truckId;
  truck.status = 'InRoute';
  
  await truck.save();
  return await this.save();
};

export default mongoose.model('Route', routeSchema);
