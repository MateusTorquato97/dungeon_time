import { StyleSheet } from 'react-native';
import { Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
    },
    title: {
        flex: 1,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
        marginRight: 44, // Para compensar o botão de voltar e centralizar o título
    },
    gamesContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    gameCard: {
        backgroundColor: '#2A2A2A',
        borderRadius: 15,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFD700',
        flexDirection: 'row',
        alignItems: 'center',
    },
    gameImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 12,
    },
    gameInfo: {
        flex: 1,
        marginRight: 12,
    },
    gameTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    gameDescription: {
        fontSize: 14,
        color: '#CCCCCC',
    },
    arrowButton: {
        padding: 8,
    },
}); 