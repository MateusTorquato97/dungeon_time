// server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import pkg from 'pg';
const { Pool } = pkg;
import jwt from 'jsonwebtoken';

import authRoutes from './routes/authRoutes.js'; // ajuste o caminho conforme sua estrutura
import dungeonRoutes from './routes/dungeonRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js'; // Nova importação
import equipmentRoutes from './routes/equipmentRoutes.js'; // Nova importação
import characterRoutes from './routes/characterRoutes.js'; // Nova importação
import battleRoutes from './routes/battleRoutes.js';
import arenaRoutes from './routes/arenaRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';

const app = express();
app.use(express.json()); // necessário para interpretar JSON nos endpoints

const server = http.createServer(app);

// Configura o Socket.IO com CORS para aceitar conexões de outros domínios (ex: app Expo)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
        credentials: true
    },
    allowEIO3: true
});

// Configura o pool de conexões com o Postgres usando a string de conexão do .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Endpoint para testar a leitura do banco de dados
app.get('/test-db', async (req, res) => {
    try {
        // Consulta todos os registros da tabela "channels"
        const result = await pool.query('SELECT * FROM channels');
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao ler o banco de dados:', err);
        res.status(500).json({ error: err.message });
    }
});

// Monta as rotas de autenticação
app.use('/api/auth', authRoutes);
// Assim, os endpoints serão: POST /auth/signup e POST /auth/login

// Adicione esta linha junto com as outras rotas
app.use('/api/dungeons', dungeonRoutes);
app.use('/api/inventory', inventoryRoutes); // Nova rota
app.use('/api/equipment', equipmentRoutes); // Nova rota
app.use('/api/character', characterRoutes); // Nova rota
app.use('/api/battle', battleRoutes);
app.use('/api/arena', arenaRoutes);
app.use('/api/ranking', rankingRoutes);

// Middleware do Socket.IO para autenticação
io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        console.error('Erro na verificação do token:', err.message);
        next(new Error('Authentication error'));
    }
});

// Configuração do Socket.IO para comunicação em tempo real
io.on('connection', (socket) => {
    console.log(`Novo cliente conectado: ${socket.id}`);

    socket.on('join channel', async (channelId) => {
        const room = `channel_${channelId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} entrou na sala ${room}`);

        // Consulta as últimas 50 mensagens deste canal (ordem cronológica)
        try {
            const query = `
                SELECT m.*, u.nickname, u.nivel, u.role
                FROM messages m
                JOIN usuarios u ON m.sender_id = u.id
                WHERE m.channel_id = $1
                ORDER BY m.created_at DESC
                LIMIT 50
            `;
            const result = await pool.query(query, [channelId]);
            // Como os resultados vêm em ordem decrescente, inverta para ordem cronológica
            const previousMessages = result.rows.reverse();
            // Envie as mensagens anteriores somente para o socket que acabou de se conectar
            socket.emit('previous messages', previousMessages);
            console.log(`Enviadas ${previousMessages.length} mensagens anteriores para ${socket.id}`);
        } catch (err) {
            console.error('Erro ao buscar mensagens anteriores:', err);
        }
    });

    socket.on('chat message', async (data) => {
        console.log('Evento chat message recebido:', data);
        const { channel_id, sender_id, content } = data;
        try {
            const query = `
                WITH inserted AS (
                    INSERT INTO messages (channel_id, sender_id, content)
                    VALUES ($1, $2, $3)
                    RETURNING *
                )
                SELECT inserted.*, u.nickname, u.nivel, u.role
                FROM inserted
                JOIN usuarios u ON inserted.sender_id = u.id;
            `;
            const result = await pool.query(query, [channel_id, sender_id, content]);
            const message = result.rows[0];
            io.to(`channel_${channel_id}`).emit('chat message', message);
            console.log('Mensagem salva e emitida:', message);
        } catch (err) {
            console.error('Erro ao salvar mensagem:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});


// Inicia o servidor na porta definida na variável de ambiente ou 3000 por padrão
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`[API] Servidor rodando na porta ${PORT}`);
});
