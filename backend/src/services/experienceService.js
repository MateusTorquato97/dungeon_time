import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const incrementosPorClasse = {
    guerreiro: {
        forca: 3,
        destreza: 1,
        inteligencia: 1,
        vitalidade: 3,
        defesa: 2,
        sorte: 1
    },
    mago: {
        forca: 1,
        destreza: 1,
        inteligencia: 3,
        vitalidade: 1,
        defesa: 1,
        sorte: 2
    },
    ladino: {
        forca: 1,
        destreza: 3,
        inteligencia: 2,
        vitalidade: 1,
        defesa: 1,
        sorte: 3
    },
    paladino: {
        forca: 2,
        destreza: 1,
        inteligencia: 2,
        vitalidade: 2,
        defesa: 3,
        sorte: 1
    },
    cacador: {
        forca: 2,
        destreza: 3,
        inteligencia: 1,
        vitalidade: 2,
        defesa: 1,
        sorte: 2
    },
    clerigo: {
        forca: 1,
        destreza: 1,
        inteligencia: 3,
        vitalidade: 2,
        defesa: 2,
        sorte: 2
    },
    mercenario: {
        forca: 2,
        destreza: 2,
        inteligencia: 1,
        vitalidade: 2,
        defesa: 2,
        sorte: 2
    },
    cavaleiro: {
        forca: 2,
        destreza: 2,
        inteligencia: 1,
        vitalidade: 3,
        defesa: 3,
        sorte: 1
    }
};



class ExperienceService {
    constructor() {
        this.baseXP = 100; // XP base para cada nível
    }

    calcularProximoXP(nivel) {
        return this.baseXP * nivel;
    }

    async adicionarXP(usuarioId, xpGanho) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Busca dados atuais do personagem
            const result = await client.query(`
                SELECT nivel, xp_atual, prox_xp, classe
                FROM personagens 
                WHERE usuario_id = $1
            `, [usuarioId]);

            let { nivel, xp_atual, prox_xp, classe } = result.rows[0];
            xp_atual += xpGanho;
            let nivelAnterior = nivel;

            // Verifica se subiu de nível
            while (xp_atual >= prox_xp) {
                xp_atual -= prox_xp;
                nivel += 1;
                prox_xp = this.calcularProximoXP(nivel);
            }

            // Se subiu de nível, atualiza atributos base
            let atributosGanhos = {};
            if (nivel > nivelAnterior) {
                await this.atualizarAtributosNivel(client, usuarioId, nivel - nivelAnterior, classe);
                atributosGanhos = {
                    forca: incrementosPorClasse[classe].forca * (nivel - nivelAnterior),
                    destreza: incrementosPorClasse[classe].destreza * (nivel - nivelAnterior),
                    inteligencia: incrementosPorClasse[classe].inteligencia * (nivel - nivelAnterior),
                    vitalidade: incrementosPorClasse[classe].vitalidade * (nivel - nivelAnterior),
                    defesa: incrementosPorClasse[classe].defesa * (nivel - nivelAnterior),
                    sorte: incrementosPorClasse[classe].sorte * (nivel - nivelAnterior)
                };
            }

            // Atualiza o personagem
            await client.query(`
                UPDATE personagens 
                SET nivel = $1, 
                    xp_atual = $2, 
                    prox_xp = $3,
                    updated_at = CURRENT_TIMESTAMP
                WHERE usuario_id = $4
            `, [nivel, xp_atual, prox_xp, usuarioId]);

            await client.query('COMMIT');

            return {
                nivel,
                xp_atual,
                prox_xp,
                subiuDeNivel: nivel > nivelAnterior,
                niveisGanhos: nivel - nivelAnterior,
                atributosGanhos
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async atualizarAtributosNivel(client, usuarioId, niveisGanhos, classe) {
        const incrementos = incrementosPorClasse[classe];
        if (!incrementos) {
            throw new Error(`Classe '${classe}' não encontrada`);
        }

        // Atualiza os atributos e calcula vida/mana
        await client.query(`
            UPDATE personagens
            SET forca = forca + $1,
                destreza = destreza + $2,
                inteligencia = inteligencia + $3,
                vitalidade = vitalidade + $4,
                defesa = defesa + $5,
                sorte = sorte + $6,
                vida = vida + $7,
                mana = mana + $8
            WHERE usuario_id = $9
        `, [
            incrementos.forca * niveisGanhos,
            incrementos.destreza * niveisGanhos,
            incrementos.inteligencia * niveisGanhos,
            incrementos.vitalidade * niveisGanhos,
            incrementos.defesa * niveisGanhos,
            incrementos.sorte * niveisGanhos,
            incrementos.vitalidade * niveisGanhos, // Vida: 10 pontos por ponto de vitalidade
            incrementos.inteligencia * niveisGanhos, // Mana: 10 pontos por ponto de inteligência
            usuarioId
        ]);
    }
}

export const experienceService = new ExperienceService(); 