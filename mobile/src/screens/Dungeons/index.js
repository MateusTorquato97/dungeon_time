import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    ImageBackground,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Alert,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../../contexts/AuthContext';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import styles from './styles';
import DungeonProgress from '../../components/DungeonProgress';
import { dungeonService } from '../../services/dungeonService';
import DungeonCard from '../../components/DungeonCard';
import { notificationService } from '../../services/notificationService';
import RewardsModal from '../../components/RewardsModal';
import LevelUpModal from '../../components/LevelUpModal';

export default function DungeonsScreen({ navigation }) {
    const { usuario, token } = useContext(AuthContext);
    const [availableDungeons, setAvailableDungeons] = useState([]);
    const [activeDungeons, setActiveDungeons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    // timeOffset será um número (ms) que representa a diferença entre o horário do servidor e o do dispositivo
    const [timeOffset, setTimeOffset] = useState(0);
    const [showRewardsModal, setShowRewardsModal] = useState(false);
    const [selectedDungeonRewards, setSelectedDungeonRewards] = useState(null);
    const [newItems, setNewItems] = useState([]);
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);
    const [levelUpData, setLevelUpData] = useState(null);

    useEffect(() => {
    }, [token, usuario]);

    const loadDungeons = async () => {
        try {
            setRefreshing(true);
            // Executa as requisições em paralelo
            const [available, active, serverTimeResponse] = await Promise.all([
                dungeonService.getAvailableDungeons(token),
                dungeonService.getActiveDungeons(token),
                dungeonService.getServerTime(token),
            ]);

            setAvailableDungeons(available);
            setActiveDungeons(active);

            // Calcula o offset: diferença entre o horário do servidor e o horário do dispositivo (em ms)
            const serverTimestamp = new Date(serverTimeResponse.serverTime).getTime();
            const clientTimestamp = new Date().getTime();
            const offset = serverTimestamp - clientTimestamp;
            setTimeOffset(offset);

        } catch (error) {
            console.error('Erro no loadDungeons:', error);
            Alert.alert('Erro', 'Falha ao carregar dungeons: ' + error.message);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };

    // Carrega as dungeons ao montar o componente
    useEffect(() => {
        loadDungeons();
    }, []);

    // Atualiza a lista a cada 15 segundos se houver dungeons ativas
    useEffect(() => {
        if (activeDungeons.length > 0) {
            const interval = setInterval(loadDungeons, 30000);
            return () => clearInterval(interval);
        }
    }, [activeDungeons.length]);

    // Iniciar uma dungeon
    const handleDungeonPress = async (dungeon) => {
        try {
            const newDungeon = await dungeonService.startDungeon(token, dungeon.id);
            setActiveDungeons(prev => [...prev, newDungeon]);

            // Pega o timestamp de finalização em milissegundos (horário do servidor)
            const finishTimestamp = new Date(newDungeon.finalizada_em).getTime();
            // Ajusta para o horário do dispositivo subtraindo o offset
            const adjustedFinishTimestamp = finishTimestamp - timeOffset;

            // Agenda a notificação usando o horário ajustado
            await notificationService.scheduleLocalNotification(
                'Dungeon Finalizada! 🎉',
                `Sua exploração em ${dungeon.nome} foi concluída com sucesso!`,
                adjustedFinishTimestamp
            );

            loadDungeons();
        } catch (error) {
            console.error('Erro ao iniciar dungeon:', error);
            Alert.alert('Erro', error.message);
        }
    };


    // Verifica a conclusão das dungeons a cada minuto
    const checkDungeonCompletion = async () => {
        const now = new Date().getTime();
        activeDungeons.forEach(async (dungeon) => {
            const startTime = new Date(dungeon.created_at).getTime();
            const duration = dungeon.tempo_espera * 60 * 1000; // duração em ms
            if (now >= startTime + duration) {
                try {
                    await dungeonService.finishDungeon(token, dungeon.id);
                    loadDungeons();
                } catch (error) {
                    console.error('Erro ao finalizar dungeon:', error);
                }
            }
        });
    };

    useEffect(() => {
        const interval = setInterval(checkDungeonCompletion, 60000);
        return () => clearInterval(interval);
    }, [activeDungeons]);

    // Função para coletar recompensas
    const handleCollectRewards = async (dungeon) => {
        try {
            const result = await dungeonService.collectRewards(token, dungeon.id);

            const newItemIds = result.rewards.map(reward => reward.id);
            setNewItems(prev => [...prev, ...newItemIds]);

            // Armazena os dados de level up para usar depois
            if (result.experiencia.subiuDeNivel) {
                const levelData = {
                    newLevel: result.experiencia.nivel,
                    attributesGained: result.experiencia.atributosGanhos
                };
                setLevelUpData(levelData);
            }

            setSelectedDungeonRewards({
                items: result.rewards,
                experiencia: result.experiencia
            });
            setShowRewardsModal(true);
            loadDungeons();
        } catch (error) {
            console.error('Erro completo:', error);
            Alert.alert('Erro', 'Falha ao coletar recompensas');
        }
    };

    // Modificar o handler de fechar a modal de recompensas
    const handleCloseRewardsModal = () => {
        setShowRewardsModal(false);
        // Se tiver dados de level up, mostra a modal depois que a de recompensas fechar
        if (levelUpData) {
            setShowLevelUpModal(true);
        }
    };

    // Função para fechar o modal de level up
    const handleCloseLevelUpModal = () => {
        setShowLevelUpModal(false);
        setLevelUpData(null);
    };

    if (loading) {
        return (
            <ImageBackground
                source={require('../../../assets/images/background_app.jpeg')}
                style={styles.container}
            >
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground
            source={require('../../../assets/images/background_app.jpeg')}
            style={styles.container}
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <TopBar navigation={navigation} />

                    <ScrollView
                        style={styles.scrollView}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={loadDungeons}
                                tintColor="#ffffff"
                            />
                        }
                    >
                        {/* Dungeons em Andamento */}
                        {activeDungeons.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>EM ANDAMENTO</Text>
                                {activeDungeons.map((dungeon) => (
                                    <View key={dungeon.id} style={{ marginBottom: 16 }}>
                                        <DungeonProgress
                                            dungeon={dungeon}
                                            timeOffset={timeOffset}
                                            onCollectRewards={handleCollectRewards}
                                            token={token}
                                            loadDungeons={loadDungeons}
                                        />
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Dungeons Disponíveis */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>DUNGEONS DISPONÍVEIS</Text>
                            {availableDungeons.map((dungeon) => (
                                <DungeonCard
                                    key={dungeon.id}
                                    dungeon={dungeon}
                                    userLevel={usuario?.nivel || 1}
                                    onPress={handleDungeonPress}
                                />
                            ))}
                        </View>
                    </ScrollView>

                    <BottomNav navigation={navigation} />
                </SafeAreaView>
            </LinearGradient>

            <RewardsModal
                visible={showRewardsModal}
                rewards={selectedDungeonRewards?.items}
                experiencia={selectedDungeonRewards?.experiencia}
                onClose={handleCloseRewardsModal}
                onCollect={handleCloseRewardsModal}
            />

            <LevelUpModal
                visible={showLevelUpModal}
                onClose={handleCloseLevelUpModal}
                levelUpData={levelUpData}
            />
        </ImageBackground>
    );
}