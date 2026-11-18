import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransaksi } from '../../context/TransaksiContext';

const rupiah = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;

export default function PenjualanSuksesScreen() {
  const params = useLocalSearchParams();
  const { transaksiList } = useTransaksi();
  const insets = useSafeAreaInsets();

  // Transaksi yang baru dibuat ada di urutan teratas daftar
  const trx = transaksiList.find((t) => t.id === params.id) || transaksiList[0];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.successOuter}>
          <View style={styles.successMiddle}>
            <View style={styles.successInner}>
              <MaterialCommunityIcons name="check" size={38} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Pembayaran Berhasil</Text>
        <Text style={styles.subtitle}>Transaksi tersimpan di database dan stok produk sudah dikurangi.</Text>

        {trx && (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.kode}>{trx.id}</Text>
              <View style={styles.badge}>
                <View style={styles.dot} />
                <Text style={styles.badgeText}>Berhasil</Text>
              </View>
            </View>
            <Text style={styles.waktu}>{trx.tanggalPendek}, {trx.jam} WIB</Text>

            <View style={styles.divider} />

            {trx.items.map((it, i) => (
              <View key={it.sku + i} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNama}>{it.nama}</Text>
                  <Text style={styles.itemQty}>{it.qty}x @{rupiah(it.harga)}</Text>
                </View>
                <Text style={styles.itemTotal}>{rupiah(it.subtotal)}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.rowBetween}>
              <Text style={styles.label}>Metode Pembayaran</Text>
              <Text style={styles.value}>{trx.metode}</Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <Text style={styles.label}>Total Item</Text>
              <Text style={styles.value}>{trx.jumlahItem} pcs</Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <Text style={styles.grandLabel}>Total Pembayaran</Text>
              <Text style={styles.grandValue}>{rupiah(trx.total)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(app)/penjualan')} activeOpacity={0.85}>
          <MaterialCommunityIcons name="cart-plus" size={20} color="#FFFFFF" />
          <Text style={styles.primaryText}>Transaksi Baru</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(app)/beranda')} activeOpacity={0.7}>
          <MaterialCommunityIcons name="home-outline" size={20} color="#0052CC" />
          <Text style={styles.secondaryText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 70, paddingBottom: 200 },
  successOuter: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#E6F9EF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  successMiddle: {
    width: 92, height: 92, borderRadius: 46, backgroundColor: '#BBF7D0',
    justifyContent: 'center', alignItems: 'center',
  },
  successInner: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: '#15803D',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  card: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kode: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#16A34A' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  waktu: { fontSize: 12, color: '#64748B', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  itemNama: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  itemQty: { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemTotal: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  label: { fontSize: 13, color: '#64748B' },
  value: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  grandLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  grandValue: { fontSize: 19, fontWeight: '700', color: '#0052CC' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F8FAFC',
    paddingHorizontal: 20, paddingTop: 12, gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row', backgroundColor: '#0052CC', paddingVertical: 15, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row', backgroundColor: '#F1F5FF', paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#DBEAFE',
  },
  secondaryText: { color: '#0052CC', fontSize: 14, fontWeight: '700' },
});