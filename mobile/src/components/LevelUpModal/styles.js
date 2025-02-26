import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.9,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#836323',
        overflow: 'hidden',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        color: '#FFD700',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    levelText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    attributesContainer: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    subtitle: {
        color: '#836323',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    attributeText: {
        color: '#4CAF50',
        fontSize: 16,
        marginVertical: 5,
    },
    button: {
        backgroundColor: '#836323',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
}); 