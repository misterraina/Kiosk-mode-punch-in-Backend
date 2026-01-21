import { Router, Request, Response } from 'express';
import pool from '../../config/database';
import authenticateAdmin from '../../middleware/adminAuth';

const router: Router = Router();

interface User {
  id?: number;
  employeeCode: string;
  name: string;
  status?: string;
  faceProfileId?: string;
}

// Create user (admin only)
router.post('/', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { employeeCode, name, status = 'ACTIVE', faceProfileId }: User = req.body;

        // Check if employee code already exists
        const existingUser = await pool.query(
            'SELECT id FROM "user" WHERE employeeCode = $1',
            [employeeCode]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Employee code already exists' });
        }

        const result = await pool.query(
            'INSERT INTO "user" (employeeCode, name, status, faceProfileId) VALUES ($1, $2, $3, $4) RETURNING *',
            [employeeCode, name, status, faceProfileId]
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all users (admin only)
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = 'SELECT * FROM "user"';
        let countQuery = 'SELECT COUNT(*) FROM "user"';
        const params: any[] = [];

        if (status) {
            query += ' WHERE status = $1';
            countQuery += ' WHERE status = $1';
            params.push(status);
        }

        query += ' ORDER BY id DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const [usersResult, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, status ? [status] : [])
        ]);

        res.json({
            users: usersResult.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page as string),
            limit: parseInt(limit as string)
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user by ID (admin only)
router.get('/:id', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query('SELECT * FROM "user" WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
