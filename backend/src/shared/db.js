import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    timezone: 'America/Sao_Paulo'
});

export default pool;