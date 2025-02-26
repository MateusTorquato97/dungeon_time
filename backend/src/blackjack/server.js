import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import pkg from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';

import blackjackRoutes from './routes/blackjackRoutes.js';
import { BlackjackManager } from './services/blackjackManager.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling']
    },
    path: '/blackjack/socket.io'
});

const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const blackjackManager = new BlackjackManager(io, pool);

// Middleware de autenticação para Socket.IO
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        console.log('[Blackjack] Token não fornecido');
        return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('[Blackjack] Erro na verificação do token:', err.message);
            return next(new Error('Authentication error'));
        }
        socket.user = decoded;
        next();
    });
});

// Configurar rotas da API
app.use('/api/blackjack', blackjackRoutes);

// Configurar evento de conexão Socket.IO
io.on('connection', (socket) => {
    console.log(`[Blackjack] Usuário conectado: ${socket.id}`);

    // Associar o usuário conectado ao socket
    blackjackManager.registerUser(socket);

    // Evento de entrada em uma sala
    socket.on('join-room', (roomId) => {
        blackjackManager.joinRoom(socket, roomId);
    });

    // Evento de saída de uma sala
    socket.on('leave-room', (roomId) => {
        blackjackManager.leaveRoom(socket, roomId);
    });

    // Evento de aposta
    socket.on('place-bet', (data) => {
        blackjackManager.placeBet(socket, data.roomId, data.amount);
    });

    // Eventos de jogo
    socket.on('hit', (data) => {
        blackjackManager.playerHit(socket, data.roomId);
    });

    socket.on('stand', (data) => {
        blackjackManager.playerStand(socket, data.roomId);
    });

    socket.on('double', (data) => {
        blackjackManager.playerDouble(socket, data.roomId);
    });

    socket.on('surrender', (data) => {
        blackjackManager.playerSurrender(socket, data.roomId);
    });

    // Evento de desconexão
    socket.on('disconnect', () => {
        console.log(`[Blackjack] Usuário desconectado: ${socket.id}`);
        blackjackManager.handleDisconnect(socket);
    });
});

// Sistema de inatividade - verificação periódica
setInterval(() => {
    blackjackManager.checkInactivity();
}, 30000); // Verificar a cada 30 segundos

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`[Blackjack] Servidor rodando na porta ${PORT}`);
});