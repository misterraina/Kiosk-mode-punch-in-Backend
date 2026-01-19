const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_pcFeZEm2N3rR@ep-lingering-river-a4hkkqsf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function migrate() {
    const pool = new Pool({
        connectionString: DATABASE_URL
    });

    try {
        console.log('Running database migrations...');
        
        // Create admin table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admin (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                passwordHash VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN')),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Create user table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                id SERIAL PRIMARY KEY,
                employeeCode VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'DISABLED')),
                faceProfileId VARCHAR(255),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Create device table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS device (
                id SERIAL PRIMARY KEY,
                deviceCode VARCHAR(50) UNIQUE NOT NULL,
                location VARCHAR(255),
                isActive BOOLEAN DEFAULT false,
                lastSeenAt TIMESTAMP
            );
        `);
        
        // Create punchRecords table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS punchRecords (
                id SERIAL PRIMARY KEY,
                userId INTEGER REFERENCES "user"(id),
                deviceId INTEGER REFERENCES device(id),
                punchInAt TIMESTAMP NOT NULL,
                punchOutAt TIMESTAMP,
                durationMinutes INTEGER GENERATED ALWAYS AS (
                    CASE 
                        WHEN punchOutAt IS NOT NULL 
                        THEN EXTRACT(EPOCH FROM (punchOutAt - punchInAt))/60 
                        ELSE NULL 
                    END
                ) STORED,
                status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'CLOSED', 'INVALID')),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Create session table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS session (
                id SERIAL PRIMARY KEY,
                subjectId INTEGER NOT NULL,
                subjectType VARCHAR(20) NOT NULL CHECK (subjectType IN ('ADMIN', 'DEVICE')),
                expiresAt TIMESTAMP NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Create organization table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS organization (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                timezone VARCHAR(50) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Create auditLog table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS auditLog (
                id SERIAL PRIMARY KEY,
                actorType VARCHAR(20) NOT NULL CHECK (actorType IN ('ADMIN', 'DEVICE', 'SYSTEM')),
                actorId INTEGER NOT NULL,
                action VARCHAR(255) NOT NULL,
                metadata JSONB,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log('Database migrations completed successfully!');
        
    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        await pool.end();
    }
}

migrate();
