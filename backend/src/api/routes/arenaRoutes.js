import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { combatService } from '../../services/combatService.js';
import { arenaService } from '../../services/arenaService.js';

const router = Router();

// Buscar jogadores disponíveis para batalha
router.get('/players', authenticateToken, async (req, res) => {
    try {
        const players = await arenaService.getAvailablePlayers(req.user.id);
        res.json({ players });
    } catch (error) {
        console.error('Erro ao buscar jogadores:', error);
        res.status(500).json({ error: 'Erro ao buscar jogadores disponíveis' });
    }
});

// Buscar número de batalhas diárias restantes
router.get('/daily-battles', authenticateToken, async (req, res) => {
    try {
        const battles = await arenaService.getDailyBattles(req.user.id);
        res.json(battles);
    } catch (error) {
        console.error('Erro ao buscar batalhas diárias:', error);
        res.status(500).json({ error: 'Erro ao buscar batalhas diárias' });
    }
});

router.get('/history', authenticateToken, async (req, res) => {
    try {
        const history = await arenaService.getBattleHistory(req.user.id);
        res.json(history);
    } catch (error) {
        console.error('Erro ao buscar histórico de batalhas:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico de batalhas' });
    }
});

// Iniciar uma batalha na arena
router.post('/battle', authenticateToken, async (req, res) => {
    const { oponentId } = req.body;
    try {
        // Verifica batalhas diárias
        const dailyBattles = await arenaService.getDailyBattles(req.user.id);
        if (dailyBattles.remainingBattles <= 0) {
            return res.status(400).json({ error: 'Limite de batalhas diárias atingido' });
        }

        // Cria uma batalha 1v1
        const participantes = [
            { usuarioId: req.user.id, time: 1, posicao: 1 },
            { usuarioId: oponentId, time: 2, posicao: 1 }
        ];

        const batalhaId = await combatService.iniciarBatalha('1v1', participantes);
        let statusBatalha = await combatService.getBatalhaStatus(batalhaId);

        // Define a ordem de iniciativa na primeira rodada: cada participante "roda" com influência da sorte
        let iniciativa = statusBatalha.participantes.map(p => {
            const roll = Math.random() + ((p.sorte || 0) * 0.01);
            return { ...p, roll };
        });
        iniciativa.sort((a, b) => b.roll - a.roll);

        const MAX_TURNOS = 100;
        let turno = 1;

        // Loop da batalha até que um time seja derrotado ou atinja 100 turnos
        while (!statusBatalha.vencedor && turno <= MAX_TURNOS) {
            // Itera pela ordem de iniciativa
            for (const participante of iniciativa) {
                // Atualiza o status da batalha para ter os dados mais recentes
                statusBatalha = await combatService.getBatalhaStatus(batalhaId);
                const participanteAtual = statusBatalha.participantes.find(p => p.usuario_id === participante.usuario_id);
                if (!participanteAtual || participanteAtual.status !== 'vivo') continue;

                // Exemplo de definição de ação:
                // Dentro do loop da batalha, em arenaRoutes.js
                let acao;
                const alvo = statusBatalha.participantes.find(p => p.time !== participanteAtual.time && p.status === 'vivo');
                if (!alvo) break;

                const CHANCE_BASE_HABILIDADE = 0.15;
                const BONUS_SORTE_HABILIDADE = 0.0005;
                const chanceHabilidade = CHANCE_BASE_HABILIDADE + (participanteAtual.sorte * BONUS_SORTE_HABILIDADE);
                const usarHabilidade = Math.random() < chanceHabilidade;

                if (usarHabilidade) {
                    // Busca as habilidades disponíveis para o personagem
                    const habilidades = await combatService.getPersonagemHabilidades(participanteAtual.usuario_id);
                    if (habilidades.length > 0) {
                        // Seleciona aleatoriamente uma habilidade
                        const habilidadeEscolhida = habilidades[Math.floor(Math.random() * habilidades.length)];
                        acao = {
                            tipo: 'habilidade',
                            usuarioId: participanteAtual.usuario_id,
                            alvoId: alvo.usuario_id,
                            habilidadeId: habilidadeEscolhida.id,
                            turno
                        };
                    } else {
                        // Se não houver habilidades, faz o ataque básico
                        acao = {
                            tipo: 'ataque',
                            usuarioId: participanteAtual.usuario_id,
                            alvoId: alvo.usuario_id,
                            turno
                        };
                    }
                } else {
                    acao = {
                        tipo: 'ataque',
                        usuarioId: participanteAtual.usuario_id,
                        alvoId: alvo.usuario_id,
                        turno
                    };
                }

                // Processa a ação
                statusBatalha = await combatService.processarAcaoTurno(batalhaId, turno, acao);
                if (statusBatalha.vencedor) break;

                // Chance de ataque duplo baseado na sorte: base 5% + bônus leve
                const chanceAtaqueDuplo = 0.05 + ((participanteAtual.sorte || 0) * 0.001);
                if (Math.random() < chanceAtaqueDuplo) {
                    let acaoExtra;
                    if (participanteAtual.time === 1) {
                        const alvo = statusBatalha.participantes.find(p => p.time === 2 && p.status === 'vivo');
                        if (!alvo) break;
                        acaoExtra = {
                            tipo: 'ataque',
                            usuarioId: participanteAtual.usuario_id,
                            alvoId: alvo.usuario_id,
                            turno
                        };
                    } else {
                        const alvo = statusBatalha.participantes.find(p => p.time === 1 && p.status === 'vivo');
                        if (!alvo) break;
                        acaoExtra = {
                            tipo: 'habilidade',
                            usuarioId: participanteAtual.usuario_id,
                            alvoId: alvo.usuario_id,
                            habilidadeId: 1,
                            turno
                        };
                    }
                    statusBatalha = await combatService.processarAcaoTurno(batalhaId, turno, acaoExtra);
                    if (statusBatalha.vencedor) break;
                }
            }
            if (statusBatalha.vencedor) break;
            turno++;
        }

        // Diminui o número de batalhas diárias restantes
        await arenaService.decrementDailyBattles(req.user.id);

        res.json({
            message: 'Batalha de teste concluída',
            batalhaId,
            resultado: statusBatalha
        });
    } catch (error) {
        console.error('Erro na batalha de teste:', error);
        res.status(500).json({ error: 'Erro ao executar batalha de teste' });
    }
});

