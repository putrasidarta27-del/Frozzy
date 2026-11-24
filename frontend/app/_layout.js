import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ProductProvider } from '../context/ProductContext'; // 1. Import ProductProvider
import { TransaksiProvider } from '../context/TransaksiContext'; // [DITAMBAHKAN]

// Layar tujuan yang boleh dibuka dari notifikasi (daftar putih)
const LAYAR_BOLEH = ['/(app)/produk', '/(app)/beranda'];

function Navigator() {
  const { token, loading } = useAuth();

  // [DITAMBAHKAN] Ketuk notifikasi di HP -> pindah ke layar sesuai data.screen
  useEffect(() => {
    if (loading || !token) return;

    function bukaLayar(response) {
      const screen = response?.notification?.request?.content?.data?.screen;
      if (typeof screen === 'string' && LAYAR_BOLEH.includes(screen)) {
        router.push(screen);
      }
    }

    // Aplikasi dibuka dari keadaan mati lewat ketukan notifikasi
    const terakhir = Notifications.getLastNotificationResponse();
    if (terakhir) bukaLayar(terakhir);

    // Aplikasi sedang jalan / di latar belakang
    const langganan = Notifications.addNotificationResponseReceivedListener(bukaLayar);
    return () => langganan.remove();
  }, [loading, token]);

  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen name="sign-in" options={{ title: 'Login' }} />
      ) : (
        <Stack.Screen name="(app)" />
      )}
    </Stack>
  );
}

// 2. Aplikasi dibungkus AuthProvider > ProductProvider > TransaksiProvider
// [DITAMBAHKAN] TransaksiProvider harus di dalam ProductProvider (memakai data produk dan login)
export default function RootLayout() {
  return (
    <AuthProvider>
      <ProductProvider>
        <TransaksiProvider>
          <Navigator />
        </TransaksiProvider>
      </ProductProvider>
    </AuthProvider>
  );
}