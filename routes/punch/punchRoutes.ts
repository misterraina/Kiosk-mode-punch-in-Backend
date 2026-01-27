import { Router, Request, Response } from 'express';
import pool from '../../config/database';

const router: Router = Router();

interface PunchInRequest {
  userId: number;
  deviceId?: number;
}

// Punch in endpoint (unified for kiosk and remote)
// router.post('/in', async (req: Request, res: Response) => {
//     try {
//         const { userId, deviceId }: PunchInRequest = req.body;

//         if (!userId) {
//             return res.status(400).json({ error: 'User ID is required' });
//         }

//         // Check if user exists and is active
//         const userResult = await pool.query(
//             'SELECT * FROM "user" WHERE id = $1 AND status = $2',
//             [userId, 'ACTIVE']
//         );

//         if (userResult.rows.length === 0) {
//             return res.status(404).json({ error: 'User not found or not active' });
//         }

//         // If deviceId is provided, validate device exists and is active
//         let device = null;
//         if (deviceId) {
//             const deviceResult = await pool.query(
//                 'SELECT * FROM device WHERE id = $1 AND isActive = $2',
//                 [deviceId, true]
//             );

//             if (deviceResult.rows.length === 0) {
//                 return res.status(404).json({ error: 'Device not found or not active' });
//             }

//             device = {
//                 id: deviceResult.rows[0].id,
//                 deviceCode: deviceResult.rows[0].devicecode,
//                 location: deviceResult.rows[0].location,
//                 isActive: deviceResult.rows[0].isactive,
//                 lastSeenAt: deviceResult.rows[0].lastseenat
//             };

//             // Update device last seen
//             await pool.query(
//                 'UPDATE device SET lastSeenAt = CURRENT_TIMESTAMP WHERE id = $1',
//                 [deviceId]
//             );
//         }

//         // Check if user already has an open punch
//         const openPunchResult = await pool.query(
//             'SELECT * FROM punchRecords WHERE userId = $1 AND status = $2',
//             [userId, 'OPEN']
//         );

//         if (openPunchResult.rows.length > 0) {
//             return res.status(400).json({ error: 'User already has an open punch session' });
//         }

//         // Create punch in record
//         const result = await pool.query(
//             `INSERT INTO punchRecords (userId, deviceId, punchInAt, status, createdAt) 
//              VALUES ($1, $2, CURRENT_TIMESTAMP, 'OPEN', CURRENT_TIMESTAMP) RETURNING *`,
//             [userId, deviceId || null]
//         );

//         const punchRecord = result.rows[0];
//         const user = userResult.rows[0];

//         res.status(201).json({
//             message: 'Punch in successful',
//             punchRecord: {
//                 id: punchRecord.id,
//                 userId: punchRecord.userid,
//                 deviceId: punchRecord.deviceid,
//                 punchInAt: punchRecord.punchinat,
//                 punchOutAt: punchRecord.punchoutat,
//                 durationMinutes: punchRecord.durationminutes,
//                 status: punchRecord.status,
//                 createdAt: punchRecord.createdat
//             },
//             user: {
//                 id: user.id,
//                 employeeCode: user.employeecode,
//                 name: user.name,
//                 status: user.status,
//                 faceProfileId: user.faceprofileid,
//                 createdAt: user.createdat
//             },
//             device: device,
//             mode: deviceId ? 'KIOSK' : 'REMOTE'
//         });
//     } catch (error: any) {
//         console.error('POST /api/punch/in error:', error);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// // Punch out endpoint (unified for kiosk and remote)
// router.post('/out', async (req: Request, res: Response) => {
//     try {
//         const { userId, deviceId }: PunchInRequest = req.body;

//         if (!userId) {
//             return res.status(400).json({ error: 'User ID is required' });
//         }

//         // If deviceId is provided, validate device exists and is active
//         let device = null;
//         if (deviceId) {
//             const deviceResult = await pool.query(
//                 'SELECT * FROM device WHERE id = $1 AND isActive = $2',
//                 [deviceId, true]
//             );

//             if (deviceResult.rows.length === 0) {
//                 return res.status(404).json({ error: 'Device not found or not active' });
//             }

//             device = {
//                 id: deviceResult.rows[0].id,
//                 deviceCode: deviceResult.rows[0].devicecode,
//                 location: deviceResult.rows[0].location,
//                 isActive: deviceResult.rows[0].isactive,
//                 lastSeenAt: deviceResult.rows[0].lastseenat
//             };

//             // Update device last seen
//             await pool.query(
//                 'UPDATE device SET lastSeenAt = CURRENT_TIMESTAMP WHERE id = $1',
//                 [deviceId]
//             );
//         }

//         // Find open punch record for this user
//         const openPunchResult = await pool.query(
//             'SELECT * FROM punchRecords WHERE userId = $1 AND status = $2 ORDER BY punchInAt DESC LIMIT 1',
//             [userId, 'OPEN']
//         );

//         if (openPunchResult.rows.length === 0) {
//             return res.status(400).json({ error: 'No open punch session found for this user' });
//         }

//         const punchRecord = openPunchResult.rows[0];

//         // Update punch record with punch out time
//         const result = await pool.query(
//             `UPDATE punchRecords 
//              SET punchOutAt = CURRENT_TIMESTAMP, status = 'CLOSED' 
//              WHERE id = $1 RETURNING *`,
//             [punchRecord.id]
//         );

//         const updatedRecord = result.rows[0];

//         res.json({
//             message: 'Punch out successful',
//             punchRecord: {
//                 id: updatedRecord.id,
//                 userId: updatedRecord.userid,
//                 deviceId: updatedRecord.deviceid,
//                 punchInAt: updatedRecord.punchinat,
//                 punchOutAt: updatedRecord.punchoutat,
//                 durationMinutes: updatedRecord.durationminutes,
//                 status: updatedRecord.status,
//                 createdAt: updatedRecord.createdat
//             },
//             device: device,
//             mode: deviceId ? 'KIOSK' : 'REMOTE'
//         });
//     } catch (error: any) {
//         console.error('POST /api/punch/out error:', error);
//         res.status(500).json({ error: 'Internal server error', details: error.message });
//     }
// });

// Get punch records for a user (admin only - for reporting)
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = 'SELECT pr.*, u.name as userName, u.employeeCode, d.deviceCode, d.location FROM punchRecords pr JOIN "user" u ON pr.userId = u.id LEFT JOIN device d ON pr.deviceId = d.id WHERE pr.userId = $1';
        let countQuery = 'SELECT COUNT(*) FROM punchRecords WHERE userId = $1';
        const params: any[] = [userId];

        if (status) {
            query += ' AND pr.status = $' + (params.length + 1);
            countQuery += ' AND status = $' + (params.length + 1);
            params.push(status);
        }

        query += ' ORDER BY pr.punchInAt DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const [recordsResult, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, status ? [userId, status] : [userId])
        ]);

        res.json({
            punchRecords: recordsResult.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page as string),
            limit: parseInt(limit as string)
        });
    } catch (error: any) {
        console.error('GET /api/punch/user/:userId error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
