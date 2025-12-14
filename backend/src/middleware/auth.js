import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const authMiddleware = (req, res, next) => {
    console.log('Auth Headers:', req.headers.authorization);
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.log('No token found in headers');
        return res.status(401).json({
            success: false,
            error: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

export default authMiddleware;
