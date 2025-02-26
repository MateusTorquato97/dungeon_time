import { API_URL } from '../config/api';

export const characterService = {
    async getCharacterAttributes(token) {
        try {
            const response = await fetch(`${API_URL}/character/attributes`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Falha ao buscar atributos do personagem');
            }

            return data;
        } catch (error) {
            console.error('Erro detalhado em getCharacterAttributes:', error);
            throw error;
        }
    }
}; 