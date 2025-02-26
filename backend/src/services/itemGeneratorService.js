import pool from '../shared/db.js';

class ItemGeneratorService {
    constructor() {
        this.pool = pool;
        this.rarityWeights = {
            comum: 82,      // 82%    (4 em 5)
            incomum: 12,    // 12%    (1 em 8)
            raro: 4.5,      // 4.5%   (1 em 22)
            epico: 1.3,     // 1.3%   (1 em 77)
            lendario: 0.2   // 0.2%   (1 em 500)
        };

        this.rarityMultipliers = {
            comum: 1,
            incomum: 1.25,
            raro: 1.5,
            epico: 2,
            lendario: 2.5
        };

        // Chances de roll de atributo por raridade
        this.attributeRollChances = {
            comum: 0.80,     // 80%
            incomum: 0.15,   // 15%
            raro: 0.04,      // 4%
            epico: 0.009,    // 0.9%
            lendario: 0.001  // 0.1%  (1 em 1000)
        };

        // Chance base de ganhar cada atributo extra (10%)
        this.extraAttributeChance = 0.10;    // 10% base

        // Bônus de chance por raridade
        this.rarityExtraChanceBonus = {
            comum: 0,       // 10% total
            incomum: 0.05,  // 15% total
            raro: 0.10,     // 20% total
            epico: 0.15,    // 25% total
            lendario: 0.20  // 30% total
        };

        // Máximo de atributos extras possíveis por raridade
        this.maxExtraAttributes = {
            comum: 0,
            incomum: 1,
            raro: 2,
            epico: 3,
            lendario: 4
        };
    }

    async generateRarity() {
        const total = Object.values(this.rarityWeights).reduce((a, b) => a + b, 0);
        const random = Math.random() * total;
        let acc = 0;

        for (const [rarity, weight] of Object.entries(this.rarityWeights)) {
            acc += weight;
            if (random <= acc) {
                return rarity;
            }
        }
        return 'comum';
    }

    calculateAttributeValue(baseValue, userLevel, rarityMultiplier) {
        // Cálculo base do atributo
        const value = Math.round(baseValue * (1 + userLevel * 0.2) * rarityMultiplier);

        // Determina a raridade do roll do atributo
        const random = Math.random();

        let rollRarity = 'comum';
        let accumulated = 0;

        for (const [rarity, chance] of Object.entries(this.attributeRollChances)) {
            accumulated += chance;
            if (random <= accumulated) {
                rollRarity = rarity;
                break;
            }
        }

        // Aplica o multiplicador baseado na raridade do roll
        const rollMultiplier = this.rarityMultipliers[rollRarity];
        const finalValue = Math.max(1, Math.round(value * rollMultiplier));

        return {
            value: finalValue,
            rollRarity: rollRarity
        };
    }

    getAttributeQuality(attributeInfo) {
        return attributeInfo.rollRarity;
    }

    async generateAttributes(userLevel, rarity, slot) {
        if (slot === 'consumivel') {
            return {
                forca: 0,
                destreza: 0,
                inteligencia: 0,
                vitalidade: 0,
                defesa: 0,
                sorte: 0
            };
        }

        const baseAttributes = {
            arma: { forca: 6, destreza: 4 },
            armadura: { defesa: 7, vitalidade: 4 },
            elmo: { inteligencia: 5, vitalidade: 3 },
            colar: { inteligencia: 4, sorte: 3 },
            anel: { sorte: 4, inteligencia: 3 },
            luvas: { destreza: 5, forca: 3 },
            botas: { destreza: 4, sorte: 3 }
        };

        const extraAttributes = {
            comum: 0,
            incomum: 1,
            raro: 2,
            epico: 3,
            lendario: 4
        };

        const base = baseAttributes[slot] || baseAttributes.colar;
        const multiplier = this.rarityMultipliers[rarity];

        const attributes = {};
        for (const [attr, value] of Object.entries(base)) {
            attributes[attr] = this.calculateAttributeValue(value, userLevel, multiplier);
        }

        const possibleExtras = ['forca', 'destreza', 'inteligencia', 'vitalidade', 'defesa', 'sorte']
            .filter(attr => !base[attr]);

        // Calcula a chance final baseada na raridade
        const baseChance = this.extraAttributeChance;
        const rarityBonus = this.rarityExtraChanceBonus[rarity];
        const finalChance = baseChance + rarityBonus;

        // Tenta adicionar cada atributo extra até o máximo permitido
        const maxExtras = this.maxExtraAttributes[rarity];
        let extrasAdded = 0;

        while (extrasAdded < maxExtras && possibleExtras.length > 0) {
            // Roll para ver se ganha mais um atributo
            if (Math.random() <= finalChance) {
                const randomIndex = Math.floor(Math.random() * possibleExtras.length);
                const attr = possibleExtras.splice(randomIndex, 1)[0];
                attributes[attr] = this.calculateAttributeValue(2, userLevel, multiplier);
                extrasAdded++;
            } else {
                break; // Se falhou em ganhar um atributo, para de tentar
            }
        }

        return attributes;
    }

