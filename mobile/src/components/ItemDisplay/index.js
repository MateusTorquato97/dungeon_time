import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles';
import { getItemImage } from '../../utils/itemImages';

const RARITY_GRADIENTS = {
    comum: ['#3a3a3a', '#2a2a2a'],
    incomum: ['#3d7a3d', '#2a572a'],
    raro: ['#3d3d7a', '#2a2a57'],
    epico: ['#7a3d7a', '#572a57'],
    lendario: ['#7a3d3d', '#572a2a']
};

const ItemDisplay = ({ item, onPress, isEquipped, isNew }) => {
    return (
        <TouchableOpacity onPress={() => onPress(item)}>
            <LinearGradient
                colors={RARITY_GRADIENTS[item.raridade]}
                style={styles.container}
            >
                <View style={styles.innerContainer}>
                    <Image
                        source={getItemImage(item)}
                        style={styles.itemImage}
                    />
                    {isEquipped && (
                        <View style={styles.equippedBadge}>
                            <Text style={styles.equippedText}>E</Text>
                        </View>
                    )}
                    {isNew && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newText}>NOVO</Text>
                        </View>
                    )}
                    <Text style={styles.itemName}>{item.nome}</Text>
                    <Text style={styles.itemLevel}>Nível {item.nivel}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

export default ItemDisplay; 