import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../contexts/AuthContext';
import { equipmentService } from '../../services/equipmentService';
import BottomNav from '../../components/BottomNav';
import styles from './styles';
import { getItemImage } from '../../utils/itemImages';
import { characterService } from '../../services/characterService';
import AttributeDisplay from '../../components/AttributeDisplay';
import ItemDetailsModal from '../../components/ItemDetailsModal';
import CharacterHeader from '../../components/CharacterHeader';
import { CLASS_IMAGES } from '../../constants/classImages';

const EquipmentSlot = ({ item, slotName, style, onPress }) => {
    const RARITY_GRADIENTS = {
        comum: ['#757575', '#9e9e9e'],
        incomum: ['#388E3C', '#4CAF50'],
        raro: ['#1976D2', '#2196F3'],
        epico: ['#7B1FA2', '#9C27B0'],
        lendario: ['#FFA000', '#FFD700']
    };

    if (!item) {
        return (
            <View style={[styles.equipmentSlot, style]}>
                <View style={[styles.emptySlot, { backgroundColor: 'rgba(0,0,0,1)' }]}>
                    <Text style={styles.slotLabel}>{slotName}</Text>
                </View>
            </View>
        );
    }

    return (
        <TouchableOpacity onPress={() => onPress(item)} style={[styles.equipmentSlot, style]}>
            <LinearGradient
                colors={RARITY_GRADIENTS[item?.raridade || 'comum']}
                style={styles.slotContainer}

            >
                <View style={styles.innerContainer}>
                    <Image
                        source={item ? getItemImage(item) : null}
                        style={styles.slotImage}
                    />
                    <Text style={styles.itemName} numberOfLines={1}>
                        {item ? item.nome : slotName}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const AttributeRow = ({ label, baseValue, bonusValue, averageRarity }) => {
    const rarityColors = ['#3a3a3a', '#3d7a3d', '#3d3d7a', '#7a3d7a', '#7a3d3d'];
    const colorIndex = Math.round(averageRarity) - 1;
    const bonusColor = rarityColors[colorIndex] || rarityColors[0];

    return (
        <View style={styles.attributeRow}>
            <Text style={styles.attributeLabel}>{label}:</Text>
            <Text style={styles.attributeValue}>
                {baseValue} <Text style={{ color: bonusColor }}>(+{bonusValue})</Text>
            </Text>
        </View>
    );
};

const getCharacterImage = (skinPath) => {
    if (!skinPath) return CLASS_IMAGES.default.guerreiro;
    const [category, path] = skinPath.split('/');
    return CLASS_IMAGES[category]?.[path] || CLASS_IMAGES.default.guerreiro;
};

export default function CharacterScreen() {
    const { token, usuario } = useContext(AuthContext);
    const [equippedItems, setEquippedItems] = useState({});
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [attributes, setAttributes] = useState({
        base: null,
        bonuses: {
            forca: 0,
            destreza: 0,
            inteligencia: 0,
            vitalidade: 0,
            defesa: 0,
            sorte: 0
        },
        averageRarities: {
            forca: 0,
            destreza: 0,
            inteligencia: 0,
            vitalidade: 0,
            defesa: 0,
            sorte: 0
        }
    });

    useEffect(() => {
        loadCharacterData();
    }, []);

    const loadCharacterData = async () => {
        try {

            // Carregar atributos do personagem
            const characterData = await characterService.getCharacterAttributes(token);

            if (characterData.success) {
                console.log(characterData.attributes);
                setAttributes(prev => {
                    const newState = {
                        ...prev,
                        base: characterData.attributes
                    };
                    return newState;
                });
            }

            // Carregar itens equipados
            await loadEquippedItems();
        } catch (error) {
            console.error('Erro detalhado ao carregar dados do personagem:', error);
        }
    };

    const loadEquippedItems = async () => {
        try {
            const response = await equipmentService.getEquippedItems(token);
            const itemsBySlot = response.equippedItems.reduce((acc, item) => {
                acc[item.slot] = item;
                return acc;
            }, {});
            setEquippedItems(itemsBySlot);

            // Calcula os atributos totais
            calculateTotalAttributes(response.equippedItems);
        } catch (error) {
            console.error('Erro ao carregar itens equipados:', error);
        }
    };

    const calculateTotalAttributes = (items) => {
        const equipmentBonuses = {
            forca: 0,
            destreza: 0,
            inteligencia: 0,
            vitalidade: 0,
            defesa: 0,
            sorte: 0
        };

        const rarityValues = {
            comum: 1,
            incomum: 2,
            raro: 3,
            epico: 4,
            lendario: 5
        };

        const attributeOccurrences = {
            forca: 0,
            destreza: 0,
            inteligencia: 0,
            vitalidade: 0,
            defesa: 0,
            sorte: 0
        };

        const rarityCounts = {
            forca: 0,
            destreza: 0,
            inteligencia: 0,
            vitalidade: 0,
            defesa: 0,
            sorte: 0
        };

        items.forEach(item => {
            ['forca', 'destreza', 'inteligencia', 'vitalidade', 'defesa', 'sorte'].forEach(attr => {
                if (item[attr] > 0) {
                    equipmentBonuses[attr] += item[attr];
                    attributeOccurrences[attr]++;
                    const rarityValue = rarityValues[item[`${attr}_raridade`]] || 1;
                    rarityCounts[attr] += rarityValue;
                }
            });
        });

        const averageRarities = {};
        Object.keys(rarityCounts).forEach(attr => {
            averageRarities[attr] = attributeOccurrences[attr] > 0
                ? rarityCounts[attr] / attributeOccurrences[attr]
                : 0;
        });

        setAttributes(prev => ({
            base: prev.base,
            bonuses: equipmentBonuses,
            averageRarities
        }));
    };

    const handleItemPress = (item) => {
        setSelectedItem(item);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedItem(null);
    };

    const handleEquipItem = async (item, equip) => {
        try {
            console.log('Tentando equipar/desequipar:', item.id, equip);
            const response = await equipmentService.equipItem(token, item.equipamento_id, equip);

            if (response.success) {
                await loadEquippedItems();
                await loadCharacterData(); // Recarrega os atributos também
                setIsModalVisible(false);
                setSelectedItem(null);
            } else {
                console.error('Falha ao equipar/desequipar:', response.message);
            }
        } catch (error) {
            console.error('Erro ao equipar/desequipar item:', error);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#2e2b25', '#1a0f0a']} style={styles.gradient}>
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView style={styles.content}>
                        <CharacterHeader
                            character={{
                                nickname: usuario.nickname,
                                classe: attributes.base?.classe,
                                nivel: attributes.base?.nivel || 1,
                                xp_atual: attributes.base?.xp_atual || 0,
                                prox_xp: attributes.base?.prox_xp || 100
                            }}
                        />
                        <View style={styles.equipmentLayout}>
                            {/* Personagem no centro */}
                            <View style={styles.characterContainer}>
                                <View style={styles.characterImageContainer}>
                                    <Image
                                        source={getCharacterImage(attributes.base?.skin_path)}
                                        style={styles.characterImage}
                                    />
                                </View>
                            </View>

                            {/* Slots de equipamento */}
                            <EquipmentSlot
                                item={equippedItems.elmo}
                                slotName="Elmo"
                                style={styles.helmetSlot}
                                onPress={handleItemPress}
                            />
                            <EquipmentSlot
                                item={equippedItems.colar}
                                slotName="Colar"
                                style={styles.necklaceSlot}
                                onPress={handleItemPress}
                            />
                            <EquipmentSlot
                                item={equippedItems.armadura}
                                slotName="Armadura"
                                style={styles.armorSlot}
                                onPress={handleItemPress}
                            />
                            <EquipmentSlot
                                item={equippedItems.arma}
                                slotName="Arma"
                                style={styles.weaponSlot}
                                onPress={handleItemPress}
                            />
                            <EquipmentSlot
                                item={equippedItems.luvas}
                                slotName="Luvas"
                                style={styles.glovesSlot}
                                onPress={handleItemPress}
                            />
                            <EquipmentSlot
                                item={equippedItems.anel}
                                slotName="Anel"
                                style={styles.ringSlot}
                                onPress={handleItemPress}
                            />
                            <EquipmentSlot
                                item={equippedItems.botas}
                                slotName="Botas"
                                style={styles.bootsSlot}
                                onPress={handleItemPress}
                            />
                        </View>

                        {/* Atributos Totais */}
                        <View style={styles.attributesContainer}>
                            <AttributeDisplay
                                label="Força"
                                baseValue={attributes.base?.forca || 0}
                                bonus={attributes.bonuses.forca}
                                averageRarity={attributes.averageRarities.forca}
                            />
                            <AttributeDisplay
                                label="Destreza"
                                baseValue={attributes.base?.destreza || 0}
                                bonus={attributes.bonuses.destreza}
                                averageRarity={attributes.averageRarities.destreza}
                            />
                            <AttributeDisplay
                                label="Inteligência"
                                baseValue={attributes.base?.inteligencia || 0}
                                bonus={attributes.bonuses.inteligencia}
                                averageRarity={attributes.averageRarities.inteligencia}
                            />
                            <AttributeDisplay
                                label="Vitalidade"
                                baseValue={attributes.base?.vitalidade || 0}
                                bonus={attributes.bonuses.vitalidade}
                                averageRarity={attributes.averageRarities.vitalidade}
                            />
                            <AttributeDisplay
                                label="Defesa"
                                baseValue={attributes.base?.defesa || 0}
                                bonus={attributes.bonuses.defesa}
                                averageRarity={attributes.averageRarities.defesa}
                            />
                            <AttributeDisplay
                                label="Sorte"
                                baseValue={attributes.base?.sorte || 0}
                                bonus={attributes.bonuses.sorte}
                                averageRarity={attributes.averageRarities.sorte}
                            />
                        </View>
                    </ScrollView>
                    <BottomNav />
                </SafeAreaView>

                {/* Modal de detalhes do item */}
                <ItemDetailsModal
                    item={selectedItem}
                    visible={isModalVisible}
                    onClose={handleCloseModal}
                    isEquipped={true}
                    onEquip={handleEquipItem}
                />
            </LinearGradient>
        </View>
    );
}