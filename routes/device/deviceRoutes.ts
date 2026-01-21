import { Router, Request, Response } from 'express';
import pool from '../../config/database';
import authenticateAdmin from '../../middleware/adminAuth';
import crypto from 'crypto';

const router = Router();

interface Device {
  id?: number;
  deviceCode: string;
  location?: string;
  isActive?: boolean;
  lastSeenAt?: Date;
}

// Create device (admin only)
router.post('/', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { deviceCode, location, isActive = false } = req.body;

        // Check if device code already exists
        const existingDevice = await pool.query(
            'SELECT id FROM device WHERE deviceCode = $1',
            [deviceCode]
        );

        if (existingDevice.rows.length > 0) {
            return res.status(400).json({ error: 'Device code already exists' });
        }

        const result = await pool.query(
            'INSERT INTO device (deviceCode, location, isActive) VALUES ($1, $2, $3) RETURNING *',
            [deviceCode, location, isActive]
        );

        const device = result.rows[0];

        // Generate activation code
        const activationCode = `${deviceCode}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Code expires in 24 hours

        // Store activation code in database
        await pool.query(
            `INSERT INTO activation_codes (code, deviceId, expiresAt, isUsed) 
             VALUES ($1, $2, $3, false)
             ON CONFLICT DO NOTHING`,
            [activationCode, device.id, expiresAt]
        );

        res.status(201).json({
            device: device,
            activationCode: activationCode,
            message: 'Device created successfully'
        });
    } catch (error: any) {
        console.error('Create device error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all devices (admin only)
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
    console.log('GET /api/devices route hit');
    try {
        const { page = 1, limit = 10, isActive } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = 'SELECT * FROM device';
        let countQuery = 'SELECT COUNT(*) FROM device';
        const params: any[] = [];

        if (isActive !== undefined) {
            query += ' WHERE isActive = $1';
            countQuery += ' WHERE isActive = $1';
            params.push(isActive === 'true');
        }

        query += ' ORDER BY id DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const [devicesResult, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, isActive !== undefined ? [isActive === 'true'] : [])
        ]);

        res.json({
            devices: devicesResult.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page as string),
            limit: parseInt(limit as string)
        });
    } catch (error: any) {
        console.error('GET /api/devices error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get device by ID (admin only)
router.get('/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query('SELECT * FROM device WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error('GET /api/devices/:id error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Activate device (admin only)
router.post('/activate', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { deviceCode } = req.body;

        if (!deviceCode) {
            return res.status(400).json({ error: 'Device code is required' });
        }

        // Get device
        const deviceResult = await pool.query(
            'SELECT * FROM device WHERE deviceCode = $1',
            [deviceCode]
        );

        if (deviceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const device = deviceResult.rows[0];

        if (device.isactive) {
            return res.status(400).json({ error: 'Device is already active' });
        }

        // Activate device
        await pool.query(
            'UPDATE device SET isActive = true, lastSeenAt = CURRENT_TIMESTAMP WHERE id = $1',
            [device.id]
        );

        res.json({
            message: 'Device activated successfully',
            device: {
                id: device.id,
                deviceCode: device.devicecode,
                location: device.location,
                isActive: true
            }
        });
    } catch (error: any) {
        console.error('POST /api/devices/activate error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Deactivate device (admin only)
router.post('/deactivate', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { deviceCode } = req.body;

        if (!deviceCode) {
            return res.status(400).json({ error: 'Device code is required' });
        }

        // Get device
        const deviceResult = await pool.query(
            'SELECT * FROM device WHERE deviceCode = $1',
            [deviceCode]
        );

        if (deviceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const device = deviceResult.rows[0];

        if (!device.isactive) {
            return res.status(400).json({ error: 'Device is already inactive' });
        }

        // Deactivate device
        await pool.query(
            'UPDATE device SET isActive = false WHERE id = $1',
            [device.id]
        );

        res.json({
            message: 'Device deactivated successfully',
            device: {
                id: device.id,
                deviceCode: device.devicecode,
                location: device.location,
                isActive: false
            }
        });
    } catch (error: any) {
        console.error('POST /api/devices/deactivate error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Generate activation code for existing device (admin only)
router.post('/:id/generate-code', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get device
        const deviceResult = await pool.query(
            'SELECT * FROM device WHERE id = $1',
            [id]
        );

        if (deviceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const device = deviceResult.rows[0];

        // Generate new activation code
        const activationCode = `${device.devicecode}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Delete any existing unused codes for this device
        await pool.query(
            'DELETE FROM activation_codes WHERE deviceId = $1 AND isUsed = false',
            [device.id]
        );

        // Store new activation code
        await pool.query(
            `INSERT INTO activation_codes (code, deviceId, expiresAt, isUsed) 
             VALUES ($1, $2, $3, false)`,
            [activationCode, device.id, expiresAt]
        );

        res.json({
            activationCode: activationCode,
            device: {
                id: device.id,
                deviceCode: device.devicecode,
                location: device.location,
                isActive: device.isactive
            },
            message: 'Activation code generated successfully'
        });
    } catch (error: any) {
        console.error('POST /api/devices/:id/generate-code error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Activate device with activation code (no auth required)
router.post('/activate-with-code', async (req: Request, res: Response) => {
    try {
        const { activationCode } = req.body;

        if (!activationCode) {
            return res.status(400).json({ error: 'Activation code is required' });
        }

        // Get activation code from database
        const codeResult = await pool.query(
            'SELECT * FROM activation_codes WHERE code = $1',
            [activationCode]
        );

        if (codeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid activation code' });
        }

        const codeRecord = codeResult.rows[0];

        // Check if code is already used
        if (codeRecord.isused) {
            return res.status(400).json({ error: 'Activation code has already been used' });
        }

        // Check if code is expired
        if (new Date() > new Date(codeRecord.expiresat)) {
            return res.status(400).json({ error: 'Activation code has expired' });
        }

        // Get device
        const deviceResult = await pool.query(
            'SELECT * FROM device WHERE id = $1',
            [codeRecord.deviceid]
        );

        if (deviceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }

        const device = deviceResult.rows[0];

        // Activate device
        await pool.query(
            'UPDATE device SET isActive = true, lastSeenAt = CURRENT_TIMESTAMP WHERE id = $1',
            [device.id]
        );

        // Mark activation code as used
        await pool.query(
            'UPDATE activation_codes SET isUsed = true, usedAt = CURRENT_TIMESTAMP WHERE id = $1',
            [codeRecord.id]
        );

        res.json({
            message: 'Device activated successfully',
            device: {
                id: device.id,
                deviceCode: device.devicecode,
                location: device.location,
                isActive: true
            }
        });
    } catch (error: any) {
        console.error('POST /api/devices/activate-with-code error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
