import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Peringatan', 'Email dan password wajib diisi');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (e) {
      Alert.alert('Login Gagal', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header / Judul sesuai nuansa Figma Frozzy */}
      <View style={styles.headerContainer}>
        <Text style={styles.appTitle}>Frozzy</Text>
        <Text style={styles.appSubtitle}>Aplikasi Distribusi & Manajemen Stok Frozen Food</Text>
        <Text style={styles.badgeText}>Cold Storage Suite</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Email / Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan email terdaftar"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Kata Sandi</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan kata sandi"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Masuk →</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.footerVersion}>v2.4.1-rc • Sistem Terhubung ke Database Frozzy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0052CC',
  },
  appSubtitle: {
    fontSize: 13,
    color: '#5E6C84',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#344563',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DFE1E6',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FAFBFC',
    fontSize: 14,
    color: '#172B4D',
  },
  button: {
    backgroundColor: '#0052CC',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerVersion: {
    textAlign: 'center',
    color: '#7A869A',
    fontSize: 12,
    marginTop: 24,
  },
});