import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    gradient: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 8,
    },
    title: {
        flex: 1,
        color: '#a67c52',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: 40,
    },
    listContainer: {
        paddingVertical: 10,
    },
    battleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        padding: 12,
        marginVertical: 6,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#a67c52',
    },
    battleItemWinner: {
        backgroundColor: 'rgba(51, 124, 51, 0.5)',
    },
    battleItemLoser: {
        backgroundColor: 'rgba(150, 40, 40, 0.5)',
    },
    statusIcon: {
        marginRight: 12,
        width: 24,
        alignItems: 'center',
    },
    battleInfo: {
        flex: 1,
    },
    playerInfo: {
        marginBottom: 4,
    },
    playerName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    playerDetails: {
        color: '#ccc',
        fontSize: 12,
    },
    vsText: {
        color: 'yellow',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
        marginVertical: 2,
    },
    dateText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
        textAlign: 'center',
    },
    watchButton: {
        padding: 8,
    }
}); 