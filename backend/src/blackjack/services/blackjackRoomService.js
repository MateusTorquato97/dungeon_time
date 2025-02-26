import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export class BlackjackRoomService {
    /**
     * Obter todas as salas de Blackjack disponíveis
     */
    async getAvailableRooms() {
        const client = await pool.connect();
        try {
            const roomsQuery = `
                SELECT 
                    bs.id, 
                    bs.status, 
                    bs.min_aposta, 
                    bs.max_aposta, 
                    bs.created_at,
                    (SELECT COUNT(*) FROM blackjack_jogadores_sala bjs WHERE bjs.sala_id = bs.id) as jogadores_atuais,
                    bs.max_jogadores
                FROM blackjack_salas bs
                WHERE bs.status != 'finalizada'
                ORDER BY bs.created_at DESC
            `;

            const result = await client.query(roomsQuery);
            return result.rows.map(room => ({
                id: room.id,
                status: room.status,
                minBet: room.min_aposta,
                maxBet: room.max_aposta,
                createdAt: room.created_at,
                players: parseInt(room.jogadores_atuais),
                maxPlayers: room.max_jogadores
            }));
        } catch (error) {
            console.error('Erro ao buscar salas disponíveis:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Obter detalhes de uma sala específica
     */
    async getRoomDetails(roomId) {
        const client = await pool.connect();
        try {
            // Buscar detalhes da sala
            const roomQuery = `
                SELECT 
                    bs.id, 
                    bs.status, 
                    bs.min_aposta, 
                    bs.max_aposta, 
                    bs.created_at, 
                    bs.max_jogadores
                FROM blackjack_salas bs
                WHERE bs.id = $1
            `;

            const roomResult = await client.query(roomQuery, [roomId]);

            if (roomResult.rows.length === 0) {
                return null;
            }

            const room = roomResult.rows[0];

            // Buscar jogadores na sala
            const playersQuery = `
                SELECT 
                    bjs.id, 
                    bjs.usuario_id, 
                    bjs.posicao_mesa, 
                    bjs.saldo_atual, 
                    bjs.status,
                    u.nickname
                FROM blackjack_jogadores_sala bjs
                JOIN usuarios u ON bjs.usuario_id = u.id
                WHERE bjs.sala_id = $1
                ORDER BY bjs.posicao_mesa ASC
            `;

            const playersResult = await client.query(playersQuery, [roomId]);

            // Buscar rodada atual
            const currentRoundQuery = `
                SELECT 
                    br.id, 
                    br.status, 
                    br.dealer_cartas, 
                    br.dealer_pontos, 
                    br.created_at
                FROM blackjack_rodadas br
                WHERE br.sala_id = $1 AND br.status != 'finalizada'
                ORDER BY br.created_at DESC
                LIMIT 1
            `;

            const currentRoundResult = await client.query(currentRoundQuery, [roomId]);

            const players = playersResult.rows.map(player => ({
                id: player.id,
                userId: player.usuario_id,
                nickname: player.nickname,
                position: player.posicao_mesa,
                balance: player.saldo_atual,
                status: player.status
            }));

            const currentRound = currentRoundResult.rows.length > 0 ? {
                id: currentRoundResult.rows[0].id,
                status: currentRoundResult.rows[0].status,
                dealerCards: currentRoundResult.rows[0].dealer_cartas,
                dealerPoints: currentRoundResult.rows[0].dealer_pontos,
                createdAt: currentRoundResult.rows[0].created_at
            } : null;

            return {
                id: room.id,
                status: room.status,
                minBet: room.min_aposta,
                maxBet: room.max_aposta,
                createdAt: room.created_at,
                maxPlayers: room.max_jogadores,
                players,
                currentRound
            };
        } catch (error) {
            console.error(`Erro ao buscar detalhes da sala ${roomId}:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Criar uma nova sala de Blackjack
     */
    async createRoom(minBet, maxBet) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const createRoomQuery = `
                INSERT INTO blackjack_salas (status, min_aposta, max_aposta)
                VALUES ('aguardando', $1, $2)
                RETURNING id, status, min_aposta, max_aposta, created_at, max_jogadores
            `;

            const result = await client.query(createRoomQuery, [minBet, maxBet]);

            await client.query('COMMIT');

            const newRoom = result.rows[0];
            return {
                id: newRoom.id,
                status: newRoom.status,
                minBet: newRoom.min_aposta,
                maxBet: newRoom.max_aposta,
                createdAt: newRoom.created_at,
                maxPlayers: newRoom.max_jogadores,
                players: 0
            };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao criar sala:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Obter histórico de jogadas do usuário
     */
    async getUserHistory(userId) {
        const client = await pool.connect();
        try {
            const historyQuery = `
                SELECT 
                    bj.id,
                    bj.rodada_id,
                    bj.cartas,
                    bj.pontos,
                    bj.aposta,
                    bj.status,
                    bj.resultado,
                    bj.created_at,
                    br.dealer_cartas,
                    br.dealer_pontos,
                    bs.id as sala_id
                FROM blackjack_jogadas bj
                JOIN blackjack_rodadas br ON bj.rodada_id = br.id
                JOIN blackjack_salas bs ON br.sala_id = bs.id
                WHERE bj.usuario_id = $1
                ORDER BY bj.created_at DESC
                LIMIT 50
            `;

            const result = await client.query(historyQuery, [userId]);

            return result.rows.map(row => ({
                id: row.id,
                roundId: row.rodada_id,
                roomId: row.sala_id,
                cards: row.cartas,
                points: row.pontos,
                bet: row.aposta,
                status: row.status,
                result: row.resultado,
                dealerCards: row.dealer_cartas,
                dealerPoints: row.dealer_pontos,
                createdAt: row.created_at
            }));
        } catch (error) {
            console.error(`Erro ao buscar histórico do usuário ${userId}:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Obter saldo de coins do usuário
     */
    async getUserBalance(userId) {
        const client = await pool.connect();
        try {
            const balanceQuery = `
                SELECT coins FROM usuarios WHERE id = $1
            `;

            const result = await client.query(balanceQuery, [userId]);

            if (result.rows.length === 0) {
                throw new Error('Usuário não encontrado');
            }

            return result.rows[0].coins;
        } catch (error) {
            console.error(`Erro ao buscar saldo do usuário ${userId}:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Verificar se o usuário possui coins suficientes
     */
    async checkUserBalance(userId, amount) {
        const balance = await this.getUserBalance(userId);
        return balance >= amount;
    }

    /**
     * Atualizar saldo de coins do usuário
     */
    async updateUserBalance(userId, amount) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const updateQuery = `
                UPDATE usuarios 
                SET coins = coins + $1, updated_at = NOW()
                WHERE id = $2
                RETURNING coins
            `;

            const result = await client.query(updateQuery, [amount, userId]);

            await client.query('COMMIT');

            return result.rows[0].coins;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`Erro ao atualizar saldo do usuário ${userId}:`, error);
            throw error;
        } finally {
            client.release();
        }
    }
}