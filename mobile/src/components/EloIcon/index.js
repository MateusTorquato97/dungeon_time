import React from 'react';
import { TouchableOpacity, Image, Text, View } from 'react-native';
import { StyleSheet } from 'react-native';
import eloImages from '../../utils/images/elos';

const EloIcon = ({ elo, selected, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.container, selected && styles.selected]}
            onPress={onPress}
        >
            <Image
                source={eloImages[elo.toLowerCase()]}
                style={styles.icon}
            />
            <Text style={styles.text}>{elo}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 5,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selected: {
        borderColor: '#a67c52',
        backgroundColor: 'rgba(166, 124, 82, 0.2)',
    },
    icon: {
        width: 50,
        height: 50,
    },
    text: {
        color: '#fff',
        marginTop: 5,
        fontSize: 12,
        textAlign: 'center',
    },
});

export default EloIcon;
