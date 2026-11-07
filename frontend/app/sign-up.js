
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { apiFetch } from '../services/api';

export default function SignUpScreen() {
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister() {
    if (!nama.trim() || !username.trim() || !password || !konfirmasi) {
      Alert.alert('Peringatan', 'Semua kolom wajib diisi.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Peringatan', 'Password minimal 8 karakter.');
      return;
    }

    if (password !== konfirmasi) {
      Alert.alert('Peringatan', 'Konfirmasi password tidak sama.');
      return;
    }

    try {
      setLoading(true);

      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nama: nama.trim(),
          username: username.trim(),
          password,
        }),
      });

      Alert.alert(
        'Registrasi Berhasil',
        'Akun berhasil dibuat. Silakan login.',
        [{ text: 'OK', onPress: () => router.replace('/sign-in') }]
      );
    } catch (error) {
      Alert.alert(
        'Registrasi Gagal',
        error.message || 'Tidak dapat mendaftarkan akun.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logo}>❄</Text>
          </View>

          <Text style={styles.title}>Frozzy</Text>
          <Text style={styles.subtitle}>
            Aplikasi Distribusi & Manajemen Stok Frozen Food
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>Cold Storage Suite</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Daftar Akun</Text>
          <Text style={styles.description}>
            Lengkapi data berikut untuk membuat akun Frozzy.
          </Text>

          <Text style={styles.label}>Nama Lengkap</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#A0AEC0"
              value={nama}
              onChangeText={setNama}
            />
          </View>

          <Text style={styles.label}>Username</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Buat username"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <Text style={styles.label}>Kata Sandi</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Minimal 8 karakter"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Konfirmasi Kata Sandi</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ulangi kata sandi"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={!showPassword}
              value={konfirmasi}
              onChangeText={setKonfirmasi}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Daftar Sekarang →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <TouchableOpacity
              onPress={() => router.replace('/sign-in')}
            >
              <Text style={styles.loginLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBox: {
    width: 68,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logo: {
    fontSize: 30,
    color: '#0052CC',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0052CC',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: '#DEEBFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
  },
  badgeText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    color: '#1E293B',
  },
  eyeText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 12,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 12,
    color: '#0052CC',
    fontWeight: '700',
  },
});
