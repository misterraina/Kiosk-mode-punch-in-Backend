const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function runMigration() {
    try {
        console.log('Removing kioskMode column from device table...');
        
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'remove_kiosk_mode_from_device.sql'),
            'utf8'
        );
        
        await pool.query(migrationSQL);
        
        console.log('✅ Migration completed successfully!');
        console.log('kioskMode column removed from device table.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
