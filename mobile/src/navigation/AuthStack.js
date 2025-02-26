import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Auth/Login';
// Você pode adicionar outras telas de autenticação aqui, como Cadastro, ForgotPassword, etc.

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            {/* Adicione outras telas de autenticação aqui */}
        </Stack.Navigator>
    );
}
