import notifee from '@notifee/react-native';

export async function showConnectionNotification(remoteMessage) {
    const { data } = remoteMessage;

    await notifee.displayNotification({
        title: data.title,
        body: data.body,
        android: {
            channelId: 'requests',
            pressAction: { id: 'default' },
            actions: [
                {
                    title: '✅ Accept',
                    pressAction: { id: 'accept' },
                },
                {
                    title: '❌ Reject',
                    pressAction: { id: 'reject' },
                },
            ],
        },
        data,
    });
}
