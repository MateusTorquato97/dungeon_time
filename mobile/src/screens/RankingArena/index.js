import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import EloIcon from '../../components/EloIcon';
import styles from './styles';
import { MaterialIcons } from '@expo/vector-icons';
import { rankingArenaService } from '../../services/rankingArenaService';
import { AuthContext } from '../../contexts/AuthContext';

const elos = ['Recruta', 'Escudeiro', 'Guerreiro', 'Veterano', 'Campeão', 'Guardião', 'Conquistador', 'Sanguinario', 'Imortal', 'Titã', 'Ancestral', 'Governante'];

const RankingArena = () => {
    const [ranking, setRanking] = useState([]);
    const [selectedElo, setSelectedElo] = useState('Recruta');
    const navigation = useNavigation();
    const { token } = useContext(AuthContext);

    const loadRanking = async (elo = 'Recruta') => {
        try {
            const response = await rankingArenaService.getRankingByElo(token, elo);
            setRanking(response);
        } catch (error) {
            console.error('Erro ao carregar ranking:', error);
        }
    };

    useEffect(() => {
        loadRanking(selectedElo);
    }, [selectedElo]);

    const renderItem = ({ item, index }) => (
        <LinearGradient
            colors={['#2e2b25', '#1f1a13']}
            style={styles.rankingItem}
        >
            <Text style={styles.position}>{index + 1}º</Text>
            <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{item.nickname}</Text>
                <Text style={styles.playerDetails}>
                    Nível {item.nivel} • {item.classe} • {item.elo}
                </Text>
            </View>
            <Text style={styles.points}>{item.pontos} pts</Text>
        </LinearGradient>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#a67c52" />
                </TouchableOpacity>
                <Text style={styles.title}>Ranking da Arena</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.eloSelector}
            >
                {elos.map((elo) => (
                    <EloIcon
                        key={elo}
                        elo={elo}
                        selected={selectedElo === elo}
                        onPress={() => setSelectedElo(elo)}
                    />
                ))}
            </ScrollView>

            <FlatList
                data={ranking}
                renderItem={renderItem}
                keyExtractor={(item) => item.nickname}
                style={styles.rankingList}
            />
        </View>
    );
};

export default RankingArena;
