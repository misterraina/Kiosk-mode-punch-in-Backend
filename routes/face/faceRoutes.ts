import express, { Request, Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../config/database';

const router = express.Router();

const AUTOMICA_DEVICE_ID = process.env.AUTOMICA_DEVICE_ID || 'android_001';
const AUTOMICA_DEVICE_SECRET = process.env.AUTOMICA_DEVICE_SECRET || 'secret_123';
const AUTOMICA_ENROLL_URL = process.env.AUTOMICA_ENROLL_URL || 'https://api.automica.ai/v1/enroll/json';
const AUTOMICA_ATTENDANCE_URL = process.env.AUTOMICA_ATTENDANCE_URL || 'https://api.automica.ai/v1/attendance/json';

router.post('/enroll', async (req: Request, res: Response) => {
    try {
        const { employee_id, mode, images } = req.body;

        if (!employee_id) {
            return res.status(400).json({ error: 'employee_id is required' });
        }

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ error: 'images array is required and must not be empty' });
        }

        const requestId = `req_${Date.now()}_${uuidv4().substring(0, 8)}`;

        const automicaPayload = {
            request_id: requestId,
            employee_id: employee_id,
            mode: mode || 'replace',
            images: images,
        };

        console.log(`[Face Enroll] Sending to Automica for employee: ${employee_id}`);
        console.log(`[Face Enroll] Request ID: ${requestId}`);
        console.log(`[Face Enroll] Automica URL: ${AUTOMICA_ENROLL_URL}`);
        console.log(`[Face Enroll] Mode: ${mode || 'replace'}`);
        console.log(`[Face Enroll] Number of images: ${images.length}`);
        console.log(`[Face Enroll] Image sizes: ${images.map((img: string) => img.length).join(', ')} characters`);

        const automicaResponse = await axios.post(AUTOMICA_ENROLL_URL, automicaPayload, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        if (automicaResponse.data.success) {
            const updateQuery = `
                UPDATE "user" 
                SET faceprofileid = $1 
                WHERE employeecode = $2
                RETURNING *
            `;
            
            console.log(`[Face Enroll] Updating user with employeeCode: ${employee_id}`);
            const result = await pool.query(updateQuery, [employee_id, employee_id]);

            if (result.rows.length > 0) {
                console.log(`[Face Enroll] Successfully enrolled employee: ${employee_id}`);
                return res.status(200).json({
                    success: true,
                    message: 'Employee enrolled successfully',
                    data: automicaResponse.data,
                    user: result.rows[0],
                });
            } else {
                console.log(`[Face Enroll] Warning: Employee ${employee_id} not found in database`);
                return res.status(200).json({
                    success: true,
                    message: 'Face enrolled in Automica, but employee not found in local database',
                    data: automicaResponse.data,
                });
            }
        } else {
            console.error(`[Face Enroll] Automica enrollment failed:`, automicaResponse.data);
            return res.status(400).json({
                success: false,
                error: automicaResponse.data.message || 'Enrollment failed',
                reason_code: automicaResponse.data.reason_code,
                details: automicaResponse.data.details,
            });
        }
    } catch (error: any) {
        console.error('[Face Enroll] Error:', error.message);
        
        if (error.response) {
            console.error('[Face Enroll] Response Status:', error.response.status);
            console.error('[Face Enroll] Response Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('[Face Enroll] Response Data:', JSON.stringify(error.response.data, null, 2));
            
            return res.status(error.response.status || 500).json({
                success: false,
                error: error.response.data?.message || 'Automica API error',
                reason_code: error.response.data?.reason_code,
                details: error.response.data?.details,
                full_response: error.response.data,
            });
        }

        console.error('[Face Enroll] Full Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message,
        });
    }
});

router.post('/attendance', async (req: Request, res: Response) => {
    try {
        const { image, gps_lat, gps_lng, event, employee_id } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'image is required' });
        }

        if (!event || !['in', 'out'].includes(event)) {
            return res.status(400).json({ error: 'event must be "in" or "out"' });
        }

        const requestId = `req_${Date.now()}_${uuidv4().substring(0, 8)}`;
        const clientTimestamp = new Date().toISOString();

        const automicaPayload: any = {
            request_id: requestId,
            event: event,
            image: image,
            device_id: AUTOMICA_DEVICE_ID,
            device_secret: AUTOMICA_DEVICE_SECRET,
            gps_lat: gps_lat || '0.0',
            gps_lng: gps_lng || '0.0',
            client_ts: clientTimestamp,
        };

        if (employee_id) {
            automicaPayload.employee_id = employee_id;
        }

        console.log(`[Face Attendance] Processing ${event} event`);
        console.log(`[Face Attendance] Request ID: ${requestId}`);
        console.log(`[Face Attendance] Device ID: ${AUTOMICA_DEVICE_ID}`);
        console.log(`[Face Attendance] Device Secret: ${AUTOMICA_DEVICE_SECRET ? '***' + AUTOMICA_DEVICE_SECRET.slice(-4) : 'NOT SET'}`);
        console.log(`[Face Attendance] Automica URL: ${AUTOMICA_ATTENDANCE_URL}`);
        console.log(`[Face Attendance] Image size: ${image.length} characters`);
        console.log(`[Face Attendance] GPS: ${gps_lat}, ${gps_lng}`);

        const automicaResponse = await axios.post(AUTOMICA_ATTENDANCE_URL, automicaPayload, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        if (automicaResponse.data.success) {
            const recognizedEmployeeId = automicaResponse.data.employee_id;
            
            console.log(`[Face Attendance] Face recognized for employee: ${recognizedEmployeeId}`);

            return res.status(200).json({
                success: true,
                employee_id: recognizedEmployeeId,
                decision: automicaResponse.data.decision,
                match_score: automicaResponse.data.match_score,
                quality: automicaResponse.data.quality,
                message: 'Face recognized successfully',
                data: automicaResponse.data,
            });
        } else {
            console.error(`[Face Attendance] Automica recognition failed:`, automicaResponse.data);
            return res.status(400).json({
                success: false,
                error: automicaResponse.data.message || 'Face recognition failed',
                reason_code: automicaResponse.data.reason_code,
                details: automicaResponse.data.details,
            });
        }
    } catch (error: any) {
        console.error('[Face Attendance] Error:', error.message);
        
        if (error.response) {
            console.error('[Face Attendance] Response Status:', error.response.status);
            console.error('[Face Attendance] Response Headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('[Face Attendance] Response Data:', JSON.stringify(error.response.data, null, 2));
            
            return res.status(error.response.status || 500).json({
                success: false,
                error: error.response.data?.message || 'Automica API error',
                reason_code: error.response.data?.reason_code,
                details: error.response.data?.details,
                full_response: error.response.data,
            });
        }

        console.error('[Face Attendance] Full Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message,
        });
    }
});

export default router;
