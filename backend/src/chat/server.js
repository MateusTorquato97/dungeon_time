import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const CHANNEL_NAMES = {
    '1': 'CHAT',
    '2': 'TRADE'
};

// Middleware de autenticação para Socket.IO
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        console.log('Token não fornecido');
        return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('Erro na verificação do token:', err.message);
            return next(new Error('Authentication error'));
        }
        socket.user = decoded;
        next();
    });
});

// Handlers do Socket.IO
io.on('connection', (socket) => {
    console.log(`[Chat] Usuário conectado: ${socket.id}`);

    socket.on('join channel', async (channelId) => {
        socket.join(channelId);
        const channelName = CHANNEL_NAMES[channelId] || 'DESCONHECIDO';
        console.log(`[${channelName}] Usuário ${socket.id} entrou no canal ${channelId}`);

        try {
            const result = await pool.query(
                `SELECT m.*, u.nickname, p.nivel, u.role
                 FROM messages m
                 JOIN usuarios u ON m.sender_id = u.id
                 JOIN personagens p ON m.sender_id = p.usuario_id
                 WHERE m.channel_id = $1 
                 ORDER BY m.created_at DESC LIMIT 50`,
                [channelId]
            );
            socket.emit('previous messages', result.rows.reverse());
        } catch (error) {
            console.error(`[${channelName}] Erro ao carregar mensagens:`, error);
        }
    });

    socket.on('chat message', async (data) => {
        try {
            const query = `
                WITH inserted AS (
                    INSERT INTO messages (channel_id, sender_id, content)
                    VALUES ($1, $2, $3)
                    RETURNING *
                )
                SELECT i.*, u.nickname, p.nivel, u.role
                FROM inserted i
                JOIN usuarios u ON i.sender_id = u.id
                JOIN personagens p ON i.sender_id = p.usuario_id;
            `;
            const result = await pool.query(query, [data.channel_id, data.sender_id, data.content]);
            io.to(data.channel_id).emit('chat message', result.rows[0]);
        } catch (error) {
            console.error('[Chat] Erro ao salvar mensagem:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Chat] Usuário desconectado: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`[Chat] Servidor rodando na porta ${PORT}`);
}); 