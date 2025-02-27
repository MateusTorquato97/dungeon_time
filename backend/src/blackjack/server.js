import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import router from './router.js';
import { blackjackService } from './services/blackjackService.js';

dotenv.config();

const app = express();
app.use(express.json());
const server = http.createServer(app);

const io = new Server(server, {
    path: '/socket.io/',  // Caminho padrão para o socket.io
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true,
    connectTimeout: 45000,  // Aumentar timeout da conexão
    pingTimeout: 30000,    // Aumentar ping timeout
    pingInterval: 25000    // Aumentar intervalo de ping
});

// Rota de saúde para healthcheck
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Log para indicar rotas
console.log('[Blackjack] Montando rotas API em /api/blackjack');

// Mount API routes
app.use('/api/blackjack', router);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


// Middleware de autenticação para Socket.IO com log
io.use((socket, next) => {
    console.log('[Blackjack] Tentativa de conexão socket: ', socket.id);
    const token = socket.handshake.auth.token;

    if (!token) {
        console.log('[Blackjack] Token não fornecido para socket:', socket.id);
        return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('[Blackjack] Erro na verificação do token:', err.message);
            return next(new Error('Authentication error'));
        }
        console.log('[Blackjack] Socket autenticado para usuário:', decoded.id);
        socket.user = decoded;
        next();
    });
});

// Armazena temporizadores para cada sala/rodada
const roomTimers = new Map();

// Armazena contadores de inatividade para cada jogador
const inactivityCounters = new Map();

