import { Router } from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

import { authenticateToken } from '../middlewares/auth.js';

const router = Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Rota para equipar/desequipar item
router.post('/equip', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    const { itemId, equip } = req.body;

    try {
        await client.query('BEGIN');

        // Busca informações do item
        const itemResult = await client.query(
            'SELECT * FROM equipamentos WHERE id = $1',
            [itemId]
        );
        const item = itemResult.rows[0];

        if (!item) {
            throw new Error('Item não encontrado');
        }

        if (equip) {
            // Primeiro, verifica se já existe registro para o usuário
            const existingRecord = await client.query(
                'SELECT * FROM personagem_equipamentos WHERE usuario_id = $1',
                [req.user.id]
            );

            if (existingRecord.rows.length === 0) {
                // Se não existe, cria um novo registro
                await client.query(`
                    INSERT INTO personagem_equipamentos (
                        usuario_id, ${item.slot}_id
                    ) VALUES ($1, $2)
                `, [req.user.id, itemId]);
            } else {
                // Se existe, atualiza o slot específico
                await client.query(`
                    UPDATE personagem_equipamentos 
                    SET ${item.slot}_id = $2,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE usuario_id = $1
                `, [req.user.id, itemId]);
            }
        } else {
            // Desequipando item
            await client.query(`
                UPDATE personagem_equipamentos 
                SET ${item.slot}_id = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE usuario_id = $1
            `, [req.user.id]);
        }

        await client.query('COMMIT');
        res.json({
            success: true,
            message: equip ? 'Item equipado com sucesso' : 'Item desequipado com sucesso'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// Rota para buscar itens equipados
router.get('/equipped', authenticateToken, async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                e.id as equipamento_id,
                e.nome,
                e.slot,
                e.raridade,
                e.forca,
                e.destreza,
                e.inteligencia,
                e.vitalidade,
                e.defesa,
                e.sorte,
                e.forca_raridade,
                e.destreza_raridade,
                e.inteligencia_raridade,
                e.vitalidade_raridade,
                e.defesa_raridade,
                e.sorte_raridade
            FROM personagem_equipamentos pe
            LEFT JOIN equipamentos e ON 
                e.id = pe.elmo_id OR
                e.id = pe.armadura_id OR
                e.id = pe.colar_id OR
                e.id = pe.anel_id OR
                e.id = pe.calcas_id OR
                e.id = pe.luvas_id OR
                e.id = pe.botas_id OR
                e.id = pe.arma_id
            WHERE pe.usuario_id = $1
            AND e.id IS NOT NULL
        `, [req.user.id]);

        res.json({ equippedItems: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

export default router; 