import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import truckRoutes from './routes/truckRoutes.js';
import tireRoutes from './routes/tireRoutes.js';
import routeRoutes from './routes/routeRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/trucks', truckRoutes);
app.use('/api/v1/tires', tireRoutes);
app.use('/api/v1/routes', routeRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    database: 'MongoDB Connected'
  });
});
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to TruckManager API',
    version: '1.0.0',
    database: 'MongoDB',
    endpoints: {
      health: '/health',
      auth: {
        register: '/api/v1/auth/register',
        login: '/api/v1/auth/login',
        logout: '/api/v1/auth/logout',
        profile: '/api/v1/auth/profile',
        changePassword: '/api/v1/auth/change-password',
        verifyToken: '/api/v1/auth/verify-token'
      },
      trucks: '/api/v1/trucks',
      truckById: '/api/v1/trucks/:id',
      trucksByStatus: '/api/v1/trucks/status/:status'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
