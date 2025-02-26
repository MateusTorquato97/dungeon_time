import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles';

const AdvancedFilterModal = ({ visible, onClose, onApplyFilter }) => {
    const [filters, setFilters] = useState({
        forca: '',
        destreza: '',
        inteligencia: '',
        vitalidade: '',
        defesa: ''
    });

    const handleApplyFilter = () => {
        onApplyFilter(filters);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={() => {
                Keyboard.dismiss();
                onClose();
            }}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={(e) => {
                        e.stopPropagation();
                    }}>
                        <LinearGradient
                            colors={['#2e2b25', '#1a0f0a']}
                            style={styles.modalContainer}
                        >
                            <View style={styles.modalContent}>
                                <Text style={styles.title}>Filtro Avançado</Text>

                                <ScrollView>
                                    <View style={styles.filterGroup}>
                                        <Text style={styles.filterLabel}>Força mínima:</Text>
                                        <TextInput
                                            style={styles.filterInput}
                                            value={filters.forca}
                                            onChangeText={(text) => setFilters({ ...filters, forca: text })}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor="#666"
                                        />
                                    </View>

                                    <View style={styles.filterGroup}>
                                        <Text style={styles.filterLabel}>Destreza mínima:</Text>
                                        <TextInput
                                            style={styles.filterInput}
                                            value={filters.destreza}
                                            onChangeText={(text) => setFilters({ ...filters, destreza: text })}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor="#666"
                                        />
                                    </View>

                                    <View style={styles.filterGroup}>
                                        <Text style={styles.filterLabel}>Inteligência mínima:</Text>
                                        <TextInput
                                            style={styles.filterInput}
                                            value={filters.inteligencia}
                                            onChangeText={(text) => setFilters({ ...filters, inteligencia: text })}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor="#666"
                                        />
                                    </View>

                                    <View style={styles.filterGroup}>
                                        <Text style={styles.filterLabel}>Vitalidade mínima:</Text>
                                        <TextInput
                                            style={styles.filterInput}
                                            value={filters.vitalidade}
                                            onChangeText={(text) => setFilters({ ...filters, vitalidade: text })}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor="#666"
                                        />
                                    </View>

                                    <View style={styles.filterGroup}>
                                        <Text style={styles.filterLabel}>Defesa mínima:</Text>
                                        <TextInput
                                            style={styles.filterInput}
                                            value={filters.defesa}
                                            onChangeText={(text) => setFilters({ ...filters, defesa: text })}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor="#666"
                                        />
                                    </View>
                                </ScrollView>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.applyButton]}
                                        onPress={handleApplyFilter}
                                    >
                                        <Text style={styles.buttonText}>Aplicar Filtros</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.cancelButton]}
                                        onPress={onClose}
                                    >
                                        <Text style={styles.buttonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default AdvancedFilterModal;