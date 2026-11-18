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
  const { produkList, refresh: refreshProduk } = useProducts(); // [DIUBAH] tambah refresh
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
      // [DIUBAH] tambah stokSaatIni untuk pemeriksaan stok
      return p ? { ...p, jumlah: k.jumlah, subtotal: angka(p.harga) * k.jumlah, stokSaatIni: angka(p.stok) } : null;
    })
    .filter(Boolean);

  const totalItem = baris.reduce((s, b) => s + b.jumlah, 0);
  const totalHarga = baris.reduce((s, b) => s + b.subtotal, 0);

  // [DITAMBAHKAN] Produk yang jumlahnya melebihi stok saat ini (Figma hal. 27)
  const kurang = baris.filter((b) => b.jumlah > b.stokSaatIni);
  const adaKurang = !memproses && kurang.length > 0;

  const handleBayar = async () => {
    if (baris.length === 0 || memproses || adaKurang) return;

    // [DITAMBAHKAN] Catat stok sebelum dan sesudah untuk layar sukses (Figma hal. 20)
    const stokBerubah = baris.map((b) => ({
      nama: b.nama,
      jumlah: b.jumlah,
      sebelum: b.stokSaatIni,
      sesudah: b.stokSaatIni - b.jumlah,
    }));

    setMemproses(true);
    try {
      const trx = await buatTransaksi(
        metode,
        keranjang.map((k) => ({ id_produk: k.id_produk, jumlah: k.jumlah }))
      );
      // Tutup layar penjualan dan pembayaran, supaya keranjang lama tidak tersisa
      if (router.canDismiss()) router.dismissAll();
      router.replace({
        pathname: '/(app)/penjualan-sukses',
        params: { id: trx.id, stok: JSON.stringify(stokBerubah) }, // [DIUBAH] kirim data stok
      });
    } catch (e) {
      Alert.alert('Transaksi Gagal', e.message);
      refreshProduk(); // [DITAMBAHKAN] muat ulang stok terbaru supaya kartu defisit akurat
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
        {/* [DITAMBAHKAN] Kartu stok tidak mencukupi (Figma hal. 27) */}
        {adaKurang && (
          <View style={styles.kurangCard}>
            <View style={styles.kurangHeader}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#B91C1C" />
              <Text style={styles.kurangTitle}>Stok Tidak Mencukupi</Text>
              <View style={styles.defisitBadge}>
                <Text style={styles.defisitText}>DEFISIT</Text>
              </View>
            </View>
            <Text style={styles.kurangDesc}>
              Jumlah produk yang dipilih melebihi stok tersedia di inventaris. Sesuaikan jumlah sebelum menyimpan transaksi.
            </Text>

            {kurang.map((b) => (
              <View key={b.id} style={styles.kurangItem}>
                <Text style={styles.kurangNama}>{b.nama}</Text>
                <View style={styles.kurangRow}>
                  <Text style={styles.kurangLabel}>Stok tersedia</Text>
                  <Text style={styles.kurangValue}>{b.stokSaatIni} pcs</Text>
                </View>
                <View style={styles.kurangRow}>
                  <Text style={styles.kurangLabel}>Jumlah diminta</Text>
                  <Text style={[styles.kurangValue, { color: '#B91C1C' }]}>{b.jumlah} pcs</Text>
                </View>
                <View style={styles.kurangRow}>
                  <Text style={styles.kurangLabel}>Selisih kekurangan</Text>
                  <Text style={[styles.kurangValue, { color: '#B91C1C' }]}>-{b.jumlah - b.stokSaatIni} pcs</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.sesuaikanBtn} onPress={() => router.back()} activeOpacity={0.85}>
              <MaterialCommunityIcons name="tune-variant" size={18} color="#FFFFFF" />
              <Text style={styles.sesuaikanText}>Sesuaikan Jumlah</Text>
            </TouchableOpacity>
          </View>
        )}

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
                <View style={styles.itemMeta}>
                  <Text style={styles.itemQty}>
                    <Text style={styles.itemQtyBold}>{b.jumlah}x</Text> @{b.harga}
                  </Text>
                  <View style={styles.tempPill}>
                    <Text style={styles.tempPillText}>{b.temp}</Text>
                  </View>
                </View>
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

          {/* [DITAMBAHKAN] Kotak info stok (Figma hal. 19) */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information-outline" size={18} color="#1D4ED8" />
            <Text style={styles.infoText}>Stok akan otomatis terpotong dari inventaris setelah transaksi disimpan</Text>
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
          Total akhir dihitung ulang oleh server dari harga terbaru.
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity
          style={[styles.bayarBtn, (memproses || baris.length === 0 || adaKurang) && { opacity: 0.55 }]}
          onPress={handleBayar}
          disabled={memproses || baris.length === 0 || adaKurang}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="content-save-outline" size={20} color="#FFFFFF" />
          <Text style={styles.bayarText}>
            {memproses ? 'Memproses...' : `Simpan Transaksi ${rupiah(totalHarga)}`}
          </Text>
        </TouchableOpacity>

        {/* [DITAMBAHKAN] Tombol Ubah Keranjang (Figma hal. 19) */}
        <TouchableOpacity style={styles.ubahBtn} onPress={() => router.back()} disabled={memproses} activeOpacity={0.7}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color="#0052CC" />
          <Text style={styles.ubahText}>Ubah Keranjang</Text>
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
  scrollContent: { padding: 16, paddingBottom: 190 },
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
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  itemQty: { fontSize: 12, color: '#64748B' },
  itemQtyBold: { fontWeight: '700', color: '#0052CC' },
  tempPill: { backgroundColor: '#EBF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tempPillText: { fontSize: 10, fontWeight: '700', color: '#0052CC' },
  itemTotal: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sumLabel: { fontSize: 13, color: '#64748B' },
  sumValue: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  grandLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  grandValue: { fontSize: 19, fontWeight: '700', color: '#0052CC' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF',
    borderRadius: 10, borderWidth: 1, borderColor: '#DBEAFE', padding: 10, marginTop: 6,
  },
  infoText: { flex: 1, fontSize: 12, color: '#1E3A8A', lineHeight: 17 },
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
  kurangCard: {
    backgroundColor: '#FEF2F2', borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: '#FCA5A5', marginBottom: 14,
  },
  kurangHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  kurangTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#B91C1C' },
  defisitBadge: { backgroundColor: '#B91C1C', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  defisitText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  kurangDesc: { fontSize: 12, color: '#7F1D1D', lineHeight: 17, marginBottom: 10 },
  kurangItem: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#FECACA', marginBottom: 8,
  },
  kurangNama: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  kurangRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  kurangLabel: { fontSize: 12, color: '#64748B' },
  kurangValue: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  sesuaikanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0052CC', height: 46, borderRadius: 12, marginTop: 4,
  },
  sesuaikanText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF',
    paddingHorizontal: 16, paddingTop: 12, gap: 10,
    borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 10,
  },
  bayarBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0052CC', height: 50, borderRadius: 12,
  },
  bayarText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  ubahBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFFFFF', height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1',
  },
  ubahText: { fontSize: 14, fontWeight: '700', color: '#0052CC' },
});