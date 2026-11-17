import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProducts } from '../../context/ProductContext';

export default function EditProdukSuksesScreen() {
  const params = useLocalSearchParams();
  const { produkList } = useProducts();
  const insets = useSafeAreaInsets();

  // Produk yang baru diperbarui, dicari berdasarkan id
  const produk = produkList.find((p) => p.id === params.id);

  // Waktu pembaruan dibekukan saat layar dibuka
  const [waktu] = useState(() => {
    const now = new Date();
    const jam = String(now.getHours()).padStart(2, '0');
    const menit = String(now.getMinutes()).padStart(2, '0');
    return `Hari ini, ${jam}:${menit}`;
  });

  const stokAda = parseInt(produk?.stok, 10) > 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ikon Sukses */}
        <View style={styles.successWrap}>
          <View style={styles.successCircle}>
            <MaterialCommunityIcons name="check" size={50} color="#FFFFFF" />
          </View>
          <View style={styles.snowBadge}>
            <MaterialCommunityIcons name="snowflake" size={16} color="#0052CC" />
          </View>
        </View>

        <Text style={styles.title}>Produk Berhasil Diperbarui</Text>
        <Text style={styles.subtitle}>
          Perubahan informasi produk telah berhasil disimpan ke sistem.
        </Text>

        {/* Kartu Ringkasan */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons name="archive-outline" size={26} color="#0052CC" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.skuText}>{produk?.sku}</Text>
              <Text style={styles.nameText} numberOfLines={1}>{produk?.nama}</Text>
            </View>
            <View style={styles.activeBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.activeText}>Aktif</Text>
            </View>
          </View>

          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Harga Jual</Text>
              <Text style={styles.priceValue}>{produk?.harga}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Stok Tersedia</Text>
              <View style={styles.stockRow}>
                <Text style={styles.stockValue}>{produk?.stok}</Text>
                <MaterialCommunityIcons
                  name={stokAda ? 'check-circle' : 'alert-circle'}
                  size={16}
                  color={stokAda ? '#15803D' : '#DC2626'}
                />
              </View>
            </View>
          </View>

          <View style={styles.storageRow}>
            <View style={styles.storageLeft}>
              <MaterialCommunityIcons name="thermometer" size={16} color="#0052CC" />
              <Text style={styles.storageLabel}>Penyimpanan Beku</Text>
            </View>
            <Text style={styles.storageTemp}>{produk?.temp}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Waktu Pembaruan</Text>
            <Text style={styles.timeValue}>{waktu}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Tombol Bawah */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.replace({
              pathname: '/(app)/detail-produk',
              params: { sku: produk?.sku },
            })
          }
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#FFFFFF" />
          <Text style={styles.primaryText}>Kembali ke Detail Produk</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 90, paddingBottom: 140 },
  successWrap: { marginBottom: 26 },
  successCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#D1FAE5',
  },
  snowBadge: {
    position: 'absolute',
    right: -4,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF2FF',
    borderWidth: 3,
    borderColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19, marginBottom: 26, paddingHorizontal: 16 },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#EBF2FF', justifyContent: 'center', alignItems: 'center' },
  skuText: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  nameText: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#DCFCE7', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  activeText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 12 },
  statLabel: { fontSize: 11, color: '#64748B', marginBottom: 6 },
  priceValue: { fontSize: 18, fontWeight: '700', color: '#0052CC' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockValue: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EBF2FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  storageLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storageLabel: { fontSize: 12, fontWeight: '600', color: '#1E3A8A' },
  storageTemp: { fontSize: 12, fontWeight: '700', color: '#0052CC' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 14 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeLabel: { fontSize: 12, color: '#64748B' },
  timeValue: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
});