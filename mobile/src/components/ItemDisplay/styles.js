import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 8,
        padding: 2,
    },
    innerContainer: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4
    },
    itemImage: {
        width: '60%',
        height: '60%',
        resizeMode: 'contain'
    },
    itemName: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4
    },
    itemLevel: {
        color: '#a67c52',
        fontSize: 10,
        marginTop: 2
    },
    equippedBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#836323',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    equippedText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    newBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 1,
    },
    newText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    }
}); 