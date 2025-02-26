import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../config/api';

export async function signup(email, nickname, senha, classe) {
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, {
            email,
            nickname,
            senha,
            classe
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            return { error: error.response.data.error };
        }
        return { error: 'Erro na requisição' };
    }
}

export async function login(email, senha) {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { email, senha });
        return response.data;
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            return { error: error.response.data.error };
        }
        return { error: 'Erro na requisição' };
    }
}

export async function getProfile() {
    try {
        const token = await SecureStore.getItemAsync('userToken');
        const response = await axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : error;
    }
}
