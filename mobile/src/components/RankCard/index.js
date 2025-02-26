import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RankCard = ({ player, position }) => {
    const getEloColor = (elo) => {
        switch (elo.toLowerCase()) {
            case 'bronze': return '#CD7F32';
            case 'prata': return '#C0C0C0';
            case 'ouro': return '#FFD700';
            case 'platina': return '#E5E4E2';
            case 'diamante': return '#B9F2FF';
            default: return '#CD7F32';
        }
    };

    const getClassIcon = (classe) => {
        switch (classe.toLowerCase()) {
            case 'guerreiro': return 'sword';
            case 'mago': return 'magic-staff';
            case 'arqueiro': return 'bow-arrow';
            case 'paladino': return 'shield-cross';
            case 'cavaleiro': return 'horse';
            default: return 'sword';
        }
    };

    return (
        <LinearGradient
            colors={['#2e2b25', '#1f1a13']}
            style={styles.container}
        >
            <View style={styles.positionContainer}>
                <Text style={styles.position}>#{position}</Text>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.mainInfo}>
                    <Text style={styles.nickname}>{player.nickname}</Text>
                    <View style={styles.classContainer}>
                        <MaterialCommunityIcons
                            name={getClassIcon(player.classe)}
                            size={20}
                            color="#a67c52"
                        />
                        <Text style={styles.level}>Nível {player.nivel}</Text>
                    </View>
                </View>

                <View style={styles.rankInfo}>
                    <Text style={[styles.elo, { color: getEloColor(player.elo) }]}>
                        {player.elo}
                    </Text>
                    <Text style={styles.points}>{player.pontos} pontos</Text>
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#a67c52',
    },
    positionContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    position: {
        color: '#a67c52',
        fontSize: 18,
        fontWeight: 'bold',
    },
    infoContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 12,
    },
    mainInfo: {
        flex: 1,
    },
    nickname: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    classContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    level: {
        color: '#a67c52',
        marginLeft: 8,
        fontSize: 14,
    },
    rankInfo: {
        alignItems: 'flex-end',
    },
    elo: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    points: {
        color: '#ffffff',
        fontSize: 12,
        marginTop: 4,
    },
});

export default RankCard;
