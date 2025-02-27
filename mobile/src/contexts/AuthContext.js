// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/api';
import { io } from 'socket.io-client';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        loadStoredUser();
    }, []);

    async function loadStoredUser() {
        try {
            const storedUser = await SecureStore.getItemAsync('user');
            const storedToken = await SecureStore.getItemAsync('token');

            if (storedUser && storedToken) {
                setUsuario(JSON.parse(storedUser));
                setToken(storedToken);
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
        }
    }

    async function signIn(userData, userToken) {
        try {
            await SecureStore.setItemAsync('user', JSON.stringify(userData));
            await SecureStore.setItemAsync('token', userToken);
            setUsuario(userData);
            setToken(userToken);
        } catch (error) {
            console.error('Erro ao salvar dados do usuário:', error);
        }
    }

    async function signOut() {
        try {
            await SecureStore.deleteItemAsync('user');
            await SecureStore.deleteItemAsync('token');
            setUsuario(null);
            setToken(null);
        } catch (error) {
            console.error('Erro ao remover dados do usuário:', error);
        }
    }

    const socket = io(API_URL, {
        transports: ['websocket'],
        auth: {
            token: token
        }
    });

    socket.on('connect', () => {
        console.log('Socket conectado com dados do usuário:', {
            token: token,
            usuario: usuario
        });
    });

    return (
        <AuthContext.Provider value={{
            usuario,
            token,
            signIn,
            signOut,
            signed: !!token
        }}>
            {children}
        </AuthContext.Provider>
    );
}
