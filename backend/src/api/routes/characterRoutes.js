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

router.get('/attributes', authenticateToken, async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
            p.forca,
            p.destreza,
            p.inteligencia,
            p.vitalidade,
            p.defesa,
            p.sorte,
            p.classe,
            p.nivel,
            p.vida,
            p.mana,
            p.xp_atual,
            p.prox_xp,
            COALESCE(s.caminho_imagem, CONCAT('default/', p.classe)) as skin_path
        FROM personagens p
        LEFT JOIN personagem_skins ps ON ps.usuario_id = p.usuario_id AND ps.equipada = true
        LEFT JOIN skins s ON s.id = ps.skin_id
        WHERE p.usuario_id = $1
        `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Personagem não encontrado'
            });
        }

        res.json({
            success: true,
            attributes: result.rows[0]
        });
    } catch (error) {
        console.error('Erro detalhado ao buscar atributos:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar atributos do personagem'
        });
    } finally {
        client.release();
    }
});

export default router; 