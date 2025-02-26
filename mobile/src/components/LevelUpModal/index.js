import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles';

const LevelUpModal = ({ visible, onClose, levelUpData }) => {

    if (!levelUpData || !levelUpData.attributesGained) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <LinearGradient
                    colors={['#2e2b25', '#1a0f0a']}
                    style={styles.modalContainer}
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>Nível Aumentado!</Text>
                        <Text style={styles.levelText}>Nível {levelUpData.newLevel}</Text>

                        <View style={styles.attributesContainer}>
                            <Text style={styles.subtitle}>Atributos Aumentados:</Text>
                            {Object.entries(levelUpData.attributesGained).map(([attr, value]) => (
                                <Text key={attr} style={styles.attributeText}>
                                    {attr}: +{value}
                                </Text>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.button} onPress={onClose}>
                            <Text style={styles.buttonText}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    );
};

export default LevelUpModal; 