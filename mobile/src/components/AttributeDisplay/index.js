import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RARITY_COLORS, getRarityFromAverage } from '../../constants/rarityColors';

const AttributeDisplay = ({ label, baseValue, bonus, averageRarity }) => {
    const totalValue = baseValue + bonus;
    const rarityColor = bonus > 0 ? RARITY_COLORS[getRarityFromAverage(averageRarity)] : '#ffffff';

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}:</Text>
            <View style={styles.valueContainer}>
                <Text style={styles.baseValue}>{baseValue}</Text>
                {bonus > 0 && (
                    <Text style={[styles.bonus, { color: rarityColor }]}>
                        {` +${bonus}`}
                    </Text>
                )}
                <Text style={styles.total}>{` (${totalValue})`}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    label: {
        color: '#ffffff',
        fontSize: 16,
    },
    valueContainer: {
        flexDirection: 'row',
    },
    baseValue: {
        color: '#ffffff',
        fontSize: 16,
    },
    bonus: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    total: {
        color: '#ffffff',
        fontSize: 16,
    }
});

export default AttributeDisplay; 