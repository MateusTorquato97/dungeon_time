import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';

// Pegando a largura da tela do dispositivo
const { width: screenWidth } = Dimensions.get('window');

// Calculando tamanhos relativos
const imageSize = screenWidth * 0.2; // 20% da largura da tela

export default StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        marginVertical: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.white,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.white,
        marginTop: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    dungeonCard: {
        marginBottom: 20,
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dungeonCardLocked: {
        opacity: 0.7,
    },
    cardGradient: {
        padding: screenWidth * 0.04, // 4% da largura da tela
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dungeonImage: {
        width: imageSize,
        height: imageSize,
        borderRadius: imageSize * 0.1, // 10% do tamanho da imagem
        marginRight: imageSize * 0.15, // 15% do tamanho da imagem
    },
    dungeonInfo: {
        flex: 1,
    },
    dungeonTitle: {
        fontSize: screenWidth * 0.045, // 4.5% da largura da tela
        fontWeight: 'bold',
        color: COLORS.white,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        marginBottom: screenWidth * 0.02,
    },
    infoText: {
        fontSize: screenWidth * 0.035, // 3.5% da largura da tela
        color: COLORS.white,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
        marginBottom: screenWidth * 0.01,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2e2b25', // Mesmo do navButton
        paddingVertical: screenWidth * 0.02,
        paddingHorizontal: screenWidth * 0.04,
        borderRadius: 10,
        marginTop: screenWidth * 0.025,
        alignSelf: 'flex-end',
        borderWidth: 1,
        borderColor: '#a67c52', // Dourado medieval
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.7,
        shadowRadius: 3,
        elevation: 5,
    },
    startButtonText: {
        color: '#a67c52', // Dourado medieval
        fontWeight: 'bold',
        marginLeft: screenWidth * 0.02,
        fontSize: screenWidth * 0.035,
        fontFamily: 'serif',
        textShadowColor: '#000',
        textShadowOffset: {
            width: 1,
            height: 1
        },
        textShadowRadius: 1,
    },
    lockedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockedText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    section: {
        marginTop: screenWidth * 0.05, // 5% da largura da tela
        marginBottom: screenWidth * 0.03, // 3% da largura da tela
    },
    sectionTitle: {
        fontSize: screenWidth * 0.06, // 6% da largura da tela
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: screenWidth * 0.03,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    loadingText: {
        color: '#a67c52',
        fontSize: 20,
        fontFamily: 'serif',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
}); 