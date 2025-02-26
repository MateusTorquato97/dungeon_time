import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View,
    Text,
    Animated,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    ImageBackground,
    Image,
    TouchableOpacity,
    Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { arenaService } from '../../services/arenaService';
import styles from './styles';
import { CLASS_IMAGES } from '../../constants/classImages';

/**
 * Função auxiliar para obter a imagem do personagem baseado em "skinPath".
 */
const getPlayerImage = (skinPath) => {
    const [category, path] = skinPath.split('/');
    return CLASS_IMAGES[category]?.[path] || CLASS_IMAGES.default.guerreiro;
};

export default function BattleScreen({ route, navigation }) {
    const { battleId } = route.params;
    const { token, usuario } = useContext(AuthContext);

    // Estados principais
    const [battleData, setBattleData] = useState(null);
    const [currentLog, setCurrentLog] = useState(0);
    const [showResultBanner, setShowResultBanner] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Estados para saúde atual dos jogadores
    const [currentHP1, setCurrentHP1] = useState(0);
    const [currentHP2, setCurrentHP2] = useState(0);

    // Animações de posição e barras de vida
    const player1Position = useRef(new Animated.Value(0)).current;
    const player2Position = useRef(new Animated.Value(0)).current;
    const player1Health = useRef(new Animated.Value(1)).current;
    const player2Health = useRef(new Animated.Value(1)).current;

    // Efeitos visuais temporários (dano, dodge, etc.)
    const [player1Damage, setPlayer1Damage] = useState(null);
    const [player2Damage, setPlayer2Damage] = useState(null);
    const [player1Dodge, setPlayer1Dodge] = useState(false);
    const [player2Dodge, setPlayer2Dodge] = useState(false);
    const [player1DoubleAttack, setPlayer1DoubleAttack] = useState(false);
    const [player2DoubleAttack, setPlayer2DoubleAttack] = useState(false);

    // Efeitos contínuos (ex: bloqueio)
    const [player1Effects, setPlayer1Effects] = useState({});
    const [player2Effects, setPlayer2Effects] = useState({});

    // Turno e atacante atual
    const [currentTurn, setCurrentTurn] = useState(null);
    const [currentAttacker, setCurrentAttacker] = useState(null);

    // Controle de logs e animações
    const scrollViewRef = useRef(null);
    const battleTimeoutRef = useRef(null);
    const animateNextActionRef = useRef(null);
    const currentLogIndex = useRef(0);

    // Animação decorativa (por exemplo, para banners, tochas, etc.)
    const decorShakeAnim = useRef(new Animated.Value(0)).current;

    // Ao carregar os dados da batalha, inicializa a saúde atual
    useEffect(() => {
        if (battleData) {
            setCurrentHP1(battleData.player1.maxHealth);
            setCurrentHP2(battleData.player2.maxHealth);
        }
    }, [battleData]);

    // Carrega os dados da batalha ao montar
    useEffect(() => {
        loadBattleData();
        return () => {
            if (battleTimeoutRef.current) clearTimeout(battleTimeoutRef.current);
        };
    }, []);

    // Animação de “balanço” para decorações
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(decorShakeAnim, {
                    toValue: 1,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(decorShakeAnim, {
                    toValue: 0,
                    duration: 3000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const loadBattleData = async () => {
        try {
            const data = await arenaService.getBattleDetails(token, battleId);
            setBattleData(data);
            startBattleAnimation(data);
        } catch (error) {
            console.error('Erro ao carregar dados da batalha:', error);
        }
    };

    const startBattleAnimation = (data) => {
        if (!data?.logs?.length) return;
        currentLogIndex.current = 0;

        const animateNextAction = () => {
            if (isPaused) return;
            if (currentLogIndex.current >= data.logs.length) {
                setShowResultBanner(true);
                return;
            }

            const log = data.logs[currentLogIndex.current];
            const isPlayer1Attacking = (log.attacker === data.player1.id);
            setCurrentTurn(log.turn);
            setCurrentAttacker(log.attacker);

            // Aplica efeito de bloqueio se houver
            if (log.effects && log.effects.bloqueio) {
                const effect = log.effects.bloqueio;
                if (isPlayer1Attacking) {
                    setPlayer1Effects(prev => ({
                        ...prev,
                        bloqueio: { valor: effect.valor, duracao: effect.duracao, turnoAtivacao: log.turn }
                    }));
                } else {
                    setPlayer2Effects(prev => ({
                        ...prev,
                        bloqueio: { valor: effect.valor, duracao: effect.duracao, turnoAtivacao: log.turn }
                    }));
                }
            }

            // Animação de ataque: avanço e recuo
            Animated.sequence([
                Animated.timing(isPlayer1Attacking ? player1Position : player2Position, {
                    toValue: isPlayer1Attacking ? 40 : -40,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(isPlayer1Attacking ? player1Position : player2Position, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => {
                // Atualiza os efeitos temporários (dano/dodge/ataque duplo)
                if (log.damage > 0) {
                    if (isPlayer1Attacking) {
                        setPlayer2Damage(log.damage);
                        setCurrentHP2(log.newHealth);
                    } else {
                        setPlayer1Damage(log.damage);
                        setCurrentHP1(log.newHealth);
                    }
                    setTimeout(() => {
                        setPlayer1Damage(null);
                        setPlayer2Damage(null);
                    }, 1000);
                } else if (log.cura > 0) {
                    // Se houver cura, exibe como valor negativo (ou outro estilo)
                    if (isPlayer1Attacking) {
                        setPlayer2Damage(-log.cura);
                        setCurrentHP2(log.newHealth);
                    } else {
                        setPlayer1Damage(-log.cura);
                        setCurrentHP1(log.newHealth);
                    }
                    setTimeout(() => {
                        setPlayer1Damage(null);
                        setPlayer2Damage(null);
                    }, 1000);
                } else if (log.message.includes('desviou') || log.message.includes('bloqueou')) {
                    if (isPlayer1Attacking) setPlayer2Dodge(true);
                    else setPlayer1Dodge(true);
                    setTimeout(() => {
                        setPlayer1Dodge(false);
                        setPlayer2Dodge(false);
                    }, 1000);
                } else if (log.message.includes('atacou novamente')) {
                    if (isPlayer1Attacking) setPlayer1DoubleAttack(true);
                    else setPlayer2DoubleAttack(true);
                    setTimeout(() => {
                        setPlayer1DoubleAttack(false);
                        setPlayer2DoubleAttack(false);
                    }, 1000);
                }

                // Atualiza a barra de vida (animação)
                const healthPercentage = log.newHealth / (
                    isPlayer1Attacking ? data.player2.maxHealth : data.player1.maxHealth
                );
                Animated.timing(isPlayer1Attacking ? player2Health : player1Health, {
                    toValue: healthPercentage,
                    duration: 500,
                    useNativeDriver: false,
                }).start(() => {
                    setCurrentLog(currentLogIndex.current);
                    currentLogIndex.current++;
                    if (currentLogIndex.current < data.logs.length && !isPaused) {
                        battleTimeoutRef.current = setTimeout(animateNextAction, 1500);
                    } else if (currentLogIndex.current >= data.logs.length) {
                        setShowResultBanner(true);
                    }
                });
            });
        };

        animateNextActionRef.current = animateNextAction;
        animateNextAction();
    };

    // Efeito para reduzir a duração do bloqueio a cada turno
    useEffect(() => {
        if (!currentTurn || !currentAttacker || !battleData) return;

        if (currentAttacker === battleData.player2.id && player1Effects.bloqueio) {
            setPlayer1Effects(prev => {
                if (!prev.bloqueio) return prev;
                const newDuracao = prev.bloqueio.duracao - 1;
                if (newDuracao <= 0) {
                    const { bloqueio, ...rest } = prev;
                    return rest;
                }
                return { ...prev, bloqueio: { ...prev.bloqueio, duracao: newDuracao } };
            });
        }
        if (currentAttacker === battleData.player1.id && player2Effects.bloqueio) {
            setPlayer2Effects(prev => {
                if (!prev.bloqueio) return prev;
                const newDuracao = prev.bloqueio.duracao - 1;
                if (newDuracao <= 0) {
                    const { bloqueio, ...rest } = prev;
                    return rest;
                }
                return { ...prev, bloqueio: { ...prev.bloqueio, duracao: newDuracao } };
            });
        }
    }, [currentTurn, currentAttacker, player1Effects, player2Effects, battleData]);

    const formatBattleLog = (message) => {
        const parts = [];
        const turnMatch = message.match(/^(Turno \d+:)/);
        if (turnMatch) {
            parts.push(<Text key="turn" style={styles.turnText}>{turnMatch[1]}</Text>);
            message = message.slice(turnMatch[1].length);
        }
        const damageMatch = message.match(/(\d+ de dano)/);
        if (damageMatch) {
            const beforeDamage = message.split(damageMatch[1])[0];
            const afterDamage = message.split(damageMatch[1])[1];
            parts.push(<Text key="before">{beforeDamage}</Text>);
            parts.push(<Text key="damage" style={styles.damageValueText}>{damageMatch[1]}</Text>);
            parts.push(<Text key="after">{afterDamage}</Text>);
        } else {
            if (message.match(/(bloqueou o ataque|bloqueio terminou)/)) {
                const blockMatch = message.match(/(bloqueou o ataque|bloqueio terminou)/);
                const [before, after] = message.split(blockMatch[1]);
                parts.push(<Text key="before">{before}</Text>);
                parts.push(<Text key="block" style={styles.blockText}>{blockMatch[1]}</Text>);
                parts.push(<Text key="after">{after}</Text>);
            } else if (message.includes('desviou do ataque')) {
                const dodgeMatch = message.match(/(desviou do ataque)/);
                const [before, after] = message.split(dodgeMatch[1]);
                parts.push(<Text key="before">{before}</Text>);
                parts.push(<Text key="dodge" style={styles.dodgeText}>{dodgeMatch[1]}</Text>);
                parts.push(<Text key="after">{after}</Text>);
            } else if (message.includes('atacou novamente')) {
                const doubleAttackMatch = message.match(/(atacou novamente)/);
                const [before, after] = message.split(doubleAttackMatch[1]);
                parts.push(<Text key="before">{before}</Text>);
                parts.push(<Text key="doubleAttack" style={styles.doubleAttackText}>{doubleAttackMatch[1]}</Text>);
                parts.push(<Text key="after">{after}</Text>);
            } else {
                parts.push(<Text key="rest">{message}</Text>);
            }
        }
        return <Text style={styles.logText}>{parts}</Text>;
    };

    const handlePauseResume = () => {
        if (isPaused) {
            setIsPaused(false);
            if (animateNextActionRef.current) animateNextActionRef.current();
        } else {
            if (battleTimeoutRef.current) clearTimeout(battleTimeoutRef.current);
            setIsPaused(true);
        }
    };

    const handleRestart = () => {
        if (battleTimeoutRef.current) clearTimeout(battleTimeoutRef.current);
        currentLogIndex.current = 0;
        setShowResultBanner(false);
        setCurrentLog(0);
        setCurrentTurn(null);
        setCurrentAttacker(null);
        setPlayer1Damage(null);
        setPlayer2Damage(null);
        setPlayer1Effects({});
        setPlayer2Effects({});
        player1Position.setValue(0);
        player2Position.setValue(0);
        player1Health.setValue(1);
        player2Health.setValue(1);
        // Reinicia as saúdes para os valores máximos
        setCurrentHP1(battleData.player1.maxHealth);
        setCurrentHP2(battleData.player2.maxHealth);
        setIsPaused(false);
        startBattleAnimation(battleData);
    };

    const handleBack = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Arena' }]
        });
    };

    if (!battleData) return null;

    const shakeInterpolation = decorShakeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '1deg']
    });
    const decorationShakeStyle = {
        transform: [{ rotate: shakeInterpolation }]
    };

    return (
        <ImageBackground
            source={require('../../../assets/images/background_arena2.jpg')}
            style={styles.container}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)']}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    {/* Arena principal */}
                    <View style={styles.arenaContainer}>
                        {/* PLAYER 1 */}
                        <View style={styles.player1Container}>
                            <Animated.View
                                style={[
                                    styles.characterSprite,
                                    { transform: [{ translateX: player1Position }] }
                                ]}
                            >
                                <Image
                                    source={getPlayerImage(battleData.player1.skinPath)}
                                    style={styles.characterImage}
                                />
                            </Animated.View>
                            <View style={styles.playerInfo}>
                                <View style={styles.healthBarContainer}>
                                    <Animated.View
                                        style={[
                                            styles.healthBar,
                                            {
                                                width: player1Health.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%']
                                                })
                                            }
                                        ]}
                                    />
                                </View>
                                {/* Exibe o valor da vida */}
                                <Text style={styles.healthText}>
                                    {currentHP1}/{battleData.player1.maxHealth}
                                </Text>
                                <Text style={styles.playerName}>{battleData.player1.nickname}</Text>
                                {player1Effects.bloqueio && (
                                    <View style={styles.effectIcon}>
                                        <FontAwesome5 name="shield-alt" size={18} color="#87CEEB" />
                                        <Text style={styles.effectDuration}>
                                            {player1Effects.bloqueio.duracao}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {player1Damage && (
                                <Animated.Text style={[styles.damageText, styles.player1EffectText]}>
                                    {player1Damage}
                                </Animated.Text>
                            )}
                            {player1Dodge && (
                                <Text style={[styles.dodgeText, styles.player1EffectText]}>
                                    DODGE!
                                </Text>
                            )}
                            {player1DoubleAttack && (
                                <Text style={[styles.doubleAttackText, styles.player1EffectText]}>
                                    ATAQUE DUPLO!
                                </Text>
                            )}
                        </View>

                        {/* PLAYER 2 */}
                        <View style={styles.player2Container}>
                            <Animated.View
                                style={[
                                    styles.characterSprite,
                                    { transform: [{ translateX: player2Position }] }
                                ]}
                            >
                                <Image
                                    source={getPlayerImage(battleData.player2.skinPath)}
                                    style={styles.characterImage}
                                />
                            </Animated.View>
                            <View style={styles.playerInfo}>
                                <View style={styles.healthBarContainer}>
                                    <Animated.View
                                        style={[
                                            styles.healthBar,
                                            {
                                                width: player2Health.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0%', '100%']
                                                })
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.healthText}>
                                    {currentHP2}/{battleData.player2.maxHealth}
                                </Text>
                                <Text style={styles.playerName}>{battleData.player2.nickname}</Text>
                                {player2Effects.bloqueio && (
                                    <View style={styles.effectIcon}>
                                        <FontAwesome5 name="shield-alt" size={18} color="#87CEEB" />
                                        <Text style={styles.effectDuration}>
                                            {player2Effects.bloqueio.duracao}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            {player2Damage && (
                                <Animated.Text style={[styles.damageText, styles.player2EffectText]}>
                                    {player2Damage}
                                </Animated.Text>
                            )}
                            {player2Dodge && (
                                <Text style={[styles.dodgeText, styles.player2EffectText]}>
                                    DODGE!
                                </Text>
                            )}
                            {player2DoubleAttack && (
                                <Text style={[styles.doubleAttackText, styles.player2EffectText]}>
                                    ATAQUE DUPLO!
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Log da Batalha */}
                    <View style={styles.logWrapper}>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.logContainer}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        >
                            {battleData.logs.slice(0, currentLog + 1).map((log, index) => (
                                <View key={index}>{formatBattleLog(log.message)}</View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Controles */}
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity onPress={handleBack} style={styles.controlButton}>
                            <FontAwesome5 name="arrow-left" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View style={styles.rightControlsContainer}>
                            <TouchableOpacity onPress={handlePauseResume} style={styles.controlButton}>
                                <FontAwesome5 name={isPaused ? "play" : "pause"} size={24} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleRestart} style={[styles.controlButton, { marginLeft: 10 }]}>
                                <FontAwesome5 name="redo" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {showResultBanner && (
                        <View style={styles.resultBanner}>
                            <Text style={styles.resultTitle}>
                                {battleData.status === 'finalizada' && battleData.winner &&
                                    (battleData.winner === usuario.id ? 'Vitória!' : 'Derrota!')}
                            </Text>
                            <Text style={styles.resultMessage}>
                                {battleData.status === 'finalizada' && battleData.winner &&
                                    (battleData.winner === usuario.id
                                        ? 'Você venceu a batalha!'
                                        : 'Você perdeu a batalha!')}
                            </Text>
                        </View>
                    )}
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
}