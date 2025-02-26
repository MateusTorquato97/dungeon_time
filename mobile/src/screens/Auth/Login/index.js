import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    SafeAreaView,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './styles';
import { login, signup } from '../../../services/authService'; // Ajuste o caminho conforme sua estrutura
import { AuthContext } from '../../../contexts/AuthContext';

export default function Login({ navigation }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmSenha, setConfirmSenha] = useState('');
    const [nickname, setNickname] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { signIn } = useContext(AuthContext);
    const [selectedClass, setSelectedClass] = useState(null);

    const classes = [
        { id: 'guerreiro', nome: 'Guerreiro' },
        { id: 'mago', nome: 'Mago' },
        { id: 'ladino', nome: 'Ladino' },
        { id: 'paladino', nome: 'Paladino' },
        { id: 'cacador', nome: 'Caçador' },
        { id: 'clerigo', nome: 'Clérigo' },
        { id: 'mercenario', nome: 'Mercenário' },
        { id: 'cavaleiro', nome: 'Cavaleiro' }
    ];

    const classesInfo = {
        guerreiro: {
            descricao: "Especialista em combate corpo a corpo",
            bonus: "Bônus em Força e Defesa\nVida Base: 120\nMana Base: 40"
        },
        mago: {
            descricao: "Mestre das artes arcanas",
            bonus: "Bônus em Inteligência e Sorte\nVida Base: 70\nMana Base: 120"
        },
        ladino: {
            descricao: "Especialista em ataques furtivos",
            bonus: "Bônus em Destreza e Sorte\nVida Base: 80\nMana Base: 60"
        },
        paladino: {
            descricao: "Guerreiro sagrado",
            bonus: "Bônus em Defesa e Vitalidade\nVida Base: 110\nMana Base: 70"
        },
        cacador: {
            descricao: "Mestre do combate à distância",
            bonus: "Bônus em Destreza e Força\nVida Base: 85\nMana Base: 55"
        },
        clerigo: {
            descricao: "Curandeiro divino",
            bonus: "Bônus em Vitalidade e Inteligência\nVida Base: 90\nMana Base: 100"
        },
        mercenario: {
            descricao: "Aventureiro versátil",
            bonus: "Bônus em Sorte e Destreza\nVida Base: 85\nMana Base: 50"
        },
        cavaleiro: {
            descricao: "Guardião resistente",
            bonus: "Bônus em Defesa e Força\nVida Base: 110\nMana Base: 45"
        }
    };

    const handleLogin = async () => {
        try {
            console.log('Tentando login com:', { email, senha });
            const result = await login(email, senha);
            console.log('Resposta do servidor:', result);

            if (result.error) {
                setErrorMessage(result.error);
            } else {
                console.log('Dados recebidos do login:', result);
                await signIn(result.usuario, result.token);
                console.log('Login bem-sucedido, token:', result.token);
            }
        } catch (error) {
            console.error('Erro no login:', error);
            setErrorMessage('Erro inesperado. Tente novamente.');
        }
    };


    const handleSignup = async () => {
        setErrorMessage('');
        if (senha !== confirmSenha) {
            setErrorMessage('As senhas não conferem.');
            return;
        }
        if (!selectedClass && !isLogin) {
            setErrorMessage('Selecione uma classe.');
            return;
        }
        try {
            const result = await signup(email, nickname, senha, selectedClass);
            if (result.error) {
                setErrorMessage(result.error);
            } else {
                console.log('Cadastro bem-sucedido:', result);
                setIsLogin(true);
            }
        } catch (error) {
            console.error('Erro inesperado no cadastro:', error);
            setErrorMessage('Erro inesperado. Tente novamente.');
        }
    };

    return (
        <ImageBackground
            source={require('../../../../assets/images/background_app.jpeg')}
            style={styles.container}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
                style={styles.overlay}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>DUNGEON TIME</Text>
                            <Text style={styles.subtitle}>{isLogin ? 'LOGIN' : 'CADASTRO'}</Text>
                        </View>

                        <View style={styles.formContainer}>
                            {/* Campo de email */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="E-mail"
                                    placeholderTextColor="#999"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>

                            {/* Campo de nickname aparece apenas no modo cadastro */}
                            {!isLogin && (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nickname"
                                        placeholderTextColor="#999"
                                        autoCapitalize="none"
                                        value={nickname}
                                        onChangeText={setNickname}
                                    />
                                </View>
                            )}

                            {/* Campo de senha */}
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Senha"
                                    placeholderTextColor="#999"
                                    secureTextEntry
                                    value={senha}
                                    onChangeText={setSenha}
                                />
                            </View>

                            {/* Campo de confirmação de senha, apenas no modo cadastro */}
                            {!isLogin && (
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirmar Senha"
                                        placeholderTextColor="#999"
                                        secureTextEntry
                                        value={confirmSenha}
                                        onChangeText={setConfirmSenha}
                                    />
                                </View>
                            )}

                            {/* Exibição da mensagem de erro, se houver */}
                            {errorMessage ? (
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            ) : null}

                            {!isLogin && (
                                <View style={styles.classContainer}>
                                    <Text style={styles.classTitle}>Escolha sua Classe</Text>
                                    <View style={styles.classGrid}>
                                        {classes.map((classe) => (
                                            <TouchableOpacity
                                                key={classe.id}
                                                style={[
                                                    styles.classButton,
                                                    selectedClass === classe.id && styles.selectedClass
                                                ]}
                                                onPress={() => setSelectedClass(classe.id)}
                                            >
                                                <Text style={[
                                                    styles.classText,
                                                    selectedClass === classe.id && styles.selectedClassText
                                                ]}>
                                                    {classe.nome}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Descrição da classe selecionada */}
                                    {selectedClass && (
                                        <View style={styles.classDescription}>
                                            <Text style={styles.descriptionTitle}>{classes.find(c => c.id === selectedClass)?.nome}</Text>
                                            <Text style={styles.descriptionText}>{classesInfo[selectedClass].descricao}</Text>
                                            <Text style={styles.bonusText}>{classesInfo[selectedClass].bonus}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Botão de ação: Login ou Cadastro */}
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={isLogin ? handleLogin : handleSignup}
                            >
                                <Text style={styles.actionButtonText}>
                                    {isLogin ? 'ENTRAR' : 'CADASTRAR'}
                                </Text>
                            </TouchableOpacity>

                            {/* Botão para alternar entre login e cadastro */}
                            <TouchableOpacity
                                style={styles.switchButton}
                                onPress={() => {
                                    setIsLogin(!isLogin);
                                    setErrorMessage('');
                                }}
                            >
                                <Text style={styles.switchButtonText}>
                                    {isLogin
                                        ? 'Não tem uma conta? Cadastre-se'
                                        : 'Já tem uma conta? Faça login'}
                                </Text>
                            </TouchableOpacity>

                            {/* Link para recuperação de senha aparece apenas no login */}
                            {isLogin && (
                                <TouchableOpacity style={styles.forgotButton}>
                                    <Text style={styles.forgotButtonText}>Esqueceu sua senha?</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </SafeAreaView>
                </ScrollView>
            </LinearGradient>
        </ImageBackground>
    );
}
