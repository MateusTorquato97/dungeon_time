import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#a67c52',
    },
    rankPosition: {
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    positionText: {
        color: '#a67c52',
        fontSize: 18,
        fontWeight: 'bold',
    },
    playerInfo: {
        flex: 1,
        marginLeft: 12,
    },
    playerName: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailsContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    detailText: {
        color: '#a67c52',
        fontSize: 14,
        marginRight: 8,
    },
    classText: {
        color: '#a67c52',
        fontSize: 14,
    },
    eloContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    eloText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    pointsText: {
        color: '#a67c52',
        fontSize: 14,
    },
});
