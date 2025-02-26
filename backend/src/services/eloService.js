import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

class EloService {
    async calcularPontos(eloVencedor, eloPerdedor) {
        const PONTOS_BASE = 30
        const diferenca = Math.abs(eloVencedor - eloPerdedor)
        const fatorDiferenca = 1 - (diferenca / 1000)
        return Math.round(PONTOS_BASE * Math.max(0.1, fatorDiferenca))
    }

    async getDivisao(pontos) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT nome 
                 FROM elos 
                 WHERE pontos_minimos <= $1 
                 ORDER BY pontos_minimos DESC 
                 LIMIT 1`,
                [pontos]
            );
            return result.rows[0]?.nome || 'RECRUTA';
        } finally {
            client.release();
        }
    }

    async atualizarElo(usuarioId, pontosGanhos) {
        const client = await pool.connect();
        try {
            // Busca pontos atuais
            const result = await client.query(
                'SELECT pontos_arena FROM personagens WHERE usuario_id = $1',
                [usuarioId]
            );

            const pontosAtuais = result.rows[0].pontos_arena;
            const novosPontos = Math.max(0, pontosAtuais + pontosGanhos);

            // Busca novo elo baseado nos pontos
            const novoEloResult = await client.query(
                `SELECT nome 
                 FROM elos 
                 WHERE pontos_minimos <= $1 
                 ORDER BY pontos_minimos DESC 
                 LIMIT 1`,
                [novosPontos]
            );

            const novoElo = novoEloResult.rows[0]?.nome || 'RECRUTA';

            // Atualiza pontos e elo do jogador
            await client.query(
                `UPDATE personagens 
                 SET pontos_arena = $1, 
                     elo = $2 
                 WHERE usuario_id = $3`,
                [novosPontos, novoElo, usuarioId]
            );

            return { pontos: novosPontos, elo: novoElo };
        } finally {
            client.release();
        }
    }

    async getRanking(limite = 100) {
        const client = await pool.connect()
        try {
            const result = await client.query(
                `SELECT 
                    u.nickname,
                    p.pontos_arena,
                    p.elo,
                    p.nivel,
                    p.classe
                 FROM personagens p
                 JOIN usuarios u ON u.id = p.usuario_id
                 ORDER BY p.pontos_arena DESC
                 LIMIT $1`,
                [limite]
            )

            return result.rows.map(user => ({
                nickname: user.nickname,
                pontos: user.pontos_arena,
                elo: user.elo,
                nivel: user.nivel,
                classe: user.classe
            }))
        } finally {
            client.release()
        }
    }

    async getRankingByElo(elo, limite = 100) {
        const client = await pool.connect();
        try {
            let query = `
                SELECT 
                    u.nickname,
                    p.pontos_arena,
                    e.nome as elo,
                    p.nivel,
                    p.classe
                FROM personagens p
                JOIN usuarios u ON u.id = p.usuario_id
                JOIN elos e ON e.pontos_minimos <= p.pontos_arena`;

            const params = [];

            if (elo && elo !== 'Todos') {
                query += ` WHERE LOWER(e.nome) = LOWER($1)`;
                params.push(elo);
            }

            query += ` ORDER BY p.pontos_arena DESC LIMIT $${params.length + 1}`;
            params.push(limite);

            const result = await client.query(query, params);
            return result.rows.map(user => ({
                nickname: user.nickname,
                pontos: user.pontos_arena,
                elo: user.elo,
                nivel: user.nivel,
                classe: user.classe
            }))
        } finally {
            client.release();
        }
    }
}

export const eloService = new EloService();