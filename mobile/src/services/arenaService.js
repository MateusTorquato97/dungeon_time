import { API_URL } from '../config/api';

export const arenaService = {
    getAvailablePlayers: async (token) => {
        try {
            const response = await fetch(`${API_URL}/arena/players`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error('Falha ao buscar jogadores');
            }

            return data;
        } catch (error) {
            console.error('Erro em getAvailablePlayers:', error);
            throw error;
        }
    },

    getDailyBattles: async (token) => {
        try {
            const response = await fetch(`${API_URL}/arena/daily-battles`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Falha ao buscar batalhas diárias');
            return await response.json();
        } catch (error) {
            console.error('Erro em getDailyBattles:', error);
            throw error;
        }
    },

    startBattle: async (token, oponentId) => {
        try {
            const response = await fetch(`${API_URL}/arena/battle`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oponentId })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Falha ao iniciar batalha');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro em startBattle:', error);
            throw error;
        }
    },

    getBattleHistory: async (token) => {
        try {
            const response = await fetch(`${API_URL}/arena/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Falha ao buscar histórico');
            return await response.json();
        } catch (error) {
            console.error('Erro em getBattleHistory:', error);
            throw error;
        }
    },

    getBattleDetails: async (token, battleId) => {
        try {
            const response = await fetch(`${API_URL}/arena/battle/${battleId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar detalhes da batalha');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro em getBattleDetails:', error);
            throw error;
        }
    },

    startBattleTeste: async (token, oponentId) => {
        try {
            const response = await fetch(`${API_URL}/battle/teste`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ oponentId })
            });
            if (!response.ok) throw new Error('Falha ao iniciar batalha de teste');
            return await response.json();
        } catch (error) {
            console.error('Erro em startBattleTeste:', error);
            throw error;
        }
    }
};