    async getRandomBaseItem(slot = null) {
        const client = await this.pool.connect();
        try {
            let query = 'SELECT * FROM base_itens';
            const params = [];

            if (slot) {
                query += ' WHERE slot = $1';
                params.push(slot);
            }

            query += ' ORDER BY RANDOM() LIMIT 1';

            const result = await client.query(query, params);
            return result.rows[0];
        } catch (error) {
            console.error('Erro em getRandomBaseItem:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async generateItem(userId, userLevel, slot = null) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Seleciona um item base aleatório
            const baseItem = await this.getRandomBaseItem(slot);
            if (!baseItem) throw new Error('Nenhum item base encontrado');

            // 2. Gera a raridade
            const rarity = await this.generateRarity();

            // 3. Gera os atributos com base no nível do usuário e no slot do item
            const attributes = await this.generateAttributes(userLevel, rarity, baseItem.slot);

            // 4. Insere o novo equipamento na tabela "equipamentos"
            const equipmentResult = await client.query(`
                INSERT INTO equipamentos (
                    nome, tipo, nivel, raridade, slot,
                    forca, destreza, inteligencia, vitalidade, defesa, sorte,
                    forca_raridade, destreza_raridade, inteligencia_raridade, 
                    vitalidade_raridade, defesa_raridade, sorte_raridade
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING id
            `, [
                baseItem.nome,
                baseItem.categoria,
                userLevel,
                rarity,
                baseItem.slot,
                attributes.forca?.value || 0,
                attributes.destreza?.value || 0,
                attributes.inteligencia?.value || 0,
                attributes.vitalidade?.value || 0,
                attributes.defesa?.value || 0,
                attributes.sorte?.value || 0,
                attributes.forca?.rollRarity || 'comum',
                attributes.destreza?.rollRarity || 'comum',
                attributes.inteligencia?.rollRarity || 'comum',
                attributes.vitalidade?.rollRarity || 'comum',
                attributes.defesa?.rollRarity || 'comum',
                attributes.sorte?.rollRarity || 'comum'
            ]);

            await client.query('COMMIT');

            // 5. Retorna o item inserido (somente da tabela equipamentos)
            const finalItem = await client.query(`
                SELECT *
                FROM equipamentos
                WHERE id = $1
            `, [equipmentResult.rows[0].id]);

            return finalItem.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Novo método para gerar múltiplos itens
    async generateMultipleItems(userId, userLevel, quantity, slot = null) {
        const items = [];
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            for (let i = 0; i < quantity; i++) {
                const item = await this.generateItem(userId, userLevel, slot);
                items.push(item);
            }

            await client.query('COMMIT');
            return items;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async generateRandomItems(userId, userLevel, minItems = 1, maxItems = 3) {
        const quantity = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;
        const items = [];
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            // Define probabilidades para cada slot
            const slotChances = {
                arma: 0.15,      // 15% chance
                armadura: 0.15,  // 15% chance
                elmo: 0.15,      // 15% chance
                colar: 0.10,     // 10% chance
                anel: 0.10,      // 10% chance
                luvas: 0.10,     // 10% chance
                botas: 0.10,     // 10% chance
                consumivel: 0.15 // 15% chance
            };

            for (let i = 0; i < quantity; i++) {
                // Escolhe um slot aleatório baseado nas probabilidades
                const random = Math.random();
                let selectedSlot = null;
                let accumulated = 0;

                for (const [slot, chance] of Object.entries(slotChances)) {
                    accumulated += chance;
                    if (random <= accumulated) {
                        selectedSlot = slot;
                        break;
                    }
                }

                const levelUser = await client.query(`
                    SELECT nivel FROM personagens WHERE usuario_id = $1 LIMIT 1
                `, [userId]);

                const item = await this.generateItem(userId, levelUser.rows[0].nivel, selectedSlot);
                items.push(item);
            }

            await client.query('COMMIT');
            return {
                quantity,
                items
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export default new ItemGeneratorService();