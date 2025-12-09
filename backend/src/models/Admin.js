import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

adminSchema.index({ user: 1 });

adminSchema.methods.createTruck = async function (truckData) {
  const Truck = mongoose.model('Truck');
  return await Truck.create(truckData);
};

adminSchema.methods.createTrailer = async function (trailerData) {
  const Trailer = mongoose.model('Trailer');
  return await Trailer.create(trailerData);
};

export default mongoose.model('Admin', adminSchema);
