import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import itemGeneratorService from './itemGeneratorService.js';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

class DungeonJobService {
    async checkCompletedDungeons() {
        const client = await pool.connect();
        const jobId = process.env.HOSTNAME;

        try {
            await client.query('BEGIN');

            // Verifica primeiro se há dungeons para processar
            const checkQuery = `
                SELECT COUNT(*) as count
                FROM dungeons d
                WHERE 
                    d.status = 'em_progresso'
                    AND CURRENT_TIMESTAMP >= d.finalizada_em;
            `;

            const checkResult = await client.query(checkQuery);
            const hasDungeonsToProcess = checkResult.rows[0].count > 0;

            if (!hasDungeonsToProcess) {
                await client.query('COMMIT');
                return;
            }

            // Se há dungeons, tenta obter o lock
            const lockResult = await client.query(`
                SELECT pg_try_advisory_xact_lock(123456) as locked
            `);

            if (!lockResult.rows[0].locked) {
                console.log(`[Job ${jobId}] Skip: outro job está processando as dungeons pendentes`);
                await client.query('COMMIT');
                return;
            }

            console.log(`[Job ${jobId}] Processando dungeons pendentes...`);

            const updateQuery = `
                UPDATE dungeons d
                SET 
                    status = 'aguardando_recompensa', 
                    finalizada_em = CURRENT_TIMESTAMP,
                    updated_at = CURRENT_TIMESTAMP
                FROM tipos_dungeon td
                WHERE 
                    d.tipo_dungeon_id = td.id
                    AND d.status = 'em_progresso'
                    AND CURRENT_TIMESTAMP >= d.finalizada_em
                RETURNING 
                    d.id, 
                    d.usuario_id, 
                    d.tipo_dungeon_id,
                    td.nivel_minimo;
            `;

            const result = await client.query(updateQuery);

            // Gera recompensas para cada dungeon finalizada
            for (const dungeon of result.rows) {
                const items = await itemGeneratorService.generateRandomItems(
                    dungeon.usuario_id,
                    dungeon.nivel_minimo
                );

                // Insere as recompensas
                for (const item of items.items) {
                    await client.query(`
                        INSERT INTO dungeon_recompensas (dungeon_id, equipamento_id)
                        VALUES ($1, $2)
                    `, [dungeon.id, item.id]);
                }
            }

            if (result.rows.length > 0) {
                console.log(`[Job ${jobId}] ${result.rows.length} dungeons finalizadas`);
                result.rows.forEach(dungeon => {
                    console.log(`[Job ${jobId}] Dungeon ${dungeon.id} finalizada para usuário ${dungeon.usuario_id}`);
                });
            }

            await client.query('COMMIT');

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
        setInterval(() => this.checkCompletedDungeons(), 10000);
    }
}

export default new DungeonJobService(); 