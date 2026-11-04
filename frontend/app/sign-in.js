import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Peringatan', 'ID Karyawan / Username dan Kata Sandi wajib diisi');
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header Sesuai Figma 1: Logo Kotak + Frozzy + Subjudul + Badge */}
        <View style={styles.headerContainer}>
          <View style={styles.logoBox}>
            <View style={styles.snowflakeInner}>
              <Text style={styles.snowflakeText}>❄</Text>
            </View>
          </View>

          <Text style={styles.appTitle}>Frozzy</Text>
          <Text style={styles.appSubtitle}>Aplikasi Distribusi & Manajemen Stok Frozen Food</Text>
          
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Cold Storage Suite</Text>
          </View>
        </View>

        {/* Form Card Sesuai Figma 1 */}
        <View style={styles.formCard}>
          
          {/* Field ID Karyawan / Username */}
          <Text style={styles.label}>ID Karyawan / Username</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Masukkan ID Karyawan atau Username"
              placeholderTextColor="#A0AEC0"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Field Kata Sandi & Lupa Sandi */}
          <View style={styles.passwordHeaderRow}>
            <Text style={styles.label}>Kata Sandi</Text>
            <TouchableOpacity onPress={() => Alert.alert('Informasi', 'Fitur Lupa Sandi belum masuk dalam ruang lingkup SRS.')}>
              <Text style={styles.forgotText}>Lupa Sandi?</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Masukkan kata sandi"
              placeholderTextColor="#A0AEC0"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              style={styles.eyeButton}
            >
              <Text style={styles.eyeText}>{showPassword ? 'Sembunyikan' : 'Lihat'}</Text>
            </TouchableOpacity>
          </View>

          {/* Opsi Ingat Akun Saya & Versi */}
          <View style={styles.rowRemember}>
            <View style={styles.checkboxRow}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: '#E2E8F0', true: '#0052CC' }}
                thumbColor={'#FFFFFF'}
              />
              <Text style={styles.rememberText}>Ingat Akun Saya</Text>
            </View>
            <Text style={styles.versionText}>v2.4.1-rc</Text>
          </View>

          {/* Tombol Masuk */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Masuk →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Info Sesuai Figma 1 */}
        <View style={styles.footerInfo}>
          <View style={styles.footerDot} />
          <Text style={styles.footerText}>
            Sistem Terhubung ke Database Stok Offline & Server Frozzy
          </Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Latar belakang abu-abu terang bersih khas Figma
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 30,
  },
  headerContainer: {
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
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  snowflakeInner: {
    width: 44,
    height: 44,
    backgroundColor: '#F0F5FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snowflakeText: {
    fontSize: 22,
    color: '#0052CC',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0052CC',
    letterSpacing: 0.2,
  },
  appSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  badgeContainer: {
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
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  forgotText: {
    fontSize: 12,
    color: '#0052CC',
    fontWeight: '600',
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
  inputPassword: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    color: '#1E293B',
  },
  eyeButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  eyeText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '600',
  },
  rowRemember: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 12,
    color: '#334155',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 6,
  },
  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981', // Indikator hijau status terhubung
  },
  footerText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
});