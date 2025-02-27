import { StyleSheet } from 'react-native';
import { Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    backButton: {
        padding: 10,
    },
    title: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        textAlign: 'center',
        marginRight: 44, // Para compensar o botão de voltar e centralizar o título
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2A2A2A',
        paddingVertical: 10,
        marginBottom: 10,
        marginHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    balanceText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFF',
        marginTop: 10,
        fontSize: 16,
    },
    roomsList: {
        padding: 16,
    },
    roomCard: {
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    roomCardDisabled: {
        opacity: 0.6,
        borderColor: '#999',
    },
    roomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    roomTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusWaiting: {
        backgroundColor: '#4CAF50',
    },
    statusInProgress: {
        backgroundColor: '#2196F3',
    },
    statusFinished: {
        backgroundColor: '#F44336',
    },
    statusText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    roomDetails: {
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        color: '#FFF',
        fontSize: 14,
        marginLeft: 8,
    },
    joinButtonContainer: {
        alignItems: 'center',
    },
    joinButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    joinButtonText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 4,
    },
    fullRoomText: {
        color: '#999',
        fontSize: 14,
        fontWeight: 'bold',
    },
    createRoomButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFD700',
        padding: 16,
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    createRoomButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#2A2A2A',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        color: '#FFF',
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#333',
        color: '#FFF',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#444',
        borderWidth: 1,
        borderColor: '#666',
    },
    cancelButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    createButton: {
        backgroundColor: '#FFD700',
    },
    createButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        marginTop: 50,
    },
    emptyText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubText: {
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
    },
});