const express = require('express');
const router = express.Router();
const {
  getAllTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  deleteTruck,
  getTrucksByStatus
} = require('../controllers/truckController');

// Routes
router.get('/', getAllTrucks);
router.get('/:id', getTruckById);
router.post('/', createTruck);
router.put('/:id', updateTruck);
router.delete('/:id', deleteTruck);
router.get('/status/:status', getTrucksByStatus);

module.exports = router;
