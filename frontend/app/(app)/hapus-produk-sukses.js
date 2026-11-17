import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HapusProdukSuksesScreen() {
  const insets = useSafeAreaInsets();

  // Waktu hapus dibekukan saat layar dibuka
  const [waktu] = useState(() => {
    const now = new Date();
    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    return `Hari ini, ${jam}:${menit}`;
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pil Brand */}
        <View style={styles.brandPill}>
          <MaterialCommunityIcons name="snowflake" size={14} color="#0052CC" />
          <Text style={styles.brandText}>Frozzy Cold Storage</Text>
        </View>

        {/* Ikon Sukses */}
        <View style={styles.successOuter}>
          <View style={styles.successMiddle}>
            <View style={styles.successInner}>
              <MaterialCommunityIcons name="check" size={44} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.snowBadge}>
            <MaterialCommunityIcons name="snowflake" size={14} color="#0052CC" />
          </View>
          <View style={styles.checkBadge}>
            <MaterialCommunityIcons name="check" size={11} color="#15803D" />
          </View>
        </View>

        <Text style={styles.title}>Produk Berhasil Dihapus</Text>
        <Text style={styles.subtitle}>
          Produk telah dihapus secara permanen dari daftar stok katalog Frozzy.
        </Text>

        {/* Kartu Status */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="archive-outline" size={24} color="#475569" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusLabel}>STATUS GUDANG</Text>
              <Text style={styles.statusValue}>Ruang Dingin #02 Terbarui</Text>
            </View>
            <View style={styles.syncBadge}>
              <Text style={styles.syncText}>Tersimpan</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Waktu Hapus</Text>
            <Text style={styles.timeValue}>{waktu}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Tombol Bawah */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(app)/produk')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
          <Text style={styles.primaryText}>Kembali ke Katalog</Text>
        </TouchableOpacity>
        <View style={styles.noteRow}>
          <MaterialCommunityIcons name="lock-outline" size={12} color="#64748B" />
          <Text style={styles.noteText}>Perubahan tersimpan otomatis di perangkat</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 70, paddingBottom: 170 },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 50,
  },
  brandText: { fontSize: 12, fontWeight: '700', color: '#0052CC' },
  successOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#DDF8EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  successMiddle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: '#86EFAC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successInner: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snowBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19, marginBottom: 28, paddingHorizontal: 14 },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 46, height: 46, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  statusLabel: { fontSize: 10, fontWeight: '600', color: '#64748B', letterSpacing: 0.5, marginBottom: 2 },
  statusValue: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  syncBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  syncText: { fontSize: 10, fontWeight: '700', color: '#15803D' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeLabel: { fontSize: 12, color: '#64748B' },
  timeValue: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#1D5FDB',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  noteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12 },
  noteText: { fontSize: 11, color: '#64748B' },
});