import { BlackjackDeck } from './blackjackDeck.js';

export class BlackjackGame {
    constructor(roomId, pool, io) {
        this.roomId = roomId;
        this.pool = pool;
        this.io = io;
        this.deck = new BlackjackDeck();
        this.currentRoundId = null;
        this.players = []; // lista de jogadores na sala
        this.activePlayers = []; // lista de jogadores ativos na rodada atual
        this.currentPlayerIndex = -1; // índice do jogador atual no array activePlayers
        this.dealerCards = []; // cartas do dealer
        this.dealerPoints = 0; // pontos do dealer
        this.roundStatus = null; // status da rodada
        this.minBetAmount = 0; // aposta mínima
        this.maxBetAmount = 0; // aposta máxima
        this.maxPlayers = 4; // máximo de jogadores na sala
    }

    /**
     * Verifica se a sala está vazia
     */
    isEmpty() {
        return this.players.length === 0;
    }

    /**
     * Verifica se deve iniciar uma nova rodada
     */
    shouldStartNewRound() {
        const result = this.players.length > 0 && !this.currentRoundId && this.roundStatus !== 'em_distribuicao';
        console.log(`[Blackjack] Verificando condições para nova rodada: 
        - Jogadores: ${this.players.length} > 0? ${this.players.length > 0}
        - currentRoundId nulo? ${!this.currentRoundId}
        - roundStatus não é 'em_distribuicao'? ${this.roundStatus !== 'em_distribuicao'}
        - Resultado: ${result}`);
        return result;
    }

    /**
     * Adiciona um jogador à sala
     */
    async addPlayer(userId) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Verifica se o jogador já está na sala
            const checkQuery = `
                SELECT * FROM blackjack_jogadores_sala
                WHERE usuario_id = $1 AND sala_id = $2
            `;

            const checkResult = await client.query(checkQuery, [userId, this.roomId]);

            if (checkResult.rows.length > 0) {
                await client.query('ROLLBACK');
                return true; // Jogador já está na sala
            }

            // Verifica se há vagas disponíveis
            const roomQuery = `
                SELECT 
                    bs.max_jogadores, 
                    bs.min_aposta, 
                    bs.max_aposta,
                    bs.status,
                    (SELECT COUNT(*) FROM blackjack_jogadores_sala bjs WHERE bjs.sala_id = bs.id) as jogadores_atuais
                FROM blackjack_salas bs
                WHERE bs.id = $1
            `;

            const roomResult = await client.query(roomQuery, [this.roomId]);

            if (roomResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false; // Sala não encontrada
            }

            const room = roomResult.rows[0];

            if (parseInt(room.jogadores_atuais) >= room.max_jogadores) {
                await client.query('ROLLBACK');
                return false; // Sala cheia
            }

            if (room.status === 'finalizada') {
                await client.query('ROLLBACK');
                return false; // Sala finalizada
            }

            // Atualiza os valores da sala no objeto
            this.minBetAmount = room.min_aposta;
            this.maxBetAmount = room.max_aposta;
            this.maxPlayers = room.max_jogadores;

            // Verifica se o usuário tem saldo suficiente
            const userQuery = `
                SELECT coins FROM usuarios
                WHERE id = $1
            `;

            const userResult = await client.query(userQuery, [userId]);

            if (userResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false; // Usuário não encontrado
            }

            const user = userResult.rows[0];

            if (user.coins < room.min_aposta) {
                await client.query('ROLLBACK');
                return false; // Saldo insuficiente
            }

            // Encontra a próxima posição disponível
            const positionsQuery = `
                SELECT posicao_mesa FROM blackjack_jogadores_sala
                WHERE sala_id = $1
            `;

            const positionsResult = await client.query(positionsQuery, [this.roomId]);
            const occupiedPositions = positionsResult.rows.map(row => row.posicao_mesa);

            let nextPosition = 1;
            while (occupiedPositions.includes(nextPosition) && nextPosition <= this.maxPlayers) {
                nextPosition++;
            }

            if (nextPosition > this.maxPlayers) {
                await client.query('ROLLBACK');
                return false; // Não há posições disponíveis
            }

            // Adiciona o jogador à sala
            const insertQuery = `
                INSERT INTO blackjack_jogadores_sala (sala_id, usuario_id, posicao_mesa, saldo_atual, status)
                VALUES ($1, $2, $3, $4, 'aguardando')
                RETURNING id
            `;

            const insertResult = await client.query(insertQuery, [
                this.roomId,
                userId,
                nextPosition,
                user.coins
            ]);

            if (insertResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false; // Erro ao adicionar jogador
            }

            // Se esta é a primeira pessoa a entrar, atualiza o status da sala
            if (parseInt(room.jogadores_atuais) === 0 && room.status === 'aguardando') {
                const updateRoomQuery = `
                    UPDATE blackjack_salas
                    SET status = 'em_andamento', updated_at = NOW()
                    WHERE id = $1
                `;

                await client.query(updateRoomQuery, [this.roomId]);
            }

            await client.query('COMMIT');

