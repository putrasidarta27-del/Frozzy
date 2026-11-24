// Meminta izin notifikasi dan mengambil ExpoPushToken milik HP ini
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Notifikasi tetap tampil sebagai banner saat aplikasi sedang dibuka
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Mengembalikan string token, atau null bila gagal / tidak diizinkan.
// Fungsi ini tidak pernah melempar error supaya login tidak ikut gagal.
export async function ambilExpoPushToken() {
  try {
    // Token push hanya ada di HP asli
    if (!Device.isDevice) return null;

    // Android wajib punya channel sebelum izin diminta
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Frozzy',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const izinSaatIni = await Notifications.getPermissionsAsync();
    let status = izinSaatIni.status;

    if (status !== 'granted') {
      const izinBaru = await Notifications.requestPermissionsAsync();
      status = izinBaru.status;
    }
    if (status !== 'granted') return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    if (!projectId) return null;

    const hasil = await Notifications.getExpoPushTokenAsync({ projectId });
    return hasil.data;
  } catch (e) {
    console.log('Gagal mengambil token push:', e?.message);
    return null;
  }
}