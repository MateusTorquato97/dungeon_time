import React, { useContext, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ImageBackground,
    SafeAreaView,
    useWindowDimensions,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TopBar from '../../components/TopBar';
import BottomNav from '../../components/BottomNav';
import styles from './styles';
import { AuthContext } from '../../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { dungeonService } from '../../services/dungeonService';
import { menuImages, homeImages } from '../../utils/images';

export default function HomeScreen({ navigation }) {
    const { height } = useWindowDimensions();
    const { signOut, usuario, token } = useContext(AuthContext);
    const [hasPendingRewards, setHasPendingRewards] = useState(false);
    const checkRewardsTimeoutRef = useRef(null);

    console.log(token);

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    const checkPendingRewards = async () => {
        try {
            const response = await dungeonService.checkPendingRewards(token);
            setHasPendingRewards(response.hasPendingRewards);
        } catch (error) {
            console.error('Erro ao verificar recompensas:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkPendingRewards();

            return () => {
                if (checkRewardsTimeoutRef.current) {
                    clearTimeout(checkRewardsTimeoutRef.current);
                }
            };
        }, [])
    );

    return (
        <ImageBackground
            source={require('../../../assets/images/background_app.jpeg')}
            style={styles.container}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
                style={styles.gradient}
            >
                <SafeAreaView style={styles.safeArea}>
                    <TopBar />

                    {/* Zona e Dragão */}
                    <View style={styles.zoneContainer}>
                        <Text style={styles.zoneSubtitle}>{usuario ? usuario.nickname : 'Usuário'}</Text>
                        {/* <Image
                            source={require('../../../assets/images/dragon.png')}
                            style={styles.dragonImage}
                        /> */}
                    </View>

                    {/* Menu Esquerdo */}
                    <View style={styles.leftMenu}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Image source={menuImages.referFriend} style={styles.menuIcon} />
                            <Text style={styles.menuText}>ANUNCIOS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Image source={menuImages.dailyReward} style={styles.menuIcon} />
                            <Text style={styles.menuText}>RECOMPENSA{'\n'}DIARIA</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Image source={menuImages.guild} style={styles.menuIcon} />
                            <Text style={styles.menuText}>GUILDA</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Menu Direito */}
                    <View style={styles.rightMenu}>
                        <TouchableOpacity style={styles.menuItem}>
                            <Image source={menuImages.battlePass} style={styles.menuIcon} />
                            <Text style={styles.menuText}>PASSE{'\n'}BATALHA</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem}>
                            <Image source={menuImages.leaderboard} style={styles.menuIcon} />
                            <Text style={styles.menuText}>RANK</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('Casino')}
                        >
                            <Image source={menuImages.casino} style={styles.menuIcon} />
                            <Text style={styles.menuText}>CASSINO</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => navigation.navigate('Arena')}
                        >
                            <Image source={menuImages.arena} style={styles.menuIcon} />
                            <Text style={styles.menuText}>ARENA</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Área Central (Boss e Baú) */}
                    <View style={[styles.centerContent, { bottom: height * 0.26 }]}>
                        <TouchableOpacity style={styles.bossContainer}>
                            <Image source={homeImages.bossImage} style={styles.bossImage} />
                            <Text style={styles.bossText}>DAILY BOSS</Text>
                            <Text style={styles.bossChances}>5/5 chances</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.chestContainer}>
                            <Image source={homeImages.chestImage} style={styles.chestImage} />
                            <Text style={styles.chestText}>CLAIM REWARDS</Text>
                            <Text style={styles.timerText}>04:44:20</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Área inferior (Floor e Botões) */}
                    <View style={[styles.bottomSection, { bottom: height * 0.15 }]}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.actionButton, styles.trainingButton]}>
                                <Text style={styles.buttonText}>EXPLORAÇÃO</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.battleButton]}
                                onPress={() => navigation.navigate('Dungeons')}
                            >
                                <Text style={styles.buttonText}>DUNGEONS</Text>
                                {hasPendingRewards && (
                                    <View style={styles.rewardIndicator}>
                                        <Text style={styles.rewardIndicatorText}>!</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <BottomNav />

                    {/* Botão para deslogar */}
                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.testButtonText}>Deslogar</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>
        </ImageBackground>
    );
}