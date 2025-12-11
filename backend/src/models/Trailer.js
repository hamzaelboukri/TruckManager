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
            trim: true
        },
        model: {
            type: String,
            trim: true
        },
        type: {
            type: String,
            enum: ['Flatbed', 'Refrigerated', 'Tanker', 'Container', 'Van', 'Other'],
            default: 'Flatbed'
        },
        year: {
            type: Number,
            required: [true, 'Year is required'],
            min: [1900, 'Year must be after 1900'],
            max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
        },
        maxCapacity: {
            type: Number,
            required: [true, 'Max capacity (kg) is required'],
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
        dimensions: {
            length: {
                type: Number,
                min: [0, 'Length must be positive']
            },
            width: {
                type: Number,
                min: [0, 'Width must be positive']
            },
            height: {
                type: Number,
                min: [0, 'Height must be positive']
            }
        },
        numberOfAxles: {
            type: Number,
            default: 2,
            min: [1, 'Must have at least 1 axle'],
            max: [6, 'Cannot exceed 6 axles']
        },
        status: {
            type: String,
            enum: ['Available', 'InUse', 'Maintenance', 'OutOfService'],
            default: 'Available'
        },
        condition: {
            type: String,
            enum: ['Excellent', 'Good', 'Fair', 'Poor'],
            default: 'Good'
        },
        lastMaintenanceDate: {
            type: Date
        },
        nextMaintenanceKilometers: {
            type: Number
        },
        notes: {
            type: String,
            trim: true
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
trailerSchema.index({ type: 1 });
trailerSchema.index({ condition: 1 });

trailerSchema.virtual('age').get(function () {
    return new Date().getFullYear() - this.year;
});

trailerSchema.virtual('volume').get(function () {
    if (this.dimensions?.length && this.dimensions?.width && this.dimensions?.height) {
        return this.dimensions.length * this.dimensions.width * this.dimensions.height;
    }
    return null;
});

trailerSchema.virtual('tires', {
    ref: 'Tire',
    localField: '_id',
    foreignField: 'vehicle',
    match: { ownerType: 'Trailer' }
});

trailerSchema.methods.updateCondition = function () {
    const age = this.age;
    const km = this.currentKilometers;

    if (age > 15 || km > 500000) {
        this.condition = 'Poor';
    } else if (age > 10 || km > 300000) {
        this.condition = 'Fair';
    } else if (age > 5 || km > 150000) {
        this.condition = 'Good';
    } else {
        this.condition = 'Excellent';
    }
    
    return this.save();
};

export default mongoose.model('Trailer', trailerSchema);
