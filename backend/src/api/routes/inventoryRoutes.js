import { Router } from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { authenticateToken } from '../middlewares/auth.js';

dotenv.config();

const router = Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

router.get('/items', authenticateToken, async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                e.*,
                ie.id as inventory_id,
                ie.visualizado,
                CASE 
                    WHEN e.slot = 'elmo' AND pe.elmo_id = e.id THEN true
                    WHEN e.slot = 'armadura' AND pe.armadura_id = e.id THEN true
                    WHEN e.slot = 'colar' AND pe.colar_id = e.id THEN true
                    WHEN e.slot = 'anel' AND pe.anel_id = e.id THEN true
                    WHEN e.slot = 'calcas' AND pe.calcas_id = e.id THEN true
                    WHEN e.slot = 'luvas' AND pe.luvas_id = e.id THEN true
                    WHEN e.slot = 'botas' AND pe.botas_id = e.id THEN true
                    WHEN e.slot = 'arma' AND pe.arma_id = e.id THEN true
                    ELSE false
                END as equipped
            FROM inventario_equipamentos ie
            JOIN equipamentos e ON e.id = ie.equipamento_id
            LEFT JOIN personagem_equipamentos pe ON pe.usuario_id = ie.usuario_id
            WHERE ie.usuario_id = $1
        `, [req.user.id]);

        res.json({
            items: result.rows
        });
    } catch (error) {
        console.error('Erro ao buscar inventário:', error);
        res.status(500).json({ error: 'Erro ao buscar itens do inventário' });
    } finally {
        client.release();
    }
});

router.post('/mark-as-viewed', authenticateToken, async (req, res) => {
    const { itemIds } = req.body;
    const client = await pool.connect();

    try {
        await client.query(`
            UPDATE inventario_equipamentos 
            SET visualizado = TRUE 
            WHERE id = ANY($1) AND usuario_id = $2
        `, [itemIds, req.user.id]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar itens' });
    } finally {
        client.release();
    }
});

export default router;