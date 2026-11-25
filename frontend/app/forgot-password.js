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
import { router } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  async function lanjutkan() {
    const emailBersih = email.trim().toLowerCase();

    if (!emailBersih) {
      Alert.alert('Peringatan', 'Masukkan alamat email terlebih dahulu.');
      return;
    }

    try {
      const hasil = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: emailBersih }),
      });

      Alert.alert('Berhasil', hasil.pesan);
      router.push({
        pathname: '/verify-otp',
        params: { email: emailBersih },
      });
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
          <Text style={styles.title}>Lupa Kata Sandi?</Text>
          <Text style={styles.description}>
            Jangan khawatir! Masukkan email yang terdaftar.
            Kami akan membantu kamu mengatur ulang kata sandi.
          </Text>

          <Text style={styles.label}>Alamat Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan email terdaftar"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.button} onPress={lanjutkan}>
            <Text style={styles.buttonText}>Kirim Kode OTP â†’</Text>
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
  description: { color: '#64748B', fontSize: 14, lineHeight: 22, marginBottom: 26 },
  label: { color: '#334155', fontWeight: '600', marginBottom: 9 },
  input: {
    height: 52, borderWidth: 1, borderColor: '#CBD5E1',
    borderRadius: 12, paddingHorizontal: 15,
    fontSize: 15, color: '#0F172A', marginBottom: 20,
  },
  button: {
    height: 52, backgroundColor: '#0052CC',
    borderRadius: 12, alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  footer: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 30 },
});
