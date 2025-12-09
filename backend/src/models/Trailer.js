import mongoose from 'mongoose';

const trailerSchema = new mongoose.Schema(
    {
        registrationNumber: {
            type: String,
            required: [true, 'Registration number is required'],
            unique: true,
            trim: true,
            uppercase: true
        },
        brand: {
            type: String,
            required: [true, 'Brand is required'],
            trim: true
        },
        year: {
            type: Number,
            required: [true, 'Year is required'],
            min: [1900, 'Year must be after 1900'],
            max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
        },
        maxCapacity: {
            type: Number,
            required: [true, 'Max capacity is required'],
            min: [0, 'Capacity must be positive']
        },
        currentKilometers: {
            type: Number,
            default: 0,
            min: [0, 'Kilometers cannot be negative']
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
        lastMaintenanceDate: {
            type: Date
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

trailerSchema.index({ registrationNumber: 1 });
trailerSchema.index({ status: 1 });
trailerSchema.index({ ownerType: 1 });

trailerSchema.virtual('age').get(function () {
    return new Date().getFullYear() - this.year;
});

trailerSchema.virtual('tires', {
    ref: 'Tire',
    localField: '_id',
    foreignField: 'owner'
});

trailerSchema.methods.updateStatus = function () {
    if (this.wearPercentage >= 80) {
        this.status = 'NeedReplacement';
    } else if (this.wearPercentage >= 60) {
        this.status = 'Warning';
    } else {
        this.status = 'Good';
    }
    return this.save();
};

export default mongoose.model('Trailer', trailerSchema);
