import { Router } from 'express';
import { authenticateToken } from '../api/middlewares/auth.js';
import { blackjackService } from './services/blackjackService.js';

const router = Router();

// Listar salas disponíveis
router.get('/rooms', authenticateToken, async (req, res) => {
    try {
        const rooms = await blackjackService.getAvailableRooms();
        res.json({ rooms });
    } catch (error) {
        console.error('[Blackjack] Erro ao buscar salas:', error);
        res.status(500).json({ error: 'Erro ao buscar salas disponíveis' });
    }
});

// Criar uma nova sala
router.post('/rooms', authenticateToken, async (req, res) => {
    try {
        const { minBet = 100, maxBet = 1000 } = req.body;

        // Validar valores de aposta
        if (minBet <= 0 || maxBet <= 0 || minBet > maxBet) {
            return res.status(400).json({
                error: 'Valores de aposta inválidos. A aposta mínima deve ser menor que a máxima e ambas devem ser positivas.'
            });
        }

        const room = await blackjackService.createRoom(req.user.id, minBet, maxBet);
        res.status(201).json({ room });
    } catch (error) {
        console.error('[Blackjack] Erro ao criar sala:', error);
        res.status(500).json({ error: 'Erro ao criar sala' });
    }
});

// Obter detalhes de uma sala
router.get('/rooms/:roomId', authenticateToken, async (req, res) => {
    try {
        const room = await blackjackService.getRoomDetails(req.params.roomId);
        res.json({ room });
    } catch (error) {
        console.error('[Blackjack] Erro ao buscar detalhes da sala:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes da sala' });
    }
});

// Obter histórico de jogadas do usuário
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const history = await blackjackService.getUserHistory(req.user.id);
        res.json({ history });
    } catch (error) {
        console.error('[Blackjack] Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico de jogadas' });
    }
});

// Obter saldo atual do jogador em uma sala
router.get('/balance/:roomId', authenticateToken, async (req, res) => {
    try {
        const balance = await blackjackService.getPlayerBalance(req.user.id, req.params.roomId);
        res.json({ balance });
    } catch (error) {
        console.error('[Blackjack] Erro ao buscar saldo:', error);
        res.status(500).json({ error: 'Erro ao buscar saldo do jogador' });
    }
});

export default router;