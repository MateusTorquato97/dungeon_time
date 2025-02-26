import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContainer: {
        width: '90%',
        borderRadius: 10,
        padding: 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 13,
        padding: 5,
        alignItems: 'center',
        width: '100%',
    },
    itemName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4
    },
    rarityText: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 16
    },
    attributesContainer: {
        width: '100%',
        marginBottom: 20
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    attributeLabel: {
        color: '#fff',
        fontSize: 14
    },
    attributeValue: {
        fontSize: 14,
        fontWeight: 'bold'
    },
    actionsContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
        padding: 8
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 45,
        paddingHorizontal: 20,
        backgroundColor: '#2e2b25',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#a67c52',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 3,
    },
    actionButtonText: {
        color: '#a67c52',
        fontSize: 14,
        fontFamily: 'serif',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    destroyButton: {
        backgroundColor: '#3a1f1f',
        borderColor: '#8B0000',
    },
    destroyButtonText: {
        color: '#ff4444',
    },
    closeButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    closeButtonText: {
        color: '#666',
        fontSize: 14,
        fontFamily: 'serif',
    },
    confirmationOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmationBox: {
        backgroundColor: '#2a2a2a',
        borderRadius: 8,
        padding: 20,
        width: '80%',
        borderWidth: 1,
        borderColor: '#836323',
    },
    confirmationText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    confirmationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        backgroundColor: '#836323',
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#4a4a4a',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 10,
        gap: 4,
    },
}); 