import express from 'express';
import {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    verifyToken
} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.post('/verify-token', verifyToken);

export default router;
