import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pcFeZEm2N3rR@ep-lingering-river-a4hkkqsf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

export default pool;
