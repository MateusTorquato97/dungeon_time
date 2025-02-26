import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');
const indicatorSize = width * 0.045; // 4.5% da largura da tela

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    zoneContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    zoneTitle: {
        color: COLORS.white,
        fontSize: 16,
    },
    zoneSubtitle: {
        color: COLORS.white,
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 5,
    },
    dragonImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    leftMenu: {
        position: 'absolute',
        left: 20,
        top: '30%',
        alignItems: 'center',
    },
    rightMenu: {
        position: 'absolute',
        right: 20,
        top: '30%',
        alignItems: 'center',
    },
    menuItem: {
        alignItems: 'center',
        marginVertical: 15,
    },
    menuIcon: {
        width: 35,
        height: 35,
        marginBottom: 5,
    },
    menuText: {
        color: COLORS.white,
        fontSize: 12,
        textAlign: 'center',
    },
    centerContent: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    bossContainer: {
        alignItems: 'center',
        marginRight: 40,
    },
    bossImage: {
        width: 50,
        height: 50,
        marginBottom: 5,
    },
    bossText: {
        color: COLORS.white,
        fontSize: 14,
    },
    bossChances: {
        color: COLORS.white,
        fontSize: 12,
        opacity: 0.8,
    },
    chestContainer: {
        alignItems: 'center',
        marginLeft: 40,
    },
    chestImage: {
        width: 50,
        height: 50,
        marginBottom: 5,
    },
    chestText: {
        color: COLORS.white,
        fontSize: 14,
    },
    timerText: {
        color: COLORS.white,
        fontSize: 12,
        opacity: 0.8,
    },
    bottomSection: {
        position: 'absolute',
        width: '100%',
        alignItems: 'center',
    },
    floorText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    actionButton: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginHorizontal: 10,
        minWidth: 150,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        position: 'relative',
    },
    trainingButton: {
        backgroundColor: COLORS.secondary,
    },
    battleButton: {
        backgroundColor: COLORS.primary,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    testButton: {
        backgroundColor: '#a67c52',
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 20,
        marginVertical: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    testButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    rewardIndicator: {
        position: 'absolute',
        top: -(indicatorSize * 0.3), // 30% do tamanho do indicador
        right: width * 0.02, // 2% da largura da tela
        backgroundColor: '#FFD700',
        width: indicatorSize,
        height: indicatorSize,
        borderRadius: indicatorSize / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFA000',
        zIndex: 1,
    },
    rewardIndicatorText: {
        color: '#000',
        fontSize: indicatorSize * 0.7, // 70% do tamanho do indicador
        fontWeight: 'bold',
        textAlign: 'center',
    },
});