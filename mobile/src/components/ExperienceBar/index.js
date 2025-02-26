import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles';

const ExperienceBar = ({ xpAtual, proxXP, nivel }) => {
    const progresso = (xpAtual / proxXP) * 100;

    return (
        <View style={styles.container}>
            <Text style={styles.levelText}>Nível {nivel}</Text>
            <View style={styles.barContainer}>
                <LinearGradient
                    colors={['#4a90e2', '#357abd']}
                    style={[styles.progressBar, { width: `${progresso}%` }]}
                />
                <Text style={styles.xpText}>
                    {xpAtual} / {proxXP} XP
                </Text>
            </View>
        </View>
    );
};

export default ExperienceBar; 