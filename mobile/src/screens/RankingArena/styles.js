import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingTop: 40,
    },
    headerContainer: {
        marginTop: width * 0.04,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
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
    eloSelector: {
        maxHeight: 100,
        marginBottom: 20,
    },
    rankingList: {
        paddingHorizontal: 16,
    },
    rankingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#a67c52',
    },
    position: {
        color: '#a67c52',
        fontSize: 16,
        fontWeight: 'bold',
        width: 40,
    },
    playerInfo: {
        flex: 1,
        marginLeft: 10,
    },
    playerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    playerDetails: {
        color: '#999',
        fontSize: 12,
    },
    points: {
        color: '#a67c52',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
