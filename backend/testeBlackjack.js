/**
 * Script para testar conexões socket do Blackjack
 * 
 * Uso:
 * node test-blackjack-socket.js <token> <comando> [parâmetros]
 * 
 * Comandos disponíveis:
 * - connect: Apenas conecta e escuta eventos
 * - list: Lista as salas disponíveis
 * - create: Cria uma nova sala
 * - join <roomId>: Entra em uma sala específica
 * - start: Inicia uma rodada (deve estar em uma sala)
 * - bet <roundId> <amount>: Faz uma aposta
 * - action <roundId> <action>: Executa uma ação (hit, stand, double, surrender)
 * 
 * Exemplo:
 * node test-blackjack-socket.js "seu-token-jwt" join 1
 */

import { io } from 'socket.io-client';
import axios from 'axios';

// Configurações
const API_URL = 'http://localhost:3000'; // Ajuste conforme necessário

// Obter argumentos da linha de comando
const args = process.argv.slice(2);
const token = args[0];
const command = args[1];
const params = args.slice(2);

if (!token || !command) {
    console.log('Uso: node test-blackjack-socket.js <token> <comando> [parâmetros]');
    process.exit(1);
}

console.log('Iniciando teste de socket com token:', token.substring(0, 10) + '...');
console.log('Comando:', command);
console.log('Parâmetros:', params);

// Inicializar socket
const socket = io(API_URL, {
    path: '/blackjack/socket.io',
    auth: {
        token
    },
    transports: ['websocket', 'polling'], // Tenta websocket primeiro, mas permite fallback
    reconnection: true,
    reconnectionAttempts: 5,
    timeout: 20000,
    forceNew: true
});

// Adicionamos listener para todos os eventos para debug
socket.onAny((event, ...args) => {
    console.log(`[EVENT] ${event}`, args);
});

// Estado atual
let currentRoomId = null;
let currentRoundId = null;

// Configurar listeners de eventos
socket.on('connect', () => {
    console.log('✅ Conectado ao servidor de Blackjack');
    console.log(`ID do socket: ${socket.id}`);

    // Executar o comando após a conexão
    executeCommand();
});

socket.on('connect_error', (error) => {
    console.error('❌ Erro de conexão:', error.message);
    console.error('Detalhes:', error);
});

// Falha de transporte com detalhes
socket.io.on("error", (error) => {
    console.error('❌ Erro de transporte:', error);
});

socket.on('room joined', (data) => {
    console.log('📌 Entrou na sala:', data);
    currentRoomId = data.roomId;
});

socket.on('room details', (data) => {
    console.log('📋 Detalhes da sala:');
    console.log(`  ID: ${data.id}`);
    console.log(`  Status: ${data.status}`);
    console.log(`  Apostas: ${data.minBet} - ${data.maxBet}`);

    console.log('  Jogadores:');
    if (data.players && data.players.length > 0) {
        data.players.forEach(player => {
            console.log(`    - ${player.nickname} (Posição: ${player.position}, Saldo: ${player.balance})`);
        });
    } else {
        console.log('    Nenhum jogador na sala');
    }

    if (data.currentRound) {
        console.log('  Rodada atual:');
        console.log(`    ID: ${data.currentRound.id}`);
        console.log(`    Status: ${data.currentRound.status}`);
        currentRoundId = data.currentRound.id;

        if (data.currentRound.plays && data.currentRound.plays.length > 0) {
            console.log('    Jogadas:');
            data.currentRound.plays.forEach(play => {
                console.log(`      - ${play.nickname}: Aposta ${play.bet}, Status ${play.status}`);
                if (play.cards && play.cards.length > 0) {
                    const cardsStr = play.cards.map(card => `${card.value}${getSuitSymbol(card.suit)}`).join(' ');
                    console.log(`        Cartas: ${cardsStr} (${play.points} pontos)`);
                }
            });
        }
    }
});

socket.on('room created', (data) => {
    console.log('🏠 Sala criada:', data);
    currentRoomId = data.id;
});

socket.on('player joined', (data) => {
    console.log('👤 Jogador entrou:', data);
});

socket.on('player left', (data) => {
    console.log('👋 Jogador saiu:', data);
});

socket.on('round started', (data) => {
    console.log('🎮 Rodada iniciada:', data);
    currentRoundId = data.roundId;
});

socket.on('betting ended', (data) => {
    console.log('💰 Apostas encerradas:', data);
});

socket.on('cards dealt', (data) => {
    console.log('🃏 Cartas distribuídas:');
    console.log(`  Carta do dealer: ${data.dealerUpCard.value}${getSuitSymbol(data.dealerUpCard.suit)}`);

    console.log('  Jogadas:');
    data.plays.forEach(play => {
        console.log(`    - ${play.nickname}:`);
        if (play.cards && play.cards.length > 0) {
            const cardsStr = play.cards.map(card => `${card.value}${getSuitSymbol(card.suit)}`).join(' ');
            console.log(`      Cartas: ${cardsStr} (${play.points} pontos)`);
        }
    });

    if (data.activePlayer) {
        console.log(`  Vez do jogador: ${data.activePlayer.userId} (Posição: ${data.activePlayer.position})`);
    }
});

