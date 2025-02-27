import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home';
import ChatScreen from '../screens/Chat';
import DungeonsScreen from '../screens/Dungeons';
import InventoryScreen from '../screens/Inventory';
import CharacterScreen from '../screens/Character';
import ArenaScreen from '../screens/Arena';
import BattleScreen from '../screens/Battle';
import RankingScreen from '../screens/RankingArena';
import BattleHistoryScreen from '../screens/BattleHistory';
import CasinoScreen from '../screens/Casino';

const Stack = createNativeStackNavigator();

export default function AppStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Dungeons" component={DungeonsScreen} />
            <Stack.Screen name="Inventory" component={InventoryScreen} />
            <Stack.Screen name="Character" component={CharacterScreen} />
            <Stack.Screen name="Arena" component={ArenaScreen} />
            <Stack.Screen name="Battle" component={BattleScreen} />
            <Stack.Screen name="Ranking" component={RankingScreen} />
            <Stack.Screen name="BattleHistory" component={BattleHistoryScreen} />
            <Stack.Screen name="Casino" component={CasinoScreen} />
        </Stack.Navigator>
    );
}
