import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

const CasinoScreen = ({ navigation }) => {
    const games = [
        {
            id: 1,
            title: 'Blackjack',
            description: 'Jogue contra o dealer e tente chegar o mais próximo de 21 sem ultrapassar.',
            image: require('../../../assets/images/casino/blackjack.png'),
        },
        {
            id: 2,
            title: 'Roleta',
            description: 'Aposte em números, cores ou combinações e tente a sua sorte na roleta.',
            image: require('../../../assets/images/casino/roulette.png'),
        },
        {
            id: 3,
            title: 'Caça Níqueis',
            description: 'Gire os rolos e combine símbolos para ganhar prêmios incríveis.',
            image: require('../../../assets/images/casino/slots.png'),
        },
    ];

    const handleGamePress = (gameId) => {
        switch (gameId) {
            case 1: // Blackjack
                navigation.navigate('RoomsScreen');
                break;
            case 2: // Roleta
                console.log('Roleta - Em desenvolvimento');
                break;
            case 3: // Caça Níqueis
                console.log('Caça Níqueis - Em desenvolvimento');
                break;
            default:
                console.log(`Jogo selecionado: ${gameId}`);
        }
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
                <Text style={styles.title}>Cassino</Text>
            </View>

            <ScrollView style={styles.gamesContainer}>
                {games.map((game) => (
                    <TouchableOpacity
                        key={game.id}
                        style={styles.gameCard}
                        onPress={() => handleGamePress(game.id)}
                    >
                        <Image
                            source={game.image}
                            style={styles.gameImage}
                            resizeMode="cover"
                        />
                        <View style={styles.gameInfo}>
                            <Text style={styles.gameTitle}>{game.title}</Text>
                            <Text style={styles.gameDescription}>{game.description}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.arrowButton}
                            onPress={() => handleGamePress(game.id)}
                        >
                            <Ionicons name="chevron-forward" size={24} color="#FFD700" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default CasinoScreen; 