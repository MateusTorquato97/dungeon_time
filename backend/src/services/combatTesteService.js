import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { eloService } from './eloService.js';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

class CombatTesteService {
    // Inicia uma nova batalha e insere os participantes com seus valores base de vida e mana
    async iniciarBatalha(tipo, participantes) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const batalhaResult = await client.query(
                `INSERT INTO batalhas (tipo, status)
                 VALUES ($1, 'em_progresso')
                 RETURNING id`,
                [tipo]
            );
            const batalhaId = batalhaResult.rows[0].id;

            const time1Result = await client.query(
                `INSERT INTO times_batalha (batalha_id, numero_time)
                 VALUES ($1, 1)
                 RETURNING id`,
                [batalhaId]
            );
            const time2Result = await client.query(
                `INSERT INTO times_batalha (batalha_id, numero_time)
                 VALUES ($1, 2)
                 RETURNING id`,
                [batalhaId]
            );

            for (const participante of participantes) {
                const timeId = participante.time === 1 ? time1Result.rows[0].id : time2Result.rows[0].id;
                const personagemResult = await client.query(
                    `SELECT vida, mana, sorte FROM personagens WHERE usuario_id = $1`,
                    [participante.usuarioId]
                );
                const personagem = personagemResult.rows[0];

                await client.query(
                    `INSERT INTO participantes_batalha 
                     (time_id, usuario_id, posicao, vida_atual, mana_atual, vida_base, mana_base, status)
                     VALUES ($1, $2, $3, $4, $5, $4, $5, 'vivo')`,
                    [
                        timeId,
                        participante.usuarioId,
                        participante.posicao,
                        personagem.vida,
                        personagem.mana
                    ]
                );
            }

            await client.query('COMMIT');
            return batalhaId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Processa uma ação em um turno, incluindo efeitos e verificação de vitória
    async processarAcaoTurno(batalhaId, turno, acao) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insere o log e captura o ID
            const logResult = await client.query(
                `INSERT INTO logs_batalha 
                 (batalha_id, turno, tipo_acao, usuario_origem, usuario_alvo, habilidade_id, dano, cura, efeitos, vez_usuario_id)
                 VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7, $8)
                 RETURNING *`,
                [
                    batalhaId,
                    turno,
                    acao.tipo,
                    acao.usuarioId,
                    acao.alvoId,
                    acao.habilidadeId,
                    JSON.stringify({}),
                    acao.usuarioId
                ]
            );
            const logId = logResult.rows[0].id;

            // Processa a ação – repassando o logId
            await this.processarAcao(client, batalhaId, turno, acao, logId);

            // Verifica se houve vitória
            const vencedor = await this.verificarVitoria(client, batalhaId);
            if (vencedor) {
                await this.finalizarBatalha(client, batalhaId, vencedor);
            }

            // Atualiza o log com a vida atual do alvo
            const alvoAtual = await this.getParticipante(client, batalhaId, acao.alvoId);
            await client.query(
                `UPDATE logs_batalha SET vida_alvo_pos_acao = $1 WHERE id = $2 RETURNING *`,
                [alvoAtual.vida_atual, logId]
            );

