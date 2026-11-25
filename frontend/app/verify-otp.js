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

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');

  async function verifikasi() {
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert('Peringatan', 'Masukkan kode OTP 6 digit.');
      return;
    }

    try {
      const hasil = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });

      Alert.alert('Berhasil', hasil.pesan);
      router.push({
        pathname: '/reset-password',
        params: { email, otp },
      });
    } catch (error) {
      Alert.alert('Verifikasi Gagal', error.message);
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
          <Text style={styles.title}>Verifikasi OTP</Text>
          <Text style={styles.description}>
            Masukkan kode verifikasi 6 digit yang dikirim
            ke alamat email:
          </Text>
          <Text style={styles.email}>{email}</Text>

          <Text style={styles.label}>Kode OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="#94A3B8"
            value={otp}
            onChangeText={(value) =>
              setOtp(value.replace(/[^0-9]/g, '').slice(0, 6))
            }
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <TouchableOpacity style={styles.button} onPress={verifikasi}>
            <Text style={styles.buttonText}>Verifikasi â†’</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert('Informasi', 'Fitur kirim ulang OTP akan diaktifkan setelah backend selesai.')}>
            <Text style={styles.resend}>Kirim ulang kode OTP</Text>
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
  description: { color: '#64748B', fontSize: 14, lineHeight: 22 },
  email: { color: '#0052CC', fontWeight: '700', marginTop: 5, marginBottom: 25 },
  label: { color: '#334155', fontWeight: '600', marginBottom: 9 },
  input: {
    height: 58, borderWidth: 1, borderColor: '#CBD5E1',
    borderRadius: 12, paddingHorizontal: 15,
    fontSize: 24, letterSpacing: 12, color: '#0F172A',
    marginBottom: 20,
  },
  button: {
    height: 52, backgroundColor: '#0052CC',
    borderRadius: 12, alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  resend: { color: '#0052CC', textAlign: 'center', fontWeight: '600', marginTop: 22 },
  footer: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 30 },
});
