// battleRoutes.js
import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { combatService } from '../../services/combatService.js';
import { arenaService } from '../../services/arenaService.js';
import { combatTesteService } from '../../services/combatTesteService.js';

const router = Router();

router.post('/teste', authenticateToken, async (req, res) => {
    const { oponentId } = req.body;
    try {
        // Verifica batalhas diárias
        /*
        const dailyBattles = await arenaService.getDailyBattles(req.user.id);
        if (dailyBattles.remainingBattles <= 0) {
            return res.status(400).json({ error: 'Limite de batalhas diárias atingido' });
        }
        */

        // Cria uma batalha 1v1
        const participantes = [
            { usuarioId: req.user.id, time: 1, posicao: 1 },
            { usuarioId: oponentId, time: 2, posicao: 1 }
        ];

        const batalhaId = await combatTesteService.iniciarBatalha('1v1', participantes);
        let statusBatalha = await combatTesteService.getBatalhaStatusSemClient(batalhaId);

        // Define a ordem de iniciativa na primeira rodada: cada participante "roda" com influência da sorte
        let iniciativa = statusBatalha.participantes.map(p => {
            const roll = Math.random() + ((p.sorte || 0) * 0.01);
            return { ...p, roll };
        });
        iniciativa.sort((a, b) => b.roll - a.roll);

        const MAX_TURNOS = 100;
        let turno = 1;

        while (!statusBatalha.vencedor && turno <= MAX_TURNOS) {
            for (const participante of iniciativa) {
                statusBatalha = await combatTesteService.getBatalhaStatusSemClient(batalhaId);
                const participanteAtual = statusBatalha.participantes.find(p => p.usuario_id === participante.usuario_id);
                if (!participanteAtual || participanteAtual.status !== 'vivo') continue;

                let acao;
                const alvo = statusBatalha.participantes.find(p => p.time !== participanteAtual.time && p.status === 'vivo');
                if (!alvo) break;

                const efeitosAtivos = await combatTesteService.getEfeitosAtivos(participanteAtual.participante_id, batalhaId);
                if (efeitosAtivos.length > 0) {
                    const resultadoProcessamento = await combatTesteService.processarEfeitosAtivos(batalhaId, participanteAtual.usuario_id, turno, efeitosAtivos);
                    if (resultadoProcessamento === 'atordoado') {
                        await combatTesteService.processarEfeitosSemClient(batalhaId, participanteAtual.usuario_id);
                        continue;
                    }

                    statusBatalha = await combatTesteService.getBatalhaStatusSemClient(batalhaId);
                    if (statusBatalha.vencedor) break;
                }

                const CHANCE_BASE_HABILIDADE = 0.15;
                const BONUS_SORTE_HABILIDADE = 0.0005;
                const chanceHabilidade = CHANCE_BASE_HABILIDADE + (participanteAtual.sorte * BONUS_SORTE_HABILIDADE);
                const usarHabilidade = Math.random() < chanceHabilidade;

                if (usarHabilidade) {
                    let habilidadesDisponiveis = await combatTesteService.getPersonagemHabilidades(participanteAtual.usuario_id);
                    if (habilidadesDisponiveis.length > 0) {
                        const efeitosAtivos = await combatTesteService.getEfeitosAtivos(alvo.participante_id, batalhaId);
                        if (efeitosAtivos.length > 0) {
                            habilidadesDisponiveis = habilidadesDisponiveis.filter(habilidade => {
                                return !efeitosAtivos.some(efeito =>
                                    efeito.origem_habilidade_id === habilidade.id
                                );
                            });
                        }

                        if (habilidadesDisponiveis.length > 0) {
                            const habilidadeEscolhida = habilidadesDisponiveis[Math.floor(Math.random() * habilidadesDisponiveis.length)];
                            acao = {
                                tipo: 'habilidade',
                                usuarioId: participanteAtual.usuario_id,
                                alvoId: alvo.usuario_id,
                                habilidadeId: habilidadeEscolhida.id,
                                turno
                            };
                        } else {
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
                } else {
                    acao = {
                        tipo: 'ataque',
                        usuarioId: participanteAtual.usuario_id,
                        alvoId: alvo.usuario_id,
                        turno
                    };
                }

                statusBatalha = await combatTesteService.processarAcaoTurno(batalhaId, turno, acao);
                if (statusBatalha.vencedor) break;
            }
            if (statusBatalha.vencedor) break;
            turno++;
        }

        // Mostra o resultado da batalha no console
        console.log('Batalha de ID ', batalhaId, 'foi finalizada com o vencedor: ', statusBatalha.vencedor_id, 'em ', turno, 'turnos');

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

export default router;