            await client.query('COMMIT');
            return await this.getBatalhaStatus(client, batalhaId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Processa uma ação individual (ataque ou habilidade)
    async processarAcao(client, batalhaId, turno, acao, logId) {
        const participante = await this.getParticipante(client, batalhaId, acao.usuarioId);
        if (participante.status !== 'vivo') {
            throw new Error('Personagem não pode realizar ações');
        }

        let dano = 0;
        let cura = 0;
        let efeitos = {};

        if (acao.tipo === 'habilidade') {
            const resultado = await this.processarHabilidade(client, participante, acao, batalhaId);
            dano = resultado.dano;
            cura = resultado.cura;
            efeitos = resultado.efeitos;
        } else if (acao.tipo === 'ataque') {
            const resultado = await this.calcularDanoBasico(client, batalhaId, participante, acao);
            if (resultado.dano > 0) {
                dano = resultado.dano;
                efeitos.critico = resultado.critico;
            }
        }

        // Atualiza o log usando diretamente o logId inserido
        await client.query(
            `UPDATE logs_batalha 
            SET dano = $1, cura = $2, efeitos = $3
            WHERE id = $4`,
            [dano, cura, JSON.stringify(efeitos), logId]
        );

        // Aplica o dano no alvo
        if (dano > 0) {
            await this.atualizarStatusParticipante(client, batalhaId, acao.alvoId, dano, 0);
        }
        // Aplica a cura no usuário que usou a habilidade
        if (cura > 0) {
            await this.atualizarStatusParticipante(client, batalhaId, acao.usuarioId, 0, cura);
        }

        // Commit parcial para garantir que os efeitos foram salvos
        await client.query('COMMIT');
        await client.query('BEGIN');
    }

    // Calcula dano básico com variação aleatória, chance de esquiva e chance de crítico.
    // Agora retorna um objeto: { dano, critico }
    async calcularDanoBasico(client, batalhaId, atacante, acao) {
        // Recupera atributos do atacante
        const atacanteStats = await client.query(
            `SELECT p.*, pe.arma_id 
             FROM personagens p 
             LEFT JOIN personagem_equipamentos pe ON p.usuario_id = pe.usuario_id 
             WHERE p.usuario_id = $1`,
            [atacante.usuario_id]
        );
        const atk = atacanteStats.rows[0];

        // Recupera atributos do defensor
        const defensorStats = await client.query(
            `SELECT p.*, pe.armadura_id 
             FROM personagens p 
             LEFT JOIN personagem_equipamentos pe ON p.usuario_id = pe.usuario_id 
             WHERE p.usuario_id = $1`,
            [acao.alvoId]
        );
        const def = defensorStats.rows[0];

        // Calcula dano base dependendo da classe do atacante
        let danoBase;
        switch (atk.classe) {
            case 'guerreiro':
            case 'paladino':
            case 'cavaleiro':
                danoBase = atk.forca * 2;
                break;
            case 'mago':
            case 'clerigo':
                danoBase = atk.inteligencia * 2;
                break;
            case 'ladino':
            case 'cacador':
            case 'mercenario':
                danoBase = atk.destreza * 2;
                break;
            default:
                danoBase = atk.forca * 1.5;
        }

        // Acrescenta bônus de equipamento, se houver
        if (atk.arma_id) {
            const armaStats = await client.query('SELECT * FROM equipamentos WHERE id = $1', [atk.arma_id]);
            const arma = armaStats.rows[0];
            danoBase += (arma.forca || 0) + (arma.destreza || 0) + (arma.inteligencia || 0);
        }

        // Calcula redução de dano baseada na defesa do defensor
        let reducaoDano = def.defesa;
        if (def.armadura_id) {
            const armaduraStats = await client.query('SELECT * FROM equipamentos WHERE id = $1', [def.armadura_id]);
            const armadura = armaduraStats.rows[0];
            reducaoDano += armadura.defesa || 0;
        }

        // Verifica se o defensor tem efeito de buff de defesa ativo
        const efeitosDefensor = await client.query(
            `SELECT * FROM efeitos_batalha WHERE participante_id = $1 AND tipo_efeito = 'buff_defesa'`,
            [acao.alvoId]
        );
        if (efeitosDefensor.rows.length > 0) {
            const buffDefesa = efeitosDefensor.rows[0];
            // Aumenta em porcentagem a redução de dano
            reducaoDano += reducaoDano * (buffDefesa.valor / 100);
        }

        // Nova implementação com bônus de defesa alta
        const FATOR_ESCALA = 0.75;
        const LIMIAR_DEFESA_ALTA = 1.5; // 50% maior que o dano base
        const BONUS_DEFESA_ALTA = 0.15; // 15% de redução adicional

        const razaoDefAtk = reducaoDano / danoBase;
        let reducao = Math.min(0.75, razaoDefAtk * FATOR_ESCALA);

        // Aplica bônus se a defesa for significativamente maior
        if (razaoDefAtk > LIMIAR_DEFESA_ALTA) {
            // Calcula um bônus proporcional ao quanto a defesa excede o limiar
            const excesso = razaoDefAtk - LIMIAR_DEFESA_ALTA;
            const bonusAdicional = Math.min(BONUS_DEFESA_ALTA, excesso * BONUS_DEFESA_ALTA);
            reducao = Math.min(0.85, reducao + bonusAdicional); // Permite ultrapassar o limite de 75% até 85%
        }

        let danoFinal = Math.floor(danoBase * (1 - reducao));

        // Aplica variação aleatória de ±10%
        const variacao = (Math.random() * 0.2) - 0.1;
        danoFinal = Math.floor(danoFinal * (1 + variacao));

        // Verifica a chance de esquiva baseada na destreza do defensor
        const destrezaResult = await client.query(
            `SELECT p.destreza FROM personagens p WHERE p.usuario_id = $1`,
            [acao.alvoId]
        );
        const destrezaDefensor = destrezaResult.rows[0].destreza || 10;
        // Exemplo: para cada 10 pontos de destreza, 5% de chance de esquivar
        const chanceEsquiva = (destrezaDefensor / 10) * 0.05;
        if (Math.random() < chanceEsquiva) {
            // O defensor esquivou, não causando dano
            return { dano: 0, critico: false };
        }

        // Chance de acerto crítico baseada na sorte do atacante
        const chanceBaseCritico = 0.05;
        const sorteResult = await client.query(
            `SELECT p.sorte FROM personagens p WHERE p.usuario_id = $1`,
            [atacante.usuario_id]
        );
        const chanceCritico = chanceBaseCritico + (sorteResult.rows[0].sorte / 1000);
        let critico = false;
        if (Math.random() < chanceCritico) {
            critico = true;
            danoFinal = Math.floor(danoFinal * 1.5);
        }

        // Verifica se o alvo tem bloqueio ativo
        const alvoParticipante = await this.getParticipante(client, batalhaId, acao.alvoId);
        const bloqueio = await this.verificarBloqueio(client, alvoParticipante.id);

        if (bloqueio > 0) {
            return { dano: 0, critico: false };
        }

        // Garante que o dano seja no mínimo 1 (a menos que o defensor tenha esquivado)
        return { dano: Math.max(1, danoFinal), critico };
    }

    async getPersonagemHabilidades(usuarioId) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    h.*,
                    ph.nivel_habilidade,
                    he.tipo_efeito,
                    he.valor,
                    he.atributo_base,
                    he.duracao,
                    he.chance
                FROM personagens_habilidades ph
                JOIN habilidades h ON h.id = ph.habilidade_id
                JOIN habilidades_efeitos he ON he.habilidade_id = h.id
                WHERE ph.usuario_id = $1
            `, [usuarioId]);

            const habilidades = {};
            result.rows.forEach(row => {
                if (!habilidades[row.id]) {
                    habilidades[row.id] = {
                        id: row.id,
                        nome: row.nome,
                        descricao: row.descricao,
                        tipo: row.tipo,
                        classe: row.classe,
                        nivel_requisito: row.nivel_requisito,
                        cooldown: row.cooldown,
                        nivel_habilidade: row.nivel_habilidade,
                        efeitos: []
                    };
                }
                habilidades[row.id].efeitos.push({
                    tipo_efeito: row.tipo_efeito,
                    valor: row.valor,
                    atributo_base: row.atributo_base,
                    duracao: row.duracao,
                    chance: row.chance
                });
            });
            return Object.values(habilidades);
        } catch (error) {
            console.error('Erro ao buscar habilidades:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Função aprimorada para calcular dano de habilidades 
    async calcularDanoHabilidade(client, batalhaId, atacante, acao, efeito) {
        // Buscar informações do atacante
        const atacanteStats = await client.query(
            `SELECT p.*, pe.arma_id 
             FROM personagens p 
             LEFT JOIN personagem_equipamentos pe ON p.usuario_id = pe.usuario_id 
             WHERE p.usuario_id = $1`,
            [atacante.usuario_id]
        );
        const atk = atacanteStats.rows[0];

        // Buscar informações do defensor
        const defensorStats = await client.query(
            `SELECT p.*, pe.armadura_id 
             FROM personagens p 
             LEFT JOIN personagem_equipamentos pe ON p.usuario_id = pe.usuario_id 
             WHERE p.usuario_id = $1`,
            [acao.alvoId]
        );
        const def = defensorStats.rows[0];

        if (!def) {
            return { dano: 0, efeitos: {} };
        }

        // Determinar dano base da habilidade
        let danoBase = efeito.valor || 0;

        // Aplicar modificador baseado no atributo, se definido
        if (efeito.atributo_base) {
            const multiplicador = atk[efeito.atributo_base] / 100;
            danoBase = Math.floor(danoBase * multiplicador);
        } else {
            // Se não tiver atributo específico, usar um padrão baseado na classe
            switch (atk.classe) {
                case 'guerreiro':
                case 'paladino':
                case 'cavaleiro':
                    danoBase += Math.floor(atk.forca / 2);
                    break;
                case 'mago':
                case 'clerigo':
                    danoBase += Math.floor(atk.inteligencia / 2);
                    break;
                case 'ladino':
                case 'cacador':
                case 'mercenario':
                    danoBase += Math.floor(atk.destreza / 2);
                    break;
                default:
                    danoBase += Math.floor(atk.forca / 3);
            }
        }

        // Acrescenta bônus de equipamento, se houver
        if (atk.arma_id) {
            const armaStats = await client.query('SELECT * FROM equipamentos WHERE id = $1', [atk.arma_id]);
            const arma = armaStats.rows[0];

            // Adicionar bônus relevantes da arma
            if (efeito.atributo_base === 'forca') {
                danoBase += (arma.forca || 0);
            } else if (efeito.atributo_base === 'inteligencia') {
                danoBase += (arma.inteligencia || 0);
            } else if (efeito.atributo_base === 'destreza') {
                danoBase += (arma.destreza || 0);
            } else {
                // Se não tem atributo específico, add todos os bônus relevantes da arma
                danoBase += (arma.forca || 0) + (arma.destreza || 0) + (arma.inteligencia || 0);
            }
        }

        // Calcula redução de dano baseada na defesa do defensor
        let reducaoDano = def.defesa || 0;
        if (def.armadura_id) {
            const armaduraStats = await client.query('SELECT * FROM equipamentos WHERE id = $1', [def.armadura_id]);
            const armadura = armaduraStats.rows[0];
            reducaoDano += armadura.defesa || 0;
        }

        // Verifica se o defensor tem efeito de buff de defesa ativo
        const efeitosDefensor = await client.query(
            `SELECT * FROM efeitos_batalha WHERE participante_id = $1 AND tipo_efeito = 'buff_defesa'`,
            [acao.alvoId]
        );
        if (efeitosDefensor.rows.length > 0) {
            const buffDefesa = efeitosDefensor.rows[0];
            // Aumenta em porcentagem a redução de dano
            reducaoDano += reducaoDano * (buffDefesa.valor / 100);
        }

        // Aplicar fórmula de redução de dano similar à função de ataque básico
        const FATOR_ESCALA = 0.75;
        const LIMIAR_DEFESA_ALTA = 1.5;
        const BONUS_DEFESA_ALTA = 0.15;

        const razaoDefAtk = reducaoDano / danoBase;
        let reducao = Math.min(0.75, razaoDefAtk * FATOR_ESCALA);

        // Aplica bônus se a defesa for significativamente maior
        if (razaoDefAtk > LIMIAR_DEFESA_ALTA) {
            const excesso = razaoDefAtk - LIMIAR_DEFESA_ALTA;
            const bonusAdicional = Math.min(BONUS_DEFESA_ALTA, excesso * BONUS_DEFESA_ALTA);
            reducao = Math.min(0.85, reducao + bonusAdicional);
        }

        let danoFinal = Math.floor(danoBase * (1 - reducao));

        // Aplica variação aleatória de ±10%
        const variacao = (Math.random() * 0.2) - 0.1;
        danoFinal = Math.floor(danoFinal * (1 + variacao));

        // Verifica a chance de esquiva baseada na destreza do defensor
        const destrezaDefensor = def.destreza || 10;
        // Exemplo: para cada 10 pontos de destreza, 5% de chance de esquivar
        const chanceEsquiva = (destrezaDefensor / 10) * 0.05;
        if (Math.random() < chanceEsquiva) {
            // O defensor esquivou, não causando dano
            return { dano: 0, efeitos: {} };
        }

        // Chance de acerto crítico baseada na sorte do atacante
        const chanceBaseCritico = 0.05;
        const chanceCritico = chanceBaseCritico + (atk.sorte / 1000);
        let critico = false;
        if (Math.random() < chanceCritico) {
            critico = true;
            danoFinal = Math.floor(danoFinal * 1.5);
        }

        // Verifica se o alvo tem bloqueio ativo
        const alvoParticipante = await this.getParticipante(client, batalhaId, acao.alvoId);
        const bloqueio = await this.verificarBloqueio(client, alvoParticipante.id);

        if (bloqueio > 0) {
            return { dano: 0, efeitos: {} };
        }

        // Garante que o dano seja no mínimo 1 (a menos que o defensor tenha esquivado)
        return {
            dano: Math.max(1, danoFinal),
            efeitos: { critico }
        };
    }

    // Processa uma habilidade e seus efeitos
    async processarHabilidade(client, participante, acao, batalhaId) {
        // Buscar informações da habilidade
        const habilidadeResult = await client.query(
            `SELECT h.*, he.* 
             FROM habilidades h
             LEFT JOIN habilidades_efeitos he ON h.id = he.habilidade_id
             WHERE h.id = $1`,
            [acao.habilidadeId]
        );
        const efeitosRows = habilidadeResult.rows;
        const habilidade = efeitosRows[0]; // Informações básicas da habilidade

        let resultado = {
            dano: 0,
            cura: 0,
            efeitos: {}
        };

        // Verifica se o alvo tem bloqueio ativo
        const alvoParticipante = await this.getParticipante(client, batalhaId, acao.alvoId);
        const bloqueio = await this.verificarBloqueio(client, alvoParticipante.id);

        if (bloqueio > 0 && acao.habilidadeId) {
            return resultado;
        }

        // Processar outros efeitos da habilidade
        for (const efeito of efeitosRows) {
            if (Math.random() <= efeito.chance / 100) {
                switch (efeito.tipo_efeito) {
                    case 'dano':
                        const resultadoDano = await this.calcularDanoHabilidade(client, batalhaId, participante, acao, efeito);
                        resultado.dano += resultadoDano.dano;
                        resultado.efeitos.critico = resultadoDano.efeitos.critico;
                        break;
                    case 'cura':
                        const curaCalculada = await this.calcularCura(client, participante, efeito);
                        resultado.cura = Number(resultado.cura) + Number(curaCalculada);
                        break;
                    case 'bloqueio':
                        await client.query(
                            `INSERT INTO efeitos_batalha 
                             (participante_id, tipo_efeito, valor, duracao, origem_usuario_id, origem_habilidade_id)
                             VALUES ($1, $2, $3, $4, $5, $6)
                             RETURNING *`,
                            [
                                participante.id,
                                'bloqueio',
                                efeito.valor,
                                efeito.duracao,
                                participante.usuario_id,
                                acao.habilidadeId
                            ]
                        );

                        resultado.efeitos.bloqueio = {
                            valor: efeito.valor,
                            duracao: efeito.duracao
                        };
                        break;
                    case 'buff_defesa':
                        await client.query(
                            `INSERT INTO efeitos_batalha 
                             (participante_id, tipo_efeito, valor, duracao, origem_usuario_id, origem_habilidade_id)
                             VALUES ($1, $2, $3, $4, $5, $6)
                             RETURNING *`,
                            [
                                participante.id,
                                'buff_defesa',
                                efeito.valor,
                                efeito.duracao,
                                participante.usuario_id,
                                acao.habilidadeId
                            ]
                        );

                        resultado.efeitos.buff_defesa = {
                            valor: efeito.valor,
                            duracao: efeito.duracao
                        };
                        break;
                    case 'veneno':
                        // Encontrar o participante alvo (adversário)
                        const venenoResult = await client.query(
                            `SELECT pb.* 
                             FROM participantes_batalha pb
                             JOIN times_batalha tb ON pb.time_id = tb.id
                             WHERE tb.batalha_id = $1 AND pb.time_id != $2
                             LIMIT 1`,
                            [batalhaId, participante.time_id]
                        );
                        // Para efeitos de veneno, inserimos na tabela efeitos_batalha
                        if (venenoResult.rows.length > 0) {
                            const alvoVeneno = venenoResult.rows[0];
                            await client.query(
                                `INSERT INTO efeitos_batalha 
                                 (participante_id, tipo_efeito, valor, duracao, origem_usuario_id, origem_habilidade_id)
                                 VALUES ($1, $2, $3, $4, $5, $6)
                                 RETURNING *`,
                                [
                                    alvoVeneno.id,
                                    'veneno',
                                    Number(efeito.valor),
                                    Number(efeito.duracao),
                                    participante.usuario_id,
                                    acao.habilidadeId
                                ]
                            );

                            resultado.efeitos.veneno = {
                                valor: Number(efeito.valor),
                                duracao: Number(efeito.duracao)
                            };
                        }
                        break;
                    case 'atordoar':
                        // Encontrar o participante alvo (adversário)
                        const atordoarResult = await client.query(
                            `SELECT pb.* 
                             FROM participantes_batalha pb
                             JOIN times_batalha tb ON pb.time_id = tb.id
                             WHERE tb.batalha_id = $1 AND pb.time_id != $2
                             LIMIT 1`,
                            [batalhaId, participante.time_id]
                        );
                        if (atordoarResult.rows.length > 0) {
                            const alvoAtordoar = atordoarResult.rows[0];
                            await client.query(
                                `INSERT INTO efeitos_batalha
                                 (participante_id, tipo_efeito, valor, duracao, origem_usuario_id, origem_habilidade_id)
                                 VALUES ($1, $2, $3, $4, $5, $6)
                                 RETURNING *`,
                                [
                                    alvoAtordoar.id,
                                    'atordoado',
                                    efeito.valor,
                                    efeito.duracao,
                                    participante.usuario_id,
                                    acao.habilidadeId
                                ]
                            );
                            resultado.efeitos.atordoar = {
                                valor: Number(efeito.valor),
                                duracao: efeito.duracao
                            };
                        }
                        break;
                    default:
                        resultado.efeitos[efeito.tipo_efeito] = {
                            valor: Number(efeito.valor),
                            duracao: efeito.duracao
                        };
                }
            }
        }

        return {
            dano: Number(resultado.dano),
            cura: Number(resultado.cura),
            efeitos: resultado.efeitos
        };
    }

    async processarAtordoar(client, batalhaId, usuarioId, efeito, turno) {
        await client.query('BEGIN');

        // Busca informações do participante atordoado e de quem causou
        const [participanteResult, causadorResult] = await Promise.all([
            client.query(
                `SELECT pb.*, u.nickname 
                 FROM participantes_batalha pb 
                 JOIN usuarios u ON u.id = pb.usuario_id
                 JOIN times_batalha tb ON pb.time_id = tb.id
                 WHERE pb.usuario_id = $1 
                 AND tb.batalha_id = $2`,
                [usuarioId, batalhaId]
            ),
            client.query(
                `SELECT u.nickname, h.nome as nome_habilidade
                 FROM usuarios u 
                 JOIN habilidades h ON h.id = $1
                 WHERE u.id = $2`,
                [efeito.origem_habilidade_id, efeito.origem_usuario_id]
            )
        ]);

        const participante = participanteResult.rows[0];
        if (!participante) {
            throw new Error('Participante não encontrado');
        }

        // Cria o log mostrando que é o turno do jogador atordoado
        const logResult = await client.query(
            `INSERT INTO logs_batalha 
             (batalha_id, turno, tipo_acao, usuario_origem, usuario_alvo, 
              habilidade_id, dano, cura, efeitos, vez_usuario_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING id`,
            [
                batalhaId,
                turno,
                'atordoado',
                usuarioId,
                efeito.origem_usuario_id,
                null,
                0,
                0,
                JSON.stringify({
                    atordoado_por: {
                        usuario_id: efeito.origem_usuario_id,
                        nickname: causadorResult.rows[0].nickname,
                        habilidade: causadorResult.rows[0].nome_habilidade
                    }
                }),
                usuarioId
            ]
        );

        // Usa a vida atual do participante diretamente da query
        await client.query(
            `UPDATE logs_batalha SET vida_alvo_pos_acao = $1 WHERE id = $2`,
            [participante.vida_atual, logResult.rows[0].id]
        );

        await client.query('COMMIT');
    }

    async processarVeneno(client, batalhaId, usuarioId, efeito, turno) {
        await client.query('BEGIN');

        // Inflige o dano de veneno no turno atual (dano é baseado no atributo do adversário)
        const dano = await this.calcularDanoVeneno(client, efeito.origem_usuario_id, efeito);

        // Busca informações de quem causou o veneno
        const causadorResult = await client.query(
            `SELECT p.usuario_id, u.nickname, h.nome as nome_habilidade
             FROM personagens p 
             JOIN habilidades h ON h.id = $1
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE p.usuario_id = $2`,
            [efeito.origem_habilidade_id, efeito.origem_usuario_id]
        );

        // Cria o log mostrando o dano de veneno
        const logResult = await client.query(
            `INSERT INTO logs_batalha 
         (batalha_id, turno, tipo_acao, usuario_origem, usuario_alvo, habilidade_id, dano, cura, efeitos, vez_usuario_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
            [
                batalhaId,
                turno,
                efeito.tipo_efeito,
                efeito.origem_usuario_id, // Quem causou o envenenamento
                usuarioId, // Quem está sofrendo o dano
                efeito.origem_habilidade_id,
                dano,
                0,
                JSON.stringify({
                    envenenado_por: {
                        usuario_id: efeito.origem_usuario_id,
                        nickname: causadorResult.rows[0].nickname,
                        habilidade: causadorResult.rows[0].nome_habilidade
                    }
                }),
                usuarioId
            ]
        );
        const logId = logResult.rows[0].id;

        // Só atualiza o status do alvo se houver dano para aplicar
        if (dano > 0) {
            await this.atualizarStatusParticipante(client, batalhaId, usuarioId, dano, 0);
        }

        // Verifica se houve vitória
        const vencedor = await this.verificarVitoria(client, batalhaId);
        if (vencedor) {
            await this.finalizarBatalha(client, batalhaId, vencedor);
        }

        // Após atualizar o status do alvo, atualiza o log com a vida atual do alvo
        const alvoAtual = await this.getParticipante(client, batalhaId, usuarioId);
        const logAtualizado = await client.query(
            `UPDATE logs_batalha SET vida_alvo_pos_acao = $1 WHERE id = $2 RETURNING *`,
            [alvoAtual.vida_atual, logId]
        );

        // Consulta o log para verificar se o veneno foi aplicado
        const logVeneno = await client.query(
            `SELECT * FROM logs_batalha WHERE id = $1`,
            [logId]
        );

        await client.query('COMMIT');
    }

    async calcularDanoVeneno(client, origemUsuarioId, efeito) {
        const personagemResult = await client.query(
            `SELECT p.*, pe.arma_id 
             FROM personagens p 
             LEFT JOIN personagem_equipamentos pe ON p.usuario_id = pe.usuario_id 
             WHERE p.usuario_id = $1`,
            [origemUsuarioId]
        );

        const personagem = personagemResult.rows[0];
        let danoBase = efeito.valor;
        if (efeito.atributo_base) {
            danoBase = Math.floor(danoBase * (personagem[efeito.atributo_base] / 100));
        }
        return danoBase;
    }

    async calcularCura(client, participante, efeito) {
        const personagemResult = await client.query(
            `SELECT p.* FROM personagens p WHERE p.usuario_id = $1`,
            [participante.usuario_id]
        );
        const personagem = personagemResult.rows[0];
        let curaBase = Number(efeito.valor);
        if (efeito.atributo_base) {
            curaBase = Math.floor(curaBase * (Number(personagem[efeito.atributo_base]) / 100));
        }
        return Number(curaBase);
    }

    // Processa efeitos ativos na batalha (buffs, debuffs, dano ao longo do tempo, etc)
    async processarEfeitos(client, batalhaId, usuarioId) {
        try {
            // Primeiro, diminui a duração de todos os efeitos ativos
            await client.query(
                `UPDATE efeitos_batalha eb
                 SET duracao = duracao - 1
                 FROM participantes_batalha pb
                 JOIN times_batalha tb ON pb.time_id = tb.id
                 WHERE tb.batalha_id = $1
                 AND eb.participante_id = $2
                 AND eb.duracao > 0`,
                [batalhaId, usuarioId]
            );

            // Remove efeitos que atingiram duração zero
            await client.query(
                `DELETE FROM efeitos_batalha eb
                 USING participantes_batalha pb
                 JOIN times_batalha tb ON pb.time_id = tb.id
                 WHERE tb.batalha_id = $1 
                 AND eb.participante_id = pb.id
                 AND eb.participante_id = $2
                 AND eb.duracao <= 0`,
                [batalhaId, usuarioId]
            );
        } catch (error) {
            console.error('Erro ao processar efeitos:', error);
            throw error;
        }
    }

    // Processa efeitos ativos na batalha (buffs, debuffs, dano ao longo do tempo, etc) sem client no parametro
    async processarEfeitosSemClient(batalhaId, usuarioId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Primeiro busca o participante_id correto
            const participanteResult = await client.query(
                `SELECT pb.id as participante_id
                 FROM participantes_batalha pb
                 JOIN times_batalha tb ON pb.time_id = tb.id
                 WHERE tb.batalha_id = $1 AND pb.usuario_id = $2`,
                [batalhaId, usuarioId]
            );

            if (participanteResult.rows.length > 0) {
                const participanteId = participanteResult.rows[0].participante_id;

                // Agora usa o participante_id correto
                const result = await client.query(
                    `UPDATE efeitos_batalha eb
                     SET duracao = duracao - 1
                     WHERE eb.participante_id = $1
                     AND eb.duracao > 0`,
                    [participanteId]
                );

                // Remove efeitos que atingiram duração zero
                await client.query(
                    `DELETE FROM efeitos_batalha
                     WHERE participante_id = $1
                     AND duracao <= 0`,
                    [participanteId]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao processar efeitos:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async processarEfeitosAtivos(batalhaId, usuarioId, turno, efeitosAtivos) {
        const client = await pool.connect();
        try {
            for (const efeito of efeitosAtivos) {
                switch (efeito.tipo_efeito) {
                    case 'veneno':
                        await this.processarVeneno(client, batalhaId, usuarioId, efeito, turno);
                        break;
                    case 'atordoado':
                        await this.processarAtordoar(client, batalhaId, usuarioId, efeito, turno);
                        return 'atordoado';
                    case 'bloqueio':
                        break;
                    default:
                        break;
                }
            }
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao processar efeitos ativos:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Função auxiliar para verificar se um participante tem bloqueio ativo
    async verificarBloqueio(client, participanteId) {
        const result = await client.query(
            `SELECT * 
             FROM efeitos_batalha 
             WHERE participante_id = $1 
             AND tipo_efeito = 'bloqueio' 
             AND duracao > 0`,
            [participanteId]
        );

        if (result.rows.length > 0) {
            return result.rows[0].valor;
        }
        return 0;
    }

    // Verifica se apenas um time possui participantes vivos
    async verificarVitoria(client, batalhaId) {
        const result = await client.query(
            `SELECT tb.numero_time, COUNT(pb.*) as vivos
             FROM times_batalha tb
             LEFT JOIN participantes_batalha pb ON tb.id = pb.time_id
             WHERE tb.batalha_id = $1 AND pb.status = 'vivo'
             GROUP BY tb.numero_time`,
            [batalhaId]
        );
        const timesVivos = result.rows.filter(r => parseInt(r.vivos) > 0);
        if (timesVivos.length === 1) {
            return timesVivos[0].numero_time;
        }
        return null;
    }

    // Atualiza o status do participante utilizando os valores base de vida e mana
    async atualizarStatusParticipante(client, batalhaId, usuarioId, dano, cura) {
        await client.query(
            `WITH novo_estado AS (
                SELECT 
                    pb.id,
                    GREATEST(0, LEAST(pb.vida_base, pb.vida_atual - $2 + $3)) AS nova_vida
                FROM participantes_batalha pb
                JOIN times_batalha tb ON pb.time_id = tb.id
                WHERE tb.batalha_id = $4 AND pb.usuario_id = $1
            )
            UPDATE participantes_batalha pb
            SET 
                vida_atual = ne.nova_vida,
                status = CASE WHEN ne.nova_vida <= 0 THEN 'morto' ELSE 'vivo' END
            FROM novo_estado ne
            WHERE pb.id = ne.id;`,
            [usuarioId, dano, cura, batalhaId]
        );
    }

    async getParticipante(client, batalhaId, usuarioId) {
        const result = await client.query(
            `SELECT pb.* 
             FROM participantes_batalha pb
             JOIN times_batalha tb ON pb.time_id = tb.id
             WHERE tb.batalha_id = $1 AND pb.usuario_id = $2`,
            [batalhaId, usuarioId]
        );
        if (result.rows.length === 0) {
            throw new Error('Participante não encontrado na batalha');
        }
        return result.rows[0];
    }

    async getParticipanteTurno(client, batalhaId, usuarioId) {
        const result = await client.query(
            `SELECT pb.* 
             FROM participantes_batalha pb
             JOIN times_batalha tb ON pb.time_id = tb.id
             WHERE tb.batalha_id = $1 AND pb.usuario_id = $2`,
            [batalhaId, usuarioId]
        );
        if (result.rows.length === 0) {
            throw new Error('Participante não encontrado na batalha');
        }
        return result.rows.find(p => p.usuario_id === usuarioId);
    }

    async getBatalhaStatus(client, batalhaId) {
        try {
            const batalhaResult = await client.query(
                `SELECT * FROM batalhas WHERE id = $1`,
                [batalhaId]
            );
            const participantesResult = await client.query(
                `SELECT
                    pb.id as participante_id,
                    pb.usuario_id,
                    tb.numero_time as time,
                    pb.vida_atual,
                    pb.vida_base,
                    pb.mana_atual,
                    pb.mana_base,
                    pb.status,
                    pb.posicao,
                    p.sorte,
                    u.nickname,
                    p.classe,
                    COALESCE(s.caminho_imagem, CONCAT('default/', p.classe)) as skin_path
                FROM participantes_batalha pb
                JOIN times_batalha tb ON pb.time_id = tb.id
                JOIN personagens p ON pb.usuario_id = p.usuario_id
                JOIN usuarios u ON p.usuario_id = u.id
                LEFT JOIN personagem_skins ps ON ps.usuario_id = p.usuario_id AND ps.equipada = true
                LEFT JOIN skins s ON s.id = ps.skin_id
                WHERE tb.batalha_id = $1`,
                [batalhaId]
            );
            // Recupera os logs em ordem crescente de turno e id,
            // juntando informações dos usuários (origem e alvo) e, se houver, o nome da habilidade usada
            const logsResult = await client.query(
                `SELECT l.*, 
                        uo.nickname as origem_nickname, 
                        ua.nickname as alvo_nickname,
                        h.nome as nome_habilidade
                 FROM logs_batalha l
                 LEFT JOIN usuarios uo ON l.usuario_origem = uo.id
                 LEFT JOIN usuarios ua ON l.usuario_alvo = ua.id
                 LEFT JOIN habilidades h ON l.habilidade_id = h.id
                 WHERE l.batalha_id = $1 
                 ORDER BY l.turno ASC, l.id ASC`,
                [batalhaId]
            );

            // Gera logs textuais detalhados
            const logsText = [];
            const logs = logsResult.rows;
            for (let i = 0; i < logs.length; i++) {
                const log = logs[i];
                let text = `Turno ${log.turno}: `;

                if (log.tipo_acao === 'ataque') {
                    if (log.dano > 0) {
                        let criticoText = "";
                        if (log.efeitos && log.efeitos.critico) {
                            criticoText = " com acerto crítico";
                        }
                        // Se o mesmo usuário atuou duas vezes no mesmo turno, considera ataque duplo
                        if (i > 0) {
                            const prevLog = logs[i - 1];
                            if (prevLog.turno === log.turno && prevLog.usuario_origem === log.usuario_origem) {
                                text += `${log.origem_nickname} teve sorte e atacou novamente ${log.alvo_nickname}${criticoText}, causando ${log.dano} de dano. ${log.alvo_nickname} ficou com ${log.vida_alvo_pos_acao} de vida.`;
                            } else {
                                text += `${log.origem_nickname} atacou ${log.alvo_nickname}${criticoText}, causando ${log.dano} de dano. ${log.alvo_nickname} ficou com ${log.vida_alvo_pos_acao} de vida.`;
                            }
                        } else {
                            text += `${log.origem_nickname} atacou ${log.alvo_nickname}${criticoText}, causando ${log.dano} de dano. ${log.alvo_nickname} ficou com ${log.vida_alvo_pos_acao} de vida.`;
                        }
                    } else {
                        text += `${log.origem_nickname} tentou atacar ${log.alvo_nickname}, porém ${log.alvo_nickname} desviou do ataque.`;
                    }
                } else if (log.tipo_acao === 'habilidade') {
                    if (log.dano > 0) {
                        let criticoText = "";
                        let atordoadoText = "";
                        if (log.efeitos && log.efeitos.critico) {
                            criticoText = " com acerto crítico";
                        }
                        if (log.efeitos && log.efeitos.atordoado) {
                            atordoadoText = ` e atordou ${log.alvo_nickname} por ${log.efeitos.atordoado.duracao} turno(s).`;
                        }
                        text += `${log.origem_nickname} usou a habilidade ${log.nome_habilidade} em ${log.alvo_nickname}${criticoText}, causando ${log.dano} de dano${atordoadoText}. ${log.alvo_nickname} ficou com ${log.vida_alvo_pos_acao} de vida.`;
                    } else {
                        // Verifica se é uma habilidade de bloqueio
                        if (log.efeitos && log.efeitos.bloqueio) {
                            text += `${log.origem_nickname} usou a habilidade ${log.nome_habilidade} e ativou um escudo que bloqueia ${log.efeitos.bloqueio.valor}% de dano por ${log.efeitos.bloqueio.duracao} turno(s).`;
                        } else if (log.efeitos && log.efeitos.veneno) {
                            text += `${log.origem_nickname} usou a habilidade ${log.nome_habilidade} e ativou um veneno que causa dano por ${log.efeitos.veneno.duracao} turno(s).`;
                        } else {
                            text += `${log.origem_nickname} usou a habilidade ${log.nome_habilidade} em ${log.alvo_nickname}, mas não causou dano.`;
                        }
                    }
                } else if (log.tipo_acao === 'veneno') {
                    text += `${log.alvo_nickname} sofreu dano por envenenamento, causando ${log.dano} de dano. ${log.alvo_nickname} ficou com ${log.vida_alvo_pos_acao} de vida.`;
                } else if (log.tipo_acao === 'atordoado') {
                    text += `${log.alvo_nickname} está atordoado e não pode agir.`;
                }

                if (log.cura > 0) {
                    text += ` ${log.origem_nickname} se curou em ${log.cura} pontos. ${log.origem_nickname} ficou com ${log.vida_atual} de vida.`;
                }
                logsText.push(text);
            }

            return {
                status: batalhaResult.rows[0].status,
                vencedor: batalhaResult.rows[0].vencedor_time,
                vencedor_id: participantesResult.rows.find(p => p.time === batalhaResult.rows[0].vencedor_time)?.usuario_id,
                participantes: participantesResult.rows,
                logs: logs,
                logsText
            };
        } catch (error) {
            console.error('Erro ao buscar status da batalha:', error);
            throw error;
        }
    }

    async getBatalhaStatusSemClient(batalhaId) {
        const client = await pool.connect();
        try {
            const batalhaResult = await client.query(
                `SELECT * FROM batalhas WHERE id = $1`,
                [batalhaId]
            );
            const participantesResult = await client.query(
                `SELECT
                    pb.id as participante_id,
                    pb.usuario_id,
                    tb.numero_time as time,
                    pb.vida_atual,
                    pb.vida_base,
                    pb.mana_atual,
                    pb.mana_base,
                    pb.status,
                    pb.posicao,
                    p.sorte,
                    u.nickname,
                    p.classe,
                    COALESCE(s.caminho_imagem, CONCAT('default/', p.classe)) as skin_path
                FROM participantes_batalha pb
                JOIN times_batalha tb ON pb.time_id = tb.id
                JOIN personagens p ON pb.usuario_id = p.usuario_id
                JOIN usuarios u ON p.usuario_id = u.id
                LEFT JOIN personagem_skins ps ON ps.usuario_id = p.usuario_id AND ps.equipada = true
                LEFT JOIN skins s ON s.id = ps.skin_id
                WHERE tb.batalha_id = $1`,
                [batalhaId]
            );
            // Recupera os logs em ordem crescente de turno e id,
            // juntando informações dos usuários (origem e alvo) e, se houver, o nome da habilidade usada
            const logsResult = await client.query(
                `SELECT l.*, 
                        uo.nickname as origem_nickname, 
                        ua.nickname as alvo_nickname,
                        h.nome as nome_habilidade
                 FROM logs_batalha l
                 LEFT JOIN usuarios uo ON l.usuario_origem = uo.id
                 LEFT JOIN usuarios ua ON l.usuario_alvo = ua.id
                 LEFT JOIN habilidades h ON l.habilidade_id = h.id
                 WHERE l.batalha_id = $1 
                 ORDER BY l.turno ASC, l.id ASC`,
                [batalhaId]
            );

            // Gera logs textuais detalhados
            const logsText = [];
            const logs = logsResult.rows;
            for (let i = 0; i < logs.length; i++) {
                const log = logs[i];
                let text = `Turno ${log.turno}: `;

                if (log.tipo_acao === 'ataque') {
                    if (log.dano > 0) {
                        let criticoText = "";
                        if (log.efeitos && log.efeitos.critico) {
                            criticoText = " com acerto crítico";
                        }
                        // Se o mesmo usuário atuou duas vezes no mesmo turno, considera ataque duplo
                        if (i > 0) {
                            const prevLog = logs[i - 1];
                            if (prevLog.turno === log.turno && prevLog.usuario_origem === log.usuario_origem) {
                                text += `${log.origem_nickname} teve sorte e atacou novamente ${log.alvo_nickname}${criticoText}, causando ${log.dano} de dano. ${log.alvo_nickname} ficou com ${log.vida_alvo_pos_acao} de vida.`;
                            } else {
                                text += `${log.origem_nickname} atacou ${log.alvo_nickname}${criticoText}, causando ${log.dano} de dano. ${log.alvo_nickname} ficou com ${log.vida_alvo_pos_acao} de vida.`;
                            }
                        } else {
                            text += `${log.origem_nickname} atacou ${log.alvo_nickname}${criticoText}, causando ${log.dano} de dano. ${log.alvo_nickname} ficou com ${log.vida_alvo_pos_acao} de vida.`;
                        }
                    } else {
                        text += `${log.origem_nickname} tentou atacar ${log.alvo_nickname}, porém ${log.alvo_nickname} desviou do ataque.`;
                    }
                } else if (log.tipo_acao === 'habilidade') {
                    if (log.dano > 0) {
                        let criticoText = "";
                        let atordoadoText = "";
                        if (log.efeitos && log.efeitos.critico) {
                            criticoText = " com acerto crítico";
                        }
                        if (log.efeitos && log.efeitos.atordoado) {
                            atordoadoText = ` e atordou ${log.alvo_nickname} por ${log.efeitos.atordoado.duracao} turno(s).`;
                        }
                        text += `${log.origem_nickname} usou a habilidade ${log.nome_habilidade} em ${log.alvo_nickname}${criticoText}, causando ${log.dano} de dano${atordoadoText}. ${log.alvo_nickname} ficou com ${log.vida_alvo_pos_acao} de vida.`;
                    } else {
                        // Verifica se é uma habilidade de bloqueio
                        if (log.efeitos && log.efeitos.bloqueio) {
                            text += `${log.origem_nickname} usou a habilidade ${log.nome_habilidade} e ativou um escudo que bloqueia ${log.efeitos.bloqueio.valor}% de dano por ${log.efeitos.bloqueio.duracao} turno(s).`;
                        } else if (log.efeitos && log.efeitos.veneno) {
                            text += `${log.origem_nickname} usou a habilidade ${log.nome_habilidade} e ativou um veneno que causa dano por ${log.efeitos.veneno.duracao} turno(s).`;
                        } else {
                            text += `${log.origem_nickname} usou a habilidade ${log.nome_habilidade} em ${log.alvo_nickname}, mas não causou dano.`;
                        }
                    }
                } else if (log.tipo_acao === 'veneno') {
                    text += `${log.alvo_nickname} sofreu dano por envenenamento, causando ${log.dano} de dano. ${log.alvo_nickname} ficou com ${log.vida_alvo_pos_acao} de vida.`;
                } else if (log.tipo_acao === 'atordoado') {
                    text += `${log.alvo_nickname} está atordoado e não pode agir.`;
                }

                if (log.cura > 0) {
                    text += ` ${log.origem_nickname} se curou em ${log.cura} pontos. ${log.origem_nickname} ficou com ${log.vida_atual} de vida.`;
                }
                logsText.push(text);
            }

            return {
                status: batalhaResult.rows[0].status,
                vencedor: batalhaResult.rows[0].vencedor_time,
                vencedor_id: participantesResult.rows.find(p => p.time === batalhaResult.rows[0].vencedor_time)?.usuario_id,
                participantes: participantesResult.rows,
                logs: logs,
                logsText
            };
        } catch (error) {
            console.error('Erro ao buscar status da batalha:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async getEfeitosAtivos(usuarioId, batalhaId) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                `SELECT DISTINCT eb.*, he.atributo_base
                FROM efeitos_batalha eb
                LEFT JOIN habilidades_efeitos he 
                ON eb.origem_habilidade_id = he.habilidade_id
                AND he.tipo_efeito = eb.tipo_efeito
                JOIN participantes_batalha pb ON eb.participante_id = pb.id
                JOIN times_batalha tb ON pb.time_id = tb.id
                WHERE eb.participante_id = $1
                AND tb.batalha_id = $2
                AND eb.duracao > 0;
                `,
                [usuarioId, batalhaId]
            );
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar efeitos ativos:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async finalizarBatalha(client, batalhaId, vencedor) {
        // Primeiro atualiza o status da batalha (código existente)
        await client.query(
            `UPDATE batalhas 
             SET status = 'finalizada',
                 vencedor_time = $2,
                 finalizada_em = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [batalhaId, vencedor]
        );

        // Busca os participantes da batalha corretamente através dos times
        const { rows: participantes } = await client.query(
            `SELECT 
            pb.usuario_id,
            p.pontos_arena,
            p.elo,
            tb.numero_time
         FROM participantes_batalha pb
         JOIN times_batalha tb ON pb.time_id = tb.id
         JOIN personagens p ON p.usuario_id = pb.usuario_id
         WHERE tb.batalha_id = $1`,
            [batalhaId]
        );

        // Considera que o desafiador é o participante do time 1
        const desafiador = participantes.find(p => p.numero_time === 1);
        const oponente = participantes.find(p => p.numero_time !== 1);

        if (desafiador && oponente) {
            // Calcula os pontos com base nos pontos de arena
            const pontosGanhos = await eloService.calcularPontos(
                desafiador.pontos_arena,
                oponente.pontos_arena
            );
            // Se o vencedor for o time 1, o desafiador venceu e ganha pontos; caso contrário, perde
            const ajuste = (vencedor === 1 ? pontosGanhos : -pontosGanhos);
            await eloService.atualizarElo(desafiador.usuario_id, ajuste);
        }
    }
}

export const combatTesteService = new CombatTesteService();