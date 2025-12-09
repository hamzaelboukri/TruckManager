import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';
import { isAdmin } from '../middleware/role.js';

const router = express.Router();

router.use(authMiddleware);
router.use(isAdmin);

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
