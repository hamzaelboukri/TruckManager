import driverService from '../services/driverService.js';

export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await driverService.getAllDrivers();
        
        res.status(200).json({
            success: true,
            count: drivers.length,
            data: drivers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

export const getDriverById = async (req, res) => {
    try {
        const driver = await driverService.getDriverById(req.params.id);
        
        res.status(200).json({
            success: true,
            data: driver
        });
    } catch (error) {
        if (error.message === 'Driver not found') {
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
