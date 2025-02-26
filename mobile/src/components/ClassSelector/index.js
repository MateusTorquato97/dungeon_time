import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const classes = [
    {
        id: 'guerreiro',
        nome: 'Guerreiro',
        descricao: 'Especialista em combate corpo a corpo e resistência física'
    },
    {
        id: 'mago',
        nome: 'Mago',
        descricao: 'Especialista em magias e encontrar itens raros'
    },
    {
        id: 'ladino',
        nome: 'Ladino',
        descricao: 'Especialista em ataques precisos e encontrar tesouros'
    },
    {
        id: 'paladino',
        nome: 'Paladino',
        descricao: 'Especialista em proteção e sobrevivência'
    },
    {
        id: 'cacador',
        nome: 'Caçador',
        descricao: 'Especialista em ataques à distância'
    },
    {
        id: 'clerigo',
        nome: 'Clérigo',
        descricao: 'Especialista em cura e suporte'
    },
    {
        id: 'mercenario',
        nome: 'Mercenário',
        descricao: 'Especialista em encontrar itens raros e esquiva'
    },
    {
        id: 'cavaleiro',
        nome: 'Cavaleiro',
        descricao: 'Especialista em tankar dano e contra-ataques'
    }
];

const ClassSelector = ({ selectedClass, onSelectClass }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Escolha sua Classe</Text>
            {classes.map((classe) => (
                <TouchableOpacity
                    key={classe.id}
                    style={[
                        styles.classButton,
                        selectedClass === classe.id && styles.selectedClass
                    ]}
                    onPress={() => onSelectClass(classe.id)}
                >
                    <Text style={styles.className}>{classe.nome}</Text>
                    <Text style={styles.classDescription}>{classe.descricao}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    // Estilos aqui...
});

export default ClassSelector; 