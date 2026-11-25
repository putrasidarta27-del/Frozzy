import { apiFetch } from '../services/api';

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);

  async function simpanPassword() {
    if (!password || !konfirmasi) {
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
      const hasil = await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, password }),
      });

      Alert.alert(
        'Berhasil',
        hasil.pesan,
        [{ text: 'Kembali ke Login', onPress: () => router.replace('/sign-in') }]
      );
    } catch (error) {
      Alert.alert('Gagal', error.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>â€¹ Kembali</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logo}>â„</Text>
          </View>
          <Text style={styles.brand}>Frozzy</Text>
          <Text style={styles.subtitle}>Kelola Bisnis Lebih Mudah</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Kata Sandi Baru</Text>
          <Text style={styles.description}>
            Buat kata sandi baru untuk akun Frozzy kamu.
          </Text>

          <Text style={styles.label}>Kata Sandi Baru</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Minimal 8 karakter"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showText}>{showPassword ? 'Sembunyikan' : 'Lihat'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Konfirmasi Kata Sandi</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ulangi kata sandi baru"
              placeholderTextColor="#94A3B8"
              value={konfirmasi}
              onChangeText={setKonfirmasi}
              secureTextEntry={!showKonfirmasi}
            />
            <TouchableOpacity onPress={() => setShowKonfirmasi(!showKonfirmasi)}>
              <Text style={styles.showText}>{showKonfirmasi ? 'Sembunyikan' : 'Lihat'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={simpanPassword}>
            <Text style={styles.buttonText}>Simpan Kata Sandi â†’</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Â© Frozzy - Kelola Bisnis Lebih Mudah</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  back: { color: '#0052CC', fontSize: 15, fontWeight: '600', marginBottom: 24 },
  header: { alignItems: 'center', marginBottom: 30 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: '#0052CC', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  logo: { color: '#FFFFFF', fontSize: 34 },
  brand: { fontSize: 30, fontWeight: '800', color: '#0052CC' },
  subtitle: { color: '#64748B', fontSize: 13, marginTop: 5 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 24, elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  description: { color: '#64748B', fontSize: 14, lineHeight: 22, marginBottom: 25 },
  label: { color: '#334155', fontWeight: '600', marginBottom: 9 },
  passwordContainer: {
    height: 52, borderWidth: 1, borderColor: '#CBD5E1',
    borderRadius: 12, paddingHorizontal: 13,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  passwordInput: { flex: 1, color: '#0F172A', fontSize: 14 },
  showText: { color: '#0052CC', fontSize: 12, fontWeight: '600' },
  button: {
    height: 52, backgroundColor: '#0052CC',
    borderRadius: 12, alignItems: 'center',
    justifyContent: 'center', marginTop: 5,
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footer: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 30 },
});
