import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ItemReward from '../ItemReward';
import styles from './styles';

const RewardsModal = ({ visible, rewards, onClose, onCollect, experiencia }) => {
    if (!rewards || !Array.isArray(rewards)) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <LinearGradient
                    colors={['#2e2b25', '#1a0f0a']}
                    style={styles.modalContent}
                >
                    <Text style={styles.title}>Recompensas da Dungeon!</Text>

                    {experiencia && (
                        <View style={styles.xpContainer}>
                            <Text style={styles.xpText}>
                                +{experiencia.xpGanho} XP
                            </Text>
                            <Text style={styles.xpProgress}>
                                {experiencia.xp_atual} / {experiencia.prox_xp}
                            </Text>
                        </View>
                    )}

                    <View style={styles.rewardsContainer}>
                        {rewards.map((reward, index) => (
                            <ItemReward
                                key={index}
                                item={reward}
                                isNew={true}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.collectButton}
                        onPress={onCollect}
                    >
                        <Text style={styles.collectButtonText}>COLETAR RECOMPENSAS</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </Modal>
    );
};

export default RewardsModal; 