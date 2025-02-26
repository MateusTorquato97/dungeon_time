import React from 'react';
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RARITY_COLORS, RARITY_GRADIENTS } from '../../constants/rarityColors';
import styles from './styles';

const AttributeValue = ({ label, value, rarity }) => (
    <View style={styles.attributeRow}>
        <Text style={styles.attributeLabel}>{label}:</Text>
        <Text style={[styles.attributeValue, { color: RARITY_COLORS[rarity || 'comum'] }]}>
            {value}
        </Text>
    </View>
);

const ItemDetailsModal = ({ item, visible, onClose, isEquipped, onEquip }) => {
    const handleEquipPress = () => {
        if (onEquip) {
            onEquip(item, !isEquipped);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <LinearGradient
                    colors={RARITY_GRADIENTS[item?.raridade || 'comum']}
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        {/* Cabeçalho */}
                        <Text style={styles.itemName}>{item?.nome}</Text>
                        <Text style={[styles.rarityText, { color: RARITY_COLORS[item?.raridade] }]}>
                            {item?.raridade}
                        </Text>

                        {/* Atributos */}
                        <View style={styles.attributesContainer}>
                            {item?.forca > 0 && (
                                <AttributeValue
                                    label="Força"
                                    value={item.forca}
                                    rarity={item.forca_raridade}
                                />
                            )}
                            {item?.destreza > 0 && (
                                <AttributeValue
                                    label="Destreza"
                                    value={item.destreza}
                                    rarity={item.destreza_raridade}
                                />
                            )}
                            {item?.inteligencia > 0 && (
                                <AttributeValue
                                    label="Inteligência"
                                    value={item.inteligencia}
                                    rarity={item.inteligencia_raridade}
                                />
                            )}
                            {item?.vitalidade > 0 && (
                                <AttributeValue
                                    label="Vitalidade"
                                    value={item.vitalidade}
                                    rarity={item.vitalidade_raridade}
                                />
                            )}
                            {item?.defesa > 0 && (
                                <AttributeValue
                                    label="Defesa"
                                    value={item.defesa}
                                    rarity={item.defesa_raridade}
                                />
                            )}
                            {item?.sorte > 0 && (
                                <AttributeValue
                                    label="Sorte"
                                    value={item.sorte}
                                    rarity={item.sorte_raridade}
                                />
                            )}
                        </View>

                        {/* Ações */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={[styles.actionButton, isEquipped && styles.unequipButton]}
                                onPress={handleEquipPress}
                            >
                                <Text style={styles.actionButtonText}>
                                    {isEquipped ? '🔄 Desequipar' : '⚔️ Equipar'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <Text style={styles.actionButtonText}>💰 Vender</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.actionButton, styles.destroyButton]}>
                                <Text style={[styles.actionButtonText, styles.destroyButtonText]}>
                                    🗑️ Destruir
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Botão Fechar */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Text style={styles.closeButtonText}>✖️ Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    );
};

export default ItemDetailsModal;