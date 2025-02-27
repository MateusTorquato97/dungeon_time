import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Modal, Alert, ScrollView } from 'react-native';
import { io } from "socket.io-client";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BLACKJACK_API_URL } from '../../config/api';
import { AuthContext } from '../../contexts/AuthContext';
import styles from './styles';

// Componente para a tela de Blackjack
const BlackjackScreen = ({ navigation }) => {
    const { usuario, token } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inRoom, setInRoom] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [currentRound, setCurrentRound] = useState(null);
    const [dealerCards, setDealerCards] = useState([]);
    const [dealerPoints, setDealerPoints] = useState(0);
    const [playerCards, setPlayerCards] = useState([]);
    const [playerPoints, setPlayerPoints] = useState(0);
    const [gameStatus, setGameStatus] = useState(''); // Para mostrar mensagens de jogo
    const [players, setPlayers] = useState([]);
    const [currentBet, setCurrentBet] = useState(0);
    const [myTurn, setMyTurn] = useState(false);
    const [betAmount, setBetAmount] = useState(100);
    const [playerBalance, setPlayerBalance] = useState(0);
    const [showBetModal, setShowBetModal] = useState(false);
    const [roundResult, setRoundResult] = useState(null);
    const [gamePhase, setGamePhase] = useState('waiting'); // 'waiting', 'betting', 'playing', 'result'
    // Novo estado para acompanhar as jogadas de todos os jogadores
    const [allPlays, setAllPlays] = useState([]);
    const [timer, setTimer] = useState(0);
    const [maxTime, setMaxTime] = useState(20); // Padrão de 20 segundos
    const [activeTimerPlayerId, setActiveTimerPlayerId] = useState(null);
    const timerRef = useRef(null);

    const socket = useRef(null);
    const myPosition = useRef(null);
    const userId = useRef(null);

    // Carregar as salas disponíveis
    const loadRooms = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BLACKJACK_API_URL}/api/blackjack/rooms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data.rooms);
            setLoading(false);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar salas de blackjack');
            setLoading(false);
        }
    };

    // Configurar o Socket.IO
    const setupSocket = async () => {
        userId.current = usuario.id;

        if (!socket.current) {
            socket.current = io(BLACKJACK_API_URL, {
                path: '/blackjack/socket.io',
                auth: {
                    token
                },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                timeout: 20000,
                forceNew: true
            });

            // Eventos de Socket
            socket.current.on('connect', () => {
                console.log('Conectado ao servidor de Blackjack');
            });

            socket.current.on('room joined', (data) => {
                console.log('Entrou na sala:', data);
                myPosition.current = data.position;
                setInRoom(true);
                setGamePhase('waiting');
            });

            socket.current.on('room details', (data) => {
                console.log('Detalhes da sala:', data);
                setCurrentRoom(data);
                setPlayers(data.players || []);

                // Mostrar o saldo atual do jogador
                const myPlayer = data.players.find(p => p.userId === userId.current);
                if (myPlayer) {
                    setPlayerBalance(myPlayer.balance);
                }

                // Verificar se já existe uma rodada em andamento
                if (data.currentRound) {
                    setCurrentRound(data.currentRound);

                    if (data.currentRound.status === 'apostas') {
                        setGamePhase('betting');
                        setGameStatus('Apostas abertas! Faça sua aposta.');
                    } else if (data.currentRound.status === 'jogadas') {
                        setGamePhase('playing');

                        // Encontrar minha jogada
                        const myPlay = data.currentRound.plays.find(p => p.userId === userId.current);
                        if (myPlay) {
                            setPlayerCards(myPlay.cards);
                            setPlayerPoints(myPlay.points);
                            setCurrentBet(myPlay.bet);
                        }

                        // Atualizar todas as jogadas
                        setAllPlays(data.currentRound.plays);

                        // Verificar se há cartas do dealer
                        if (data.currentRound.dealerCards && data.currentRound.dealerCards.length > 0) {
                            setDealerCards([data.currentRound.dealerCards[0]]);
                        }
                    } else if (data.currentRound.status === 'finalizada') {
                        setGamePhase('result');

                        // Mostrar resultados
                        setDealerCards(data.currentRound.dealerCards);
                        setDealerPoints(data.currentRound.dealerPoints);

                        // Atualizar todas as jogadas
                        setAllPlays(data.currentRound.plays);

                        // Encontrar minha jogada
                        const myPlay = data.currentRound.plays.find(p => p.userId === userId.current);
                        if (myPlay) {
                            setRoundResult(myPlay.result);
                            setPlayerCards(myPlay.cards);
                            setPlayerPoints(myPlay.points);
                        }
                    }
                }
            });

            socket.current.on('room created', (data) => {
                console.log('Sala criada:', data);
                setCurrentRoom(data);
                setInRoom(true);
                setPlayerBalance(data.initialBalance);
                myPosition.current = 1; // Criador sempre é posição 1
                setGamePhase('waiting');
            });

            socket.current.on('player joined', (data) => {
                console.log('Jogador entrou (dados completos):', JSON.stringify(data, null, 2));

                // Quando um jogador entra, vamos fazer uma solicitação para obter os detalhes atualizados da sala
                if (currentRoom?.id) {
                    // Buscar detalhes completos da sala
                    fetchRoomDetails(currentRoom.id);
                } else {
                    // Caso ainda não tenhamos um ID da sala, atualizar apenas com os dados recebidos
                    setPlayers(prevPlayers => {
                        // Verificar se o jogador já está na lista
                        const exists = prevPlayers.some(p => p.userId === data.userId);
                        if (exists) return prevPlayers;

                        // Adicionar o novo jogador com as informações fornecidas
                        return [...prevPlayers, {
                            userId: data.userId,
                            nickname: data.nickname || usuario.name || 'Jogador ' + data.position,
                            position: data.position,
                            balance: data.balance || 0,
                            status: data.status || 'aguardando'
                        }];
                    });
                }
            });

            socket.current.on('player left', (data) => {
                console.log('Jogador saiu:', data);
                // Remover o jogador da lista
                setPlayers(prevPlayers => prevPlayers.filter(p => p.userId !== data.userId));
                // Remover as jogadas desse jogador também
                setAllPlays(prevPlays => prevPlays.filter(p => p.userId !== data.userId));
            });

            socket.current.on('round started', (data) => {
                console.log('Rodada iniciada:', data);
                setCurrentRound(data);
                setGamePhase('betting');
                setGameStatus('Apostas abertas! Faça sua aposta.');

                // Resetar o estado do jogo
                setDealerCards([]);
                setPlayerCards([]);
                setDealerPoints(0);
                setPlayerPoints(0);
                setRoundResult(null);
                setCurrentBet(0);
                setAllPlays([]);
            });

            socket.current.on('timer_start', (data) => {
                console.log('Timer iniciado:', data);

                // Limpar timer anterior se existir
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }

                setMaxTime(data.duration);
                setTimer(data.duration);
                setActiveTimerPlayerId(data.playerId);

                // Não atualizamos mais o gameStatus aqui para evitar duplicação
                // Se houver fase de próxima rodada, definimos um flag para o timer

                // Iniciar contagem regressiva
                timerRef.current = setInterval(() => {
                    setTimer(prevTime => {
                        const newTime = prevTime - 1;
                        if (newTime <= 0) {
                            clearInterval(timerRef.current);
                            return 0;
                        }
                        return newTime;
                    });
                }, 1000);
            });

            socket.current.on('timer_stop', () => {
                console.log('Timer parado');
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
                setTimer(0);
                setActiveTimerPlayerId(null);
            });

            // Listener para round canceled
            socket.current.on('round canceled', (data) => {
                console.log('Rodada cancelada:', data);
                setGameStatus(`${data.message}. Iniciando nova rodada...`);
                setGamePhase('waiting');

                // Resetar estado da rodada
                setCurrentRound(null);
                setDealerCards([]);
                setPlayerCards([]);
                setDealerPoints(0);
                setPlayerPoints(0);
                setRoundResult(null);
                setCurrentBet(0);
                setAllPlays([]);
            });

            // Listener para players removed
            socket.current.on('players removed', (data) => {
                console.log('Jogadores removidos:', data);

                // Atualizar lista de jogadores
                setPlayers(prevPlayers =>
                    prevPlayers.filter(p => !data.userIds.includes(p.userId))
                );

                // Remover jogadas desses jogadores
                setAllPlays(prevPlays =>
                    prevPlays.filter(p => !data.userIds.includes(p.userId))
                );

                // Mostrar mensagem de jogadores removidos
                if (data.reason === 'inatividade') {
                    const playerNames = data.userIds.map(id => {
                        const player = players.find(p => p.userId === id);
                        return player ? player.nickname : `Jogador ${id}`;
                    }).join(', ');

                    setGameStatus(`${playerNames} ${data.userIds.length > 1 ? 'foram removidos' : 'foi removido'} por inatividade.`);
                }
            });

            // Listener para kicked (quando o próprio jogador é expulso)
            socket.current.on('kicked', (data) => {
                console.log('Você foi expulso:', data);
                Alert.alert('Aviso', data.reason);

                // Voltar para a tela de salas
                setInRoom(false);
                setCurrentRoom(null);
                setPlayers([]);
                setGamePhase('waiting');
                setAllPlays([]);
                loadRooms(); // Recarregar lista de salas
            });

            socket.current.on('betting ended', (data) => {
                console.log('Apostas encerradas:', data);
                setGameStatus('Apostas encerradas! Distribuindo cartas...');
            });

            socket.current.on('cards dealt', (data) => {
                console.log('Cartas distribuídas:', data);
                setGamePhase('playing');

                // Atualizar as cartas do dealer (apenas a primeira carta é visível)
                setDealerCards([data.dealerUpCard]);

                // Atualizar todas as jogadas
                setAllPlays(data.plays);

                // Encontrar minha jogada
                const myPlay = data.plays.find(p => p.userId === userId.current);
                if (myPlay) {
                    setPlayerCards(myPlay.cards);
                    setPlayerPoints(myPlay.points);
                }

                // Verificar se é a minha vez
                if (data.activePlayer && data.activePlayer.userId === userId.current) {
                    setMyTurn(true);
                    setGameStatus('Sua vez! Escolha uma ação.');
                } else {
                    setMyTurn(false);
                    if (data.activePlayer) {
                        const activePlayerName = data.plays.find(p => p.userId === data.activePlayer.userId)?.nickname;
                        setGameStatus(`Vez de ${activePlayerName || 'outro jogador'}.`);
                    }
                }
            });

            socket.current.on('player acted', (data) => {
                console.log('Jogador agiu:', data);

                // Atualizar a jogada do jogador que agiu
                setAllPlays(prevPlays =>
                    prevPlays.map(play =>
                        play.userId === data.userId
                            ? { ...play, cards: data.cards, points: data.points, status: data.status }
                            : play
                    )
                );

                // Se for minha jogada, atualizar minhas cartas
                if (data.userId === userId.current) {
                    setPlayerCards(data.cards);
                    setPlayerPoints(data.points);
                    setMyTurn(false);
                }

                // Atualizar o status do jogo
                const playerName = players.find(p => p.userId === data.userId)?.nickname || 'Jogador';
                setGameStatus(`${data.userId === userId.current ? 'Você' : playerName} escolheu ${actionTranslation(data.action)}.`);
            });

            socket.current.on('next player', (data) => {
                console.log('Próximo jogador:', data);

                // Verificar se é a minha vez
                if (data.userId === userId.current) {
                    setMyTurn(true);
                    setGameStatus('Sua vez! Escolha uma ação.');
                } else {
                    setMyTurn(false);
                    const nextPlayerName = players.find(p => p.userId === data.userId)?.nickname;
                    setGameStatus(`Vez de ${nextPlayerName || 'outro jogador'}.`);
                }
            });

            socket.current.on('turn timeout', (data) => {
                console.log('Tempo esgotado:', data);

                // Atualizar a jogada do jogador que teve timeout
                setAllPlays(prevPlays =>
                    prevPlays.map(play =>
                        play.userId === data.userId
                            ? { ...play, cards: data.cards, points: data.points, status: data.status }
                            : play
                    )
                );

                // Se for minha jogada, atualizar minhas cartas
                if (data.userId === userId.current) {
                    setPlayerCards(data.cards);
                    setPlayerPoints(data.points);
                    setMyTurn(false);
                    setGameStatus('Seu tempo acabou! Stand automático.');
                } else {
                    const playerName = players.find(p => p.userId === data.userId)?.nickname;
                    setGameStatus(`Tempo de ${playerName || 'jogador'} acabou. Stand automático.`);
                }
            });

            socket.current.on('round finished', (data) => {
                console.log('Rodada finalizada:', data);
                setGamePhase('result');

                // Mostrar todas as cartas do dealer
                setDealerCards(data.dealerHand);
                setDealerPoints(data.dealerPoints);

                // Atualizar todas as jogadas com os resultados
                setAllPlays(data.plays);

                // Encontrar minha jogada
                const myPlay = data.plays.find(p => p.userId === userId.current);
                if (myPlay) {
                    setRoundResult(myPlay.result);
                    setPlayerCards(myPlay.cards);
                    setPlayerPoints(myPlay.points);

                    // Definir mensagem de resultado
                    if (myPlay.result) {
                        let message = '';
                        switch (myPlay.result) {
                            case 'blackjack':
                                message = 'Blackjack! Você ganhou 3:2';
                                break;
                            case 'ganhou':
                                message = 'Você ganhou!';
                                break;
                            case 'perdeu':
                                message = 'Você perdeu.';
                                break;
                            case 'empatou':
                                message = 'Empate.';
                                break;
                            case 'surrender':
                                message = 'Você desistiu. Recebeu metade da aposta de volta.';
                                break;
                        }
                        setGameStatus(message);
                    }
                }

                // Atualizar o saldo
                fetchPlayerBalance();
            });

            socket.current.on('error', (data) => {
                console.error('Erro:', data.message);
                Alert.alert('Erro', data.message);
            });
        }
    };

    // Buscar o saldo atual do jogador
    const fetchPlayerBalance = async () => {
        try {
            if (!currentRoom) return;

            const response = await axios.get(`${BLACKJACK_API_URL}/api/blackjack/balance/${currentRoom.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setPlayerBalance(response.data.balance);
        } catch (error) {
            console.error('Erro ao buscar saldo:', error);
        }
    };

    // Buscar detalhes completos da sala
    const fetchRoomDetails = async (roomId) => {
        try {
            console.log('Buscando detalhes atualizados da sala:', roomId);
            const response = await axios.get(`${BLACKJACK_API_URL}/api/blackjack/rooms/${roomId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Atualizar o estado com os dados mais recentes
            if (response.data.room) {
                console.log('Detalhes atualizados da sala:', response.data.room);
                setCurrentRoom(response.data.room);
                setPlayers(response.data.room.players || []);

                // Mostrar o saldo atual do jogador
                const myPlayer = response.data.room.players.find(p => p.userId === userId.current);
                if (myPlayer) {
                    setPlayerBalance(myPlayer.balance);
                }

                // Atualizar o estado da rodada atual
                if (response.data.room.currentRound) {
                    setCurrentRound(response.data.room.currentRound);
                    setAllPlays(response.data.room.currentRound.plays || []);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes da sala:', error);
        }
    };

    // Tradução para as ações
    const actionTranslation = (action) => {
        switch (action) {
            case 'hit': return 'pedir carta';
            case 'stand': return 'parar';
            case 'double': return 'dobrar';
            case 'surrender': return 'desistir';
            default: return action;
        }
    };

    // Tradução para os resultados
    const resultTranslation = (result) => {
        switch (result) {
            case 'blackjack': return 'Blackjack!';
            case 'ganhou': return 'Ganhou';
            case 'perdeu': return 'Perdeu';
            case 'empatou': return 'Empatou';
            case 'surrender': return 'Desistiu';
            default: return result;
        }
    };

    // Método para entrar em uma sala
    const joinRoom = (roomId) => {
        if (socket.current) {
            socket.current.emit('join room', roomId);
        }
    };

    // Método para criar uma sala
    const createRoom = async () => {
        try {
            const response = await axios.post(`${BLACKJACK_API_URL}/api/blackjack/rooms`, {
                minBet: 100,
                maxBet: 1000
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.room) {
                console.log('Sala criada:', response.data.room);
                // Após criar a sala via REST, junte-se à sala via socket:
                socket.current.emit('join room', response.data.room.id);
            }
        } catch (error) {
            Alert.alert('Erro', 'Falha ao criar sala de blackjack');
        }
    };

    // Método para sair da sala
    const leaveRoom = () => {
        if (socket.current) {
            socket.current.emit('leave room');
            setInRoom(false);
            setCurrentRoom(null);
            setPlayers([]);
            setGamePhase('waiting');
            setAllPlays([]);
            loadRooms(); // Recarregar lista de salas
        }
    };

    // Método para iniciar uma rodada
    const startRound = () => {
        if (socket.current) {
            socket.current.emit('start round');
        }
    };

    // Método para fazer uma aposta
    const placeBet = () => {
        if (socket.current && currentRound) {
            socket.current.emit('place bet', {
                roundId: currentRound.roundId,
                betAmount
            });
            setCurrentBet(betAmount);
            setShowBetModal(false);
        }
    };

    // Método para realizar uma ação (hit, stand, double, surrender)
    const playerAction = (action) => {
        if (socket.current && currentRound && myTurn) {
            socket.current.emit('player action', {
                roundId: currentRound.roundId,
                action
            });
            setMyTurn(false);
        }
    };

    // Carregar dados iniciais
    useEffect(() => {
        loadRooms();
        setupSocket();

        return () => {
            // Limpar socket ao desmontar
            if (socket.current) {
                socket.current.disconnect();
            }

            // Limpar qualquer timer que esteja rodando
            timerRef.current && clearInterval(timerRef.current);
        };
    }, []);

    // Renderizar uma carta
    const renderCard = (card, index) => {
        if (!card) return null;

        const suitSymbol = {
            hearts: '♥',
            diamonds: '♦',
            clubs: '♣',
            spades: '♠'
        };

        const symbol = suitSymbol[card.suit] || '?';
        const color = ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black';

        return (
            <View key={index} style={[styles.card, { borderColor: color }]}>
                <Text style={[styles.cardValue, { color }]}>{card.value}</Text>
                <Text style={[styles.cardSuit, { color }]}>{symbol}</Text>
            </View>
        );
    };

    // Renderizar lista de salas
    const renderRoomList = () => (
        <View style={styles.container}>
            <Text style={styles.title}>Blackjack Casino</Text>

            <TouchableOpacity style={styles.createButton} onPress={createRoom}>
                <Text style={styles.buttonText}>Criar Nova Sala</Text>
            </TouchableOpacity>

            <Text style={styles.subtitle}>Salas Disponíveis</Text>

            {loading ? (
                <Text style={styles.loadingText}>Carregando salas...</Text>
            ) : (
                <FlatList
                    data={rooms}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.roomItem}
                            onPress={() => joinRoom(item.id)}
                        >
                            <Text style={styles.roomName}>Sala #{item.id}</Text>
                            <Text style={styles.roomDetails}>
                                Jogadores: {item.playerCount}/{item.maxPlayers}
                            </Text>
                            <Text style={styles.roomDetails}>
                                Apostas: {item.minBet} - {item.maxBet} moedas
                            </Text>
                            <Text style={styles.roomStatus}>
                                Status: {item.status === 'aguardando' ? 'Aguardando' : 'Em andamento'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Nenhuma sala disponível</Text>
                    }
                />
            )}
        </View>
    );

    // Renderizar as cartas de um jogador
    const renderPlayerCards = (play) => {
        if (!play || !play.cards || play.cards.length === 0) return null;

        const showResult = gamePhase === 'result' && play.result;

        return (
            <>
                <View style={styles.otherPlayerHeader}>
                    <Text style={styles.otherPlayerName}>{play.nickname}</Text>
                    <Text style={styles.otherPlayerInfo}>Posição: {play.position}</Text>
                    {play.bet > 0 && (
                        <Text style={styles.otherPlayerInfo}>Aposta: {play.bet}</Text>
                    )}
                    <Text style={styles.otherPlayerInfo}>Pontos: {play.points}</Text>
                    {showResult && (
                        <Text style={[
                            styles.otherPlayerResult,
                            play.result === 'ganhou' || play.result === 'blackjack' ? styles.winText :
                                play.result === 'perdeu' ? styles.loseText : styles.tieText
                        ]}>
                            {resultTranslation(play.result)}
                        </Text>
                    )}
                </View>

                <View style={styles.cardsContainer}>
                    {play.cards.map((card, index) => renderCard(card, index))}
                </View>
            </>
        );
    };

    // Renderizar o componente do timer
    // Renderizar o componente do timer
    const renderTimer = (secondsLeft, maxSeconds, activePlayerId) => {
        // Não mostrar timer se não estiver ativo
        if (!secondsLeft || secondsLeft <= 0) return null;

        // Verificar se é um timer de "próxima rodada"
        const isNextRoundTimer = gamePhase === 'result';

        // Texto a ser exibido
        let timerText = '';
        if (isNextRoundTimer) {
            timerText = `Próxima rodada em ${secondsLeft}s`;
        } else if (activePlayerId) {
            // Timer para jogador específico
            const activePlayer = players.find(p => p.userId === activePlayerId);
            const playerName = activePlayer ? activePlayer.nickname : 'Jogador';
            timerText = `${playerName}: ${secondsLeft}s`;
        } else {
            // Timer genérico (apostas)
            timerText = `${secondsLeft}s`;
        }

        // Calculando percentual para a barra de progresso
        const percentage = Math.max(0, Math.min(100, (secondsLeft / maxSeconds) * 100));

        // Determinar cor com base no tempo restante
        let barColor = '#2ecc71'; // Verde
        if (percentage < 30) {
            barColor = '#e74c3c'; // Vermelho
        } else if (percentage < 60) {
            barColor = '#f39c12'; // Laranja
        }

        return (
            <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{timerText}</Text>
                <View style={styles.timerBarContainer}>
                    <View
                        style={[
                            styles.timerBar,
                            { width: `${percentage}%`, backgroundColor: barColor }
                        ]}
                    />
                </View>
            </View>
        );
    };

    // Renderizar a sala de jogo
    const renderGameRoom = () => (
        <View style={styles.gameContainer}>
            <View style={styles.roomHeader}>
                <Text style={styles.roomTitle}>Sala #{currentRoom?.id}</Text>
                <Text style={styles.balance}>Saldo: {playerBalance} moedas</Text>
                <TouchableOpacity style={styles.leaveButton} onPress={leaveRoom}>
                    <Text style={styles.buttonText}>Sair</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.playersContainer}>
                {players.map((player) => (
                    <View
                        key={player.userId}
                        style={[
                            styles.playerBadge,
                            player.userId === userId.current && styles.currentPlayerBadge
                        ]}
                    >
                        <Text style={styles.playerName}>{player.nickname}</Text>
                        <Text style={styles.playerPosition}>Posição: {player.position}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.gameStatusContainer}>
                <Text style={styles.gameStatusText}>{gameStatus}</Text>
            </View>

            {/* Componente de Timer */}
            {renderTimer(timer, maxTime, activeTimerPlayerId)}

            <ScrollView style={styles.gameArea}>
                {/* Área do dealer */}
                <View style={styles.dealerArea}>
                    <Text style={styles.areaTitle}>Dealer</Text>
                    <Text style={styles.points}>Pontos: {gamePhase === 'result' ? dealerPoints : '?'}</Text>
                    <View style={styles.cardsContainer}>
                        {dealerCards.map((card, index) => renderCard(card, index))}
                        {dealerCards.length === 1 && gamePhase !== 'waiting' && (
                            <View style={styles.hiddenCard}>
                                <Text style={styles.hiddenCardText}>?</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Área do jogador atual */}
                <View style={styles.playerArea}>
                    <Text style={styles.areaTitle}>Suas Cartas</Text>
                    <Text style={styles.points}>Pontos: {playerPoints}</Text>
                    <View style={styles.cardsContainer}>
                        {playerCards.map((card, index) => renderCard(card, index))}
                    </View>

                    {/* Aposta atual */}
                    {currentBet > 0 && (
                        <Text style={styles.currentBet}>Aposta: {currentBet} moedas</Text>
                    )}

                    {/* Resultado da rodada */}
                    {roundResult && (
                        <Text style={[
                            styles.resultText,
                            roundResult === 'ganhou' || roundResult === 'blackjack' ? styles.winText :
                                roundResult === 'perdeu' ? styles.loseText : styles.tieText
                        ]}>
                            {resultTranslation(roundResult)}
                        </Text>
                    )}
                </View>

                {/* Área para mostrar as cartas de outros jogadores */}
                {(gamePhase === 'playing' || gamePhase === 'result') && allPlays.length > 0 && (
                    <View style={styles.otherPlayersArea}>
                        <Text style={styles.areaTitle}>Outros Jogadores</Text>
                        {allPlays
                            .filter(play => play.userId !== userId.current)
                            .sort((a, b) => a.position - b.position)
                            .map(play => (
                                <View key={play.userId} style={styles.otherPlayerContainer}>
                                    {renderPlayerCards(play)}
                                </View>
                            ))}
                    </View>
                )}
            </ScrollView>

            {/* Controles do jogo */}
            <View style={styles.controls}>
                {gamePhase === 'waiting' && myPosition.current === 1 && (
                    <TouchableOpacity style={styles.actionButton} onPress={startRound}>
                        <Text style={styles.buttonText}>Iniciar Rodada</Text>
                    </TouchableOpacity>
                )}

                {gamePhase === 'betting' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => setShowBetModal(true)}
                    >
                        <Text style={styles.buttonText}>Apostar</Text>
                    </TouchableOpacity>
                )}

                {gamePhase === 'playing' && myTurn && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => playerAction('hit')}
                        >
                            <Text style={styles.buttonText}>Hit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => playerAction('stand')}
                        >
                            <Text style={styles.buttonText}>Stand</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => playerAction('double')}
                            disabled={playerBalance < currentBet * 2}
                        >
                            <Text style={styles.buttonText}>Double</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => playerAction('surrender')}
                        >
                            <Text style={styles.buttonText}>Surrender</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Modal de apostas */}
            <Modal
                visible={showBetModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowBetModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Faça sua aposta</Text>

                        <Text style={styles.modalText}>
                            Saldo disponível: {playerBalance} moedas
                        </Text>

                        <View style={styles.betControl}>
                            <TouchableOpacity
                                style={styles.betButton}
                                onPress={() => setBetAmount(Math.max(betAmount - 100, currentRoom?.minBet || 100))}
                            >
                                <Text style={styles.betButtonText}>-</Text>
                            </TouchableOpacity>

                            <Text style={styles.betAmount}>{betAmount}</Text>

                            <TouchableOpacity
                                style={styles.betButton}
                                onPress={() => setBetAmount(Math.min(betAmount + 100, Math.min(playerBalance, currentRoom?.maxBet || 1000)))}
                            >
                                <Text style={styles.betButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowBetModal(false)}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={placeBet}
                                disabled={betAmount <= 0 || betAmount > playerBalance}
                            >
                                <Text style={styles.buttonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );

    return inRoom ? renderGameRoom() : renderRoomList();
};

export default BlackjackScreen;