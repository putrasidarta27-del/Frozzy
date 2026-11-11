import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ProductProvider } from '../context/ProductContext'; // 1. Import ProductProvider

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

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* 2. Bungkus aplikasi dengan ProductProvider */}
      <ProductProvider>
        <Navigator />
      </ProductProvider>
    </AuthProvider>
  );
}