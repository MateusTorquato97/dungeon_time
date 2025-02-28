import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#2c3e50',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
        color: '#34495e',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#7f8c8d',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#7f8c8d',
    },
    roomItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    roomName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    roomDetails: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 2,
    },
    roomStatus: {
        fontSize: 14,
        color: '#7f8c8d',
        fontStyle: 'italic',
    },
    createButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    gameContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: '#124125', // Verde escuro típico de mesa de casino
    },
    roomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    roomTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    balance: {
        fontSize: 16,
        color: '#fff',
    },
    leaveButton: {
        backgroundColor: '#e74c3c',
        padding: 8,
        borderRadius: 4,
    },
    playersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    playerBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    currentPlayerBadge: {
        backgroundColor: 'rgba(52, 152, 219, 0.3)',
    },
    playerName: {
        color: '#fff',
        fontWeight: 'bold',
    },
    playerPosition: {
        color: '#ddd',
        fontSize: 12,
    },
    gameStatusContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    gameStatusText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
    gameArea: {
        flex: 1,
    },
    dealerArea: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    playerArea: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    otherPlayersArea: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    otherPlayerContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    otherPlayerHeader: {
        marginBottom: 8,
    },
    otherPlayerName: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    otherPlayerInfo: {
        color: '#ddd',
        fontSize: 14,
    },
    otherPlayerResult: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 4,
    },
    areaTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    points: {
        color: '#ddd',
        fontSize: 16,
        marginBottom: 8,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    card: {
        width: 60,
        height: 90,
        backgroundColor: '#fff',
        borderRadius: 4,
        borderWidth: 1,
        margin: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hiddenCard: {
        width: 60,
        height: 90,
        backgroundColor: '#2980b9',
        borderRadius: 4,
        margin: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hiddenCardText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    cardValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardSuit: {
        fontSize: 24,
    },
    currentBet: {
        color: '#ffd700', // Gold color
        fontSize: 16,
        marginTop: 8,
    },
    resultText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        textAlign: 'center',
    },
    winText: {
        color: '#2ecc71',
    },
    loseText: {
        color: '#e74c3c',
    },
    tieText: {
        color: '#f39c12',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    actionButton: {
        backgroundColor: '#2ecc71',
        padding: 12,
        borderRadius: 8,
        margin: 4,
        minWidth: 80,
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        width: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        marginBottom: 16,
    },
    betControl: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    betButton: {
        backgroundColor: '#3498db',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    betButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    betAmount: {
        fontSize: 24,
        marginHorizontal: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        padding: 12,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
    },
    confirmButton: {
        backgroundColor: '#2ecc71',
    },
    timerContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    timerText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 4,
    },
    timerBarContainer: {
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    timerBar: {
        height: 10,
        borderRadius: 5,
    },
});

export default styles;