import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ProductProvider } from '../context/ProductContext'; // 1. Import ProductProvider
import { TransaksiProvider } from '../context/TransaksiContext'; // [DITAMBAHKAN]

function Navigator() {
  const { token, loading } = useAuth();

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