import { API_URL } from '../config/api';
import { dungeonImages } from '../utils/images';

export const dungeonService = {
    // Buscar dungeons disponíveis
    getAvailableDungeons: async (token) => {
        try {
            const response = await fetch(`${API_URL}/dungeons/available`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Falha ao buscar dungeons');
            const dungeons = await response.json();

            return dungeons.map(dungeon => ({
                ...dungeon,
                image: dungeonImages[dungeon.id] || dungeonImages.floresta_sagrada
            }));
        } catch (error) {
            console.error('Erro em getAvailableDungeons:', error);
            throw error;
        }
    },

    getServerTime: async (token) => {
        try {
            const response = await fetch(`${API_URL}/dungeons/time`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Falha ao buscar horário do servidor');
            return response.json();
        } catch (error) {
            console.error('Erro em getServerTime:', error);
            throw error;
        }
    },

    // Buscar dungeons ativas do usuário
    getActiveDungeons: async (token) => {
        try {
            const response = await fetch(`${API_URL}/dungeons/active`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha ao buscar dungeons ativas');
            }

            return data;
        } catch (error) {
            console.error('Erro detalhado em getActiveDungeons:', error);
            throw error;
        }
    },

    // Iniciar uma dungeon
    startDungeon: async (token, tipo_dungeon_id) => {
        try {
            const response = await fetch(`${API_URL}/dungeons/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tipo_dungeon_id })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Falha ao iniciar dungeon');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro em startDungeon:', error);
            throw error;
        }
    },

    // Finalizar uma dungeon
    finishDungeon: async (token, dungeonId) => {
        try {
            const response = await fetch(`${API_URL}/dungeons/finish/${dungeonId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Falha ao finalizar dungeon');
            return await response.json();
        } catch (error) {
            console.error('Erro em finishDungeon:', error);
            throw error;
        }
    },

    // Coletar recompensas de uma dungeon
    collectRewards: async (token, dungeonId) => {
        try {
            const response = await fetch(`${API_URL}/dungeons/collect-rewards/${dungeonId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Falha ao coletar recompensas');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro em collectRewards:', error);
            throw error;
        }
    },

    checkPendingRewards: async (token) => {
        try {
            const response = await fetch(`${API_URL}/dungeons/pending-rewards`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Falha ao verificar recompensas');
            return await response.json();
        } catch (error) {
            console.error('Erro em checkPendingRewards:', error);
            throw error;
        }
    }
}; 