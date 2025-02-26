import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ItemReward from '../../components/ItemReward';
import { inventoryService } from '../../services/inventoryService';
import { AuthContext } from '../../contexts/AuthContext';
import BottomNav from '../../components/BottomNav';
import styles from './styles';
import { Feather } from '@expo/vector-icons';
import AdvancedFilterModal from '../../components/AdvancedFilterModal';
import { equipmentService } from '../../services/equipmentService';
import ItemDetailsModal from '../../components/ItemDetailsModal';

const { width: screenWidth } = Dimensions.get('window');

export default function InventoryScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('todos');
    const [advancedFilterVisible, setAdvancedFilterVisible] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState(null);
    const [equippedItems, setEquippedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const filters = [
        { id: 'todos', label: 'Todos' },
        { id: 'arma', label: 'Armas' },
        { id: 'armadura', label: 'Armaduras' },
        { id: 'elmo', label: 'Elmos' },
        { id: 'colar', label: 'Colares' },
        { id: 'anel', label: 'Anéis' },
        { id: 'luvas', label: 'Luvas' },
        { id: 'botas', label: 'Botas' },
        { id: 'consumivel', label: 'Consumíveis' }
    ];

    const loadInventory = async () => {
        try {
            const response = await inventoryService.getItems(token);
            if (response && response.items) {
                setItems(response.items);
                setFilteredItems(response.items);
            } else {
                setItems([]);
                setFilteredItems([]);
            }
        } catch (error) {
            console.error('Erro ao carregar inventário:', error);
            setItems([]);
            setFilteredItems([]);
        }
    };

    const loadEquippedItems = async () => {
        try {
            const response = await equipmentService.getEquippedItems(token);
            setEquippedItems(response.equippedItems);
        } catch (error) {
            console.error('Erro ao carregar itens equipados:', error);
        }
    };

    const handleItemPress = (item) => {
        setSelectedItem(item);
        setModalVisible(true);
    };

    const handleEquipItem = async (item, equip) => {
        try {
            console.log('Tentando equipar/desequipar:', item, equip);
            const response = await equipmentService.equipItem(token, item.id, equip);

            if (response.success) {
                await loadEquippedItems();
                await loadInventory();
                setModalVisible(false);
            } else {
                console.error('Falha ao equipar/desequipar:', response.message);
            }
        } catch (error) {
            console.error('Erro ao equipar/desequipar item:', error);
        }
    };

    const isItemEquipped = (item) => {
        if (!item || !equippedItems) return false;
        return equippedItems.some(equipped => equipped.equipamento_id === item.id);
    };

    const filterItems = () => {
        let filtered = items;

        // Filtro por tipo
        if (selectedFilter !== 'todos') {
            filtered = filtered.filter(item => item.slot === selectedFilter);
        }

        // Filtro por texto
        if (searchText) {
            filtered = filtered.filter(item =>
                item.nome.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Filtros avançados
        if (advancedFilters) {
            filtered = filtered.filter(item => {
                return (
                    (!advancedFilters.forca || item.forca >= parseInt(advancedFilters.forca)) &&
                    (!advancedFilters.destreza || item.destreza >= parseInt(advancedFilters.destreza)) &&
                    (!advancedFilters.inteligencia || item.inteligencia >= parseInt(advancedFilters.inteligencia)) &&
                    (!advancedFilters.vitalidade || item.vitalidade >= parseInt(advancedFilters.vitalidade)) &&
                    (!advancedFilters.defesa || item.defesa >= parseInt(advancedFilters.defesa)) &&
                    (!advancedFilters.sorte || item.sorte >= parseInt(advancedFilters.sorte))
                );
            });
        }

        setFilteredItems(filtered);
    };

    useEffect(() => {
        loadInventory();
        loadEquippedItems();
    }, []);

    useEffect(() => {
        filterItems();
    }, [selectedFilter, searchText, advancedFilters]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#2e2b25', '#1a0f0a']}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        <View style={styles.searchContainer}>
                            <View style={styles.searchInputContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Buscar item..."
                                    placeholderTextColor="#8b8b8b"
                                    value={searchText}
                                    onChangeText={setSearchText}
                                />
                                <TouchableOpacity
                                    style={styles.advancedFilterButton}
                                    onPress={() => setAdvancedFilterVisible(true)}
                                >
                                    <Feather name="filter" size={24} color="#a67c52" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.filterContainer}>
                            <FlatList
                                horizontal
                                data={filters}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.filterButton,
                                            selectedFilter === item.id && styles.filterButtonActive
                                        ]}
                                        onPress={() => setSelectedFilter(item.id)}
                                    >
                                        <Text style={styles.filterButtonText}>{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={item => item.id}
                            />
                        </View>

                        <View style={styles.itemsContainer}>
                            {filteredItems.map((item, index) => (
                                item ? (
                                    <ItemReward
                                        key={item?.id?.toString() || index.toString()}
                                        item={item}
                                        isEquipped={isItemEquipped(item)}
                                        isNew={!item.visualizado}
                                        onEquip={handleEquipItem}
                                    />
                                ) : null
                            ))}
                        </View>
                    </View>

                    <BottomNav navigation={navigation} />
                </SafeAreaView>
            </LinearGradient>

            <AdvancedFilterModal
                visible={advancedFilterVisible}
                onClose={() => setAdvancedFilterVisible(false)}
                onApplyFilter={setAdvancedFilters}
            />

            <ItemDetailsModal
                item={selectedItem}
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                isEquipped={isItemEquipped(selectedItem)}
                onEquip={handleEquipItem}
            />
        </View>
    );
} 