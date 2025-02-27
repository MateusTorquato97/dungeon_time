import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { blackjackGameLogic } from '../gameLogic.js';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

class BlackjackService {
    async getAvailableRooms() {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    bs.id, 
                    bs.status, 
                    bs.min_aposta as "minBet", 
                    bs.max_aposta as "maxBet", 
                    bs.max_jogadores as "maxPlayers",
                    COUNT(bjs.usuario_id) as "playerCount"
                FROM blackjack_salas bs
                LEFT JOIN blackjack_jogadores_sala bjs ON bs.id = bjs.sala_id
                WHERE bs.status IN ('aguardando', 'em_andamento')
                GROUP BY bs.id
                ORDER BY bs.created_at DESC
            `);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async createRoom(creatorId, minBet = 100, maxBet = 1000) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verifica o saldo de moedas do usuário
            const userResult = await client.query(`
                SELECT coins FROM usuarios WHERE id = $1
            `, [creatorId]);

            if (userResult.rows.length === 0) {
                throw new Error('Usuário não encontrado');
            }

            const userCoins = userResult.rows[0].coins;

            // O jogador precisa ter pelo menos o valor máximo de aposta para criar uma sala
            if (userCoins < maxBet) {
                throw new Error('Você precisa ter pelo menos ' + maxBet + ' moedas para criar uma sala');
            }

            // Cria a sala
            const roomResult = await client.query(`
                INSERT INTO blackjack_salas (status, min_aposta, max_aposta)
                VALUES ('aguardando', $1, $2)
                RETURNING id, status, min_aposta, max_aposta, max_jogadores
            `, [minBet, maxBet]);

            const room = roomResult.rows[0];

            // Define o saldo inicial como 5x a aposta máxima ou o máximo de moedas do usuário
            const initialBalance = Math.min(maxBet * 5, userCoins);

            // Adiciona o criador como o primeiro jogador na posição 1
            await client.query(`
                INSERT INTO blackjack_jogadores_sala (sala_id, usuario_id, posicao_mesa, status, saldo_atual)
                VALUES ($1, $2, 1, 'aguardando', $3)
            `, [room.id, creatorId, initialBalance]);

            // Deduz o saldo inicial das moedas do usuário
            await client.query(`
                UPDATE usuarios SET coins = coins - $1 WHERE id = $2
            `, [maxBet, creatorId]);

            await client.query('COMMIT');
            return {
                id: room.id,
                status: room.status,
                minBet: room.min_aposta,
                maxBet: room.max_aposta,
                maxPlayers: room.max_jogadores,
                initialBalance
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getRoomDetails(roomId) {
        const client = await pool.connect();
        try {
            // Busca informações da sala
            const roomResult = await client.query(`
                SELECT 
                    bs.id, 
                    bs.status, 
                    bs.min_aposta as "minBet", 
                    bs.max_aposta as "maxBet", 
                    bs.max_jogadores as "maxPlayers",
                    bs.created_at as "createdAt"
                FROM blackjack_salas bs
                WHERE bs.id = $1
            `, [roomId]);

            if (roomResult.rows.length === 0) {
                throw new Error('Sala não encontrada');
            }

            const room = roomResult.rows[0];

            // Busca jogadores na sala
            const playersResult = await client.query(`
                SELECT 
                    bjs.usuario_id as "userId",
                    u.nickname,
                    bjs.posicao_mesa as "position",
                    bjs.saldo_atual as "balance",
                    bjs.status
                FROM blackjack_jogadores_sala bjs
                JOIN usuarios u ON bjs.usuario_id = u.id
                WHERE bjs.sala_id = $1
                ORDER BY bjs.posicao_mesa
            `, [roomId]);

            room.players = playersResult.rows;

            // Busca a rodada atual, se existir
            const roundResult = await client.query(`
                SELECT 
                    br.id,
                    br.status,
                    br.created_at as "createdAt",
                    br.finalizada_em as "finishedAt"
                FROM blackjack_rodadas br
                WHERE br.sala_id = $1
                ORDER BY br.created_at DESC
                LIMIT 1
            `, [roomId]);

            if (roundResult.rows.length > 0) {
                room.currentRound = roundResult.rows[0];

                // Busca jogadas da rodada atual
                const playsResult = await client.query(`
                    SELECT 
                        bj.id,
                        bj.usuario_id as "userId",
                        u.nickname,
                        bj.cartas as "cards",
                        bj.pontos as "points",
                        bj.aposta as "bet",
                        bj.status,
                        bj.resultado as "result",
                        bjs.posicao_mesa as "position"
                    FROM blackjack_jogadas bj
                    JOIN usuarios u ON bj.usuario_id = u.id
                    JOIN blackjack_jogadores_sala bjs ON bj.usuario_id = bjs.usuario_id AND bjs.sala_id = $1
                    WHERE bj.rodada_id = $2
                    ORDER BY bjs.posicao_mesa
                `, [roomId, room.currentRound.id]);

                room.currentRound.plays = playsResult.rows;

                // Adiciona as cartas do dealer, se a rodada estiver em andamento ou finalizada
                if (['jogadas', 'finalizada'].includes(room.currentRound.status)) {
                    const dealerResult = await client.query(`
                        SELECT 
                            dealer_cartas as "dealerCards",
                            dealer_pontos as "dealerPoints"
                        FROM blackjack_rodadas
                        WHERE id = $1
                    `, [room.currentRound.id]);

                    if (dealerResult.rows.length > 0) {
                        room.currentRound.dealerCards = dealerResult.rows[0].dealerCards;
                        room.currentRound.dealerPoints = dealerResult.rows[0].dealerPoints;
                    }
                }
            }

            return room;
        } finally {
            client.release();
        }
    }

    async joinRoom(userId, roomId, position = null) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verifica se a sala existe e tem espaço
            const roomResult = await client.query(`
                SELECT bs.*, COUNT(bjs.usuario_id) as player_count
                FROM blackjack_salas bs
                LEFT JOIN blackjack_jogadores_sala bjs ON bs.id = bjs.sala_id
                WHERE bs.id = $1
                GROUP BY bs.id
            `, [roomId]);

            if (roomResult.rows.length === 0) {
                throw new Error('Sala não encontrada');
            }

            const room = roomResult.rows[0];

            if (parseInt(room.player_count) >= room.max_jogadores) {
                throw new Error('Sala cheia');
            }

            // Verifica se o jogador já está na sala
            const playerCheck = await client.query(`
                SELECT * FROM blackjack_jogadores_sala
                WHERE sala_id = $1 AND usuario_id = $2
            `, [roomId, userId]);

            if (playerCheck.rows.length > 0) {
                await client.query('COMMIT');
                return {
                    roomId,
                    position: playerCheck.rows[0].posicao_mesa,
                    balance: playerCheck.rows[0].saldo_atual
                };
            }

            // Verifica o saldo de moedas do usuário
            const userResult = await client.query(`
                SELECT coins FROM usuarios WHERE id = $1
            `, [userId]);

            if (userResult.rows.length === 0) {
                throw new Error('Usuário não encontrado');
            }

            const userCoins = userResult.rows[0].coins;

            // O jogador precisa ter pelo menos o valor mínimo de aposta
            if (userCoins < room.min_aposta) {
                throw new Error('Saldo insuficiente para entrar nesta sala');
            }

            // Define o saldo inicial como 5x a aposta máxima ou o máximo de moedas do usuário
            const initialBalance = Math.min(room.max_aposta * 5, userCoins);

            // Encontra uma posição disponível se não for especificada
            let finalPosition = position;
            if (!finalPosition) {
                const takenPositions = await client.query(`
                    SELECT posicao_mesa FROM blackjack_jogadores_sala
                    WHERE sala_id = $1
                `, [roomId]);

                const positions = takenPositions.rows.map(p => p.posicao_mesa);
                for (let i = 1; i <= room.max_jogadores; i++) {
                    if (!positions.includes(i)) {
                        finalPosition = i;
                        break;
                    }
                }
            }

            if (!finalPosition) {
                throw new Error('Não há posições disponíveis');
            }

            // Adiciona o jogador à sala
            await client.query(`
                INSERT INTO blackjack_jogadores_sala (sala_id, usuario_id, posicao_mesa, status, saldo_atual)
                VALUES ($1, $2, $3, 'aguardando', $4)
            `, [roomId, userId, finalPosition, initialBalance]);

            // Deduz o saldo inicial das moedas do usuário
            await client.query(`
                UPDATE usuarios SET coins = coins - $1 WHERE id = $2
            `, [initialBalance, userId]);

            await client.query('COMMIT');

            return {
                roomId,
                position: finalPosition,
                balance: initialBalance
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async leaveRoom(userId, roomId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verifica se o jogador está na sala
            const playerCheck = await client.query(`
                SELECT * FROM blackjack_jogadores_sala
                WHERE sala_id = $1 AND usuario_id = $2
            `, [roomId, userId]);

            if (playerCheck.rows.length === 0) {
                throw new Error('Jogador não está na sala');
            }

            const player = playerCheck.rows[0];

            // Devolve o saldo restante para as moedas do usuário
            await client.query(`
                UPDATE usuarios SET coins = coins + $1 WHERE id = $2
            `, [player.saldo_atual, userId]);

            // Remove o jogador da sala
            await client.query(`
                DELETE FROM blackjack_jogadores_sala
                WHERE sala_id = $1 AND usuario_id = $2
            `, [roomId, userId]);

            // Verifica se a sala fica vazia após a saída do jogador
            const roomCheck = await client.query(`
                SELECT COUNT(*) as player_count
                FROM blackjack_jogadores_sala
                WHERE sala_id = $1
            `, [roomId]);

            if (parseInt(roomCheck.rows[0].player_count) === 0) {
                // Sala vazia, marca como finalizada
                await client.query(`
                    UPDATE blackjack_salas
                    SET status = 'finalizada'
                    WHERE id = $1
                `, [roomId]);
            }

            await client.query('COMMIT');

            return { success: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async startRound(roomId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verifica se a sala existe e está em status de espera
            const roomResult = await client.query(`
                SELECT * FROM blackjack_salas
                WHERE id = $1 AND status = 'aguardando'
            `, [roomId]);

            if (roomResult.rows.length === 0) {
                throw new Error('Sala não encontrada ou não está em status de espera');
            }

            // Busca jogadores na sala
            const playersResult = await client.query(`
                SELECT usuario_id
                FROM blackjack_jogadores_sala
                WHERE sala_id = $1 AND status = 'aguardando'
            `, [roomId]);

            if (playersResult.rows.length === 0) {
                throw new Error('Não há jogadores na sala');
            }

            // Cria uma nova rodada
            const roundResult = await client.query(`
                INSERT INTO blackjack_rodadas (sala_id, status, dealer_cartas)
                VALUES ($1, 'apostas', '[]')
                RETURNING id
            `, [roomId]);

            const roundId = roundResult.rows[0].id;

            // Atualiza o status da sala
            await client.query(`
                UPDATE blackjack_salas
                SET status = 'em_andamento'
                WHERE id = $1
            `, [roomId]);

            // Cria jogadas iniciais para cada jogador
            for (const player of playersResult.rows) {
                await client.query(`
                    INSERT INTO blackjack_jogadas (rodada_id, usuario_id, status, cartas)
                    VALUES ($1, $2, 'aguardando', '[]')
                `, [roundId, player.usuario_id]);
            }

            await client.query('COMMIT');

            return { roundId };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async placeBet(userId, roundId, betAmount) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verifica se a jogada existe e está em status de espera
            const playResult = await client.query(`
                SELECT bj.*, br.sala_id
                FROM blackjack_jogadas bj
                JOIN blackjack_rodadas br ON bj.rodada_id = br.id
                WHERE bj.rodada_id = $1 AND bj.usuario_id = $2 AND bj.status = 'aguardando'
            `, [roundId, userId]);

            if (playResult.rows.length === 0) {
                throw new Error('Jogada não encontrada ou não está em status de espera');
            }

            const play = playResult.rows[0];

            // Verifica limites de aposta da sala
            const roomResult = await client.query(`
                SELECT min_aposta, max_aposta
                FROM blackjack_salas
                WHERE id = $1
            `, [play.sala_id]);

            const room = roomResult.rows[0];

            if (betAmount < room.min_aposta || betAmount > room.max_aposta) {
                throw new Error(`A aposta deve estar entre ${room.min_aposta} e ${room.max_aposta}`);
            }

            // Verifica se o jogador tem saldo suficiente
            const playerResult = await client.query(`
                SELECT saldo_atual
                FROM blackjack_jogadores_sala
                WHERE sala_id = $1 AND usuario_id = $2
            `, [play.sala_id, userId]);

            const player = playerResult.rows[0];

            if (betAmount > player.saldo_atual) {
                throw new Error('Saldo insuficiente');
            }

            // Atualiza a jogada com a aposta
            await client.query(`
                UPDATE blackjack_jogadas
                SET aposta = $1, status = 'apostou'
                WHERE rodada_id = $2 AND usuario_id = $3
            `, [betAmount, roundId, userId]);

            // Não deduz o valor da aposta do saldo do jogador agora,
            // isso será feito apenas ao final da rodada

            await client.query('COMMIT');

            return { success: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async dealInitialCards(roundId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Verifica se a rodada existe e está em status de apostas
            const roundResult = await client.query(`
                SELECT *
                FROM blackjack_rodadas
                WHERE id = $1 AND status = 'apostas'
            `, [roundId]);

            if (roundResult.rows.length === 0) {
                throw new Error('Rodada não encontrada ou não está em status de apostas');
            }

            // Busca jogadores que fizeram apostas
            const playsResult = await client.query(`
                SELECT *
                FROM blackjack_jogadas
                WHERE rodada_id = $1 AND status = 'apostou'
                ORDER BY id
            `, [roundId]);

            if (playsResult.rows.length === 0) {
                // Se ninguém apostou, finaliza a rodada sem distribuir cartas
                await client.query(`
                    UPDATE blackjack_rodadas
                    SET status = 'finalizada', finalizada_em = CURRENT_TIMESTAMP
                    WHERE id = $1
                `, [roundId]);
                await client.query('COMMIT');
                return { success: false, message: 'Nenhuma aposta feita' };
            }

            // Cria e embaralha o baralho
            const deck = blackjackGameLogic.createDeck();

            // Distribui as cartas iniciais
            const initialDeal = blackjackGameLogic.dealInitialCards(
                deck,
                playsResult.rows.length
            );

            // Atualiza as cartas do dealer
            await client.query(`
                UPDATE blackjack_rodadas
                SET dealer_cartas = $1, dealer_pontos = $2, status = 'jogadas'
                WHERE id = $3
            `, [
                JSON.stringify(initialDeal.dealerHand),
                blackjackGameLogic.calculateHandValue(initialDeal.dealerHand),
                roundId
            ]);

            // Atualiza as cartas dos jogadores
            for (let i = 0; i < playsResult.rows.length; i++) {
                const play = playsResult.rows[i];
                const hand = initialDeal.playerHands[i];
                const points = blackjackGameLogic.calculateHandValue(hand);
                const isBlackjack = blackjackGameLogic.isBlackjack(hand);

                // Se o jogador tiver blackjack, já define o status como 'stand'
                const newStatus = isBlackjack ? 'stand' : 'hit';

                await client.query(`
                    UPDATE blackjack_jogadas
                    SET cartas = $1, pontos = $2, status = $3
                    WHERE rodada_id = $4 AND usuario_id = $5
                `, [
                    JSON.stringify(hand),
                    points,
                    newStatus,
                    roundId,
                    play.usuario_id
                ]);

                // Se for blackjack, já define o resultado
                if (isBlackjack) {
                    await client.query(`
                        UPDATE blackjack_jogadas
                        SET resultado = 'blackjack'
                        WHERE rodada_id = $1 AND usuario_id = $2
                    `, [roundId, play.usuario_id]);
                }
            }

            await client.query('COMMIT');

            return {
                success: true,
                dealerHand: [initialDeal.dealerHand[0]], // Apenas mostra a primeira carta do dealer
                playerHands: initialDeal.playerHands
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async playerAction(userId, roundId, action) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Busca a jogada atual
            const playResult = await client.query(`
                SELECT bj.*, br.dealer_cartas, br.status as round_status, bs.id as sala_id
                FROM blackjack_jogadas bj
                JOIN blackjack_rodadas br ON bj.rodada_id = br.id
                JOIN blackjack_salas bs ON br.sala_id = bs.id
                WHERE bj.rodada_id = $1 AND bj.usuario_id = $2
            `, [roundId, userId]);

            if (playResult.rows.length === 0) {
                throw new Error('Jogada não encontrada');
            }

            const play = playResult.rows[0];

            if (play.round_status !== 'jogadas') {
                throw new Error('Rodada não está em status de jogadas');
            }

            if (play.status !== 'hit') {
                throw new Error('Não é possível realizar ação no status atual');
            }

            // Busca a sala para verificar apostas
            const roomResult = await client.query(`
                SELECT min_aposta, max_aposta
                FROM blackjack_salas
                WHERE id = $1
            `, [play.sala_id]);

            const room = roomResult.rows[0];

            // Processa baseado na ação
            const cards = typeof play.cartas === 'string' ? JSON.parse(play.cartas) : play.cartas;
            let newStatus = play.status;
            let newCards = [...cards];
            let newPoints = play.pontos;
            let additionalBet = 0;

            switch (action) {
                case 'hit':
                    // Adiciona uma carta
                    const deck = blackjackGameLogic.createDeck();
                    newCards.push(deck[0]); // Pega apenas a primeira carta (simulando um saque)
                    newPoints = blackjackGameLogic.calculateHandValue(newCards);

                    // Verifica se estourou
                    if (blackjackGameLogic.isBusted(newCards)) {
                        newStatus = 'stand';
                    }
                    break;

                case 'stand':
                    // Jogador para
                    newStatus = 'stand';
                    break;

                case 'double':
                    // Dobra a aposta e pega mais uma carta
                    additionalBet = play.aposta;

                    // Verifica se o jogador tem saldo suficiente
                    const playerResult = await client.query(`
                        SELECT saldo_atual
                        FROM blackjack_jogadores_sala
                        WHERE sala_id = $1 AND usuario_id = $2
                    `, [play.sala_id, userId]);

                    if (playerResult.rows[0].saldo_atual < additionalBet) {
                        throw new Error('Saldo insuficiente para dobrar');
                    }

                    // Adiciona uma carta
                    const doubleDeck = blackjackGameLogic.createDeck();
                    newCards.push(doubleDeck[0]);
                    newPoints = blackjackGameLogic.calculateHandValue(newCards);
                    newStatus = 'stand';
                    break;

                case 'surrender':
                    // Surrender e recebe metade da aposta de volta
                    newStatus = 'stand';
                    await client.query(`
                        UPDATE blackjack_jogadas
                        SET resultado = 'surrender'
                        WHERE rodada_id = $1 AND usuario_id = $2
                    `, [roundId, userId]);
                    break;

                default:
                    throw new Error('Ação inválida');
            }

            // Atualiza a jogada
            await client.query(`
                UPDATE blackjack_jogadas
                SET cartas = $1, pontos = $2, status = $3, aposta = aposta + $4
                WHERE rodada_id = $5 AND usuario_id = $6
            `, [
                JSON.stringify(newCards),
                newPoints,
                newStatus,
                additionalBet,
                roundId,
                userId
            ]);

            await client.query('COMMIT');

            return {
                cards: newCards,
                points: newPoints,
                status: newStatus,
                action
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async dealerPlay(roundId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Busca a rodada atual
            const roundResult = await client.query(`
                SELECT *
                FROM blackjack_rodadas
                WHERE id = $1 AND status = 'jogadas'
            `, [roundId]);

            if (roundResult.rows.length === 0) {
                throw new Error('Rodada não encontrada ou não está em status de jogadas');
            }

            const round = roundResult.rows[0];
            let dealerHand;
            if (!round.dealer_cartas) {
                dealerHand = [];
            } else if (typeof round.dealer_cartas === 'string') {
                try {
                    dealerHand = JSON.parse(round.dealer_cartas);
                } catch (e) {
                    // Se o parse falhar, use o valor original
                    dealerHand = round.dealer_cartas;
                }
            } else {
                dealerHand = round.dealer_cartas;
            }

            // Dealer joga de acordo com as regras
            const { dealerHand: newDealerHand } = blackjackGameLogic.playDealer(
                blackjackGameLogic.createDeck(),
                dealerHand
            );

            const dealerPoints = blackjackGameLogic.calculateHandValue(newDealerHand);

            // Atualiza as cartas do dealer
            await client.query(`
                UPDATE blackjack_rodadas
                SET dealer_cartas = $1, dealer_pontos = $2, status = 'finalizada', finalizada_em = CURRENT_TIMESTAMP
                WHERE id = $3
            `, [
                JSON.stringify(newDealerHand),
                dealerPoints,
                roundId
            ]);

            // Processa os resultados para todos os jogadores
            const playsResult = await client.query(`
                SELECT bj.*, bjs.saldo_atual
                FROM blackjack_jogadas bj
                JOIN blackjack_rodadas br ON bj.rodada_id = br.id
                JOIN blackjack_jogadores_sala bjs ON bj.usuario_id = bjs.usuario_id AND bjs.sala_id = br.sala_id
                WHERE bj.rodada_id = $1 AND bj.resultado IS NULL
            `, [roundId]);

            for (const play of playsResult.rows) {
                // Só processa se o jogador apostou
                if (play.aposta > 0) {
                    const playerHand = typeof play.cartas === 'string' ? JSON.parse(play.cartas) : play.cartas;

                    // Se já tem blackjack, mantém o resultado
                    if (play.resultado !== 'blackjack' && play.resultado !== 'surrender') {
                        const result = blackjackGameLogic.determineResult(playerHand, newDealerHand);

                        // Atualiza o resultado da jogada
                        await client.query(`
                            UPDATE blackjack_jogadas
                            SET resultado = $1
                            WHERE rodada_id = $2 AND usuario_id = $3
                        `, [result, roundId, play.usuario_id]);

                        // Atualiza o saldo do jogador com base no resultado
                        const payout = blackjackGameLogic.calculatePayout(play.aposta, result);

                        if (payout > 0) {
                            await client.query(`
                                UPDATE blackjack_jogadores_sala
                                SET saldo_atual = saldo_atual + $1
                                WHERE sala_id = $2 AND usuario_id = $3
                            `, [payout, round.sala_id, play.usuario_id]);
                        }
                    } else if (play.resultado === 'blackjack') {
                        // Paga o blackjack
                        const payout = blackjackGameLogic.calculatePayout(play.aposta, 'blackjack');

                        await client.query(`
                            UPDATE blackjack_jogadores_sala
                            SET saldo_atual = saldo_atual + $1
                            WHERE sala_id = $2 AND usuario_id = $3
                        `, [payout, round.sala_id, play.usuario_id]);
                    } else if (play.resultado === 'surrender') {
                        // Devolve metade da aposta no surrender
                        const refund = Math.floor(play.aposta / 2);

                        await client.query(`
                            UPDATE blackjack_jogadores_sala
                            SET saldo_atual = saldo_atual + $1
                            WHERE sala_id = $2 AND usuario_id = $3
                        `, [refund, round.sala_id, play.usuario_id]);
                    }
                }
            }

            // Atualiza o status da sala de volta para aguardando
            await client.query(`
                UPDATE blackjack_salas
                SET status = 'aguardando'
                WHERE id = $1
            `, [round.sala_id]);

            await client.query('COMMIT');

            return {
                dealerHand: newDealerHand,
                dealerPoints
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getPlaysForRound(roundId) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    bj.usuario_id as "userId",
                    u.nickname,
                    bj.cartas as "cards",
                    bj.pontos as "points",
                    bj.aposta as "bet",
                    bj.status,
                    bj.resultado as "result",
                    bjs.posicao_mesa as "position"
                FROM blackjack_jogadas bj
                JOIN usuarios u ON bj.usuario_id = u.id
                JOIN blackjack_rodadas br ON bj.rodada_id = br.id
                JOIN blackjack_jogadores_sala bjs ON bj.usuario_id = bjs.usuario_id AND bjs.sala_id = br.sala_id
                WHERE bj.rodada_id = $1
                ORDER BY bjs.posicao_mesa
            `, [roundId]);

