import { BlackjackGame } from './blackjackGame.js';

export class BlackjackManager {
    constructor(io, pool) {
        this.io = io;
        this.pool = pool;
        this.games = new Map(); // Map de roomId -> BlackjackGame
        this.userSockets = new Map(); // Map de userId -> socket
        this.userRooms = new Map(); // Map de userId -> roomId
        this.userLastActivity = new Map(); // Map de userId -> timestamp da última atividade
        this.inactivityTimeout = 3 * 60 * 1000; // 3 minutos de inatividade
    }

    /**
     * Registra um usuário conectado ao sistema
     */
    registerUser(socket) {
        const userId = socket.user.id;
        this.userSockets.set(userId, socket);
        this.updateUserActivity(userId);
    }

    /**
     * Atualiza o timestamp da última atividade do usuário
     */
    updateUserActivity(userId) {
        this.userLastActivity.set(userId, Date.now());
    }

    /**
     * Verifica usuários inativos e os remove das salas
     */
    async checkInactivity() {
        const now = Date.now();

        for (const [userId, lastActivity] of this.userLastActivity.entries()) {
            if (now - lastActivity > this.inactivityTimeout) {
                const roomId = this.userRooms.get(userId);

                if (roomId) {
                    const socket = this.userSockets.get(userId);
                    if (socket) {
                        console.log(`[Blackjack] Removendo usuário ${userId} da sala ${roomId} por inatividade`);
                        await this.leaveRoom(socket, roomId, true);

                        // Notificar o usuário
                        socket.emit('inactivity-kick', {
                            message: 'Você foi removido da sala por inatividade'
                        });
                    }
                }
            }
        }
    }

    /**
     * Trata a desconexão de um usuário
     */
    async handleDisconnect(socket) {
        const userId = socket.user?.id;
        if (!userId) return;

        const roomId = this.userRooms.get(userId);
        if (roomId) {
            await this.leaveRoom(socket, roomId, true);
        }

        this.userSockets.delete(userId);
        this.userLastActivity.delete(userId);
    }

    /**
     * Usuário entra em uma sala
     */
    async joinRoom(socket, roomId) {
        try {
            const userId = socket.user.id;
            this.updateUserActivity(userId);

            // Verifica se o usuário já está em uma sala
            const currentRoomId = this.userRooms.get(userId);
            if (currentRoomId) {
                await this.leaveRoom(socket, currentRoomId);
            }

            // Cria um novo jogo se não existir
            if (!this.games.has(roomId)) {
                this.games.set(roomId, new BlackjackGame(roomId, this.pool, this.io));
            }

            const game = this.games.get(roomId);

            // Adiciona o jogador à sala
            const success = await game.addPlayer(userId);

            if (success) {
                // Associa o usuário à sala
                this.userRooms.set(userId, roomId);

                // Inscreve o socket na sala
                socket.join(`blackjack-room-${roomId}`);

                // Notifica o jogador que entrou com sucesso
                socket.emit('room-joined', {
                    roomId,
                    message: 'Você entrou na sala com sucesso'
                });

                // Atualiza o estado do jogo para todos na sala
                await game.broadcastGameState();

                // Inicia um novo jogo se houver jogadores suficientes
                if (game.shouldStartNewRound()) {
                    await game.startNewRound();
                }
            } else {
                socket.emit('join-error', {
                    message: 'Não foi possível entrar na sala'
                });
            }
        } catch (error) {
            console.error(`[Blackjack] Erro ao entrar na sala ${roomId}:`, error);
            socket.emit('join-error', {
                message: 'Erro ao entrar na sala',
                error: error.message
            });
        }
    }