socket.on('player acted', (data) => {
    console.log('🎯 Jogador agiu:');
    console.log(`  Jogador: ${data.userId}`);
    console.log(`  Ação: ${data.action}`);
    if (data.cards && data.cards.length > 0) {
        const cardsStr = data.cards.map(card => `${card.value}${getSuitSymbol(card.suit)}`).join(' ');
        console.log(`  Cartas: ${cardsStr} (${data.points} pontos)`);
    }
});

socket.on('next player', (data) => {
    console.log('👉 Próximo jogador:', data);
});

socket.on('turn timeout', (data) => {
    console.log('⏰ Tempo esgotado para jogador:', data);
});

socket.on('round finished', (data) => {
    console.log('🏁 Rodada finalizada:');

    console.log('  Dealer:');
    if (data.dealerHand && data.dealerHand.length > 0) {
        const cardsStr = data.dealerHand.map(card => `${card.value}${getSuitSymbol(card.suit)}`).join(' ');
        console.log(`    Cartas: ${cardsStr} (${data.dealerPoints} pontos)`);
    }

    console.log('  Resultados:');
    data.plays.forEach(play => {
        console.log(`    - ${play.nickname}: ${play.result || 'Sem resultado'}`);
        if (play.cards && play.cards.length > 0) {
            const cardsStr = play.cards.map(card => `${card.value}${getSuitSymbol(card.suit)}`).join(' ');
            console.log(`      Cartas: ${cardsStr} (${play.points} pontos)`);
        }
    });
});

socket.on('error', (data) => {
    console.error('❌ Erro:', data.message);
});

// Função para executar o comando especificado
function executeCommand() {
    switch (command) {
        case 'connect':
            console.log('Aguardando eventos...');
            break;

        case 'list':
            listRooms();
            break;

        case 'create':
            createRoom();
            break;

        case 'join':
            if (params.length < 1) {
                console.error('❌ Erro: ID da sala não fornecido');
                socket.disconnect();
                return;
            }
            joinRoom(params[0]);
            break;

        case 'start':
            startRound();
            break;

        case 'bet':
            if (params.length < 2) {
                console.error('❌ Erro: Parâmetros insuficientes. Use: bet <roundId> <amount>');
                socket.disconnect();
                return;
            }
            placeBet(params[0], parseInt(params[1]));
            break;

        case 'action':
            if (params.length < 2) {
                console.error('❌ Erro: Parâmetros insuficientes. Use: action <roundId> <action>');
                socket.disconnect();
                return;
            }
            playerAction(params[0], params[1]);
            break;

        default:
            console.error(`❌ Comando desconhecido: ${command}`);
            socket.disconnect();
    }
}

// Funções auxiliares para os comandos
async function listRooms() {
    try {
        console.log('Listando salas via API...');
        const response = await axios.get(`${API_URL}/api/blackjack/rooms`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('📋 Lista de salas disponíveis:');
        response.data.rooms.forEach(room => {
            console.log(`  - Sala #${room.id}: ${room.playerCount}/${room.maxPlayers} jogadores, Apostas: ${room.minBet}-${room.maxBet}`);
        });

        setTimeout(() => {
            console.log('Desconectando...');
            socket.disconnect();
        }, 1000);
    } catch (error) {
        console.error('❌ Erro ao listar salas:', error.message);
        socket.disconnect();
    }
}

function createRoom() {
    console.log('🏠 Criando sala...');
    socket.emit('create room', { minBet: 100, maxBet: 1000 });
}

function joinRoom(roomId) {
    console.log(`🚪 Entrando na sala ${roomId}...`);
    socket.emit('join room', roomId);
}

function startRound() {
    console.log('🎮 Iniciando rodada...');
    socket.emit('start round');
}

function placeBet(roundId, betAmount) {
    console.log(`💰 Apostando ${betAmount} na rodada ${roundId}...`);
    socket.emit('place bet', { roundId, betAmount });
}

function playerAction(roundId, action) {
    console.log(`🎯 Executando ação ${action} na rodada ${roundId}...`);
    socket.emit('player action', { roundId, action });
}

// Função para obter símbolo do naipe
function getSuitSymbol(suit) {
    switch (suit) {
        case 'hearts': return '♥';
        case 'diamonds': return '♦';
        case 'clubs': return '♣';
        case 'spades': return '♠';
        default: return '?';
    }
}

// Manter o script rodando até a desconexão
process.on('SIGINT', () => {
    console.log('Encerrando teste...');
    socket.disconnect();
    process.exit(0);
});