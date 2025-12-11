import Trailer from '../models/Trailer.js';

class TrailerService {
    async createTrailer(trailerData) {
        const trailer = await Trailer.create(trailerData);
        return trailer;
    }

    async getAllTrailers(filters = {}, options = {}) {
        const { page = 1, limit = 10, sortBy = '-createdAt' } = options;
        const skip = (page - 1) * limit;

        const query = { ...filters };

        const trailers = await Trailer.find(query)
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .populate('tires');

        const total = await Trailer.countDocuments(query);

        return {
            trailers,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getTrailerById(trailerId) {
        const trailer = await Trailer.findById(trailerId).populate('tires');
        if (!trailer) {
            throw new Error('Trailer not found');
        }
        return trailer;
    }

    async getTrailerByRegistration(registrationNumber) {
        const trailer = await Trailer.findOne({ 
            registrationNumber: registrationNumber.toUpperCase() 
        }).populate('tires');
        
        if (!trailer) {
            throw new Error('Trailer not found');
        }
        return trailer;
    }

    async updateTrailer(trailerId, updateData) {
        const trailer = await Trailer.findById(trailerId);
        if (!trailer) {
            throw new Error('Trailer not found');
        }

        Object.assign(trailer, updateData);
        await trailer.save();
        await trailer.populate('tires');
        
        return trailer;
    }

    async deleteTrailer(trailerId) {
        const trailer = await Trailer.findByIdAndDelete(trailerId);
        if (!trailer) {
            throw new Error('Trailer not found');
        }
        return trailer;
    }

    async updateKilometers(trailerId, kilometers) {
        const trailer = await Trailer.findById(trailerId);
        if (!trailer) {
            throw new Error('Trailer not found');
        }

        if (kilometers < trailer.currentKilometers) {
            throw new Error('New kilometers cannot be less than current kilometers');
        }

        trailer.currentKilometers = kilometers;
        await trailer.save();
        await trailer.populate('tires');
        
        return trailer;
    }

    async updateStatus(trailerId, status) {
        const trailer = await Trailer.findById(trailerId);
        if (!trailer) {
            throw new Error('Trailer not found');
        }

        const validStatuses = ['Available', 'InUse', 'Maintenance', 'OutOfService'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status');
        }

        trailer.status = status;
        await trailer.save();
        await trailer.populate('tires');
        
        return trailer;
    }

    async updateCondition(trailerId) {
        const trailer = await Trailer.findById(trailerId);
        if (!trailer) {
            throw new Error('Trailer not found');
        }

        await trailer.updateCondition();
        await trailer.populate('tires');
        
        return trailer;
    }

    async getTrailersByStatus(status, options = {}) {
        return await this.getAllTrailers({ status }, options);
    }

    async getTrailersByType(type, options = {}) {
        return await this.getAllTrailers({ type }, options);
    }

    async getTrailersByCondition(condition, options = {}) {
        return await this.getAllTrailers({ condition }, options);
    }

    async getAvailableTrailers(options = {}) {
        return await this.getAllTrailers({ status: 'Available' }, options);
    }

    async searchTrailers(searchTerm, options = {}) {
        const { page = 1, limit = 10 } = options;
        const skip = (page - 1) * limit;

        const searchRegex = new RegExp(searchTerm, 'i');
        
        const query = {
            $or: [
                { registrationNumber: searchRegex },
                { brand: searchRegex },
                { model: searchRegex },
                { type: searchRegex }
            ]
        };

        const trailers = await Trailer.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .populate('tires');

        const total = await Trailer.countDocuments(query);

        return {
            trailers,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getTrailerStatistics() {
        const [
            totalTrailers,
            statusCounts,
            typeCounts,
            conditionCounts,
            avgKilometers,
            avgAge
        ] = await Promise.all([
            Trailer.countDocuments(),
            
            Trailer.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            
            Trailer.aggregate([
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]),
            
            Trailer.aggregate([
                { $group: { _id: '$condition', count: { $sum: 1 } } }
            ]),
            
            Trailer.aggregate([
                { $group: { _id: null, avgKm: { $avg: '$currentKilometers' } } }
            ]),
            
            Trailer.aggregate([
                {
                    $project: {
                        age: {
                            $subtract: [new Date().getFullYear(), '$year']
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgAge: { $avg: '$age' }
                    }
                }
            ])
        ]);

        return {
            totalTrailers,
            byStatus: statusCounts,
            byType: typeCounts,
            byCondition: conditionCounts,
            averageKilometers: avgKilometers[0]?.avgKm || 0,
            averageAge: Math.round(avgAge[0]?.avgAge || 0)
        };
    }

    async getTrailerMaintenanceInfo(trailerId) {
        const trailer = await Trailer.findById(trailerId).populate('tires');
        if (!trailer) {
            throw new Error('Trailer not found');
        }

        const daysSinceLastMaintenance = trailer.lastMaintenanceDate
            ? Math.floor((Date.now() - trailer.lastMaintenanceDate.getTime()) / (1000 * 60 * 60 * 24))
            : null;

        const needsMaintenance = trailer.nextMaintenanceKilometers
            ? trailer.currentKilometers >= trailer.nextMaintenanceKilometers
            : daysSinceLastMaintenance && daysSinceLastMaintenance > 180;

        return {
            trailer,
            lastMaintenanceDate: trailer.lastMaintenanceDate,
            daysSinceLastMaintenance,
            nextMaintenanceKilometers: trailer.nextMaintenanceKilometers,
            currentKilometers: trailer.currentKilometers,
            needsMaintenance,
            condition: trailer.condition
        };
    }

    async updateMaintenanceInfo(trailerId, maintenanceData) {
        const trailer = await Trailer.findById(trailerId);
        if (!trailer) {
            throw new Error('Trailer not found');
        }

        if (maintenanceData.lastMaintenanceDate) {
            trailer.lastMaintenanceDate = maintenanceData.lastMaintenanceDate;
        }
        
        if (maintenanceData.nextMaintenanceKilometers) {
            trailer.nextMaintenanceKilometers = maintenanceData.nextMaintenanceKilometers;
        }

        await trailer.save();
        await trailer.populate('tires');
        
        return trailer;
    }
}

export default new TrailerService();
