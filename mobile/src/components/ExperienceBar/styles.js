import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        marginBottom: 10,
    },
    levelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    barContainer: {
        height: 20,
        backgroundColor: '#333',
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressBar: {
        position: 'absolute',
        height: '100%',
        borderRadius: 10,
    },
    xpText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 20,
    },
}); 