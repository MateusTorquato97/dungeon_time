import { API_URL } from '../config/api';

export const equipmentService = {
    async equipItem(token, itemId, equip) {
        try {
            const response = await fetch(`${API_URL}/equipment/equip`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemId, equip })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Falha ao equipar/desequipar item');
            }

            return data;
        } catch (error) {
            console.error('Erro em equipItem:', error);
            throw error;
        }
    },

    async getEquippedItems(token) {
        try {
            const response = await fetch(`${API_URL}/equipment/equipped`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar itens equipados');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro em getEquippedItems:', error);
            throw error;
        }
    }
}; 