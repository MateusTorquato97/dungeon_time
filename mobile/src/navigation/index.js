import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home';
import Login from '../screens/Auth/Login';
import ChatScreen from '../screens/Chat';
import DungeonsScreen from '../screens/Dungeons';
import { AuthContext } from '../contexts/AuthContext';
import InventoryScreen from '../screens/Inventory';
import CharacterScreen from '../screens/Character';
import ArenaScreen from '../screens/Arena';
import BattleScreen from '../screens/Battle';
import RankingScreen from '../screens/RankingArena';
import BattleHistoryScreen from '../screens/BattleHistory';

const Stack = createNativeStackNavigator();

export default function Navigation() {
    const { token } = useContext(AuthContext);

    console.log('Navigation - Token atual:', token);

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
        >
            {token ? (
                // Rotas autenticadas
                <>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Chat" component={ChatScreen} />
                    <Stack.Screen name="Dungeons" component={DungeonsScreen} />
                    <Stack.Screen name="Inventory" component={InventoryScreen} />
                    <Stack.Screen name="Character" component={CharacterScreen} />
                    <Stack.Screen name="Arena" component={ArenaScreen} />
                    <Stack.Screen name="Battle" component={BattleScreen} />
                    <Stack.Screen name="Ranking" component={RankingScreen} />
                    <Stack.Screen name="BattleHistory" component={BattleHistoryScreen} />
                </>

            ) : (
                // Rotas não autenticadas
                <Stack.Screen name="Login" component={Login} />
            )}
        </Stack.Navigator>
    );
} 