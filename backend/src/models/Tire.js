import mongoose from 'mongoose';

const tireSchema = new mongoose.Schema(
    {
        serialNumber: {
            type: String,
            required: [true, 'Serial number is required'],
            unique: true,
            trim: true,
            uppercase: true
        },
        brand: {
            type: String,
            required: [true, 'Brand is required'],
            trim: true
        },
        model: {
            type: String,
            required: [true, 'Model is required'],
            trim: true
        },
        size: {
            type: String,
            required: [true, 'Size is required'],
            trim: true
        },
        position: {
            type: String,
            required: [true, 'Position is required'],
            trim: true
        },
        ownerType: {
            type: String,
            enum: ['Truck', 'Trailer'],
            required: [true, 'Owner type is required']
        },
        vehicle: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'ownerType',
            required: [true, 'Vehicle reference is required']
        },
        currentWearPercentage: {
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
        purchaseDate: {
            type: Date,
            required: [true, 'Purchase date is required']
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
tireSchema.index({ vehicle: 1, ownerType: 1 });

tireSchema.virtual('usageKilometers').get(function () {
    return this.currentKilometers - this.installationKilometers;
});

tireSchema.methods.updateWear = function (newKilometers) {
    if (newKilometers < this.currentKilometers) {
        throw new Error('New kilometers cannot be less than current kilometers');
    }

    this.currentKilometers = newKilometers;
    const usageKm = this.currentKilometers - this.installationKilometers;

    this.currentWearPercentage = Math.min((usageKm / 50000) * 100, 100);

    if (this.currentWearPercentage >= 80) {
        this.status = 'NeedReplacement';
    } else if (this.currentWearPercentage >= 60) {
        this.status = 'Warning';
    } else {
        this.status = 'Good';
    }

    return this.save();
};

export default mongoose.model('Tire', tireSchema);
