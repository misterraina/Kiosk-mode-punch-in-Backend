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
        console.log('Running kiosk mode migration...');
        
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'add_kiosk_mode_to_device.sql'),
            'utf8'
        );
        
        await pool.query(migrationSQL);
        
        console.log('✅ Migration completed successfully!');
        console.log('kioskMode column added to device table.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
