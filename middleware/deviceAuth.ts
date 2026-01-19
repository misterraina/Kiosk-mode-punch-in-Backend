import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import JWT_SECRET from '../config/jwt';

interface DeviceRequest extends Request {
    device?: {
        id: number;
        deviceCode: string;
        location?: string;
        isActive: boolean;
        lastSeenAt?: Date;
    };
}

const authenticateDevice = async (req: DeviceRequest, res: Response, next: NextFunction) => {
    try {
        const deviceToken = req.headers['x-device-token'] as string;

        if (!deviceToken) {
            return res.status(401).json({ error: 'Device token required' });
        }

        // Verify JWT token
        const decoded = jwt.verify(deviceToken, JWT_SECRET) as any;
        
        // Get device from database
        const deviceResult = await pool.query(
            'SELECT * FROM device WHERE id = $1',
            [decoded.deviceId]
        );

        if (deviceResult.rows.length === 0) {
            return res.status(401).json({ error: 'Device not found' });
        }

        const device = deviceResult.rows[0];

        if (!device.isactive) {
            return res.status(401).json({ error: 'Device is not active' });
        }

        // Update last seen timestamp
        await pool.query(
            'UPDATE device SET lastSeenAt = CURRENT_TIMESTAMP WHERE id = $1',
            [device.id]
        );

        req.device = {
            id: device.id,
            deviceCode: device.devicecode,
            location: device.location,
            isActive: device.isactive,
            lastSeenAt: device.lastseenat
        };
        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid device token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Device token expired' });
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default authenticateDevice;
export { DeviceRequest };
