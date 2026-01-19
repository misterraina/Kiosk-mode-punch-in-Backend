const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Database connection from .env
const DATABASE_URL = 'postgresql://neondb_owner:npg_pcFeZEm2N3rR@ep-lingering-river-a4hkkqsf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function seedAdmin() {
    const pool = new Pool({
        connectionString: DATABASE_URL
    });

    try {
        console.log('Connecting to database...');
        
        // Hash the password
        const password = 'admin123';
        const passwordHash = await bcrypt.hash(password, 12);
        
        console.log('Seeding admin user...');
        
        // Insert admin user
        const result = await pool.query(
            `INSERT INTO admin (id, email, passwordHash, role, createdAt) 
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
             ON CONFLICT (id) DO UPDATE SET
             email = EXCLUDED.email,
             passwordHash = EXCLUDED.passwordHash,
             role = EXCLUDED.role
             RETURNING *`,
            [1, 'admin@punchinout.com', passwordHash, 'SUPER_ADMIN']
        );
        
        console.log('Admin user seeded successfully:', result.rows[0]);
        console.log('Email: admin@punchinout.com');
        console.log('Password: admin123');
        
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await pool.end();
    }
}

seedAdmin();
