import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Importa o hook
import styles from './styles';

export default function BottomNav() {
    const navigation = useNavigation(); // Obtém a prop navigation

    const goToHome = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    const goToInventory = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Inventory' }],
        });
    };

    const goToCharacter = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Character' }],
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#1f1a13', '#1a0f0a']}
                style={styles.background}
            >
                <View style={styles.menuContent}>
                    {/* Linha de decoração */}
                    <View style={styles.decorationTop}>
                        {[...Array(8)].map((_, i) => (
                            <View key={i} style={styles.decorationPiece} />
                        ))}
                    </View>

                    {/* Botões laterais agrupados */}
                    <View style={styles.bottomNav}>
                        <View style={styles.navGroup}>
                            <TouchableOpacity
                                style={styles.navButton}
                                onPress={() => navigation.navigate('Chat', { channelId: 1, senderId: 123 })}  // Adiciona a navegação para a tela Chat
                            >
                                <MaterialIcons
                                    name="chat"
                                    size={28}
                                    color="#a67c52"
                                />
                                <Text style={styles.navText}>Chat</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navButton} onPress={goToInventory}>
                                <MaterialCommunityIcons
                                    name="bag-personal"
                                    size={28}
                                    color="#a67c52"
                                />
                                <Text style={styles.navText}>Mochila</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.navGroup}>
                            <TouchableOpacity style={styles.navButton} onPress={goToCharacter}>
                                <MaterialIcons
                                    name="fingerprint"
                                    size={28}
                                    color="#a67c52"
                                />
                                <Text style={styles.navText}>Char</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navButton}>
                                <MaterialCommunityIcons
                                    name="store"
                                    size={28}
                                    color="#a67c52"
                                />
                                <Text style={styles.navText}>Shop</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Botão Home atualizado com onPress */}
            <View style={styles.homeButtonContainer}>
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={goToHome}
                >
                    <MaterialCommunityIcons name="castle" size={40} color="#a67c52" />
                </TouchableOpacity>
                <Text style={styles.homeLabel}>Home</Text>
            </View>
        </View>
    );
}
