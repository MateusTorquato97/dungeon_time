import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { dungeonImages } from '../../utils/images';
import styles from './styles';

export default function DungeonCard({ dungeon, onPress, userLevel }) {
    const isLocked = userLevel < dungeon.nivel_minimo;
    const dungeonImage = dungeonImages[dungeon.id] || dungeonImages.floresta_sagrada;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#2e2b25', '#1a0f0a']}
                style={styles.gradient}
            >
                <Image
                    source={dungeonImage}
                    style={styles.image}
                    resizeMode="cover"
                />

                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{dungeon.nome}</Text>
                    <Text style={styles.description}>{dungeon.descricao}</Text>

                    <View style={styles.statsContainer}>
                        <Text style={styles.statsText}>⚔️ Nível mínimo: {dungeon.nivel_minimo}</Text>
                        <Text style={styles.statsText}>💰 Recompensa: {dungeon.recompensa} moedas</Text>
                        <Text style={styles.statsText}>⏱️ Duração: {dungeon.tempo_espera}min</Text>
                    </View>

                    {!isLocked && (
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => onPress(dungeon)}
                        >
                            <Text style={styles.startButtonText}>INICIAR</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {isLocked && (
                    <View style={styles.lockedOverlay}>
                        <Text style={styles.lockedText}>
                            Nível {dungeon.nivel_minimo} necessário
                        </Text>
                    </View>
                )}
            </LinearGradient>
        </View>
    );
} 