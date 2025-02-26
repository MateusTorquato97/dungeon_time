import React from 'react';
import Routes from './src/navigation/Routes';
import { AuthProvider } from './src/contexts/AuthContext';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuração do comportamento das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Configuração do canal de notificação (apenas Android)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('dungeon-notifications', {
    name: 'Dungeon Notifications',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
