import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
        position: 'relative',
    },

    // Decorações no topo
    topDecoration: {
        position: 'absolute',
        top: 0,
        left: 20,
        width: 80,
        height: 80,
        zIndex: 10,
    },
    topDecorationRight: {
        position: 'absolute',
        top: 0,
        right: 20,
        width: 80,
        height: 80,
        zIndex: 10,
    },

    // Barra superior de vida
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 20,
    },
    topBarSection: {
        alignItems: 'center',
    },
    playerNameTop: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    topHealthBarContainer: {
        width: screenWidth * 0.4,
        height: 18,
        backgroundColor: '#333',
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#a67c52',
        overflow: 'hidden',
    },
    topHealthBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    healthText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 2,
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },

    // Arena principal
    arenaContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'relative',
    },
    arenaFloor: {
        position: 'absolute',
        bottom: 0,
        width: screenWidth,
        height: screenHeight * 0.25,
    },

    // Containers dos jogadores
    player1Container: {
        position: 'absolute',
        bottom: screenHeight * 0.12,
        left: 30,
        width: 140,
        alignItems: 'center',
    },
    player2Container: {
        position: 'absolute',
        bottom: screenHeight * 0.12,
        right: 30,
        width: 140,
        alignItems: 'center',
    },

    // Sprite do personagem (que se move)
    characterSprite: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    characterImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },

    // Informações do jogador (nome, vida e efeitos) – fixo, abaixo do sprite
    playerInfo: {
        marginTop: 4,
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        height: 40,
    },
    healthBarContainer: {
        width: 120,
        height: 12,
        backgroundColor: '#333',
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#a67c52',
    },
    healthBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    playerName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },

    // Ícone de efeito (bloqueio) – posicionado absolutamente para não empurrar outros elementos
    effectIcon: {
        position: 'absolute',
        bottom: -25,
        left: '50%',
        transform: [{ translateX: -20 }],
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#a67c52',
    },
    effectDuration: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 4,
    },

    // Efeitos temporários (dano, dodge, ataque duplo)
    damageText: {
        position: 'absolute',
        color: '#ff4444',
        fontSize: 18,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
    dodgeText: {
        position: 'absolute',
        color: '#87CEEB',
        fontWeight: 'bold',
        fontSize: 18,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
    doubleAttackText: {
        position: 'absolute',
        color: '#FFB6C1',
        fontWeight: 'bold',
        fontSize: 18,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
    player1EffectText: {
        top: -30,
        width: '100%',
        textAlign: 'center',
    },
    player2EffectText: {
        top: -30,
        width: '100%',
        textAlign: 'center',
    },

    // Log de batalha
    logWrapper: {
        position: 'absolute',
        top: screenHeight * 0.3,
        left: 20,
        right: 20,
    },
    logContainer: {
        maxHeight: 150,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#a67c52',
    },
    logText: {
        color: '#FFF',
        marginBottom: 8,
        fontSize: 14,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
    turnText: {
        color: '#FFD700',
        fontWeight: 'bold',
        marginRight: 5,
    },
    damageValueText: {
        color: '#FF4444',
        fontWeight: 'bold',
    },
    blockText: {
        color: '#87CEEB',
        fontWeight: 'bold',
    },

    // Controles
    controlsContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    controlButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderColor: '#a67c52',
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightControlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Banner de resultado
    resultBanner: {
        position: 'absolute',
        top: screenHeight * 0.15,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#a67c52',
        alignItems: 'center',
        zIndex: 999,
    },
    resultTitle: {
        color: '#FFF',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
    resultMessage: {
        color: '#FFF',
        fontSize: 18,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
});
