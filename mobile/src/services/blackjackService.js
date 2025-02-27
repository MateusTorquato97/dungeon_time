import { BLACKJACK_API_URL } from '../config/api';
import io from 'socket.io-client';

/**
 * Serviço para comunicação com a API do Blackjack
 */
export const blackjackService = {
    /**
     * Obter todas as salas disponíveis
     */
    getRooms: async (token) => {
        try {
            const response = await fetch(`${BLACKJACK_API_URL}/rooms`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar salas');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro em getRooms:', error);
            throw error;
        }
    },

    /**
     * Obter detalhes de uma sala específica
     */
    getRoomDetails: async (token, roomId) => {
        try {
            const response = await fetch(`${BLACKJACK_API_URL}/rooms/${roomId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar detalhes da sala');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro em getRoomDetails:', error);
            throw error;
        }
    },

    /**
     * Criar uma nova sala
     */
    createRoom: async (token, minBet, maxBet) => {
        try {
            const response = await fetch(`${BLACKJACK_API_URL}/rooms`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ minBet, maxBet })
            });

            if (!response.ok) {
                throw new Error('Falha ao criar sala');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro em createRoom:', error);
            throw error;
        }
    },

    /**
     * Obter histórico de jogadas
     */
    getHistory: async (token) => {
        try {
            const response = await fetch(`${BLACKJACK_API_URL}/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar histórico');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro em getHistory:', error);
            throw error;
        }
    },

    /**
     * Obter saldo atual
     */
    getBalance: async (token) => {
        try {
            const response = await fetch(`${BLACKJACK_API_URL}/balance`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar saldo');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro em getBalance:', error);
            throw error;
        }
    },

    /**
     * Conectar ao socket do Blackjack
     */
    connectSocket: (token, onConnected, onError) => {
        console.log("Conectando ao socket com token:", token ? "Token existente" : "Token ausente");

        // Usando o endereço base da URL da API
        const serverUrl = BLACKJACK_API_URL.split('/api/blackjack')[0];
        console.log("URL do servidor para socket:", serverUrl);

        const socket = io(serverUrl, {
            path: '/blackjack/socket.io',
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: {
                token: token
            }
        });

        socket.on('connect', () => {
            console.log('Conectado ao socket do Blackjack');
            if (onConnected) onConnected(socket);
        });

        socket.on('connect_error', (error) => {
            console.error('Erro de conexão com socket do Blackjack:', error);
            if (onError) onError(error);
        });

        return socket;
    }
};