// Handlers do Socket.IO
io.on('connection', (socket) => {
    console.log(`[Blackjack] Usuário conectado: ${socket.id}, User ID: ${socket.user?.id}`);

    // Store the current room joined by this socket
    let currentRoomId = null;
    let currentPosition = null;

    // Join a room
    socket.on('join room', async (roomId) => {
        try {
            const userId = socket.user.id;
            const result = await blackjackService.joinRoom(userId, roomId);

            // Join the socket.io room
            socket.join(`room_${roomId}`);
            currentRoomId = roomId;
            currentPosition = result.position;

            // Initialize inactivity counter for this player
            if (!inactivityCounters.has(userId)) {
                inactivityCounters.set(userId, 0);
            }

            // Notify the player they joined
            socket.emit('room joined', {
                roomId,
                position: result.position,
                userId: socket.user.id,
                nickname: socket.user.nickname
            });

            // Notify other players in the room
            io.to(`room_${roomId}`).emit('player joined', {
                userId,
                nickname: socket.user.nickname,
                position: result.position
            });

            // Get room details and send to the player
            const roomDetails = await blackjackService.getRoomDetails(roomId);
            socket.emit('room details', roomDetails);
        } catch (error) {
            console.error('[Blackjack] Erro ao entrar na sala:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // Leave a room
    socket.on('leave room', async () => {
        try {
            if (!currentRoomId) return;

            const userId = socket.user.id;
            await blackjackService.leaveRoom(userId, currentRoomId);

            // Leave the socket.io room
            socket.leave(`room_${currentRoomId}`);

            // Notify other players in the room
            io.to(`room_${currentRoomId}`).emit('player left', {
                userId,
                position: currentPosition
            });

            currentRoomId = null;
            currentPosition = null;
        } catch (error) {
            console.error('[Blackjack] Erro ao sair da sala:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // Create a new room
    socket.on('create room', async (data) => {
        try {
            const userId = socket.user.id;
            const { minBet, maxBet } = data;
            const room = await blackjackService.createRoom(userId, minBet, maxBet);

            // Join the socket.io room
            socket.join(`room_${room.id}`);
            currentRoomId = room.id;
            currentPosition = 1; // Creator is always in position 1

            // Initialize inactivity counter for this player
            if (!inactivityCounters.has(userId)) {
                inactivityCounters.set(userId, 0);
            }

            // Notify the player about the new room
            socket.emit('room created', room);
        } catch (error) {
            console.error('[Blackjack] Erro ao criar sala:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // Start a round
    socket.on('start round', async () => {
        try {
            if (!currentRoomId) {
                throw new Error('Você não está em uma sala');
            }

            const roomId = currentRoomId;
            const roomDetails = await blackjackService.getRoomDetails(roomId);

            // Check if player is in position 1 (dealer position)
            if (currentPosition !== 1) {
                throw new Error('Apenas o jogador na posição 1 pode iniciar a rodada');
            }

            // Check if there's already a round in progress
            if (roomDetails.currentRound &&
                ['apostas', 'jogadas', 'em_distribuicao'].includes(roomDetails.currentRound.status)) {
                throw new Error('Já existe uma rodada em andamento');
            }

            // Check if there are at least 1 player in the room
            if (roomDetails.players.length < 1) {
                throw new Error('Precisa de pelo menos 1 jogador para iniciar uma rodada');
            }

            const result = await blackjackService.startRound(roomId);

            // Notify all players in the room
            io.to(`room_${roomId}`).emit('round started', {
                roundId: result.roundId,
                message: 'Apostas abertas! Você tem 20 segundos para apostar.'
            });

            // Clear any existing timer for this room
            if (roomTimers.has(roomId)) {
                clearTimeout(roomTimers.get(roomId));
            }

            // Start a 20-second timer for bets
            const timer = setTimeout(async () => {
                try {
                    const currentRoundDetails = await blackjackService.getRoomDetails(roomId);

                    if (currentRoundDetails.currentRound &&
                        currentRoundDetails.currentRound.status === 'apostas') {

                        // Notify players that betting time is over
                        io.to(`room_${roomId}`).emit('betting ended', {
                            message: 'Tempo de apostas encerrado!'
                        });

                        // Deal initial cards
                        const dealResult = await blackjackService.dealInitialCards(result.roundId);
                        if (!dealResult.success) {
                            console.error('[Blackjack] Erro ao distribuir cartas:', dealResult.message);
                            // Emite evento "round canceled" para tratar o caso de nenhuma aposta
                            io.to(`room_${roomId}`).emit('round canceled', {
                                message: dealResult.message
                            });
                            return;
                        }

                        // Prepare data to send to clients
                        const playsWithCards = await blackjackService.getPlaysForRound(result.roundId);

                        // Find the first player who needs to act
                        const activePlayerIndex = playsWithCards.findIndex(p => p.status === 'hit');
                        const activePlayer = activePlayerIndex >= 0 ? playsWithCards[activePlayerIndex] : null;

                        // Notify all players about the dealer's up card and initial state
                        io.to(`room_${roomId}`).emit('cards dealt', {
                            dealerUpCard: dealResult.dealerHand[0],
                            plays: playsWithCards,
                            activePlayer: activePlayer ? {
                                userId: activePlayer.userId,
                                position: activePlayer.position
                            } : null
                        });

                        // If there's an active player, start their turn timer
                        if (activePlayer) {
                            startPlayerTurnTimer(roomId, result.roundId, activePlayer.userId);
                        } else {
                            // No active players, dealer plays
                            await blackjackService.dealerPlay(result.roundId);
                            finishRound(roomId, result.roundId);
                        }
                    }
                } catch (error) {
                    console.error('[Blackjack] Erro ao lidar cartas:', error);
                    io.to(`room_${roomId}`).emit('error', {
                        message: 'Erro ao distribuir as cartas. Tente iniciar uma nova rodada.'
                    });
                }
            }, 20000); // 20 seconds for bets

            roomTimers.set(roomId, timer);

        } catch (error) {
            console.error('[Blackjack] Erro ao iniciar rodada:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // Place a bet
    socket.on('place bet', async (data) => {
        try {
            if (!currentRoomId) {
                throw new Error('Você não está em uma sala');
            }

            const userId = socket.user.id;
            const { roundId, betAmount } = data;

            // Validate bet amount
            if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
                throw new Error('Valor de aposta inválido');
            }

            // Reset inactivity counter when player places a bet
            inactivityCounters.set(userId, 0);

            await blackjackService.placeBet(userId, roundId, betAmount);

            // Notify all players in the room
            io.to(`room_${currentRoomId}`).emit('bet placed', {
                userId,
                betAmount
            });

        } catch (error) {
            console.error('[Blackjack] Erro ao fazer aposta:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // Player action (hit, stand, double, surrender)
    socket.on('player action', async (data) => {
        try {
            if (!currentRoomId) {
                throw new Error('Você não está em uma sala');
            }

            const userId = socket.user.id;
            const { roundId, action } = data;

            // Validate action
            if (!['hit', 'stand', 'double', 'surrender'].includes(action)) {
                throw new Error('Ação inválida');
            }

            // Cancel the player's turn timer
            if (roomTimers.has(`turn_${roundId}_${userId}`)) {
                clearTimeout(roomTimers.get(`turn_${roundId}_${userId}`));
                roomTimers.delete(`turn_${roundId}_${userId}`);
            }

            // Reset inactivity counter when player acts
            inactivityCounters.set(userId, 0);

            const result = await blackjackService.playerAction(userId, roundId, action);

            // Notify all players in the room about the action
            io.to(`room_${currentRoomId}`).emit('player acted', {
                userId,
                action,
                cards: result.cards,
                points: result.points,
                status: result.status
            });

            // Get the next player or finish the round
            const playsWithCards = await blackjackService.getPlaysForRound(roundId);

            // Find the next player who needs to act
            const activePlayerIndex = playsWithCards.findIndex(p => p.status === 'hit');

            if (activePlayerIndex >= 0) {
                // There's another player who needs to act
                const nextPlayer = playsWithCards[activePlayerIndex];

                io.to(`room_${currentRoomId}`).emit('next player', {
                    userId: nextPlayer.userId,
                    position: nextPlayer.position
                });

                // Start turn timer for the next player
                startPlayerTurnTimer(currentRoomId, roundId, nextPlayer.userId);
            } else {
                // All players have acted, dealer plays
                const dealerResult = await blackjackService.dealerPlay(roundId);

                // Finish the round
                await finishRound(currentRoomId, roundId);
            }

        } catch (error) {
            console.error('[Blackjack] Erro ao executar ação:', error);
            socket.emit('error', { message: error.message });
        }
    });

    // Disconnect
    socket.on('disconnect', async () => {
        console.log(`[Blackjack] Usuário desconectado: ${socket.id}`);
        if (currentRoomId && socket.user) {
            try {
                await blackjackService.leaveRoom(socket.user.id, currentRoomId);

                // Notify other players in the room
                io.to(`room_${currentRoomId}`).emit('player left', {
                    userId: socket.user.id,
                    position: currentPosition
                });
            } catch (error) {
                console.error('[Blackjack] Erro ao sair da sala após desconexão:', error);
            }
        }
    });
});

// Função para iniciar o temporizador de turno de um jogador
function startPlayerTurnTimer(roomId, roundId, userId) {
    // Clear any existing timer for this player's turn
    const timerKey = `turn_${roundId}_${userId}`;
    if (roomTimers.has(timerKey)) {
        clearTimeout(roomTimers.get(timerKey));
    }

    // Start a 20-second timer for the player's turn
    const timer = setTimeout(async () => {
        try {
            // Player didn't act in time, automatically stand
            const result = await blackjackService.playerAction(userId, roundId, 'stand');

            // Increment inactivity counter for this player
            const currentCount = inactivityCounters.get(userId) || 0;
            inactivityCounters.set(userId, currentCount + 1);

            // Notify all players in the room
            io.to(`room_${roomId}`).emit('turn timeout', {
                userId,
                action: 'stand',
                cards: result.cards,
                points: result.points,
                status: result.status
            });

            // Get the next player or finish the round
            const playsWithCards = await blackjackService.getPlaysForRound(roundId);

            // Find the next player who needs to act
            const activePlayerIndex = playsWithCards.findIndex(p => p.status === 'hit');

            if (activePlayerIndex >= 0) {
                // There's another player who needs to act
                const nextPlayer = playsWithCards[activePlayerIndex];

                io.to(`room_${roomId}`).emit('next player', {
                    userId: nextPlayer.userId,
                    position: nextPlayer.position
                });

                // Start turn timer for the next player
                startPlayerTurnTimer(roomId, roundId, nextPlayer.userId);
            } else {
                // All players have acted, dealer plays
                const dealerResult = await blackjackService.dealerPlay(roundId);

                // Finish the round
                await finishRound(roomId, roundId);
            }
        } catch (error) {
            console.error('[Blackjack] Erro no timeout do jogador:', error);
        }
    }, 20000); // 20 seconds for player's turn

    roomTimers.set(timerKey, timer);
}

// Função para finalizar uma rodada e mostrar resultados
async function finishRound(roomId, roundId) {
    try {
        const roundDetails = await blackjackService.getRoundDetails(roundId);

        io.to(`room_${roomId}`).emit('round finished', {
            dealerHand: roundDetails.dealerHand,
            dealerPoints: roundDetails.dealerPoints,
            plays: roundDetails.plays
        });

        // Check for inactive players to remove
        const inactivePlayers = [];
        for (const [userId, count] of inactivityCounters.entries()) {
            if (count >= 3) { // Remove after 3 inactive rounds
                try {
                    await blackjackService.leaveRoom(userId, roomId);
                    inactivePlayers.push(userId);
                    inactivityCounters.delete(userId);
                } catch (error) {
                    console.error(`[Blackjack] Erro ao remover jogador inativo ${userId}:`, error);
                }
            }
        }

        // Notify about removed inactive players
        if (inactivePlayers.length > 0) {
            io.to(`room_${roomId}`).emit('players removed', {
                userIds: inactivePlayers,
                reason: 'inatividade'
            });
        }

        // Start a new round automatically after 10 seconds
        const timer = setTimeout(async () => {
            try {
                // Check if there are still players in the room
                const roomDetails = await blackjackService.getRoomDetails(roomId);

                if (roomDetails.players.length > 0) {
                    const result = await blackjackService.startRound(roomId);

                    io.to(`room_${roomId}`).emit('round started', {
                        roundId: result.roundId,
                        message: 'Nova rodada iniciada! Você tem 20 segundos para apostar.'
                    });

                    // Start the 20-second timer for bets
                    const betTimer = setTimeout(async () => {
                        try {
                            const currentRoundDetails = await blackjackService.getRoomDetails(roomId);

                            if (currentRoundDetails.currentRound &&
                                currentRoundDetails.currentRound.status === 'apostas') {

                                // Notify players that betting time is over
                                io.to(`room_${roomId}`).emit('betting ended', {
                                    message: 'Tempo de apostas encerrado!'
                                });

                                // Deal initial cards
                                const dealResult = await blackjackService.dealInitialCards(result.roundId);

                                if (!dealResult.success) {
                                    console.error('[Blackjack] Erro ao distribuir cartas:', dealResult.message);
                                    // Se nenhuma aposta foi feita, notifica os jogadores e finaliza a rodada
                                    io.to(`room_${roomId}`).emit('round canceled', {
                                        message: dealResult.message
                                    });
                                    return;
                                }

                                // Prepare data to send to clients
                                const playsWithCards = await blackjackService.getPlaysForRound(result.roundId);

                                // Find the first player who needs to act
                                const activePlayerIndex = playsWithCards.findIndex(p => p.status === 'hit');
                                const activePlayer = activePlayerIndex >= 0 ? playsWithCards[activePlayerIndex] : null;

                                // Notify all players about the dealer's up card and initial state
                                io.to(`room_${roomId}`).emit('cards dealt', {
                                    dealerUpCard: dealResult.dealerHand[0],
                                    plays: playsWithCards,
                                    activePlayer: activePlayer ? {
                                        userId: activePlayer.userId,
                                        position: activePlayer.position
                                    } : null
                                });

                                // If there's an active player, start their turn timer
                                if (activePlayer) {
                                    startPlayerTurnTimer(roomId, result.roundId, activePlayer.userId);
                                } else {
                                    // No active players, dealer plays
                                    await blackjackService.dealerPlay(result.roundId);
                                    finishRound(roomId, result.roundId);
                                }
                            }
                        } catch (error) {
                            console.error('[Blackjack] Erro ao lidar cartas na nova rodada:', error);
                        }
                    }, 20000); // 20 seconds for bets

                    roomTimers.set(roomId, betTimer);
                }
            } catch (error) {
                console.error('[Blackjack] Erro ao iniciar nova rodada:', error);
                io.to(`room_${roomId}`).emit('error', {
                    message: 'Erro ao distribuir as cartas. Tente iniciar uma nova rodada.'
                });
            }
        }, 10000); // 10 seconds until next round

        roomTimers.set(`next_${roomId}`, timer);
    } catch (error) {
        console.error('[Blackjack] Erro ao finalizar rodada:', error);
    }
}

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`[Blackjack] Servidor rodando na porta ${PORT}`);
});

export { io, pool };