import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import JWT_SECRET from '../config/jwt';

interface Admin {
  id: number;
  email: string;
  role: string;
}

interface JwtPayload {
  adminId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      admin?: Admin;
    }
  }
}

const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Auth middleware hit for:', req.method, req.url);
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        
        // Check if admin exists and is active
        const adminResult = await pool.query(
            'SELECT id, email, role FROM admin WHERE id = $1',
            [decoded.adminId]
        );

        if (adminResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.admin = adminResult.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

export default authenticateAdmin;
