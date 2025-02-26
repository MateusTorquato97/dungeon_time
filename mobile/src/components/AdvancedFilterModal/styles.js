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
        width: width * 0.9,
        borderRadius: 15,
        padding: 2
    },
    modalContent: {
        backgroundColor: '#1a1a1a',
        borderRadius: 13,
        padding: 16
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20
    },
    filterGroup: {
        marginBottom: 12
    },
    filterLabel: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 4
    },
    filterInput: {
        backgroundColor: '#2e2b25',
        borderWidth: 1,
        borderColor: '#a67c52',
        borderRadius: 8,
        color: '#fff',
        padding: 8,
        fontSize: 14
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center'
    },
    applyButton: {
        backgroundColor: '#2e2b25',
        borderColor: '#a67c52'
    },
    cancelButton: {
        backgroundColor: '#3a1f1f',
        borderColor: '#8B0000'
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    }
}); 