import trailerService from '../services/trailerService.js';

export const createTrailer = async (req, res) => {
    try {
        const trailer = await trailerService.createTrailer(req.body);
        res.status(201).json({
            success: true,
            message: 'Trailer created successfully',
            data: trailer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllTrailers = async (req, res) => {
    try {
        const { page, limit, sortBy, status, type, condition } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (type) filters.type = type;
        if (condition) filters.condition = condition;

        const options = { page, limit, sortBy };
        const result = await trailerService.getAllTrailers(filters, options);

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getTrailerById = async (req, res) => {
    try {
        const trailer = await trailerService.getTrailerById(req.params.id);
        res.status(200).json({
            success: true,
            data: trailer
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const getTrailerByRegistration = async (req, res) => {
    try {
        const trailer = await trailerService.getTrailerByRegistration(req.params.registrationNumber);
        res.status(200).json({
            success: true,
            data: trailer
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateTrailer = async (req, res) => {
    try {
        const trailer = await trailerService.updateTrailer(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Trailer updated successfully',
            data: trailer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteTrailer = async (req, res) => {
    try {
        await trailerService.deleteTrailer(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Trailer deleted successfully'
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateKilometers = async (req, res) => {
    try {
        const { kilometers } = req.body;
        const trailer = await trailerService.updateKilometers(req.params.id, kilometers);
        
        res.status(200).json({
            success: true,
            message: 'Kilometers updated successfully',
            data: trailer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const trailer = await trailerService.updateStatus(req.params.id, status);
        
        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: trailer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const updateCondition = async (req, res) => {
    try {
        const trailer = await trailerService.updateCondition(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'Condition updated successfully',
            data: trailer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getTrailersByStatus = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const options = { page, limit };
        
        const result = await trailerService.getTrailersByStatus(req.params.status, options);
        
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getTrailersByType = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const options = { page, limit };
        
        const result = await trailerService.getTrailersByType(req.params.type, options);
        
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAvailableTrailers = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const options = { page, limit };
        
        const result = await trailerService.getAvailableTrailers(options);
        
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const searchTrailers = async (req, res) => {
    try {
        const { q, page, limit } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const options = { page, limit };
        const result = await trailerService.searchTrailers(q, options);
        
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getTrailerStatistics = async (req, res) => {
    try {
        const stats = await trailerService.getTrailerStatistics();
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getTrailerMaintenanceInfo = async (req, res) => {
    try {
        const info = await trailerService.getTrailerMaintenanceInfo(req.params.id);
        
        res.status(200).json({
            success: true,
            data: info
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateMaintenanceInfo = async (req, res) => {
    try {
        const trailer = await trailerService.updateMaintenanceInfo(req.params.id, req.body);
        
        res.status(200).json({
            success: true,
            message: 'Maintenance info updated successfully',
            data: trailer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