router.get('/battle/:id', authenticateToken, async (req, res) => {
    const batalhaId = req.params.id;
    console.log('Requisição para detalhes da batalha:', req);
    console.log('Entrou no endpoint de detalhes da batalha:', batalhaId);
    try {
        const statusBatalha = await combatService.getBatalhaStatus(batalhaId);

        // Formata os dados para o frontend
        const battleDetails = {
            id: batalhaId,
            status: statusBatalha.status,
            winner: statusBatalha.vencedor_id,
            player1: {
                id: statusBatalha.participantes[0].usuario_id,
                nickname: statusBatalha.participantes[0].nickname,
                currentHealth: statusBatalha.participantes[0].vida_base,
                maxHealth: statusBatalha.participantes[0].vida_base,
                classIcon: statusBatalha.participantes[0].classe?.toLowerCase() || 'user',
                skinPath: statusBatalha.participantes[0].skin_path || `default/${statusBatalha.participantes[0].classe}`
            },
            player2: {
                id: statusBatalha.participantes[1].usuario_id,
                nickname: statusBatalha.participantes[1].nickname,
                currentHealth: statusBatalha.participantes[1].vida_base,
                maxHealth: statusBatalha.participantes[1].vida_base,
                classIcon: statusBatalha.participantes[1].classe?.toLowerCase() || 'user',
                skinPath: statusBatalha.participantes[1].skin_path || `default/${statusBatalha.participantes[1].classe}`
            },
            logs: statusBatalha.logs.map((log, index) => ({
                turn: log.turno,
                attacker: log.usuario_origem,
                target: log.usuario_alvo,
                damage: log.dano,
                heal: log.cura,
                effects: log.efeitos,
                message: statusBatalha.logsText[index],
                newHealth: log.vida_alvo_pos_acao
            }))
        };

        res.json(battleDetails);
    } catch (error) {
        console.error('Erro ao buscar detalhes da batalha:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes da batalha' });
    }
});

export default router;
