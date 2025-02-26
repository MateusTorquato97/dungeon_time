import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    ImageBackground,
    SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { arenaService } from '../../services/arenaService';
import styles from './styles';

const BattleHistoryItem = ({ battle, onWatchBattle }) => (
    <View style={battle.iswinner ? [styles.battleItem, styles.battleItemWinner] : [styles.battleItem, styles.battleItemLoser]}>
        <View style={styles.statusIcon}>
            <MaterialIcons
                name={battle.iswinner ? "emoji-events" : "close"}
                size={24}
                color={battle.iswinner ? "#FFD700" : "#FF4444"}
            />
        </View>

        <View style={styles.battleInfo}>
            <View style={styles.playerInfo}>
                <Text style={styles.playerName}>
                    {battle.jogador_nickname}
                    <Text style={styles.playerDetails}>
                        {` (Nv.${battle.jogador_nivel} ${battle.jogador_classe}) - ID: ${battle.id}`}
                    </Text>
                </Text>
                <Text style={styles.vsText}>VS</Text>
                <Text style={styles.playerName}>
                    {battle.oponente_nickname}
                    <Text style={styles.playerDetails}>
                        {` (Nv.${battle.oponente_nivel} ${battle.oponente_classe})`}
                    </Text>
                </Text>
            </View>

            <Text style={styles.dateText}>
                {new Date(battle.data_inicio).toLocaleDateString()}
            </Text>
        </View>

        <TouchableOpacity
            style={styles.watchButton}
            onPress={() => onWatchBattle(battle.id)}
        >
            <MaterialIcons name="play-circle-filled" size={32} color="#a67c52" />
        </TouchableOpacity>
    </View>
);

export default function BattleHistory({ navigation }) {
    const [battles, setBattles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        loadBattleHistory();
    }, []);

    const loadBattleHistory = async () => {
        try {
            const history = await arenaService.getBattleHistory(token);
            setBattles(history);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWatchBattle = (battleId) => {
        navigation.reset({
            index: 0,
            routes: [{
                name: 'Battle',
                params: { battleId, isReplay: true }
            }]
        });
    };

    const handleBack = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Arena' }]
        });
    };

    if (loading) {
        return (
            <ImageBackground
                source={require('../../../assets/images/background_app.jpeg')}
                style={styles.container}
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
                    style={[styles.gradient, styles.centerContent]}
                >
                    <ActivityIndicator size="large" color="#a67c52" />
                </LinearGradient>
            </ImageBackground>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBack}
                        >
                            <MaterialIcons name="arrow-back" size={24} color="#a67c52" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Histórico de Batalhas</Text>
                    </View>

                    <FlatList
                        data={battles}
                        renderItem={({ item }) => (
                            <BattleHistoryItem
                                battle={item}
                                onWatchBattle={handleWatchBattle}
                            />
                        )}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.listContainer}
                    />
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
} 