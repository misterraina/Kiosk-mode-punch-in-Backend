import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import pool from './config/database';

// Import routes
import adminAuthRoutes from './routes/admin/auth';
import userRoutes from './routes/user/userRoutes';
import deviceRoutes from './routes/device/deviceRoutes';
import punchRoutes from './routes/punch/punchRoutes';

const app = express();
const PORT = process.env.PORT || 4040;

// Test database connection
pool.connect((err: any, client: any, release: any) => {
    if (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
    console.log('Database connected successfully');
    release();
});

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
});

// Routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/punch', punchRoutes);
console.log('Device routes mounted at /api/devices');
console.log('Punch routes mounted at /api/punch');

// Simple test route
app.get('/api/test', (req: Request, res: Response) => {
    console.log('TEST ROUTE HIT!');
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${err.message}`);
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req: Request, res: Response) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 404 - Route not found: ${req.method} ${req.url}`);
    console.log('Available routes: /api/admin, /api/users, /api/devices, /api/punch, /api/health');
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] GLOBAL ERROR: ${err.message}`);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});

process.on('SIGTERM', () => {
    console.log('\nSIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});
