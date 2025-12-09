import truckService from '../services/truckService.js';

export const getAllTrucks = async (req, res) => {
    try {
        const { status, model, page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (model) filters.model = new RegExp(model, 'i');

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort
        };

        const result = await truckService.getAllTrucks(filters, options);

        res.status(200).json({
            success: true,
            count: result.trucks.length,
            total: result.total,
            page: result.page,
            pages: result.pages,
            data: result.trucks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getTruckById = async (req, res) => {
    try {
        const truck = await truckService.getTruckById(req.params.id);

        res.status(200).json({
            success: true,
            data: truck
        });
    } catch (error) {
        if (error.message === 'Truck not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const createTruck = async (req, res) => {
    try {
        const { registrationNumber, model, year, purchaseDate, currentKilometers, fuelCapacity, status } = req.body;

        if (!registrationNumber || !model || !year || !purchaseDate || !fuelCapacity) {
            return res.status(400).json({
                success: false,
                error: 'Please provide all required fields: registrationNumber, model, year, purchaseDate, fuelCapacity'
            });
        }

        const truckData = {
            registrationNumber,
            model,
            year,
            purchaseDate,
            fuelCapacity,
            currentKilometers: currentKilometers || 0,
            status: status || 'Available'
        };

        const truck = await truckService.createTruck(truckData);

        res.status(201).json({
            success: true,
            message: 'Truck created successfully',
            data: truck
        });
    } catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateTruck = async (req, res) => {
    try {
        const allowedUpdates = ['model', 'year', 'currentKilometers', 'fuelCapacity', 'status', 'purchaseDate'];
        const updates = Object.keys(req.body);
        const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

        if (!isValidUpdate) {
            return res.status(400).json({
                success: false,
                error: 'Invalid updates. Allowed fields: ' + allowedUpdates.join(', ')
            });
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please provide at least one field to update'
            });
        }

        const truck = await truckService.updateTruck(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: 'Truck updated successfully',
            data: truck
        });
    } catch (error) {
        if (error.message === 'Truck not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const deleteTruck = async (req, res) => {
    try {
        await truckService.deleteTruck(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Truck deleted successfully',
            data: {}
        });
    } catch (error) {
        if (error.message === 'Truck not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getTrucksByStatus = async (req, res) => {
    try {
        const trucks = await truckService.getTrucksByStatus(req.params.status);

        res.status(200).json({
            success: true,
            count: trucks.length,
            data: trucks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateTruckStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Please provide status'
            });
        }

        const validStatuses = ['Available', 'InRoute', 'Maintenance', 'OutOfService'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        const truck = await truckService.updateTruck(req.params.id, { status });

        res.status(200).json({
            success: true,
            message: `Truck status updated to ${status}`,
            data: truck
        });
    } catch (error) {
        if (error.message === 'Truck not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const updateTruckKilometers = async (req, res) => {
    try {
        const { kilometers } = req.body;

        if (kilometers === undefined || kilometers === null) {
            return res.status(400).json({
                success: false,
                error: 'Please provide kilometers'
            });
        }

        if (kilometers < 0) {
            return res.status(400).json({
                success: false,
                error: 'Kilometers cannot be negative'
            });
        }

        const truck = await truckService.updateTruck(req.params.id, { currentKilometers: kilometers });

        res.status(200).json({
            success: true,
            message: 'Truck kilometers updated successfully',
            data: truck
        });
    } catch (error) {
        if (error.message === 'Truck not found') {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getAvailableTrucks = async (req, res) => {
    try {
        const trucks = await truckService.getTrucksByStatus('Available');

        res.status(200).json({
            success: true,
            count: trucks.length,
            data: trucks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getTruckStatistics = async (req, res) => {
    try {
        const stats = await truckService.getTruckStatistics();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const searchTrucks = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a search query'
            });
        }

        const trucks = await truckService.searchTrucks(query);

        res.status(200).json({
            success: true,
            count: trucks.length,
            data: trucks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
