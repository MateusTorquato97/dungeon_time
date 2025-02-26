import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#836323',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    nickname: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    levelContainer: {
        alignItems: 'flex-end',
    },
    classe: {
        color: '#FFD700',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
    level: {
        color: '#fff',
        fontSize: 14,
        marginTop: 2,
    },
    xpContainer: {
        height: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    xpBar: {
        position: 'absolute',
        height: '100%',
        borderRadius: 10,
    },
    xpText: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        lineHeight: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
}); 