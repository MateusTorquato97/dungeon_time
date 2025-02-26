// src/navigation/Routes.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { AuthContext } from '../contexts/AuthContext';

export default function Routes() {
    const { token, loading } = useContext(AuthContext);

    if (loading) {
        return null;
    }

    return (
        <NavigationContainer>
            {token ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
}
