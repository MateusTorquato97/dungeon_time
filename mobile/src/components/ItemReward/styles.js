import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const gap = 8;
const numColumns = 4;
const itemSize = (width - (2 * (width * 0.04)) - (gap * (numColumns - 1))) / numColumns;

export default StyleSheet.create({
    container: {
        width: itemSize,
        height: itemSize,
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
        width: itemSize * 0.5,
        height: itemSize * 0.5,
        resizeMode: 'contain'
    },
    itemName: {
        color: '#fff',
        fontSize: 10, // Reduzido de 12 para 10
        textAlign: 'center',
        marginTop: 2
    },
    rarityText: {
        fontSize: 8, // Reduzido de 10 para 8
        fontWeight: 'bold',
        marginTop: 1
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4
    },
    attributeLabel: {
        color: '#fff',
        fontSize: 10,
        marginRight: 4
    },
    attributeValue: {
        fontSize: 10,
        fontWeight: 'bold'
    },
    equippedBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#FFD700',
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFA000',
    },
    equippedText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    newBadge: {
        position: 'absolute',
        top: 4,
        left: 4,
        backgroundColor: '#FF9800',
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