    /**
     * Usuário sai de uma sala
     */
    async leaveRoom(socket, roomId, isDisconnect = false) {
        try {
            const userId = socket.user.id;
            this.updateUserActivity(userId);

            if (!this.games.has(roomId)) {
                if (!isDisconnect) {
                    socket.emit('leave-error', {
                        message: 'Sala não encontrada'
                    });
                }
                return;
            }

            const game = this.games.get(roomId);

            // Remove o jogador da sala
            const success = await game.removePlayer(userId);

            if (success) {
                // Remove a associação do usuário à sala
                this.userRooms.delete(userId);

                // Desinscreve o socket da sala
                socket.leave(`blackjack-room-${roomId}`);

                if (!isDisconnect) {
                    socket.emit('room-left', {
                        roomId,
                        message: 'Você saiu da sala com sucesso'
                    });
                }

                // Atualiza o estado do jogo para todos na sala
                await game.broadcastGameState();

                // Verifica se a sala ficou vazia
                if (game.isEmpty()) {
                    await game.closeRoom();
                    this.games.delete(roomId);
                    console.log(`[Blackjack] Sala ${roomId} fechada por falta de jogadores`);
                }
            } else if (!isDisconnect) {
                socket.emit('leave-error', {
                    message: 'Não foi possível sair da sala'
                });
            }
        } catch (error) {
            console.error(`[Blackjack] Erro ao sair da sala ${roomId}:`, error);
            if (!isDisconnect) {
                socket.emit('leave-error', {
                    message: 'Erro ao sair da sala',
                    error: error.message
                });
            }
        }
    }

    /**
     * Jogador faz uma aposta
     */
    async placeBet(socket, roomId, amount) {
        try {
            const userId = socket.user.id;
            this.updateUserActivity(userId);

            if (!this.games.has(roomId)) {
                socket.emit('bet-error', {
                    message: 'Sala não encontrada'
                });
                return;
            }

            const game = this.games.get(roomId);

            // Registra a aposta
            const success = await game.placeBet(userId, amount);

            if (!success) {
                socket.emit('bet-error', {
                    message: 'Não foi possível fazer a aposta'
                });
            }
        } catch (error) {
            console.error(`[Blackjack] Erro ao fazer aposta na sala ${roomId}:`, error);
            socket.emit('bet-error', {
                message: 'Erro ao fazer aposta',
                error: error.message
            });
        }
    }

    /**
     * Jogador pede mais uma carta (hit)
     */
    async playerHit(socket, roomId) {
        try {
            const userId = socket.user.id;
            this.updateUserActivity(userId);

            if (!this.games.has(roomId)) {
                socket.emit('game-error', {
                    message: 'Sala não encontrada'
                });
                return;
            }

            const game = this.games.get(roomId);
            await game.hit(userId);
        } catch (error) {
            console.error(`[Blackjack] Erro ao pedir carta na sala ${roomId}:`, error);
            socket.emit('game-error', {
                message: 'Erro ao pedir carta',
                error: error.message
            });
        }
    }

    /**
     * Jogador para de pedir cartas (stand)
     */
    async playerStand(socket, roomId) {
        try {
            const userId = socket.user.id;
            this.updateUserActivity(userId);

            if (!this.games.has(roomId)) {
                socket.emit('game-error', {
                    message: 'Sala não encontrada'
                });
                return;
            }

            const game = this.games.get(roomId);
            await game.stand(userId);
        } catch (error) {
            console.error(`[Blackjack] Erro ao parar na sala ${roomId}:`, error);
            socket.emit('game-error', {
                message: 'Erro ao parar',
                error: error.message
            });
        }
    }

    /**
     * Jogador dobra a aposta (double)
     */
    async playerDouble(socket, roomId) {
        try {
            const userId = socket.user.id;
            this.updateUserActivity(userId);

            if (!this.games.has(roomId)) {
                socket.emit('game-error', {
                    message: 'Sala não encontrada'
                });
                return;
            }

            const game = this.games.get(roomId);
            await game.double(userId);
        } catch (error) {
            console.error(`[Blackjack] Erro ao dobrar na sala ${roomId}:`, error);
            socket.emit('game-error', {
                message: 'Erro ao dobrar',
                error: error.message
            });
        }
    }

    /**
     * Jogador desiste da jogada (surrender)
     */
    async playerSurrender(socket, roomId) {
        try {
            const userId = socket.user.id;
            this.updateUserActivity(userId);

            if (!this.games.has(roomId)) {
                socket.emit('game-error', {
                    message: 'Sala não encontrada'
                });
                return;
            }

            const game = this.games.get(roomId);
            await game.surrender(userId);
        } catch (error) {
            console.error(`[Blackjack] Erro ao render na sala ${roomId}:`, error);
            socket.emit('game-error', {
                message: 'Erro ao render',
                error: error.message
            });
        }
    }
}