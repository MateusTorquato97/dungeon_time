import React, { useEffect, useState, useRef, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    KeyboardAvoidingView,
    StyleSheet,
    Modal
} from 'react-native';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHAT_URL } from '../../config/api';

export default function ChatScreen({ route, navigation }) {
    const { usuario, token } = useContext(AuthContext);
    const insets = useSafeAreaInsets();
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const socketRef = useRef(null);
    const [currentChannel, setCurrentChannel] = useState(route.params?.channelId || 'global');
    const [showDropdown, setShowDropdown] = useState(false);
    const flatListRef = useRef();
    const headerRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState(0);

    // Lista das salas disponíveis
    const channels = [
        { id: 1, name: 'Chat' },
        { id: 2, name: 'Trade' }
    ];

    useEffect(() => {
        const setupSocket = () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            socketRef.current = io(CHAT_URL, {
                transports: ['websocket'],
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
                timeout: 60000,
                reconnection: true,
                forceNew: true,  // Força uma nova conexão
                auth: {
                    token: token
                }
            });

            socketRef.current.on('connect', () => {
                console.log('Conectado ao chat!');
                // Importante: só emitir join channel após conexão estabelecida
                setTimeout(() => {
                    socketRef.current.emit('join channel', currentChannel);
                }, 1000);
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('Erro na conexão:', error.message);
                // Aumentar o delay para tentar reconectar
                setTimeout(setupSocket, 5000);
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('Desconectado:', reason);
                if (reason === 'io server disconnect' || reason === 'transport close') {
                    setTimeout(setupSocket, 5000);
                }
            });

            socketRef.current.on('reconnect_attempt', (attemptNumber) => {
                console.log(`Tentativa de reconexão #${attemptNumber}`);
            });

            socketRef.current.on('reconnect', () => {
                console.log('Reconectado com sucesso!');
                socketRef.current.emit('join channel', currentChannel);
            });

            socketRef.current.on('previous messages', (msgs) => {
                setChatMessages(msgs);
            });

            socketRef.current.on('chat message', (msg) => {
                setChatMessages((prevMessages) => [...prevMessages, msg]);
            });
        };

        setupSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [currentChannel, token]);

    const sendMessage = () => {
        if (message.trim().length > 0) {
            const data = {
                channel_id: currentChannel,
                sender_id: usuario ? usuario.id : null,
                content: message, // Note: no backend, o campo é inserido como "context"
            };
            socketRef.current.emit('chat message', data);
            setMessage('');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const renderMessage = ({ item }) => {
        const textColor = item.role === 'admin' ? '#ADD8E6' : '#B8860B';
        return (
            <View style={styles.messageContainer}>
                <Text style={[styles.messageText, { color: textColor }]}>
                    {formatTime(item.created_at)} {item.nickname} [{item.nivel}]: {item.content}
                </Text>
            </View>
        );
    };

    // Ao selecionar uma nova sala, limpa as mensagens e atualiza a sala atual
    const handleSelectChannel = (channel) => {
        setCurrentChannel(channel.id);
        setShowDropdown(false);
        setChatMessages([]);
    };

    const measureHeader = () => {
        headerRef.current?.measureInWindow((x, y, width, height) => {
            setDropdownPosition(y + height);
        });
    };

    const handleShowDropdown = () => {
        measureHeader();
        setShowDropdown(true);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <View style={styles.container}>
                    <View ref={headerRef} style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Text style={styles.backButtonText}>←</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerTitleContainer}
                            onPress={handleShowDropdown}
                        >
                            <Text style={styles.headerTitle}>
                                {channels.find(ch => ch.id === currentChannel)?.name || 'Chat'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {showDropdown && (
                        <Modal
                            transparent={true}
                            visible={showDropdown}
                            onRequestClose={() => setShowDropdown(false)}
                            animationType="fade"
                        >
                            <TouchableOpacity
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setShowDropdown(false)}
                            >
                                <View style={[styles.dropdownModal, { top: dropdownPosition }]}>
                                    {channels.filter(ch => ch.id !== currentChannel).map(channel => (
                                        <TouchableOpacity
                                            key={channel.id}
                                            style={styles.dropdownItem}
                                            onPress={() => handleSelectChannel(channel)}
                                        >
                                            <Text style={styles.dropdownItemText}>{channel.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    )}

                    <FlatList
                        ref={flatListRef}
                        data={chatMessages}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        renderItem={renderMessage}
                        style={styles.chatList}
                        onContentSizeChange={() => flatListRef.current.scrollToEnd()}
                        contentContainerStyle={styles.chatContent}
                    />

                    <View style={[
                        styles.inputContainer,
                        { paddingBottom: Math.max(10, insets.bottom) }
                    ]}>
                        <TextInput
                            style={styles.input}
                            value={message}
                            onChangeText={setMessage}
                            placeholder="Digite sua mensagem..."
                            placeholderTextColor="#666"
                            multiline
                        />
                        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                            <Text style={styles.sendButtonText}>Enviar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    backButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#444',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 5,
    },
    dropdown: {
        backgroundColor: '#333',
        paddingVertical: 5,
    },
    dropdownItem: {
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    dropdownItemText: {
        color: '#fff',
        fontSize: 16,
    },
    chatList: {
        flex: 1,
    },
    chatContent: {
        padding: 10,
        paddingTop: 10,
    },
    messageContainer: {
        paddingVertical: 2,
    },
    messageText: {
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#111',
        borderTopWidth: 1,
        borderTopColor: '#333',
    },
    input: {
        flex: 1,
        backgroundColor: '#222',
        color: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 4,
        fontSize: 14,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#444',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 4,
        marginLeft: 8,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dropdownModal: {
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: -60 }],
        backgroundColor: '#222',
        borderRadius: 8,
        padding: 5,
        minWidth: 120,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dropdownItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    dropdownItemText: {
        color: '#fff',
        fontSize: 16,
    },
});