            // Adiciona jogador à lista local
            this.players.push({
                id: insertResult.rows[0].id,
                userId,
                position: nextPosition,
                balance: user.coins,
                status: 'aguardando'
            });

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao adicionar jogador ${userId} à sala ${this.roomId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    /**
     * Remove um jogador da sala
     */
    async removePlayer(userId) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Verifica se o jogador está na sala
            const checkQuery = `
                SELECT * FROM blackjack_jogadores_sala
                WHERE usuario_id = $1 AND sala_id = $2
            `;

            const checkResult = await client.query(checkQuery, [userId, this.roomId]);

            if (checkResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false; // Jogador não está na sala
            }

            const player = checkResult.rows[0];

            // Verifica se o jogador está em uma jogada ativa
            if (this.currentRoundId) {
                const activePlayQuery = `
                    SELECT * FROM blackjack_jogadas
                    WHERE usuario_id = $1 AND rodada_id = $2 AND status IN ('aguardando', 'hit')
                `;

                const activePlayResult = await client.query(activePlayQuery, [
                    userId,
                    this.currentRoundId
                ]);

                // Se o jogador tem uma jogada ativa, faz um stand automático
                if (activePlayResult.rows.length > 0) {
                    await this.stand(userId);
                }
            }

            // Remove o jogador da sala
            const deleteQuery = `
                DELETE FROM blackjack_jogadores_sala
                WHERE usuario_id = $1 AND sala_id = $2
            `;

            await client.query(deleteQuery, [userId, this.roomId]);

            // Verifica se a sala ficou vazia
            const countQuery = `
                SELECT COUNT(*) as count FROM blackjack_jogadores_sala
                WHERE sala_id = $1
            `;

            const countResult = await client.query(countQuery, [this.roomId]);

            if (parseInt(countResult.rows[0].count) === 0) {
                // Se a sala ficou vazia, atualiza o status para aguardando
                const updateRoomQuery = `
                    UPDATE blackjack_salas
                    SET status = 'aguardando', updated_at = NOW()
                    WHERE id = $1
                `;

                await client.query(updateRoomQuery, [this.roomId]);
            }

            await client.query('COMMIT');

            // Remove jogador da lista local
            this.players = this.players.filter(p => p.userId !== userId);
            this.activePlayers = this.activePlayers.filter(p => p.userId !== userId);

            // Se o jogador atual saiu, passa para o próximo
            if (this.currentPlayerIndex >= 0 &&
                this.activePlayers.length > 0 &&
                this.currentPlayerIndex >= this.activePlayers.length) {
                this.currentPlayerIndex = 0;
            }

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao remover jogador ${userId} da sala ${this.roomId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    /**
     * Fecha a sala de blackjack
     */
    async closeRoom() {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Atualiza o status da sala para finalizada
            const updateRoomQuery = `
                UPDATE blackjack_salas
                SET status = 'finalizada', updated_at = NOW()
                WHERE id = $1
            `;

            await client.query(updateRoomQuery, [this.roomId]);

            // Finaliza a rodada atual se existir
            if (this.currentRoundId) {
                const updateRoundQuery = `
                    UPDATE blackjack_rodadas
                    SET status = 'finalizada', finalizada_em = NOW()
                    WHERE id = $1
                `;

                await client.query(updateRoundQuery, [this.currentRoundId]);
            }

            await client.query('COMMIT');

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao fechar sala ${this.roomId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    /**
     * Inicia uma nova rodada de blackjack
     */
    async startNewRound() {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Reseta o estado do jogo
            this.deck.shuffle();
            this.dealerCards = [];
            this.dealerPoints = 0;
            this.activePlayers = [];
            this.currentPlayerIndex = -1;

            // Cria uma nova rodada
            const createRoundQuery = `
                INSERT INTO blackjack_rodadas (sala_id, status, dealer_cartas, dealer_pontos)
                VALUES ($1, 'em_distribuicao', $2, 0)
                RETURNING id
            `;

            const createRoundResult = await client.query(createRoundQuery, [
                this.roomId,
                JSON.stringify([])
            ]);

            this.currentRoundId = createRoundResult.rows[0].id;
            this.roundStatus = 'em_distribuicao';

            // Atualiza o status para aguardando apostas
            const updateRoundQuery = `
                UPDATE blackjack_rodadas
                SET status = 'apostas'
                WHERE id = $1
            `;

            await client.query(updateRoundQuery, [this.currentRoundId]);
            this.roundStatus = 'apostas';

            await client.query('COMMIT');

            // Notifica os jogadores sobre a nova rodada
            this.io.to(`blackjack-room-${this.roomId}`).emit('new-round', {
                roundId: this.currentRoundId,
                status: 'apostas',
                message: 'Nova rodada iniciada! Faça sua aposta.'
            });

            // Atualiza o estado do jogo
            await this.broadcastGameState();

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao iniciar nova rodada na sala ${this.roomId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    /**
     * Jogador faz uma aposta
     */
    async placeBet(userId, amount) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Verifica se o jogador está na sala
            const playerQuery = `
                SELECT bjs.*, u.coins 
                FROM blackjack_jogadores_sala bjs
                JOIN usuarios u ON bjs.usuario_id = u.id
                WHERE bjs.usuario_id = $1 AND bjs.sala_id = $2
            `;

            const playerResult = await client.query(playerQuery, [userId, this.roomId]);

            if (playerResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false; // Jogador não está na sala
            }

            const player = playerResult.rows[0];

            // Verifica se a rodada está em fase de apostas
            const roundQuery = `
                SELECT * FROM blackjack_rodadas
                WHERE id = $1
            `;

            const roundResult = await client.query(roundQuery, [this.currentRoundId]);

            if (roundResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false; // Rodada não encontrada
            }

            const round = roundResult.rows[0];

            if (round.status !== 'apostas') {
                await client.query('ROLLBACK');
                return false; // Não é momento de apostar
            }

            // Verifica se o jogador já fez uma aposta nesta rodada
            const betQuery = `
                SELECT * FROM blackjack_jogadas
                WHERE usuario_id = $1 AND rodada_id = $2
            `;

            const betResult = await client.query(betQuery, [userId, this.currentRoundId]);

            if (betResult.rows.length > 0) {
                await client.query('ROLLBACK');
                return false; // Jogador já apostou
            }

            // Verifica se o valor da aposta é válido
            if (amount < this.minBetAmount || amount > this.maxBetAmount) {
                await client.query('ROLLBACK');
                return false; // Valor da aposta inválido
            }

            // Verifica se o jogador tem saldo suficiente
            if (player.coins < amount) {
                await client.query('ROLLBACK');
                return false; // Saldo insuficiente
            }

            // Registra a aposta e deduz o saldo do jogador
            const updateUserQuery = `
                UPDATE usuarios
                SET coins = coins - $1, updated_at = NOW()
                WHERE id = $2
            `;

            await client.query(updateUserQuery, [amount, userId]);

            // Atualiza o saldo na tabela de jogadores na sala
            const updatePlayerQuery = `
                UPDATE blackjack_jogadores_sala
                SET saldo_atual = saldo_atual - $1
                WHERE id = $2
            `;

            await client.query(updatePlayerQuery, [amount, player.id]);

            // Sorteia duas cartas para o jogador
            const initialCards = [
                this.deck.drawCard(),
                this.deck.drawCard()
            ];

            const initialPoints = this.calculatePoints(initialCards);

            // Insere a jogada
            const insertPlayQuery = `
                INSERT INTO blackjack_jogadas 
                (rodada_id, usuario_id, cartas, pontos, aposta, status)
                VALUES ($1, $2, $3, $4, $5, 'aguardando')
                RETURNING id
            `;

            const insertPlayResult = await client.query(insertPlayQuery, [
                this.currentRoundId,
                userId,
                JSON.stringify(initialCards),
                initialPoints,
                amount
            ]);

            const playId = insertPlayResult.rows[0].id;

            // Verifica se é Blackjack (21 pontos com 2 cartas)
            if (initialPoints === 21) {
                const updatePlayQuery = `
                    UPDATE blackjack_jogadas
                    SET status = 'stand'
                    WHERE id = $1
                `;

                await client.query(updatePlayQuery, [playId]);
            }

            await client.query('COMMIT');

            // Adiciona jogador à lista de jogadores ativos
            this.activePlayers.push({
                id: player.id,
                userId,
                playId,
                cards: initialCards,
                points: initialPoints,
                bet: amount,
                status: initialPoints === 21 ? 'stand' : 'aguardando'
            });

            // Atualiza a lista local de jogadores
            const playerIndex = this.players.findIndex(p => p.userId === userId);
            if (playerIndex !== -1) {
                this.players[playerIndex].balance -= amount;
            }

            // Notifica os jogadores sobre a aposta
            this.io.to(`blackjack-room-${this.roomId}`).emit('bet-placed', {
                userId,
                amount,
                cards: initialCards,
                points: initialPoints
            });

            // Verifica se todos os jogadores fizeram suas apostas
            await this.checkAllPlayersBet();

            // Atualiza o estado do jogo
            await this.broadcastGameState();

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao fazer aposta para jogador ${userId} na sala ${this.roomId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    /**
     * Verifica se todos os jogadores fizeram suas apostas
     */
    async checkAllPlayersBet() {
        const client = await this.pool.connect();

        try {
            // Conta quantos jogadores estão na sala
            const playersQuery = `
                SELECT COUNT(*) as count 
                FROM blackjack_jogadores_sala
                WHERE sala_id = $1
            `;

            const playersResult = await client.query(playersQuery, [this.roomId]);
            const totalPlayers = parseInt(playersResult.rows[0].count);

            // Conta quantos jogadores fizeram apostas
            const betsQuery = `
                SELECT COUNT(*) as count 
                FROM blackjack_jogadas
                WHERE rodada_id = $1
            `;

            const betsResult = await client.query(betsQuery, [this.currentRoundId]);
            const totalBets = parseInt(betsResult.rows[0].count);

            // Se todos os jogadores apostaram, inicia a fase de jogadas
            if (totalBets >= totalPlayers && totalBets > 0) {
                await this.startPlayPhase();
            }
        } catch (error) {
            console.error(`[Blackjack] Erro ao verificar apostas na sala ${this.roomId}:`, error);
        } finally {
            client.release();
        }
    }

    /**
     * Inicia a fase de jogadas
     */
    async startPlayPhase() {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Atualiza o status da rodada para jogadas
            const updateRoundQuery = `
                UPDATE blackjack_rodadas
                SET status = 'jogadas'
                WHERE id = $1
            `;

            await client.query(updateRoundQuery, [this.currentRoundId]);
            this.roundStatus = 'jogadas';

            // Distribui uma carta para o dealer
            this.dealerCards = [this.deck.drawCard()];
            this.dealerPoints = this.calculatePoints(this.dealerCards);

            const updateDealerQuery = `
                UPDATE blackjack_rodadas
                SET dealer_cartas = $1, dealer_pontos = $2
                WHERE id = $3
            `;

            await client.query(updateDealerQuery, [
                JSON.stringify(this.dealerCards),
                this.dealerPoints,
                this.currentRoundId
            ]);

            await client.query('COMMIT');

            // Define o primeiro jogador
            this.currentPlayerIndex = 0;

            // Notifica os jogadores sobre a mudança de fase
            this.io.to(`blackjack-room-${this.roomId}`).emit('play-phase-started', {
                dealerCards: this.dealerCards,
                dealerPoints: this.dealerPoints,
                currentPlayer: this.activePlayers.length > 0 ? this.activePlayers[0].userId : null
            });

            // Atualiza o estado do jogo
            await this.broadcastGameState();

            // Verifica se todos os jogadores têm Blackjack
            const allBlackjack = this.activePlayers.every(p => p.points === 21);
            if (allBlackjack) {
                await this.finishRound();
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao iniciar fase de jogadas na sala ${this.roomId}:`, error);
        } finally {
            client.release();
        }
    }

    /**
     * Jogador pede mais uma carta (hit)
     */
    async hit(userId) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Verifica se é a vez do jogador
            if (this.currentPlayerIndex < 0 ||
                this.currentPlayerIndex >= this.activePlayers.length ||
                this.activePlayers[this.currentPlayerIndex].userId !== userId) {
                await client.query('ROLLBACK');
                return false; // Não é a vez do jogador
            }

            const currentPlayer = this.activePlayers[this.currentPlayerIndex];

            // Verifica se o jogador pode pedir carta
            if (currentPlayer.status !== 'aguardando' && currentPlayer.status !== 'hit') {
                await client.query('ROLLBACK');
                return false; // Jogador não pode pedir carta
            }

            // Sorteia uma nova carta
            const newCard = this.deck.drawCard();
            const cards = [...currentPlayer.cards, newCard];
            const points = this.calculatePoints(cards);

            // Atualiza a jogada
            const updatePlayQuery = `
                UPDATE blackjack_jogadas
                SET cartas = $1, pontos = $2, status = $3
                WHERE id = $4
            `;

            let newStatus = 'hit';

            // Verifica se o jogador estourou ou atingiu 21
            if (points > 21) {
                newStatus = 'stand';
            } else if (points === 21) {
                newStatus = 'stand';
            }

            await client.query(updatePlayQuery, [
                JSON.stringify(cards),
                points,
                newStatus,
                currentPlayer.playId
            ]);

            // Atualiza o objeto do jogador
            currentPlayer.cards = cards;
            currentPlayer.points = points;
            currentPlayer.status = newStatus;

            // Notifica os jogadores sobre a jogada
            this.io.to(`blackjack-room-${this.roomId}`).emit('player-hit', {
                userId,
                card: newCard,
                cards,
                points,
                busted: points > 21
            });

            // Se o jogador estourou ou atingiu 21, passa para o próximo
            if (newStatus === 'stand') {
                await this.nextPlayer();
            }

            await client.query('COMMIT');

            // Atualiza o estado do jogo
            await this.broadcastGameState();

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao pedir carta para jogador ${userId} na sala ${this.roomId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    /**
     * Jogador para de pedir cartas (stand)
     */
    async stand(userId) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            console.log(`[Blackjack] Jogador ${userId} solicitou stand na sala ${this.roomId}`);

            // Se não for a vez do jogador e o jogador estiver ativo, não faz nada
            if (this.currentPlayerIndex >= 0 &&
                this.currentPlayerIndex < this.activePlayers.length &&
                this.activePlayers[this.currentPlayerIndex].userId !== userId) {
                await client.query('ROLLBACK');
                console.log(`[Blackjack] Não é a vez do jogador ${userId}`);
                return false; // Não é a vez do jogador
            }

            // Encontra o jogador
            const playerIndex = this.activePlayers.findIndex(p => p.userId === userId);
            if (playerIndex === -1) {
                await client.query('ROLLBACK');
                console.log(`[Blackjack] Jogador ${userId} não encontrado na lista de jogadores ativos`);
                return false; // Jogador não encontrado
            }

            const player = this.activePlayers[playerIndex];

            // Verifica se o jogador pode fazer stand
            if (player.status !== 'aguardando' && player.status !== 'hit') {
                await client.query('ROLLBACK');
                console.log(`[Blackjack] Jogador ${userId} não pode fazer stand. Status atual: ${player.status}`);
                return false; // Jogador não pode fazer stand
            }

            // Atualiza a jogada
            const updatePlayQuery = `
                UPDATE blackjack_jogadas
                SET status = 'stand'
                WHERE id = $1
            `;

            await client.query(updatePlayQuery, [player.playId]);

            // Atualiza o objeto do jogador
            player.status = 'stand';

            // Notifica os jogadores sobre a jogada
            this.io.to(`blackjack-room-${this.roomId}`).emit('player-stand', {
                userId
            });

            // Se for a vez do jogador, passa para o próximo
            if (this.currentPlayerIndex === playerIndex) {
                console.log(`[Blackjack] Passando para o próximo jogador após stand do jogador ${userId}`);
                await this.nextPlayer();
            }

            await client.query('COMMIT');
            console.log(`[Blackjack] Stand do jogador ${userId} processado com sucesso`);

            // Atualiza o estado do jogo
            await this.broadcastGameState();

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao fazer stand para jogador ${userId} na sala ${this.roomId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    /**
     * Jogador dobra a aposta (double)
     */
    async double(userId) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Verifica se é a vez do jogador
            if (this.currentPlayerIndex < 0 ||
                this.currentPlayerIndex >= this.activePlayers.length ||
                this.activePlayers[this.currentPlayerIndex].userId !== userId) {
                await client.query('ROLLBACK');
                return false; // Não é a vez do jogador
            }

            const currentPlayer = this.activePlayers[this.currentPlayerIndex];

            // Verifica se o jogador pode dobrar
            if (currentPlayer.status !== 'aguardando' || currentPlayer.cards.length !== 2) {
                await client.query('ROLLBACK');
                return false; // Jogador não pode dobrar
            }

            // Verifica se o jogador tem saldo suficiente
            const playerQuery = `
                SELECT bjs.*, u.coins 
                FROM blackjack_jogadores_sala bjs
                JOIN usuarios u ON bjs.usuario_id = u.id
                WHERE bjs.usuario_id = $1 AND bjs.sala_id = $2
            `;

            const playerResult = await client.query(playerQuery, [userId, this.roomId]);

            if (playerResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return false; // Jogador não está na sala
            }

            const player = playerResult.rows[0];

            if (player.coins < currentPlayer.bet) {
                await client.query('ROLLBACK');
                return false; // Saldo insuficiente para dobrar
            }

            // Deduz o valor da aposta adicional
            const updateUserQuery = `
                UPDATE usuarios
                SET coins = coins - $1, updated_at = NOW()
                WHERE id = $2
            `;

            await client.query(updateUserQuery, [currentPlayer.bet, userId]);

            // Atualiza o saldo na tabela de jogadores na sala
            const updatePlayerQuery = `
                UPDATE blackjack_jogadores_sala
                SET saldo_atual = saldo_atual - $1
                WHERE id = $2
            `;

            await client.query(updatePlayerQuery, [currentPlayer.bet, player.id]);

            // Sorteia apenas uma carta
            const newCard = this.deck.drawCard();
            const cards = [...currentPlayer.cards, newCard];
            const points = this.calculatePoints(cards);

            // Atualiza a jogada
            const updatePlayQuery = `
                UPDATE blackjack_jogadas
                SET cartas = $1, pontos = $2, status = 'stand', aposta = aposta * 2
                WHERE id = $3
            `;

            await client.query(updatePlayQuery, [
                JSON.stringify(cards),
                points,
                currentPlayer.playId
            ]);

            // Atualiza o objeto do jogador
            currentPlayer.cards = cards;
            currentPlayer.points = points;
            currentPlayer.bet *= 2;
            currentPlayer.status = 'stand';

            // Atualiza a lista local de jogadores
            const playerIndex = this.players.findIndex(p => p.userId === userId);
            if (playerIndex !== -1) {
                this.players[playerIndex].balance -= currentPlayer.bet / 2;
            }

            // Notifica os jogadores sobre a jogada
            this.io.to(`blackjack-room-${this.roomId}`).emit('player-double', {
                userId,
                card: newCard,
                cards,
                points,
                newBet: currentPlayer.bet,
                busted: points > 21
            });

            // Passa para o próximo jogador
            await this.nextPlayer();

            await client.query('COMMIT');

            // Atualiza o estado do jogo
            await this.broadcastGameState();

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao dobrar para jogador ${userId} na sala ${this.roomId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    /**
     * Jogador desiste da jogada (surrender)
     */
    async surrender(userId) {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Verifica se é a vez do jogador
            if (this.currentPlayerIndex < 0 ||
                this.currentPlayerIndex >= this.activePlayers.length ||
                this.activePlayers[this.currentPlayerIndex].userId !== userId) {
                await client.query('ROLLBACK');
                return false; // Não é a vez do jogador
            }

            const currentPlayer = this.activePlayers[this.currentPlayerIndex];

            // Verifica se o jogador pode render
            if (currentPlayer.status !== 'aguardando' || currentPlayer.cards.length !== 2) {
                await client.query('ROLLBACK');
                return false; // Jogador não pode render
            }

            // Devolve metade da aposta
            const halfBet = Math.floor(currentPlayer.bet / 2);

            const updateUserQuery = `
                UPDATE usuarios
                SET coins = coins + $1, updated_at = NOW()
                WHERE id = $2
            `;

            await client.query(updateUserQuery, [halfBet, userId]);

            // Atualiza o saldo na tabela de jogadores na sala
            const updatePlayerQuery = `
                UPDATE blackjack_jogadores_sala
                SET saldo_atual = saldo_atual + $1
                WHERE usuario_id = $2 AND sala_id = $3
            `;

            await client.query(updatePlayerQuery, [halfBet, userId, this.roomId]);

            // Atualiza a jogada
            const updatePlayQuery = `
                UPDATE blackjack_jogadas
                SET status = 'surrender', resultado = 'surrender'
                WHERE id = $1
            `;

            await client.query(updatePlayQuery, [currentPlayer.playId]);

            // Atualiza o objeto do jogador
            currentPlayer.status = 'surrender';

            // Atualiza a lista local de jogadores
            const playerIndex = this.players.findIndex(p => p.userId === userId);
            if (playerIndex !== -1) {
                this.players[playerIndex].balance += halfBet;
            }

            // Notifica os jogadores sobre a jogada
            this.io.to(`blackjack-room-${this.roomId}`).emit('player-surrender', {
                userId,
                refund: halfBet
            });

            // Passa para o próximo jogador
            await this.nextPlayer();

            await client.query('COMMIT');

            // Atualiza o estado do jogo
            await this.broadcastGameState();

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao render para jogador ${userId} na sala ${this.roomId}:`, error);
            return false;
        } finally {
            client.release();
        }
    }

    /**
     * Passa para o próximo jogador
     */
    async nextPlayer() {
        let foundNextPlayer = false;
        console.log(`[Blackjack] Procurando próximo jogador na sala ${this.roomId}`);
        console.log(`[Blackjack] Players ativos: ${this.activePlayers.length}, Índice atual: ${this.currentPlayerIndex}`);

        // Procura o próximo jogador que ainda não terminou
        for (let i = this.currentPlayerIndex + 1; i < this.activePlayers.length; i++) {
            const player = this.activePlayers[i];
            if (player.status === 'aguardando' || player.status === 'hit') {
                this.currentPlayerIndex = i;
                foundNextPlayer = true;
                console.log(`[Blackjack] Próximo jogador encontrado: ${player.userId}`);

                // Notifica os jogadores sobre a mudança de turno
                this.io.to(`blackjack-room-${this.roomId}`).emit('next-player', {
                    userId: player.userId
                });

                break;
            }
        }

        // Se não encontrou próximo jogador, finaliza a rodada
        if (!foundNextPlayer) {
            console.log(`[Blackjack] Não há mais jogadores para jogar. Finalizando a rodada na sala ${this.roomId}`);
            await this.finishRound();
        }
    }

    /**
     * Finaliza a rodada
     */
    async finishRound() {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');
            console.log(`[Blackjack] Iniciando finalização da rodada ${this.currentRoundId} na sala ${this.roomId}`);

            // Atualiza o status da rodada para finalizada
            const updateRoundQuery = `
                UPDATE blackjack_rodadas
                SET status = 'finalizada', finalizada_em = NOW()
                WHERE id = $1
            `;

            await client.query(updateRoundQuery, [this.currentRoundId]);
            this.roundStatus = 'finalizada';
            console.log(`[Blackjack] Status da rodada atualizado para finalizada`);

            // Joga as cartas do dealer
            console.log(`[Blackjack] Cartas iniciais do dealer: ${JSON.stringify(this.dealerCards)}, Pontos: ${this.dealerPoints}`);
            while (this.dealerPoints < 17) {
                const newCard = this.deck.drawCard();
                console.log(`[Blackjack] Dealer comprou carta: ${JSON.stringify(newCard)}`);
                this.dealerCards.push(newCard);
                this.dealerPoints = this.calculatePoints(this.dealerCards);
                console.log(`[Blackjack] Novos pontos do dealer: ${this.dealerPoints}`);
            }

            // Atualiza as cartas do dealer
            const updateDealerQuery = `
                UPDATE blackjack_rodadas
                SET dealer_cartas = $1, dealer_pontos = $2
                WHERE id = $3
            `;

            await client.query(updateDealerQuery, [
                JSON.stringify(this.dealerCards),
                this.dealerPoints,
                this.currentRoundId
            ]);
            console.log(`[Blackjack] Cartas do dealer atualizadas no banco`);

            // Processa o resultado de cada jogador
            console.log(`[Blackjack] Processando resultados para ${this.activePlayers.length} jogadores`);
            for (const player of this.activePlayers) {
                if (player.status === 'surrender') {
                    console.log(`[Blackjack] Jogador ${player.userId} já desistiu, pulando...`);
                    continue; // Jogador já desistiu
                }

                let resultado = null;
                let winAmount = 0;

                // Verifica se o jogador estourou
                if (player.points > 21) {
                    resultado = 'perdeu';
                    console.log(`[Blackjack] Jogador ${player.userId} estourou (${player.points} pontos)`);
                } else if (this.dealerPoints > 21) {
                    // Dealer estourou, jogador ganha
                    resultado = 'ganhou';
                    winAmount = player.bet * 2;
                    console.log(`[Blackjack] Dealer estourou. Jogador ${player.userId} ganhou ${winAmount}`);
                } else if (player.points > this.dealerPoints) {
                    // Jogador tem mais pontos que o dealer
                    resultado = 'ganhou';

                    // Se for blackjack (21 pontos com 2 cartas), paga 3:2
                    if (player.points === 21 && player.cards.length === 2) {
                        resultado = 'blackjack';
                        winAmount = player.bet * 2.5;
                        console.log(`[Blackjack] Jogador ${player.userId} fez blackjack! Ganhou ${winAmount}`);
                    } else {
                        winAmount = player.bet * 2;
                        console.log(`[Blackjack] Jogador ${player.userId} ganhou com ${player.points} pontos (${winAmount})`);
                    }
                } else if (player.points === this.dealerPoints) {
                    // Empate
                    resultado = 'empatou';
                    winAmount = player.bet;
                    console.log(`[Blackjack] Jogador ${player.userId} empatou com o dealer (${player.points} pontos). Recuperou ${winAmount}`);
                } else {
                    // Dealer tem mais pontos
                    resultado = 'perdeu';
                    console.log(`[Blackjack] Jogador ${player.userId} perdeu para o dealer (${player.points} vs ${this.dealerPoints})`);
                }

                // Atualiza o resultado da jogada
                const updatePlayQuery = `
                    UPDATE blackjack_jogadas
                    SET resultado = $1
                    WHERE id = $2
                `;

                await client.query(updatePlayQuery, [resultado, player.playId]);
                console.log(`[Blackjack] Resultado ${resultado} registrado para jogador ${player.userId}`);

                // Se o jogador ganhou ou empatou, devolve o valor
                if (winAmount > 0) {
                    const updateUserQuery = `
                        UPDATE usuarios
                        SET coins = coins + $1, updated_at = NOW()
                        WHERE id = $2
                    `;

                    await client.query(updateUserQuery, [winAmount, player.userId]);

                    // Atualiza o saldo na tabela de jogadores na sala
                    const updatePlayerQuery = `
                        UPDATE blackjack_jogadores_sala
                        SET saldo_atual = saldo_atual + $1
                        WHERE usuario_id = $2 AND sala_id = $3
                    `;

                    await client.query(updatePlayerQuery, [winAmount, player.userId, this.roomId]);
                    console.log(`[Blackjack] ${winAmount} moedas adicionadas ao jogador ${player.userId}`);

                    // Atualiza a lista local de jogadores
                    const playerIndex = this.players.findIndex(p => p.userId === player.userId);
                    if (playerIndex !== -1) {
                        this.players[playerIndex].balance += winAmount;
                    }
                }
            }

            await client.query('COMMIT');
            console.log(`[Blackjack] Commit realizado para finalização da rodada`);

            // Notifica os jogadores sobre o resultado
            this.io.to(`blackjack-room-${this.roomId}`).emit('round-finished', {
                dealerCards: this.dealerCards,
                dealerPoints: this.dealerPoints,
                results: this.activePlayers.map(player => ({
                    userId: player.userId,
                    points: player.points,
                    result: player.status === 'surrender' ? 'surrender' :
                        player.points > 21 ? 'bust' :
                            this.dealerPoints > 21 ? 'win' :
                                player.points > this.dealerPoints ? 'win' :
                                    player.points < this.dealerPoints ? 'lose' :
                                        'push'
                }))
            });
            console.log(`[Blackjack] Evento round-finished emitido`);

            // Adicione logo após:
            console.log(`[Blackjack] Detalhes do evento round-finished:`, JSON.stringify({
                dealerCards: this.dealerCards,
                dealerPoints: this.dealerPoints,
                results: this.activePlayers.map(p => ({
                    userId: p.userId,
                    points: p.points,
                    result: p.status === 'surrender' ? 'surrender' : null
                }))
            }));

            // E também adicione uma verificação do método broadcastGameState
            console.log(`[Blackjack] Chamando broadcastGameState após finalização da rodada`);

            setTimeout(() => {
                this.broadcastGameState();
                console.log(`[Blackjack] Estado do jogo atualizado após finalização da rodada`);
            }, 500);

            // Reseta o estado para iniciar uma nova rodada após alguns segundos
            console.log(`[Blackjack] Agendando início da próxima rodada em 5 segundos`);
            setTimeout(async () => {
                this.currentRoundId = null;
                this.currentPlayerIndex = -1;
                this.roundStatus = null;
                console.log(`[Blackjack] Estado resetado. Verificando se deve iniciar nova rodada (${this.shouldStartNewRound()})`);

                // Inicia uma nova rodada se houver jogadores
                if (this.shouldStartNewRound()) {
                    console.log(`[Blackjack] Iniciando nova rodada`);
                    await this.startNewRound();
                } else {
                    console.log(`[Blackjack] Condições para nova rodada não atendidas`);
                }
            }, 5000);

            // Atualiza o estado do jogo
            await this.broadcastGameState();

            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`[Blackjack] Erro ao finalizar rodada na sala ${this.roomId}:`, error);
            return false;
        } finally {
            await client.query('COMMIT');
            client.release();
        }
    }

    /**
     * Calcula os pontos de um conjunto de cartas
     */
    calculatePoints(cards) {
        let points = 0;
        let aces = 0;

        for (const card of cards) {
            const value = card.value;
            if (value === 'A') {
                aces++;
                points += 11;
            } else if (value === 'K' || value === 'Q' || value === 'J') {
                points += 10;
            } else {
                points += parseInt(value);
            }
        }

        // Ajusta o valor dos ases se necessário
        while (points > 21 && aces > 0) {
            points -= 10;
            aces--;
        }

        return points;
    }

    /**
     * Envia o estado atual do jogo para todos os jogadores
     */
    async broadcastGameState() {
        try {
            // Busca os detalhes da sala e da rodada atual
            const room = await this.getRoomDetails();

            // Envia o estado para todos os jogadores na sala
            this.io.to(`blackjack-room-${this.roomId}`).emit('game-state', room);
        } catch (error) {
            console.error(`[Blackjack] Erro ao enviar estado do jogo na sala ${this.roomId}:`, error);
        }
    }

    /**
     * Busca os detalhes da sala e da rodada atual
     */
    async getRoomDetails() {
        const client = await this.pool.connect();

        try {
            // Busca detalhes da sala
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

            const roomResult = await client.query(roomQuery, [this.roomId]);

            if (roomResult.rows.length === 0) {
                return null;
            }

            const room = roomResult.rows[0];

            // Busca jogadores na sala
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

            const playersResult = await client.query(playersQuery, [this.roomId]);

            // Busca jogadas da rodada atual
            let playsResult = { rows: [] };

            if (this.currentRoundId) {
                const playsQuery = `
                    SELECT 
                        bj.id, 
                        bj.usuario_id, 
                        bj.cartas, 
                        bj.pontos, 
                        bj.aposta, 
                        bj.status, 
                        bj.resultado
                    FROM blackjack_jogadas bj
                    WHERE bj.rodada_id = $1
                `;

                playsResult = await client.query(playsQuery, [this.currentRoundId]);
            }

            // Busca rodada atual
            let roundResult = { rows: [] };

            if (this.currentRoundId) {
                const roundQuery = `
                    SELECT 
                        br.id, 
                        br.status, 
                        br.dealer_cartas, 
                        br.dealer_pontos, 
                        br.created_at
                    FROM blackjack_rodadas br
                    WHERE br.id = $1
                `;

                roundResult = await client.query(roundQuery, [this.currentRoundId]);
            }

            const round = roundResult.rows.length > 0 ? {
                id: roundResult.rows[0].id,
                status: roundResult.rows[0].status,
                dealerCards: roundResult.rows[0].dealer_cartas,
                dealerPoints: roundResult.rows[0].dealer_pontos,
                createdAt: roundResult.rows[0].created_at
            } : null;

            // Mapeia jogadores e suas jogadas
            const players = playersResult.rows.map(player => {
                const play = playsResult.rows.find(p => p.usuario_id === player.usuario_id);

                return {
                    id: player.id,
                    userId: player.usuario_id,
                    nickname: player.nickname,
                    position: player.posicao_mesa,
                    balance: player.saldo_atual,
                    status: player.status,
                    play: play ? {
                        id: play.id,
                        cards: play.cartas,
                        points: play.pontos,
                        bet: play.aposta,
                        status: play.status,
                        result: play.resultado
                    } : null
                };
            });

            return {
                id: room.id,
                status: room.status,
                minBet: room.min_aposta,
                maxBet: room.max_aposta,
                maxPlayers: room.max_jogadores,
                createdAt: room.created_at,
                players,
                round,
                currentPlayer: this.currentPlayerIndex >= 0 && this.currentPlayerIndex < this.activePlayers.length ?
                    this.activePlayers[this.currentPlayerIndex].userId : null
            };
        } catch (error) {
            console.error(`[Blackjack] Erro ao buscar detalhes da sala ${this.roomId}:`, error);
            return null;
        } finally {
            client.release();
        }
    }
}