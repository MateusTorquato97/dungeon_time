import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
    container: {
        position: 'absolute', // fixa o menu na parte de baixo
        bottom: 0,
        left: 0,
        right: 0,
    },
    background: {
        backgroundColor: '#1f1a13', // fundo escuro, clima medieval
        paddingBottom: Platform.OS === 'ios' ? 25 : 15,
        borderTopWidth: 2,
        borderTopColor: '#a67c52', // detalhe dourado ornamentado
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'visible',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    menuContent: {
        position: 'relative',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
    },
    decorationTop: {
        flexDirection: 'row',
        justifyContent: 'center', // centraliza a decoração
        marginBottom: 5,
    },
    decorationPiece: {
        width: 40,
        height: 4,
        backgroundColor: '#a67c52', // dourado
        borderRadius: 2,
        marginHorizontal: 2,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end', // alinha os botões na base
        height: 60,
        marginTop: 10,
    },
    // Agrupamento dos botões laterais para que não fiquem sob o botão Home
    navGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '40%', // cada grupo ocupa 40% da largura
    },
    navButton: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 60,
        backgroundColor: '#2e2b25', // lembra madeira ou metal envelhecido
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#a67c52', // contorno dourado
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 3,
    },
    navText: {
        color: '#a67c52',
        fontSize: 12,
        marginTop: 4,
        fontFamily: 'serif',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    // Container do botão Home (fora do fluxo dos botões laterais)
    homeButtonContainer: {
        position: 'absolute',
        alignSelf: 'center',
        bottom: 30, // ajusta esse valor se necessário para não sobrepor os botões laterais
        alignItems: 'center',
    },
    // Botão Home com design robusto e medieval
    homeButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5c3a21', // marrom rústico
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        borderWidth: 3,
        borderColor: '#a67c52', // borda dourada para destaque
    },
    // Rótulo abaixo do botão Home
    homeLabel: {
        marginTop: 6,
        color: '#a67c52',
        fontSize: 16,
        fontFamily: 'serif',
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
});
