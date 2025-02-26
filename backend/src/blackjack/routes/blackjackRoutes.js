import express from 'express';
import { authenticateToken } from '../../api/middlewares/auth.js';
import { BlackjackRoomService } from '../services/blackjackRoomService.js';

const router = express.Router();
const roomService = new BlackjackRoomService();

/**
 * @route GET /api/blackjack/rooms
 * @desc Listar todas as salas disponíveis de Blackjack
 * @access Privado
 */
router.get('/rooms', authenticateToken, async (req, res) => {
    try {
        const rooms = await roomService.getAvailableRooms();
        res.json(rooms);
    } catch (error) {
        console.error('[Blackjack] Erro ao listar salas:', error);
        res.status(500).json({ error: 'Erro ao buscar salas de Blackjack' });
    }
});

/**
 * @route GET /api/blackjack/rooms/:id
 * @desc Obter detalhes de uma sala específica
 * @access Privado
 */
router.get('/rooms/:id', authenticateToken, async (req, res) => {
    try {
        const room = await roomService.getRoomDetails(req.params.id);

        if (!room) {
            return res.status(404).json({ error: 'Sala não encontrada' });
        }

        res.json(room);
    } catch (error) {
        console.error('[Blackjack] Erro ao buscar detalhes da sala:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes da sala' });
    }
});

/**
 * @route POST /api/blackjack/rooms
 * @desc Criar uma nova sala de Blackjack
 * @access Privado
 */
router.post('/rooms', authenticateToken, async (req, res) => {
    try {
        const { minBet, maxBet } = req.body;

        if (!minBet || !maxBet) {
            return res.status(400).json({ error: 'Valores de aposta mínima e máxima são obrigatórios' });
        }

        if (minBet < 10 || maxBet > 10000 || minBet > maxBet) {
            return res.status(400).json({
                error: 'Valores de aposta inválidos. A aposta mínima deve ser maior que 10 e a máxima menor que 10.000'
            });
        }

        const newRoom = await roomService.createRoom(minBet, maxBet);
        res.status(201).json(newRoom);
    } catch (error) {
        console.error('[Blackjack] Erro ao criar sala:', error);
        res.status(500).json({ error: 'Erro ao criar sala de Blackjack' });
    }
});

/**
 * @route GET /api/blackjack/history
 * @desc Obter histórico de jogadas do usuário
 * @access Privado
 */
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const history = await roomService.getUserHistory(req.user.id);
        res.json(history);
    } catch (error) {
        console.error('[Blackjack] Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico de jogadas' });
    }
});

/**
 * @route GET /api/blackjack/balance
 * @desc Obter saldo atual do usuário
 * @access Privado
 */
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const balance = await roomService.getUserBalance(req.user.id);
        res.json({ balance });
    } catch (error) {
        console.error('[Blackjack] Erro ao buscar saldo:', error);
        res.status(500).json({ error: 'Erro ao buscar saldo do usuário' });
    }
});

export default router;