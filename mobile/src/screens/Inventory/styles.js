import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: screenWidth * 0.04,
        paddingTop: screenWidth * 0.04,
    },
    searchContainer: {
        marginBottom: screenWidth * 0.04,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3d3832',
        borderRadius: 8,
        paddingRight: 8,
    },
    searchInput: {
        flex: 1,
        padding: screenWidth * 0.03,
        color: '#fff',
        fontSize: 16,
    },
    advancedFilterButton: {
        padding: 8,
        marginLeft: 4
    },
    filterContainer: {
        marginBottom: screenWidth * 0.04,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 4
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#2e2b25',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#a67c52',
        marginRight: 8,
        marginBottom: 8
    },
    filterButtonActive: {
        backgroundColor: '#a67c52'
    },
    filterButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500'
    },
    filterButtonTextActive: {
        color: '#1a1a1a',
        fontWeight: 'bold'
    },
    itemsContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        paddingBottom: screenWidth * 0.04,
        gap: 8
    },
    itemWrapper: {
        width: `${100 / 4}%`,
        padding: 4,
        aspectRatio: 1
    }
}); 