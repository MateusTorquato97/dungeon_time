import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles';
import { dungeonImages } from '../../utils/images';

const DungeonProgress = ({ dungeon, timeOffset, onCollectRewards, token, loadDungeons }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [progress, setProgress] = useState(0);

    const dungeonImage = dungeonImages[dungeon.tipo_dungeon_id] || dungeonImages.floresta_sagrada;

    useEffect(() => {
        const updateProgress = () => {
            const now = new Date().getTime() + timeOffset;
            const startTime = new Date(dungeon.iniciada_em).getTime();
            const endTime = new Date(dungeon.finalizada_em).getTime();
            const totalDuration = endTime - startTime;
            const elapsed = now - startTime;
            const remaining = endTime - now;

            if (now >= endTime && dungeon.status === 'em_progresso') {
                setTimeLeft('Gerando recompensas...');
                setProgress(100);
                return;
            }


            const currentProgress = (elapsed / totalDuration) * 100;
            setProgress(Math.min(currentProgress, 100));

            // Calcula o tempo restante em minutos
            const remainingMinutes = Math.floor(remaining / 60000);

            // Define o texto do tempo restante
            if (remainingMinutes < 1) {
                setTimeLeft('Restante: < 1 minuto');
            } else {
                setTimeLeft(`Restante: ${remainingMinutes} min`);
            }
        };

        updateProgress();
        const interval = setInterval(updateProgress, 30000); // Atualiza a cada 30 segundos
        return () => clearInterval(interval);
    }, [dungeon.iniciada_em, dungeon.finalizada_em, timeOffset, dungeon.status, token, loadDungeons]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#2e2b25', '#1f1a13']}
                style={styles.cardGradient}
            >
                <Image
                    source={dungeonImage}
                    style={styles.dungeonImage}
                    resizeMode="cover"
                />

                <View style={styles.infoContainer}>
                    <Text style={styles.dungeonTitle}>{dungeon.nome || 'Dungeon'}</Text>

                    {dungeon.status === 'aguardando_recompensa' ? (
                        <TouchableOpacity
                            style={styles.collectButton}
                            onPress={() => onCollectRewards(dungeon)}
                        >
                            <View style={styles.collectButtonContent}>
                                <Text style={styles.collectButtonIcon}>🎁</Text>
                                <Text style={styles.collectButtonText}>COLETAR RECOMPENSAS</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <View style={styles.progressBarContainer}>
                                <LinearGradient
                                    colors={['#a67c52', '#8b5e3c']}
                                    style={[styles.progressBar, { width: `${progress}%` }]}
                                />
                            </View>
                            <Text style={styles.timeLeft}>{timeLeft}</Text>
                        </>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
};

export default DungeonProgress;
