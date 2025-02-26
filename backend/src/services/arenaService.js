import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

class ArenaService {
    async getAvailablePlayers(userId) {
        const client = await pool.connect();
        try {
            // Busca informações do personagem do usuário
            const userInfo = await client.query(
                'SELECT * FROM personagens WHERE usuario_id = $1 LIMIT 1',
                [userId]
            );

            if (userInfo.rows.length === 0) {
                throw new Error('Personagem não encontrado');
            }

            const nivel = userInfo.rows[0].nivel;
            const elo = userInfo.rows[0].elo;

            // Query 1: jogadores do mesmo nível e mesmo elo
            const resultSameLevel = await client.query(
                `SELECT 
                u.id AS usuario_id,
                u.nickname,
                p.nivel,
                p.classe,
                p.elo
            FROM usuarios u
            JOIN personagens p ON u.id = p.usuario_id
            WHERE u.id != $1
              AND p.nivel = $2
              AND u.status = 'ativo'
              AND p.elo = $3
            ORDER BY RANDOM()
            LIMIT 6`,
                [userId, nivel, elo]
            );

            let players;
            if (resultSameLevel.rows.length === 6) {
                players = resultSameLevel.rows;
            } else {
                // Query 2: jogadores com nível entre (nivel - 2) e (nivel + 2) e mesmo elo
                const resultAdjustedLevel = await client.query(
                    `SELECT 
                  u.id AS usuario_id,
                  u.nickname,
                  p.nivel,
                  p.classe,
                  p.elo
              FROM usuarios u
              JOIN personagens p ON u.id = p.usuario_id
              WHERE u.id != $1
                AND p.nivel BETWEEN $2 AND $3
                AND u.status = 'ativo'
                AND p.elo = $4
              ORDER BY RANDOM()
              LIMIT 6`,
                    [userId, nivel - 2, nivel + 2, elo]
                );
                players = resultAdjustedLevel.rows;
            }

            return {
                players,
                userLevel: nivel
            };
        } catch (error) {
            console.error('Erro em getAvailablePlayers:', error);
            throw error;
        } finally {
            client.release();
        }
    }


    async getDailyBattles(userId) {
        const client = await pool.connect();
        try {
            // Verifica se já existe registro para hoje
            const today = await client.query(
                `SELECT batalhas_restantes, ultima_atualizacao
                 FROM batalhas_diarias
                 WHERE usuario_id = $1`,
                [userId]
            );

            if (today.rows.length === 0) {
                // Primeiro acesso do dia
                const result = await client.query(
                    `INSERT INTO batalhas_diarias (usuario_id, batalhas_restantes)
                     VALUES ($1, 6)
                     RETURNING batalhas_restantes`,
                    [userId]
                );
                return { remainingBattles: result.rows[0].batalhas_restantes };
            }

            // Verifica se precisa resetar o contador (novo dia)
            const lastUpdate = new Date(today.rows[0].ultima_atualizacao);
            const now = new Date();
            if (lastUpdate.getDate() !== now.getDate()) {
                const result = await client.query(
                    `UPDATE batalhas_diarias 
                     SET batalhas_restantes = 6, ultima_atualizacao = CURRENT_TIMESTAMP
                     WHERE usuario_id = $1
                     RETURNING batalhas_restantes`,
                    [userId]
                );
                return { remainingBattles: result.rows[0].batalhas_restantes };
            }

            return { remainingBattles: today.rows[0].batalhas_restantes };
        } catch (error) {
            console.error('Erro em getDailyBattles:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async decrementDailyBattles(userId) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `UPDATE batalhas_diarias
                 SET batalhas_restantes = batalhas_restantes - 1
                 WHERE usuario_id = $1 AND batalhas_restantes > 0
                 RETURNING batalhas_restantes`,
                [userId]
            );

            return result.rows[0];
        } catch (error) {
            console.error('Erro em decrementDailyBattles:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getBattleHistory(userId) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT
                    b.id,
                    b.iniciada_em AS data_inicio,
                    b.status,
                    b.vencedor_time,
                    b.finalizada_em,
                    t1.numero_time AS jogador_time,
                    t2.numero_time AS oponente_time,
                    u1.nickname AS jogador_nickname,
                    u2.nickname AS oponente_nickname,
                    pers1.nivel AS jogador_nivel,
                    pers2.nivel AS oponente_nivel,
                    pers1.classe AS jogador_classe,
                    pers2.classe AS oponente_classe,
                    CASE 
                        WHEN b.vencedor_time = t1.numero_time THEN true 
                        ELSE false 
                    END AS isWinner
                FROM participantes_batalha p1
                JOIN times_batalha t1 ON p1.time_id = t1.id
                JOIN batalhas b ON t1.batalha_id = b.id
                JOIN personagens pers1 ON pers1.usuario_id = p1.usuario_id
                JOIN usuarios u1 ON u1.id = p1.usuario_id
                -- Seleciona o time oposto na mesma batalha
                JOIN times_batalha t2 ON t2.batalha_id = b.id AND t2.id <> t1.id
                JOIN participantes_batalha p2 ON p2.time_id = t2.id
                JOIN personagens pers2 ON pers2.usuario_id = p2.usuario_id
                JOIN usuarios u2 ON u2.id = p2.usuario_id
                WHERE p1.usuario_id = $1
                ORDER BY b.iniciada_em DESC
                LIMIT 20;
                `,
                [userId]
            );

            return result.rows;
        } catch (error) {
            console.error('Erro em getBattleHistory:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

export const arenaService = new ArenaService(); 