import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';
import JWT_SECRET from '../../config/jwt';

const router: Router = Router();

interface AdminLoginRequest {
  email: string;
  password: string;
}

interface Admin {
  id: number;
  email: string;
  passwordHash: string;
  role: string;
}

// Admin login endpoint
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password }: AdminLoginRequest = req.body;

        const result = await pool.query(
            'SELECT id, email, passwordhash as "passwordHash", role FROM admin WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const admin = result.rows[0] as Admin;
        const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { adminId: admin.id, email: admin.email, role: admin.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
