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
        console.log('Running activation_codes table migration...');
        
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migrations', 'create_activation_codes_table.sql'),
            'utf8'
        );
        
        await pool.query(migrationSQL);
        
        console.log('✅ Migration completed successfully!');
        console.log('activation_codes table created.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
