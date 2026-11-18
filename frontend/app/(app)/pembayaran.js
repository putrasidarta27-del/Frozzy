import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProducts } from '../../context/ProductContext';
import { useTransaksi, METODE_PEMBAYARAN } from '../../context/TransaksiContext';

const rupiah = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;
const angka = (teks) => parseInt(String(teks).replace(/\D/g, ''), 10) || 0;

export default function PembayaranScreen() {
  const params = useLocalSearchParams();
  const { produkList } = useProducts();
  const { buatTransaksi } = useTransaksi();
  const insets = useSafeAreaInsets();

  const [metode, setMetode] = useState(METODE_PEMBAYARAN[0].key);
  const [memproses, setMemproses] = useState(false);

  // Keranjang dikirim dari layar sebelumnya: [{ id_produk, jumlah }]
  let keranjang = [];
  try {
    keranjang = JSON.parse(params.keranjang || '[]');
  } catch (e) {
    keranjang = [];
  }

  // Gabungkan dengan data produk di katalog untuk ditampilkan
  const baris = keranjang
    .map((k) => {
      const p = produkList.find((x) => x.id === String(k.id_produk));
      return p ? { ...p, jumlah: k.jumlah, subtotal: angka(p.harga) * k.jumlah } : null;
    })
    .filter(Boolean);

  const totalItem = baris.reduce((s, b) => s + b.jumlah, 0);
  const totalHarga = baris.reduce((s, b) => s + b.subtotal, 0);

  const handleBayar = async () => {
    if (baris.length === 0 || memproses) return;
    setMemproses(true);
    try {
      const trx = await buatTransaksi(
        metode,
        keranjang.map((k) => ({ id_produk: k.id_produk, jumlah: k.jumlah }))
      );
      // Tutup layar penjualan dan pembayaran, supaya keranjang lama tidak tersisa
      if (router.canDismiss()) router.dismissAll();
      router.replace({ pathname: '/(app)/penjualan-sukses', params: { id: trx.id } });
    } catch (e) {
      Alert.alert('Transaksi Gagal', e.message);
      setMemproses(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} disabled={memproses}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#0052CC" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Pembayaran</Text>
          <Text style={styles.headerSub}>Periksa pesanan lalu pilih metode</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <MaterialCommunityIcons name="basket-outline" size={20} color="#0052CC" />
            <Text style={styles.sectionTitle}>Rincian Pesanan</Text>
          </View>

          {baris.length === 0 && <Text style={styles.kosong}>Keranjang kosong.</Text>}

          {baris.map((b, i) => (
            <View key={b.id} style={[styles.itemRow, i > 0 && styles.itemRowBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNama}>{b.nama}</Text>
                <Text style={styles.itemQty}>
                  <Text style={styles.itemQtyBold}>{b.jumlah}x</Text> @{b.harga}
                </Text>
              </View>
              <Text style={styles.itemTotal}>{rupiah(b.subtotal)}</Text>
            </View>
          ))}

          <View style={styles.divider} />
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Total Item</Text>
            <Text style={styles.sumValue}>{totalItem} pcs</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.grandLabel}>Total Pembayaran</Text>
            <Text style={styles.grandValue}>{rupiah(totalHarga)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color="#0052CC" />
            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          </View>

          {METODE_PEMBAYARAN.map((m) => {
            const aktif = m.key === metode;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.metodeRow, aktif && styles.metodeRowAktif]}
                onPress={() => setMetode(m.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.metodeIcon, aktif && { backgroundColor: '#0052CC' }]}>
                  <MaterialCommunityIcons name={m.icon} size={20} color={aktif ? '#FFFFFF' : '#0052CC'} />
                </View>
                <Text style={[styles.metodeLabel, aktif && { color: '#0052CC' }]}>{m.label}</Text>
                <MaterialCommunityIcons
                  name={aktif ? 'radiobox-marked' : 'radiobox-blank'}
                  size={22}
                  color={aktif ? '#0052CC' : '#94A3B8'}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.catatan}>
          Total akhir dihitung ulang oleh server dari harga terbaru, dan stok dikurangi otomatis setelah pembayaran dikonfirmasi.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={[styles.bayarBtn, (memproses || baris.length === 0) && { opacity: 0.55 }]}
          onPress={handleBayar}
          disabled={memproses || baris.length === 0}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.bayarText}>
            {memproses ? 'Memproses...' : `Konfirmasi Pembayaran ${rupiah(totalHarga)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  iconBtn: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  kosong: { fontSize: 13, color: '#64748B' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  itemRowBorder: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  itemNama: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  itemQty: { fontSize: 12, color: '#64748B', marginTop: 3 },
  itemQtyBold: { fontWeight: '700', color: '#0052CC' },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sumLabel: { fontSize: 13, color: '#64748B' },
  sumValue: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  grandLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  grandValue: { fontSize: 19, fontWeight: '700', color: '#0052CC' },
  metodeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 8,
  },
  metodeRowAktif: { borderColor: '#0052CC', backgroundColor: '#F5F9FF' },
  metodeIcon: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#EBF2FF',
    justifyContent: 'center', alignItems: 'center',
  },
  metodeLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#0F172A' },
  catatan: { fontSize: 11, color: '#64748B', lineHeight: 16, textAlign: 'center', paddingHorizontal: 12 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 10,
  },
  bayarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0052CC', height: 50, borderRadius: 12,
  },
  bayarText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});