            return result.rows.map(row => ({
                ...row,
                cards: typeof row.cards === 'string' ? JSON.parse(row.cards) : row.cards
            }));
        } finally {
            client.release();
        }
    }

    async getRoundDetails(roundId) {
        const client = await pool.connect();
        try {
            // Busca informações da rodada
            const roundResult = await client.query(`
                SELECT 
                    br.id,
                    br.status,
                    br.dealer_cartas as "dealerCards",
                    br.dealer_pontos as "dealerPoints",
                    br.created_at as "createdAt",
                    br.finalizada_em as "finishedAt",
                    br.sala_id as "roomId"
                FROM blackjack_rodadas br
                WHERE br.id = $1
            `, [roundId]);

            if (roundResult.rows.length === 0) {
                throw new Error('Rodada não encontrada');
            }

            const round = roundResult.rows[0];

            // Converte as cartas do dealer de string JSON para objeto
            round.dealerHand = typeof round.dealerCards === 'string'
                ? JSON.parse(round.dealerCards)
                : round.dealerCards;

            // Busca as jogadas da rodada
            const playsResult = await client.query(`
                SELECT 
                    bj.usuario_id as "userId",
                    u.nickname,
                    bj.cartas as "cards",
                    bj.pontos as "points",
                    bj.aposta as "bet",
                    bj.status,
                    bj.resultado as "result",
                    bjs.posicao_mesa as "position"
                FROM blackjack_jogadas bj
                JOIN usuarios u ON bj.usuario_id = u.id
                JOIN blackjack_jogadores_sala bjs ON bj.usuario_id = bjs.usuario_id AND bjs.sala_id = $1
                WHERE bj.rodada_id = $2
                ORDER BY bjs.posicao_mesa
            `, [round.roomId, roundId]);

            // Converte as cartas de string JSON para objeto
            round.plays = playsResult.rows.map(play => ({
                ...play,
                cards: typeof play.cards === 'string' ? JSON.parse(play.cards) : play.cards
            }));

            return round;
        } finally {
            client.release();
        }
    }

    async getUserHistory(userId) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    bj.rodada_id as "roundId",
                    br.created_at as "playedAt",
                    bj.aposta as "bet",
                    bj.resultado as "result",
                    CASE 
                        WHEN bj.resultado = 'blackjack' THEN FLOOR(bj.aposta * 2.5)
                        WHEN bj.resultado = 'ganhou' THEN bj.aposta * 2
                        WHEN bj.resultado = 'empatou' THEN bj.aposta
                        WHEN bj.resultado = 'surrender' THEN FLOOR(bj.aposta / 2)
                        ELSE 0
                    END as "payout",
                    bj.pontos as "points",
                    br.dealer_pontos as "dealerPoints"
                FROM blackjack_jogadas bj
                JOIN blackjack_rodadas br ON bj.rodada_id = br.id
                WHERE bj.usuario_id = $1 AND bj.resultado IS NOT NULL
                ORDER BY br.created_at DESC
                LIMIT 50
            `, [userId]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    async getPlayerBalance(userId, roomId) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT saldo_atual as balance
                FROM blackjack_jogadores_sala
                WHERE sala_id = $1 AND usuario_id = $2
            `, [roomId, userId]);

            if (result.rows.length === 0) {
                throw new Error('Jogador não está na sala');
            }

            return result.rows[0].balance;
        } finally {
            client.release();
        }
    }

    async removeInactivePlayers(roomId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Busca jogadores com pelo menos 3 rodadas sem jogar
            const inactivePlayers = await client.query(`
                WITH recent_rounds AS (
                    SELECT id 
                    FROM blackjack_rodadas 
                    WHERE sala_id = $1 
                    ORDER BY created_at DESC 
                    LIMIT 3
                ),
                player_bets AS (
                    SELECT 
                        bjs.usuario_id,
                        COUNT(DISTINCT CASE WHEN bj.aposta > 0 THEN bj.rodada_id END) as rounds_played
                    FROM blackjack_jogadores_sala bjs
                    LEFT JOIN blackjack_jogadas bj ON bjs.usuario_id = bj.usuario_id
                    WHERE bjs.sala_id = $1
                    AND bj.rodada_id IN (SELECT id FROM recent_rounds)
                    GROUP BY bjs.usuario_id
                )
                SELECT 
                    pb.usuario_id,
                    bjs.saldo_atual
                FROM player_bets pb
                JOIN blackjack_jogadores_sala bjs ON pb.usuario_id = bjs.usuario_id AND bjs.sala_id = $1
                WHERE pb.rounds_played = 0
            `, [roomId]);

            const removedPlayers = [];

            // Remove os jogadores inativos e devolve o saldo
            for (const player of inactivePlayers.rows) {
                // Devolve o saldo restante para as moedas do usuário
                await client.query(`
                    UPDATE usuarios SET coins = coins + $1 WHERE id = $2
                `, [player.saldo_atual, player.usuario_id]);

                // Remove o jogador da sala
                await client.query(`
                    DELETE FROM blackjack_jogadores_sala
                    WHERE sala_id = $1 AND usuario_id = $2
                `, [roomId, player.usuario_id]);

                removedPlayers.push(player.usuario_id);
            }

            await client.query('COMMIT');

            return removedPlayers;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export const blackjackService = new BlackjackService();