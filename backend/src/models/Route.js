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
        departureKilometers: {
            type: Number,
            min: [0, 'Departure kilometers cannot be negative']
        },
        arrivalKilometers: {
            type: Number,
            min: [0, 'Arrival kilometers cannot be negative']
        },
        fuelVolume: {
            type: Number,
            min: [0, 'Fuel volume cannot be negative'],
            comment: 'Volume of fuel consumed in liters'
        },
        fuelCost: {
            type: Number,
            min: [0, 'Fuel cost cannot be negative']
        },
        vehicleRemarks: {
            type: String,
            trim: true,
            comment: 'Driver remarks about vehicle condition'
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

routeSchema.virtual('actualDistance').get(function () {
    if (this.departureKilometers && this.arrivalKilometers) {
        return this.arrivalKilometers - this.departureKilometers;
    }
    return null;    
});

routeSchema.virtual('fuelConsumptionRate').get(function () {
    const actualDist = this.actualDistance;
    if (actualDist && this.fuelVolume && actualDist > 0) {
        return (this.fuelVolume / actualDist) * 100;
    }
    return null;
});

routeSchema.methods.assignTruck = async function (truckId) {
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

// Method to complete route with fuel and kilometer data
routeSchema.methods.completeRoute = async function (data) {
    const { arrivalKilometers, fuelVolume, fuelCost, vehicleRemarks } = data;

    if (!arrivalKilometers || !this.departureKilometers) {
        throw new Error('Departure and arrival kilometers are required');
    }

    if (arrivalKilometers <= this.departureKilometers) {
        throw new Error('Arrival kilometers must be greater than departure kilometers');
    }

    this.arrivalKilometers = arrivalKilometers;
    this.fuelVolume = fuelVolume || 0;
    this.fuelCost = fuelCost || 0;
    this.vehicleRemarks = vehicleRemarks || '';
    this.status = 'Completed';

    // Update truck kilometers
    const Truck = mongoose.model('Truck');
    const truck = await Truck.findById(this.truck);
    if (truck) {
        const actualDistance = arrivalKilometers - this.departureKilometers;
        truck.currentKilometers += actualDistance;
        truck.status = 'Available';
        await truck.save();
    }

    return await this.save();
};

// Method to start route with departure kilometers
routeSchema.methods.startRoute = async function (departureKilometers) {
    if (!departureKilometers || departureKilometers < 0) {
        throw new Error('Valid departure kilometers are required');
    }

    const Truck = mongoose.model('Truck');
    const truck = await Truck.findById(this.truck);
    
    if (!truck) {
        throw new Error('Truck not found');
    }

    if (truck.status !== 'Available') {
        throw new Error('Truck is not available');
    }

    this.departureKilometers = departureKilometers;
    this.status = 'InProgress';
    truck.status = 'InRoute';

    await truck.save();
    return await this.save();
};

export default mongoose.model('Route', routeSchema);