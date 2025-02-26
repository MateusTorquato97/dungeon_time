import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
});

export const notificationService = {
    // Registra o dispositivo para receber notificações
    registerForPushNotificationsAsync: async () => {
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Falha ao obter token push para notificações!');
                return;
            }

            const token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Token de notificação:', token);
            return token;
        }

        console.log('Deve usar dispositivo físico para notificações push');
    },

    // Agenda uma notificação local
    scheduleLocalNotification: async (title, body, timestamp) => {
        try {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                const { status: newStatus } = await Notifications.requestPermissionsAsync();
                if (newStatus !== 'granted') {
                    console.log('Permissão de notificação não concedida');
                    return;
                }
            }

            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    sound: 'default',
                    priority: 'high',
                },
                trigger: { seconds: 5 }
            });

            return identifier;
        } catch (error) {
            console.error('Erro ao agendar notificação:', error);
            throw error;
        }
    },

    // Cancela uma notificação específica
    cancelNotification: async (identifier) => {
        try {
            await Notifications.cancelScheduledNotificationAsync(identifier);
        } catch (error) {
            console.error('Erro ao cancelar notificação:', error);
        }
    },

    // Cancela todas as notificações pendentes
    cancelAllNotifications: async () => {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.error('Erro ao cancelar todas as notificações:', error);
        }
    },
}; 