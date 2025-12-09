import express from 'express';
import {
  getAllTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  deleteTruck,
  getTrucksByStatus
} from '../controllers/truckController.js';

const router = express.Router();

router.get('/', getAllTrucks);
router.get('/:id', getTruckById);
router.post('/', createTruck);
router.put('/:id', updateTruck);
router.delete('/:id', deleteTruck);
router.get('/status/:status', getTrucksByStatus);

export default router;
