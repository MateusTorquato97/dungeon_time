import React, { useState, useEffect, useContext, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput,
    BackHandler
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { blackjackService } from '../../../services/blackjackService';
import { AuthContext } from '../../../contexts/AuthContext';
import { styles } from './styles';
import { useFocusEffect } from '@react-navigation/native';

// Componente para exibir uma carta
const Card = ({ card, faceDown = false, style = {} }) => {
    if (faceDown) {
        return (
            <View style={[styles.card, styles.cardBack, style]}>
                <View style={styles.cardPattern}>
                    <FontAwesome5 name="dice" size={30} color="#A00" />
                </View>
            </View>
        );
    }

    const suitColor = card.suit === '♥' || card.suit === '♦' ? '#FF0000' : '#000000';
    return (
        <View style={[styles.card, style]}>
            <Text style={[styles.cardCorner, { color: suitColor }]}>
                {card.value}
                {'\n'}
                <Text style={styles.cardSuit}>{card.suit}</Text>
            </Text>
            <Text style={[styles.cardCenter, { color: suitColor }]}>{card.suit}</Text>
            <Text style={[styles.cardCornerBottom, { color: suitColor }]}>
                {card.value}
                {'\n'}
                <Text style={styles.cardSuit}>{card.suit}</Text>
            </Text>
        </View>
    );
};

// Componente para exibir um jogador e suas cartas
const Player = ({ player, isCurrentPlayer, currentUser }) => {
    const isMe = player?.userId === currentUser?.id;

    return (
        <View style={[styles.playerContainer, isCurrentPlayer && styles.activePlayer]}>
            <View style={styles.playerInfo}>
                <View style={styles.playerAvatar}>
                    <FontAwesome5 name="user" size={20} color="#FFD700" />
                </View>
                <Text style={styles.playerName} numberOfLines={1}>
                    {isMe ? 'Você' : player?.nickname || 'Jogador'}
                    {isCurrentPlayer && ' (Jogando)'}
                </Text>
            </View>

            {player?.play ? (
                <View style={styles.playerCards}>
                    {player.play.cards.map((card, index) => (
                        <Card key={index} card={card} style={{ marginLeft: index > 0 ? -60 : 0, zIndex: 10 - index }} />
                    ))}
                    <View style={styles.pointsBadge}>
                        <Text style={styles.pointsText}>{player.play.points}</Text>
                    </View>

                    {player.play.bet > 0 && (
                        <View style={styles.betContainer}>
                            <FontAwesome5 name="coins" size={12} color="#FFD700" />
                            <Text style={styles.betText}>{player.play.bet}</Text>
                        </View>
                    )}

                    {player.play.result && (
                        <View style={[
                            styles.resultBadge,
                            player.play.result === 'ganhou' || player.play.result === 'blackjack' ? styles.wonBadge :
                                player.play.result === 'empatou' ? styles.drawBadge : styles.lostBadge
                        ]}>
                            <Text style={styles.resultText}>
                                {player.play.result === 'ganhou' ? 'Ganhou' :
                                    player.play.result === 'perdeu' ? 'Perdeu' :
                                        player.play.result === 'empatou' ? 'Empatou' :
                                            player.play.result === 'blackjack' ? 'Blackjack!' :
                                                'Surrender'}
                            </Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.waitingContainer}>
                    <Text style={styles.waitingText}>Aguardando...</Text>
                </View>
            )}
        </View>
    );
};

const RoomDetail = ({ route, navigation }) => {
    const { roomId } = route.params;
    const { usuario, token } = useContext(AuthContext);
    const [roomDetails, setRoomDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [betModalVisible, setBetModalVisible] = useState(false);
    const [betAmount, setBetAmount] = useState('');
    const [placingBet, setPlacingBet] = useState(false);
    const currentPlayer = gameState?.currentPlayer;
    const isMyTurn = currentPlayer === usuario?.id;
    const canBet = gameState?.round?.status === 'apostas';
    const hasDealer = gameState?.round?.dealerCards && gameState?.round?.dealerCards.length > 0;
    const myPlayer = gameState?.players?.find(p => p.userId === usuario?.id);
    const actionInProgress = useRef(false);
    // Timer para nova rodada
    const [newRoundCountdown, setNewRoundCountdown] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                if (roomDetails && gameState?.round) {
                    Alert.alert(
                        "Sair da Sala",
                        "Tem certeza que deseja sair da sala? Você perderá qualquer aposta já feita.",
                        [
                            { text: "Cancelar", style: "cancel" },
                            { text: "Sair", onPress: () => handleLeaveRoom() }
                        ]
                    );
                    return true;
                }
                return false;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => backHandler.remove();
        }, [roomDetails, gameState])
    );

    // Efeito para lidar com contagem regressiva para nova rodada
    useEffect(() => {
        let timer;
        if (gameState?.round?.status === 'finalizada') {
            // Iniciar contagem regressiva de 5 segundos
            setNewRoundCountdown(5);

            timer = setInterval(() => {
                setNewRoundCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [gameState?.round?.status]);

    useEffect(() => {
        // Conectar ao servidor e carregar detalhes da sala
        const connectAndLoad = async () => {
            try {
                setLoading(true);
                console.log("Iniciando conexão para a sala:", roomId);

                // Tentar carregar detalhes da sala primeiro pela API
                try {
                    const details = await blackjackService.getRoomDetails(token, roomId);
                    console.log("Detalhes da sala obtidos via API:", details);
                    setRoomDetails(details);
                } catch (apiError) {
                    console.warn("Erro ao carregar detalhes da sala via API:", apiError);
                    // Continuamos mesmo com erro aqui, tentando pelo socket
                }

                // Conectar ao socket
                const newSocket = blackjackService.connectSocket(token, async (connectedSocket) => {
                    console.log("Socket conectado, entrando na sala:", roomId);

                    // Configurando ouvinte de erro para depuração
                    connectedSocket.onAny((event, ...args) => {
                        console.log(`Evento socket recebido: ${event}`, args);
                    });

                    // Ao conectar, entrar na sala
                    connectedSocket.emit('join-room', roomId);

                    // Configurar listeners
                    connectedSocket.on('room-joined', (data) => {
                        console.log('Entrou na sala:', data);
                    });

                    connectedSocket.on('game-state', (state) => {
                        console.log('Estado do jogo atualizado:', JSON.stringify(state));

                        // Verificar se o estado mudou significativamente
                        const roundStatusChanged = !gameState?.round?.status ||
                            gameState.round.status !== state?.round?.status;

                        const dealerCardsChanged = gameState?.round?.dealerCards && state?.round?.dealerCards &&
                            gameState.round.dealerCards.length !== state.round.dealerCards.length;

                        // Se o estado mudou de maneira importante, piscar na tela para chamar atenção
                        if (roundStatusChanged || dealerCardsChanged) {
                            console.log('Mudança significativa no estado do jogo:', {
                                roundStatusChanged,
                                dealerCardsChanged,
                                oldStatus: gameState?.round?.status,
                                newStatus: state?.round?.status
                            });

                            // Detectar fim de rodada - quando o status muda para 'finalizada'
                            if (state?.round?.status === 'finalizada') {
                                console.log('Rodada finalizada detectada pelo estado do jogo');

                                // Esse timeout é para garantir que temos tempo de atualizar a UI
                                setTimeout(() => {
                                    // Atualizar a interface para mostrar que a rodada terminou
                                    Alert.alert(
                                        "Rodada Finalizada",
                                        state.round.dealerPoints > 21
                                            ? `O dealer estourou com ${state.round.dealerPoints} pontos!`
                                            : `O dealer terminou com ${state.round.dealerPoints} pontos.`,
                                        [{ text: "OK" }]
                                    );
                                }, 500);
                            }
                        }

                        setGameState(state);
                    });

                    connectedSocket.on('join-error', (data) => {
                        console.error('Erro ao entrar na sala:', data);
                        Alert.alert("Erro", data.message || "Não foi possível entrar na sala");
                        navigation.goBack();
                    });

                    connectedSocket.on('bet-placed', (data) => {
                        console.log('Aposta realizada:', data);
                    });

                    connectedSocket.on('round-finished', (data) => {
                        console.log('Rodada finalizada, dados recebidos:', JSON.stringify(data));

                        // Atualiza o estado local com os dados do dealer e status da rodada
                        setGameState(prevState => {
                            if (!prevState) return prevState;

                            const updatedState = { ...prevState };
                            if (updatedState.round) {
                                updatedState.round.dealerCards = data.dealerCards;
                                updatedState.round.dealerPoints = data.dealerPoints;
                                updatedState.round.status = 'finalizada';
                            }

                            // Atualiza os resultados dos jogadores
                            if (updatedState.players && data.results) {
                                updatedState.players = updatedState.players.map(player => {
                                    const result = data.results.find(r => r.userId === player.userId);
                                    if (result && player.play) {
                                        return {
                                            ...player,
                                            play: {
                                                ...player.play,
                                                result: result.result
                                            }
                                        };
                                    }
                                    return player;
                                });
                            }

                            // Força atualização do status do jogo
                            updatedState.status = 'finalizada';

                            console.log('Estado atualizado após round-finished:', JSON.stringify(updatedState));
                            return updatedState;
                        });
                    });

                    connectedSocket.on('player-hit', (data) => {
                        console.log('Jogador pediu carta:', data);
                    });

                    connectedSocket.on('player-stand', (data) => {
                        console.log('Jogador parou:', data);
                    });

                    connectedSocket.on('player-double', (data) => {
                        console.log('Jogador dobrou:', data);
                    });

                    connectedSocket.on('player-surrender', (data) => {
                        console.log('Jogador desistiu:', data);
                    });

                    connectedSocket.on('next-player', (data) => {
                        console.log('Próximo jogador:', data);
                    });

                    connectedSocket.on('game-error', (data) => {
                        console.error('Erro no jogo:', data);
                        Alert.alert("Erro", data.message);
                    });
                });

                setSocket(newSocket);

                // Carregar detalhes da sala
                const details = await blackjackService.getRoomDetails(token, roomId);
                setRoomDetails(details);
            } catch (error) {
                console.error('Erro ao carregar sala:', error);
                Alert.alert("Erro", "Não foi possível conectar à sala. Tente novamente.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        connectAndLoad();

        return () => {
            // Desconectar socket ao sair da tela
            if (socket) {
                socket.emit('leave-room', roomId);
                socket.disconnect();
            }
        };
    }, [roomId, token]);

    const handleLeaveRoom = () => {
        if (socket) {
            socket.emit('leave-room', roomId);
            socket.disconnect();
        }
        navigation.goBack();
    };

    const handlePlaceBet = () => {
        const amount = parseInt(betAmount);
        if (isNaN(amount) || amount < (gameState?.minBet || 0) || amount > (gameState?.maxBet || 0)) {
            Alert.alert("Erro", `A aposta deve estar entre ${gameState?.minBet} e ${gameState?.maxBet}.`);
            return;
        }

        setPlacingBet(true);
        socket.emit('place-bet', { roomId, amount });
        setBetModalVisible(false);
        setPlacingBet(false);
    };

    const handleHit = () => {
        if (actionInProgress.current) return;
        actionInProgress.current = true;

        socket.emit('hit', { roomId });

        setTimeout(() => {
            actionInProgress.current = false;
        }, 1000);
    };

    const handleStand = () => {
        if (actionInProgress.current) return;
        actionInProgress.current = true;

        socket.emit('stand', { roomId });

        setTimeout(() => {
            actionInProgress.current = false;
        }, 1000);
    };

    const handleDouble = () => {
        if (actionInProgress.current) return;
        actionInProgress.current = true;

        socket.emit('double', { roomId });

        setTimeout(() => {
            actionInProgress.current = false;
        }, 1000);
    };

    const handleSurrender = () => {
        if (actionInProgress.current) return;
        actionInProgress.current = true;

        socket.emit('surrender', { roomId });

        setTimeout(() => {
            actionInProgress.current = false;
        }, 1000);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={styles.loadingText}>Conectando à sala...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        if (gameState?.round) {
                            Alert.alert(
                                "Sair da Sala",
                                "Tem certeza que deseja sair da sala? Você perderá qualquer aposta já feita.",
                                [
                                    { text: "Cancelar", style: "cancel" },
                                    { text: "Sair", onPress: () => handleLeaveRoom() }
                                ]
                            );
                        } else {
                            handleLeaveRoom();
                        }
                    }}
                >
                    <Ionicons name="chevron-back" size={28} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.title}>Sala #{roomId}</Text>
                <View style={styles.roomStatus}>
                    <Text style={styles.roomStatusText}>
                        {gameState?.status === 'aguardando' ? 'Aguardando' :
                            gameState?.status === 'em_andamento' ? 'Em Andamento' :
                                'Finalizada'}
                    </Text>
                </View>
            </View>

            <View style={styles.gameContainer}>
                {/* Seção do Dealer */}
                <View style={styles.dealerSection}>
                    <Text style={styles.dealerTitle}>Dealer</Text>
                    {hasDealer ? (
                        <View style={styles.dealerCards}>
                            {gameState.round.dealerCards.map((card, index) => (
                                <Card
                                    key={index}
                                    card={card}
                                    style={{ marginLeft: index > 0 ? -60 : 0, zIndex: 10 - index }}
                                />
                            ))}
                            <View style={styles.pointsBadge}>
                                <Text style={styles.pointsText}>{gameState.round.dealerPoints}</Text>
                            </View>

                            {gameState.round.status === 'finalizada' && (
                                <View style={[
                                    styles.resultBadge,
                                    gameState.round.dealerPoints > 21 ? styles.dealerBusted : styles.dealerStand
                                ]}>
                                    <Text style={styles.resultText}>
                                        {gameState.round.dealerPoints > 21 ? 'Estourou!' : 'Stand'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View style={styles.waitingDealer}>
                            <Text style={styles.waitingText}>Aguardando início da rodada</Text>
                        </View>
                    )}
                </View>

                {/* Status da Rodada */}
                <View style={styles.roundStatus}>
                    <Text style={styles.roundStatusText}>
                        {!gameState?.round ? 'Aguardando início da rodada' :
                            gameState.round.status === 'em_distribuicao' ? 'Distribuindo cartas...' :
                                gameState.round.status === 'apostas' ? 'Fase de Apostas' :
                                    gameState.round.status === 'jogadas' ? 'Fase de Jogadas' :
                                        gameState.round.status === 'finalizada' ?
                                            newRoundCountdown
                                                ? `Rodada Finalizada! Nova rodada em ${newRoundCountdown}s...`
                                                : 'Rodada Finalizada! Aguardando nova rodada...'
                                            : 'Rodada Finalizada'}
                    </Text>

                    {gameState?.round?.status === 'finalizada' && myPlayer?.play?.result && (
                        <Text style={[
                            styles.resultText,
                            myPlayer.play.result === 'ganhou' || myPlayer.play.result === 'blackjack'
                                ? styles.resultWon
                                : myPlayer.play.result === 'empatou'
                                    ? styles.resultDraw
                                    : styles.resultLost
                        ]}>
                            {myPlayer.play.result === 'ganhou' ? 'Você ganhou!' :
                                myPlayer.play.result === 'perdeu' ? 'Você perdeu.' :
                                    myPlayer.play.result === 'empatou' ? 'Empate!' :
                                        myPlayer.play.result === 'blackjack' ? 'Blackjack!' :
                                            'Surrender'}
                        </Text>
                    )}
                </View>

                {/* Seção de Jogadores */}
                <View style={styles.playersSection}>
                    {gameState?.players?.map((player) => (
                        <Player
                            key={player.userId}
                            player={player}
                            isCurrentPlayer={player.userId === currentPlayer}
                            currentUser={usuario}
                        />
                    ))}
                </View>

                {/* Controles de Jogo */}
                <View style={styles.gameControls}>
                    {canBet && !myPlayer?.play ? (
                        <TouchableOpacity
                            style={styles.betButton}
                            onPress={() => setBetModalVisible(true)}
                        >
                            <FontAwesome5 name="coins" size={18} color="#000" />
                            <Text style={styles.betButtonText}>Fazer Aposta</Text>
                        </TouchableOpacity>
                    ) : isMyTurn && myPlayer?.play?.status !== 'stand' && myPlayer?.play?.status !== 'surrender' ? (
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleHit}
                            >
                                <FontAwesome5 name="plus" size={16} color="#000" />
                                <Text style={styles.actionButtonText}>Hit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleStand}
                            >
                                <FontAwesome5 name="hand-paper" size={16} color="#000" />
                                <Text style={styles.actionButtonText}>Stand</Text>
                            </TouchableOpacity>

                            {myPlayer?.play?.cards?.length === 2 && (
                                <>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={handleDouble}
                                    >
                                        <FontAwesome5 name="angle-double-up" size={16} color="#000" />
                                        <Text style={styles.actionButtonText}>Double</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={handleSurrender}
                                    >
                                        <FontAwesome5 name="flag" size={16} color="#000" />
                                        <Text style={styles.actionButtonText}>Surrender</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    ) : (
                        <View style={styles.waitingTurn}>
                            <Text style={styles.waitingTurnText}>
                                {myPlayer?.play?.status === 'stand' ? 'Você deu Stand' :
                                    myPlayer?.play?.status === 'surrender' ? 'Você desistiu' :
                                        myPlayer?.play ? 'Aguardando sua vez' : 'Aguardando próxima rodada'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Modal de Aposta */}
            <Modal
                visible={betModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setBetModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Fazer Aposta</Text>

                        <Text style={styles.betRange}>
                            Aposta: {gameState?.minBet || 0} - {gameState?.maxBet || 0}
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Valor da Aposta:</Text>
                            <TextInput
                                style={styles.input}
                                value={betAmount}
                                onChangeText={setBetAmount}
                                keyboardType="number-pad"
                                placeholder="Valor da aposta"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setBetModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.confirmButton,
                                    placingBet && styles.disabledButton
                                ]}
                                onPress={handlePlaceBet}
                                disabled={placingBet}
                            >
                                {placingBet ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <Text style={styles.confirmButtonText}>Apostar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default RoomDetail;