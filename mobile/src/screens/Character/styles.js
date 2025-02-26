import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const SLOT_SIZE = width * 0.16; // Mantido em 15%

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
    content: {
        flex: 1,
        padding: 16,
        paddingBottom: 80, // Espaço para o BottomNav
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    equipmentLayout: {
        width: '100%',
        aspectRatio: 1,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: width * 0.01,
    },
    characterContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -width * 0.2 },
            { translateY: -width * 0.2 }
        ],
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: width * 0.2,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#836323',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    characterImageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    characterImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },
    equipmentSlot: {
        position: 'absolute',
        width: SLOT_SIZE,
        height: SLOT_SIZE,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#836323',
        backgroundColor: 'rgba(0, 0, 0, 1)',
        zIndex: 2
    },
    slotContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 6,
    },
    slotImage: {
        width: SLOT_SIZE * 0.6,
        height: SLOT_SIZE * 0.6,
        resizeMode: 'contain',
    },
    emptySlot: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 8,
    },
    slotLabel: {
        color: '#836323',
        fontSize: 10,
        textAlign: 'center',
    },
    // Elmo
    helmetSlot: {
        top: '10%',
        left: '50%',
        transform: [{ translateX: -SLOT_SIZE / 2 }],
    },
    // Colar
    necklaceSlot: {
        top: '20%',
        left: '20%',
    },
    // Arma
    weaponSlot: {
        top: '40%',
        left: '20%',
    },
    // Anel
    ringSlot: {
        top: '60%',
        left: '20%',
    },
    // Armadura
    armorSlot: {
        top: '20%',
        right: '20%',
    },
    // Luvas
    glovesSlot: {
        top: '40%',
        right: '20%',
    },
    // Botas
    bootsSlot: {
        bottom: '10%',
        left: '50%',
        transform: [{ translateX: -SLOT_SIZE / 2 }],
    },
    // Estilo para os atributos
    attributesContainer: {
        marginTop: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 2,
        borderColor: '#836323',
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(131, 99, 35, 0.3)',
    },
    attributeLabel: {
        color: '#836323',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
    attributeValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
    },
    attributeBonus: {
        color: '#4CAF50',
        fontSize: 14,
        marginLeft: 8,
    },
    equippedItem: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemName: {
        color: '#fff',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 2,
    },
    itemLevel: {
        color: '#aaa',
        fontSize: 10,
        marginTop: 2,
    },
    loadingText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        marginVertical: 10
    }
});