import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    TextInput,
    Alert,
    RefreshControl
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { blackjackService } from '../../../services/blackjackService';
import { AuthContext } from '../../../contexts/AuthContext';
import { styles } from './styles';
import { useFocusEffect } from '@react-navigation/native';

const RoomsScreen = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [minBet, setMinBet] = useState('100');
    const [maxBet, setMaxBet] = useState('1000');
    const [balance, setBalance] = useState(0);
    const [creatingRoom, setCreatingRoom] = useState(false);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            console.log("Buscando salas de Blackjack...");
            const roomsData = await blackjackService.getRooms(token);
            console.log("Salas recebidas:", JSON.stringify(roomsData));

            const balanceData = await blackjackService.getBalance(token);
            console.log("Saldo recebido:", JSON.stringify(balanceData));

            setRooms(roomsData);
            setBalance(balanceData.balance);
        } catch (error) {
            Alert.alert("Erro", "Não foi possível carregar as salas de Blackjack.");
            console.error("Erro ao buscar salas:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchRooms();
            return () => { };
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchRooms();
    };

    const handleJoinRoom = (roomId) => {
        console.log("Entrando na sala:", roomId);

        // Verificar se temos saldo suficiente para a aposta mínima
        const room = rooms.find(r => r.id === roomId);
        if (room && balance < room.minBet) {
            Alert.alert(
                "Saldo Insuficiente",
                `Você precisa de pelo menos ${room.minBet} moedas para entrar nesta sala. Seu saldo atual é ${balance}.`
            );
            return;
        }

        navigation.navigate('BlackjackRoomDetail', { roomId });
    };

    const handleCreateRoom = async () => {
        if (creatingRoom) return;

        const minBetNum = parseInt(minBet);
        const maxBetNum = parseInt(maxBet);

        if (isNaN(minBetNum) || isNaN(maxBetNum)) {
            Alert.alert("Erro", "Valores de aposta inválidos.");
            return;
        }

        if (minBetNum < 10 || maxBetNum > 10000 || minBetNum > maxBetNum) {
            Alert.alert("Erro", "Os valores de aposta devem estar entre 10 e 10.000, e a aposta mínima não pode ser maior que a máxima.");
            return;
        }

        try {
            setCreatingRoom(true);
            const newRoom = await blackjackService.createRoom(token, minBetNum, maxBetNum);
            setModalVisible(false);
            navigation.navigate('BlackjackRoomDetail', { roomId: newRoom.id });
        } catch (error) {
            Alert.alert("Erro", "Não foi possível criar a sala.");
            console.error(error);
        } finally {
            setCreatingRoom(false);
        }
    };

    const renderRoomItem = ({ item }) => {
        const isFull = item.players >= item.maxPlayers;

        return (
            <TouchableOpacity
                style={[styles.roomCard, isFull && styles.roomCardDisabled]}
                onPress={() => !isFull && handleJoinRoom(item.id)}
                disabled={isFull}
            >
                <View style={styles.roomHeader}>
                    <Text style={styles.roomTitle}>Sala #{item.id}</Text>
                    <View style={[styles.statusBadge,
                    item.status === 'aguardando' ? styles.statusWaiting :
                        item.status === 'em_andamento' ? styles.statusInProgress :
                            styles.statusFinished]}>
                        <Text style={styles.statusText}>
                            {item.status === 'aguardando' ? 'Aguardando' :
                                item.status === 'em_andamento' ? 'Em Andamento' :
                                    'Finalizada'}
                        </Text>
                    </View>
                </View>

                <View style={styles.roomDetails}>
                    <View style={styles.detailItem}>
                        <FontAwesome5 name="users" size={14} color="#FFD700" />
                        <Text style={styles.detailText}>
                            {item.players}/{item.maxPlayers} Jogadores
                        </Text>
                    </View>

                    <View style={styles.detailItem}>
                        <FontAwesome5 name="coins" size={14} color="#FFD700" />
                        <Text style={styles.detailText}>
                            Aposta: {item.minBet} - {item.maxBet}
                        </Text>
                    </View>
                </View>

                <View style={styles.joinButtonContainer}>
                    {isFull ? (
                        <Text style={styles.fullRoomText}>Sala Cheia</Text>
                    ) : (
                        <View style={styles.joinButton}>
                            <Text style={styles.joinButtonText}>Entrar na Sala</Text>
                            <Ionicons name="chevron-forward" size={16} color="#FFD700" />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={28} color="#FFD700" />
                </TouchableOpacity>
                <Text style={styles.title}>Salas de Blackjack</Text>
            </View>

            <View style={styles.balanceContainer}>
                <FontAwesome5 name="coins" size={16} color="#FFD700" />
                <Text style={styles.balanceText}>Saldo: {balance}</Text>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFD700" />
                    <Text style={styles.loadingText}>Carregando salas...</Text>
                </View>
            ) : (
                <FlatList
                    data={rooms}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderRoomItem}
                    contentContainerStyle={styles.roomsList}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#FFD700"
                            colors={["#FFD700"]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <FontAwesome5 name="door-closed" size={50} color="#555" />
                            <Text style={styles.emptyText}>Nenhuma sala disponível</Text>
                            <Text style={styles.emptySubText}>
                                Crie uma nova sala para começar a jogar
                            </Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.createRoomButton}
                onPress={() => setModalVisible(true)}
            >
                <FontAwesome5 name="plus" size={16} color="#000" />
                <Text style={styles.createRoomButtonText}>Criar Nova Sala</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Criar Nova Sala</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Aposta Mínima:</Text>
                            <TextInput
                                style={styles.input}
                                value={minBet}
                                onChangeText={setMinBet}
                                keyboardType="number-pad"
                                placeholder="Mín. 10"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Aposta Máxima:</Text>
                            <TextInput
                                style={styles.input}
                                value={maxBet}
                                onChangeText={setMaxBet}
                                keyboardType="number-pad"
                                placeholder="Máx. 10000"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.createButton,
                                    creatingRoom && styles.disabledButton
                                ]}
                                onPress={handleCreateRoom}
                                disabled={creatingRoom}
                            >
                                {creatingRoom ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <Text style={styles.createButtonText}>Criar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default RoomsScreen;