import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import styles from './styles';
const { width: screenWidth } = Dimensions.get('window');

export default function TopBar() {
    return (
        <View style={styles.topBar}>
            <View style={styles.resourceItem}>
                <View style={styles.resourceBackground}>
                    <Image
                        source={require('../../../assets/images/potion_mana.png')}
                        style={styles.resourceIcon}
                    />
                    <Text style={styles.resourceText}>771.9K</Text>
                </View>
            </View>

            <View style={styles.resourceItem}>
                <View style={styles.resourceBackground}>
                    <Image
                        source={require('../../../assets/images/energy_icon.png')}
                        style={styles.resourceIcon}
                    />
                    <Text style={styles.resourceText}>13.6K</Text>
                </View>
            </View>

            <View style={styles.resourceItem}>
                <View style={styles.resourceBackground}>
                    <Image
                        source={require('../../../assets/images/coin_icon.png')}
                        style={styles.resourceIcon}
                    />
                    <Text style={styles.resourceText}>2.5K</Text>
                </View>
            </View>
        </View>
    );
}