import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    ImageBackground,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Pressable,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TopBar from '../../components/TopBar';
import styles from './styles';
import { AuthContext } from '../../contexts/AuthContext';
import { FontAwesome5, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { arenaService } from '../../services/arenaService';

const CLASS_ICONS = {
    guerreiro: "shield-alt",
    mago: "hat-wizard",
    arqueiro: "bow-arrow",
    assassino: "user-ninja",
    paladino: "cross",
    default: "user"
};

const ELO_ICONS = {
    Bronze: "chess-pawn",
    Prata: "chess-knight",
    Ouro: "chess-bishop",
    Platina: "chess-rook",
    Diamante: "chess-queen",
    Mestre: "chess-king"
};

export default function ArenaScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const [dailyBattles, setDailyBattles] = useState(null);
    const [availablePlayers, setAvailablePlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);
    const [challengingPlayer, setChallengingPlayer] = useState(null);

    useEffect(() => {
        loadArenaData();
    }, []);

    const loadArenaData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [battlesResponse, playersResponse] = await Promise.all([
                arenaService.getDailyBattles(token),
                arenaService.getAvailablePlayers(token)
            ]);
            setDailyBattles(battlesResponse.remainingBattles);
            setAvailablePlayers(playersResponse.players.players || []);
        } catch (err) {
            setError('Erro ao carregar dados da arena');
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleChallenge = async (playerId) => {
        try {
            setChallengingPlayer(playerId);
            const response = await arenaService.startBattleTeste(token, playerId);
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'Battle',
                        params: { battleId: response.batalhaId }
                    }
                ]
            });
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível iniciar a batalha. Tente novamente.');
            console.error('Erro ao iniciar batalha:', err);
        } finally {
            setChallengingPlayer(null);
        }
    };

    const handleBack = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }]
        });
    };

    const renderPlayer = ({ item }) => (
        <View style={styles.playerCard}>
            <View style={styles.playerHeader}>
                <View style={styles.playerAvatar}>
                    <FontAwesome5
                        name={CLASS_ICONS[item.classe?.toLowerCase()] || CLASS_ICONS.default}
                        size={32}
                        color="#a67c52"
                    />
                </View>
                <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{item.nickname}</Text>
                    <View style={styles.statsContainer}>
                        <View style={styles.statBadge}>
                            <FontAwesome5
                                name={CLASS_ICONS[item.classe?.toLowerCase()] || CLASS_ICONS.default}
                                size={12}
                                color="#a67c52"
                            />
                            <Text style={styles.statText}>{item.classe || 'Sem classe'}</Text>
                        </View>
                        <View style={styles.statBadge}>
                            <FontAwesome5 name="star" size={12} color="#a67c52" />
                            <Text style={styles.statText}>Nível {item.nivel}</Text>
                        </View>
                        <View style={styles.statBadge}>
                            <FontAwesome5
                                name={ELO_ICONS[item.elo] || 'chess-pawn'}
                                size={12}
                                color="#a67c52"
                            />
                            <Text style={styles.statText}>{item.elo}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={[
                    styles.challengeButton,
                    challengingPlayer === item.usuario_id && styles.challengeButtonDisabled
                ]}
                onPress={() => handleChallenge(item.usuario_id)}
                disabled={challengingPlayer === item.usuario_id}
            >
                {challengingPlayer === item.usuario_id ? (
                    <ActivityIndicator size="small" color="#a67c52" />
                ) : (
                    <Text style={styles.challengeButtonText}>DESAFIAR</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <FontAwesome5 name="user-slash" size={50} color="#FFF" />
            <Text style={styles.emptyText}>
                Nenhum oponente disponível no seu nível no momento.
            </Text>
            <Text style={styles.emptySubtext}>
                Tente novamente mais tarde ou continue evoluindo seu personagem!
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={loadArenaData}>
                <Text style={styles.refreshButtonText}>Atualizar Lista</Text>
            </TouchableOpacity>
        </View>
    );

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
                    <ActivityIndicator size="large" color="#FFF" />
                </LinearGradient>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground
            source={require('../../../assets/images/background_app.jpeg')}
            style={styles.container}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <TopBar />

                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBack}
                        >
                            <MaterialIcons
                                name="arrow-back"
                                size={24}
                                style={styles.backIcon}
                            />
                        </TouchableOpacity>

                        <View style={styles.battleCounter}>
                            <MaterialCommunityIcons name="sword-cross" size={20} color="#a67c52" />
                            <Text style={styles.battleCounterText}>
                                Batalhas Restantes: {dailyBattles || 0}
                            </Text>
                        </View>
                    </View>

                    <FlatList
                        key="arena-grid-2"
                        data={availablePlayers}
                        renderItem={renderPlayer}
                        keyExtractor={item => item.usuario_id.toString()}
                        numColumns={2}
                        contentContainerStyle={styles.playersList}
                        ListEmptyComponent={renderEmptyList}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={loadArenaData} tintColor="#FFF" />
                        }
                    />

                    <View style={styles.arenaMenu}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('Ranking')}
                        >
                            <View style={styles.menuIcon}>
                                <FontAwesome5 name="trophy" size={20} color="#a67c52" />
                            </View>
                            <Text style={styles.menuText}>Ranking</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('BattleHistory')}
                        >
                            <View style={styles.menuIcon}>
                                <FontAwesome5 name="history" size={20} color="#a67c52" />
                            </View>
                            <Text style={styles.menuText}>Histórico</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuIcon}>
                                <FontAwesome5 name="medal" size={20} color="#a67c52" />
                            </View>
                            <Text style={styles.menuText}>Prêmios</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuIcon}>
                                <FontAwesome5 name="store" size={20} color="#a67c52" />
                            </View>
                            <Text style={styles.menuText}>Loja</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuIcon}>
                                <FontAwesome5 name="cog" size={20} color="#a67c52" />
                            </View>
                            <Text style={styles.menuText}>Config</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            activeOpacity={0.7}
                        >
                            <View style={styles.menuIcon}>
                                <FontAwesome5 name="question" size={20} color="#a67c52" />
                            </View>
                            <Text style={styles.menuText}>Ajuda</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
}
