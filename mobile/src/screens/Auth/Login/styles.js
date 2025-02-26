import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../../constants/colors';

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        padding: 20
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    titleContainer: {
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        marginBottom: 15,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.white,
        marginTop: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    formContainer: {
        padding: 20,
        marginTop: 40,
    },
    inputContainer: {
        backgroundColor: COLORS.transparent,
        borderRadius: 25,
        marginBottom: 10,
        padding: 5,
    },
    input: {
        height: 45,
        paddingHorizontal: 20,
        fontSize: 14,
        color: COLORS.white,
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    actionButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    switchButtonText: {
        color: COLORS.white,
        fontSize: 14,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    forgotButton: {
        marginTop: 10,
        alignItems: 'center',
    },
    forgotButtonText: {
        color: COLORS.white,
        fontSize: 14,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    errorText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    classContainer: {
        marginVertical: 5,
        width: '100%'
    },
    classTitle: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center'
    },
    classGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8
    },
    classButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 8,
        borderRadius: 5,
        width: '48%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    selectedClass: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderColor: '#fff'
    },
    classText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14
    },
    selectedClassText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    classDescription: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#836323',
    },
    descriptionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    descriptionText: {
        color: '#ccc',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 5,
    },
    bonusText: {
        color: '#836323',
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    }
}); 