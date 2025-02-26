import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.js';
import { eloService } from '../../services/eloService.js'

const router = Router()

router.get('/top1', authenticateToken, async (req, res) => {
    try {
        const ranking = await eloService.getRanking()
        res.json(ranking)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.get('/:elo?', authenticateToken, async (req, res) => {
    try {
        const ranking = await eloService.getRankingByElo(req.params.elo)
        res.json(ranking)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})



export default router 