import pool from '../../shared/db.js';

class DungeonJobService {
    async checkCompletedDungeons() {
        const client = await pool.connect();
        const jobId = process.env.HOSTNAME;

        try {
            // ... resto do código do serviço
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Job ${jobId}] Erro:`, error);
        } finally {
            client.release();
        }
    }

    startJob() {
        console.log(`[Job ${process.env.HOSTNAME}] Serviço iniciado`);
        this.checkCompletedDungeons();
        setInterval(() => this.checkCompletedDungeons(), 60000);
    }
}

export default new DungeonJobService(); 