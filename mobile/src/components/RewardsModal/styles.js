import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const gap = 8;
const numColumns = 4;
const itemSize = (width - (2 * (width * 0.04)) - (gap * (numColumns - 1))) / numColumns;

export default StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.9,
        padding: 20,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#a67c52',
    },
    title: {
        fontSize: 24,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    rewardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingHorizontal: width * 0.04,
        gap: gap,
    },
    collectButton: {
        backgroundColor: '#2e2b25',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#a67c52',
        alignSelf: 'center',
        marginTop: 20,
    },
    collectButtonText: {
        color: '#a67c52',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    xpContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    xpText: {
        color: '#FFD700',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
    xpProgress: {
        color: '#fff',
        fontSize: 14,
        marginTop: 5,
    },
}); 