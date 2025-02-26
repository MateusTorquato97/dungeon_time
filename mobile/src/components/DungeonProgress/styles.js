import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        marginHorizontal: screenWidth * 0.04,
        marginVertical: screenWidth * 0.02,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cardGradient: {
        flexDirection: 'row',
        padding: screenWidth * 0.03,
        alignItems: 'center',
    },
    dungeonImage: {
        width: screenWidth * 0.2,
        height: screenWidth * 0.2,
        borderRadius: 8,
        marginRight: screenWidth * 0.03,
        borderWidth: 2,
        borderColor: '#a67c52',
    },
    infoContainer: {
        flex: 1,
    },
    dungeonTitle: {
        color: '#a67c52',
        fontSize: screenWidth * 0.045,
        fontWeight: 'bold',
        marginBottom: 4,
        fontFamily: 'serif',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 5,
        overflow: 'hidden',
        marginVertical: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 5,
    },
    timeLeft: {
        color: '#ffffff',
        fontSize: screenWidth * 0.030,
        textAlign: 'right',
        marginTop: 4,
    },
    collectButton: {
        backgroundColor: '#2e2b25',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#a67c52',
        marginTop: 10,
        width: '100%',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    collectButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    collectButtonIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    collectButtonText: {
        color: '#a67c52',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    }
}); 