import { StyleSheet, Platform, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';
const { width: screenWidth } = Dimensions.get('window');

export default StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: screenWidth * 0.03,
        paddingHorizontal: 20,
    },
    resourceItem: {
        marginHorizontal: 5,
    },
    resourceBackground: {
        backgroundColor: COLORS.transparent,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    resourceIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
    },
    resourceText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    missionsButton: {
        position: 'absolute',
        right: 20,
        alignItems: 'center',
        marginTop: 15,
    },
    missionIcon: {
        width: 40,
        height: 40,
    },
    missionText: {
        color: COLORS.white,
        fontSize: 12,
        marginTop: 2,
    },
});