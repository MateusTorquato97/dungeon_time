import { Router } from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { authenticateToken } from '../middlewares/auth.js';
import { experienceService } from '../../services/experienceService.js';

dotenv.config();

const router = Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Rota para listar dungeons disponíveis
router.get('/available', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tipos_dungeon ORDER BY nivel_minimo');
        res.json(result.rows);
    } catch (error) {
        console.error('[Dungeon] Erro ao buscar dungeons:', error);
        res.status(500).json({ error: 'Erro ao buscar dungeons' });
    }
});

// Rota para listar dungeons ativas do usuário
router.get('/active', authenticateToken, async (req, res) => {
    try {
        const query = `
            SELECT d.* 
            FROM dungeons d
            JOIN tipos_dungeon td ON d.tipo_dungeon_id = td.id
            WHERE d.usuario_id = $1 
            AND d.status IN ('em_progresso', 'aguardando_recompensa')
            ORDER BY d.iniciada_em DESC
        `;
        const result = await pool.query(query, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar dungeons ativas:', err);
        res.status(500).json({ error: 'Erro ao buscar dungeons ativas' });
    }
});

// Rota para retornar o horário do servidor
router.get('/time', authenticateToken, async (req, res) => {
    res.json({ serverTime: new Date().toISOString() });
});

// Rota para iniciar uma dungeon
router.post('/start', authenticateToken, async (req, res) => {
    const { tipo_dungeon_id } = req.body;
    const usuario_id = req.user.id;

    try {
        // Verifica se o usuário já tem uma dungeon ativa ou aguardando recompensa do mesmo tipo
        const checkActive = await pool.query(
            `SELECT * FROM dungeons 
             WHERE usuario_id = $1 
             AND tipo_dungeon_id = $2 
             AND status IN ('em_progresso', 'aguardando_recompensa')`,
            [usuario_id, tipo_dungeon_id]
        );

        if (checkActive.rows.length > 0) {
            return res.status(400).json({ error: 'Você já tem uma dungeon deste tipo em andamento ou aguardando recompensa' });
        }

        // Inicia uma nova dungeon com data de finalização calculada usando CURRENT_TIMESTAMP padrão
        const result = await pool.query(
            `INSERT INTO dungeons 
                (usuario_id, tipo_dungeon_id, status, iniciada_em, finalizada_em)
             VALUES 
                ($1, $2, 'em_progresso', 
                 CURRENT_TIMESTAMP, 
                 CURRENT_TIMESTAMP + ((SELECT tempo_espera FROM tipos_dungeon WHERE id = $2) || ' minutes')::interval)
             RETURNING *`,
            [usuario_id, tipo_dungeon_id]
        );

        // Busca informações completas da dungeon
        const dungeonInfo = await pool.query(
            `SELECT d.*, td.* 
             FROM dungeons d
             JOIN tipos_dungeon td ON d.tipo_dungeon_id = td.id
             WHERE d.id = $1`,
            [result.rows[0].id]
        );

        res.status(201).json(dungeonInfo.rows[0]);
    } catch (err) {
        console.error('Erro ao iniciar dungeon:', err);
        res.status(500).json({ error: 'Erro ao iniciar dungeon' });
    }
});

// Rota para finalizar uma dungeon
router.post('/finish/:dungeonId', authenticateToken, async (req, res) => {
    const { dungeonId } = req.params;

    try {
        // Verifica se a dungeon existe e pertence ao usuário
        const dungeon = await pool.query(
            'SELECT * FROM dungeons WHERE id = $1 AND usuario_id = $2',
            [dungeonId, req.user.id]
        );

        if (dungeon.rows.length === 0) {
            return res.status(404).json({ error: 'Dungeon não encontrada' });
        }

        // Atualiza o status da dungeon
        const result = await pool.query(
            `UPDATE dungeons 
             SET status = 'finalizada', finalizada_em = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [dungeonId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao finalizar dungeon:', err);
        res.status(500).json({ error: 'Erro ao finalizar dungeon' });
    }
});

// dungeonRoutes.js (rota /collect-rewards/:dungeonId)
router.post('/collect-rewards/:dungeonId', authenticateToken, async (req, res) => {
    const { dungeonId } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verifica se a dungeon existe e está aguardando recompensa
        const dungeon = await client.query(
            `SELECT d.* FROM dungeons d 
             WHERE d.id = $1 AND d.usuario_id = $2 AND d.status = 'aguardando_recompensa'`,
            [dungeonId, req.user.id]
        );

        if (dungeon.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Dungeon não encontrada ou já finalizada' });
        }

        // Atualiza as recompensas, marcando-as como coletadas, e retorna os dados do equipamento
        const rewards = await client.query(
            `UPDATE dungeon_recompensas dr
             SET coletado = true
             FROM equipamentos e
             WHERE dr.dungeon_id = $1
               AND dr.coletado = false
               AND e.id = dr.equipamento_id
             RETURNING json_build_object(
                 'id', e.id,
                 'nome', e.nome,
                 'tipo', e.tipo,
                 'nivel', e.nivel,
                 'raridade', e.raridade,
                 'forca', e.forca,
                 'destreza', e.destreza,
                 'inteligencia', e.inteligencia,
                 'vitalidade', e.vitalidade,
                 'defesa', e.defesa,
                 'sorte', e.sorte,
                 'slot', e.slot,
                 'forca_raridade', e.forca_raridade,
                 'destreza_raridade', e.destreza_raridade,
                 'inteligencia_raridade', e.inteligencia_raridade,
                 'vitalidade_raridade', e.vitalidade_raridade,
                 'defesa_raridade', e.defesa_raridade,
                 'sorte_raridade', e.sorte_raridade
             ) AS item,
             e.id as equipamento_id;`,
            [dungeonId]
        );

        // Para cada recompensa coletada, insere o item no inventário do usuário.
        // Se o item já existir, atualiza a quantidade.
        for (const reward of rewards.rows) {
            await client.query(`
                INSERT INTO inventario_equipamentos (usuario_id, equipamento_id, visualizado) 
                VALUES ($1, $2, FALSE);
            `, [req.user.id, reward.equipamento_id]);
        }

        // Atualiza o status da dungeon para 'finalizada'
        await client.query(
            `UPDATE dungeons 
             SET status = 'finalizada' 
             WHERE id = $1`,
            [dungeonId]
        );

        const dungeonType = await client.query(
            'SELECT xp_recompensa FROM tipos_dungeon WHERE id = $1',
            [dungeon.rows[0].tipo_dungeon_id]
        );

        const xpGanho = dungeonType.rows[0].xp_recompensa;
        const resultadoXP = await experienceService.adicionarXP(req.user.id, xpGanho);

        await client.query('COMMIT');

        res.json({
            message: 'Recompensas coletadas com sucesso',
            rewards: rewards.rows.map(row => row.item),
            experiencia: {
                xpGanho,
                nivel: resultadoXP.nivel,
                xp_atual: resultadoXP.xp_atual,
                prox_xp: resultadoXP.prox_xp,
                subiuDeNivel: resultadoXP.subiuDeNivel,
                atributosGanhos: resultadoXP.atributosGanhos
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Erro ao coletar recompensas' });
    } finally {
        client.release();
    }
});

router.get('/pending-rewards', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT COUNT(*) > 0 as has_pending
            FROM dungeons 
            WHERE usuario_id = $1 
            AND status = 'aguardando_recompensa'
        `, [req.user.id]);

        res.json({
            hasPendingRewards: result.rows[0].has_pending === true
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao verificar recompensas pendentes' });
    } finally {
        client.release();
    }
});

router.post('/inventory/mark-as-viewed', authenticateToken, async (req, res) => {
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
