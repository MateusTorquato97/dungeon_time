import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles';

const CharacterHeader = ({ character }) => {
    const calculateXPPercentage = () => {
        return ((character.xp_atual - 0) / (character.prox_xp - 0)) * 100;
    };

    return (
        <View style={styles.container}>
            <View style={styles.infoContainer}>
                <Text style={styles.nickname}>{character.nickname}</Text>
                <View style={styles.levelContainer}>
                    <Text style={styles.classe}>{character.classe}</Text>
                    <Text style={styles.level}>Nível {character.nivel}</Text>
                </View>
            </View>

            <View style={styles.xpContainer}>
                <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={[styles.xpBar, { width: `${calculateXPPercentage()}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                />
                <Text style={styles.xpText}>
                    {character.xp_atual} / {character.prox_xp} XP
                </Text>
            </View>
        </View>
    );
};

export default CharacterHeader; 