import React, { useState, useContext } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RARITY_COLORS, RARITY_GRADIENTS } from '../../constants/rarityColors';
import { AuthContext } from '../../contexts/AuthContext';
import { inventoryService } from '../../services/inventoryService';
import ItemDetailsModal from '../ItemDetailsModal';
import styles from './styles';
import { itemImages } from '../../utils/images';

const ItemReward = ({ item, isEquipped, onEquip, isNew: initialIsNew }) => {
    const { token } = useContext(AuthContext);
    const [isNewState, setIsNewState] = useState(initialIsNew);
    const [modalVisible, setModalVisible] = useState(false);

    const handlePress = async () => {
        if (isNewState) {
            try {
                await inventoryService.markItemsAsViewed([item.inventory_id], token);
                setIsNewState(false);
            } catch (error) {
                console.error('Erro ao marcar item como visualizado:', error);
            }
        }
        setModalVisible(true);
    };

    return (
        <>
            <TouchableOpacity onPress={handlePress}>
                <LinearGradient
                    colors={RARITY_GRADIENTS[item.raridade]}
                    style={styles.container}
                >
                    <View style={styles.innerContainer}>
                        <Image
                            source={itemImages[item.nome] || itemImages['Espada Longa']}
                            style={styles.itemImage}
                        />
                        {isEquipped && (
                            <View style={styles.equippedBadge}>
                                <Text style={styles.equippedText}>E</Text>
                            </View>
                        )}
                        {isNewState && (
                            <View style={styles.newBadge}>
                                <Text style={styles.newText}>NOVO</Text>
                            </View>
                        )}
                        <Text style={styles.itemName}>{item.nome}</Text>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            <ItemDetailsModal
                item={item}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                isEquipped={isEquipped}
                onEquip={onEquip}
            />
        </>
    );
};

export default ItemReward; 