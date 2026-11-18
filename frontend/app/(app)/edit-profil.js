import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../services/api';
import * as SecureStore from 'expo-secure-store';

export default function EditProfilScreen() {
  const { user, updateProfile } = useAuth();

  const [nama, setNama] = useState(user?.nama || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [loadingProfil, setLoadingProfil] = useState(false);
  const [loadingSandi, setLoadingSandi] = useState(false);

  // Simpan perubahan profil (nama & email)
  const handleSimpanProfil = async () => {
    if (!nama.trim() || !email.trim()) {
      Alert.alert('Perhatian', 'Nama dan email tidak boleh kosong');
      return;
    }
    try {
      setLoadingProfil(true);
      await updateProfile(nama, email);
      Alert.alert('Berhasil', 'Profil berhasil diperbarui', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Gagal', e.message || 'Gagal memperbarui profil');
    } finally {
      setLoadingProfil(false);
    }
  };

  // Ubah kata sandi
  const handleUbahSandi = async () => {
    if (!passwordLama || !passwordBaru) {
      Alert.alert('Perhatian', 'Mohon isi kata sandi lama dan kata sandi baru');
      return;
    }
    if (passwordBaru.length < 8) {
      Alert.alert('Perhatian', 'Kata sandi baru minimal 8 karakter');
      return;
    }

    try {
      setLoadingSandi(true);
      const token = await SecureStore.getItemAsync('access_token');
      await apiFetch('/auth/kata-sandi', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passwordLama, passwordBaru }),
      });

      Alert.alert('Berhasil', 'Kata sandi berhasil diubah. Gunakan sandi baru untuk login berikutnya.');
      setPasswordLama('');
      setPasswordBaru('');
    } catch (e) {
      Alert.alert('Gagal', e.message || 'Gagal mengubah kata sandi');
    } finally {
      setLoadingSandi(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil & Keamanan</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bagian Edit Profil */}
        <View style={styles.cardSection}>
          <Text style={styles.cardTitle}>Informasi Personal</Text>
          <Text style={styles.cardSub}>Perbarui nama lengkap dan email akun kamu</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <TextInput
              style={styles.textInput}
              value={nama}
              onChangeText={setNama}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Akun</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Masukkan email"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loadingProfil && { opacity: 0.6 }]}
            onPress={handleSimpanProfil}
            disabled={loadingProfil}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {loadingProfil ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bagian Ubah Kata Sandi */}
        <View style={styles.cardSection}>
          <Text style={styles.cardTitle}>Ubah Kata Sandi</Text>
          <Text style={styles.cardSub}>Pastikan menggunakan kata sandi yang aman</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kata Sandi Lama</Text>
            <TextInput
              style={styles.textInput}
              secureTextEntry
              value={passwordLama}
              onChangeText={setPasswordLama}
              placeholder="Masukkan kata sandi lama"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kata Sandi Baru (Min. 8 Karakter)</Text>
            <TextInput
              style={styles.textInput}
              secureTextEntry
              value={passwordBaru}
              onChangeText={setPasswordBaru}
              placeholder="Masukkan kata sandi baru"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <TouchableOpacity
            style={[styles.secondaryButton, loadingSandi && { opacity: 0.6 }]}
            onPress={handleUbahSandi}
            disabled={loadingSandi}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              {loadingSandi ? 'Memproses...' : 'Perbarui Kata Sandi'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  cardSub: { fontSize: 12, color: '#64748B', marginBottom: 16 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#0052CC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});