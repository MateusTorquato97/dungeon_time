import { API_URL } from '../config/api';

export const inventoryService = {
    getItems: async (token) => {
        try {
            const response = await fetch(`${API_URL}/inventory/items`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Falha ao buscar itens do inventário');
            return await response.json();
        } catch (error) {
            console.error('Erro em getItems:', error);
            throw error;
        }
    },

    markItemsAsViewed: async (itemIds, token) => {
        try {
            const response = await fetch(`${API_URL}/inventory/mark-as-viewed`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemIds }),
            });

            if (!response.ok) throw new Error('Falha ao marcar itens como visualizados');
            return await response.json();
        } catch (error) {
            console.error('Erro em markItemsAsViewed:', error);
            throw error;
        }
    }
};