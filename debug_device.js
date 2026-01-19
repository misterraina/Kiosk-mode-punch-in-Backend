const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_pcFeZEm2N3rR@ep-lingering-river-a4hkkqsf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function debugDevice() {
    try {
        console.log('Checking device status...\n');
        
        // Get device by deviceCode
        const result = await pool.query('SELECT * FROM device WHERE deviceCode = $1', ['DEV001']);
        
        if (result.rows.length === 0) {
            console.log('❌ Device not found');
            return;
        }
        
        const device = result.rows[0];
        console.log('✅ Device found:');
        console.log('ID:', device.id);
        console.log('Device Code:', device.devicecode);
        console.log('Location:', device.location);
        console.log('Is Active:', device.isactive);
        console.log('Last Seen At:', device.lastseenat);
        console.log('Type of isActive:', typeof device.isactive);
        console.log('Value of isActive == true:', device.isactive == true);
        console.log('Value of isActive === true:', device.isactive === true);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

debugDevice();
