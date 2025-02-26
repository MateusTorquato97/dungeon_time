import { API_URL } from '../config/api';

export const rankingArenaService = {
    getRanking: async (token) => {
        try {
            const response = await fetch(`${API_URL}/ranking/top1`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar ranking:', error);
            throw error;
        }
    },

    getRankingByElo: async (token, elo) => {
        try {
            const response = await fetch(`${API_URL}/ranking/${elo.toLowerCase()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar ranking por elo:', error);
            throw error;
        }
    }

}
