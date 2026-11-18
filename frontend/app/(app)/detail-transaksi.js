import { useState, useEffect } from 'react'; // [DITAMBAHKAN]
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
// [DIUBAH] Data contoh tidak dipakai lagi, diganti data dari server
// import { daftarTransaksi, formatRupiah, hitungTotal, hitungItem } from '../../data/transaksiData';
import { useTransaksi, METODE_PEMBAYARAN } from '../../context/TransaksiContext'; // [DITAMBAHKAN]
import { BASE_URL } from '../../services/produkService'; // [DITAMBAHKAN]

const formatRupiah = (angka) => `Rp${Number(angka).toLocaleString('id-ID')}`; // [DITAMBAHKAN]

export default function DetailTransaksiScreen() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { produkList } = useProducts();
  const insets = useSafeAreaInsets();

  // [DIUBAH] Nota diambil dari server (daftar riwayat tidak membawa rincian item)
  // const trx = daftarTransaksi.find((t) => t.id === params.id);
  const { transaksiList, ambilDetail } = useTransaksi();
  const [detail, setDetail] = useState(null);
  const [gagal, setGagal] = useState(false);
  const header = transaksiList.find((t) => t.id === params.id);

  useEffect(() => {
    let aktif = true;
    if (!header) return undefined;
    ambilDetail(header.idTransaksi)
      .then((d) => { if (aktif) setDetail(d); })
      .catch(() => { if (aktif) setGagal(true); });
    return () => { aktif = false; };
  }, [header?.idTransaksi]);

  const trx = detail || (header && header.items.length > 0 ? header : null);

  if (!trx) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        {/* [DIUBAH] pesan menyesuaikan keadaan */}
        <Text style={{ color: '#64748B' }}>
          {!header ? 'Transaksi tidak ditemukan.' : gagal ? 'Gagal memuat nota.' : 'Memuat nota...'}
        </Text>
        <TouchableOpacity onPress={() => router.replace('/(app)/transaksi')} style={{ marginTop: 12 }}>
          <Text style={{ color: '#0052CC', fontWeight: '700' }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // [DIUBAH] Semua dari data transaksi asli (sebelumnya nama cadangan 'Budi Santoso')
  const kasir = trx.kasir || user?.nama || user?.name || '-';
  const total = trx.total;
  const totalItem = trx.items.reduce((s, i) => s + i.qty, 0);
  const ikonMetode = METODE_PEMBAYARAN.find((m) => m.key === trx.metode)?.icon || 'cash'; // [DITAMBAHKAN]

  // Pola batang barcode dibuat dari nomor transaksi (hanya tampilan)
  const bars = trx.id.split('').map((c, i) => ({
    w: (c.charCodeAt(0) + i) % 3 + 1,
    gap: (c.charCodeAt(0) + i * 2) % 2 + 2,
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Detail Transaksi</Text>
            <Text style={styles.headerSub}>Nota Digital UMKM</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => Alert.alert('Bagikan', 'Fitur bagikan nota belum tersedia.')}>
          <MaterialCommunityIcons name="share-variant-outline" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Kartu Toko */}
        <View style={styles.card}>
          <View style={styles.storeRow}>
            <View style={styles.storeLogo}>
              <MaterialCommunityIcons name="snowflake" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>Frozzy Cold Storage & Frozen Mart</Text>
              <Text style={styles.branch}>Cabang Utama #01</Text>
            </View>
            <View style={styles.successBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.successText}>Berhasil</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>No. Referensi</Text>
              <Text style={styles.value}>{trx.id}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Kasir Bertugas</Text>
              <Text style={styles.value}>{kasir}</Text>
              {/* [DIUBAH] Sebelumnya tulisan tetap "ID: KSR-089" */}
              <Text style={styles.labelSmall}>Kanal: {trx.kanal}</Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>Tanggal & Waktu Transaksi</Text>
            <Text style={styles.value}>{trx.tanggalLengkap}, {trx.jam} WIB</Text>
          </View>
        </View>

        {/* Info Stok */}
        <View style={styles.stockInfo}>
          <View style={styles.stockIconBox}>
            <MaterialCommunityIcons name="archive-outline" size={20} color="#0052CC" />
          </View>
          <Text style={styles.stockInfoText}>Stok telah dikurangi otomatis dari sistem inventaris.</Text>
          <MaterialCommunityIcons name="check-circle-outline" size={20} color="#15803D" />
        </View>

        {/* Rincian Produk */}
        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionLeft}>
              <MaterialCommunityIcons name="basket-outline" size={20} color="#0052CC" />
              <Text style={styles.sectionTitle}>Rincian Produk</Text>
            </View>
            <Text style={styles.sectionCount}>{trx.items.length} Varian SKU</Text>
          </View>

          {trx.items.map((item, index) => {
            const produk = produkList.find((p) => p.sku === item.sku);
            // [DIUBAH] Bila produk tidak ada di katalog, pakai foto dari server (kalau ada)
            const img = produk?.image
              ? (typeof produk.image === 'string' ? { uri: produk.image } : produk.image)
              : item.imageUrl
              ? { uri: `${BASE_URL}${item.imageUrl}` }
              : null;
            return (
              <View key={item.sku + index} style={[styles.itemRow, index > 0 && styles.itemRowBorder]}>
                <View style={styles.itemImageBox}>
                  {img ? (
                    <Image source={img} style={styles.itemImage} resizeMode="cover" />
                  ) : (
                    <MaterialCommunityIcons name="package-variant-closed" size={26} color="#94A3B8" />
                  )}
                  <View style={styles.tempTag}>
                    <Text style={styles.tempTagText}>{produk?.temp || '-18°C'}</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.nama}</Text>
                  <Text style={styles.itemQty}>
                    <Text style={styles.itemQtyBold}>{item.qty}x</Text> @{formatRupiah(item.harga)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.itemTotal}>{formatRupiah(item.subtotal ?? item.qty * item.harga)}</Text>
                  <Text style={styles.itemSync}>Tersimpan</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Ringkasan Pembayaran */}
        <View style={styles.card}>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Total Item</Text>
            <Text style={styles.sumValue}>{totalItem} pcs</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Subtotal</Text>
            <Text style={styles.sumValue}>{formatRupiah(total)}</Text>
          </View>
          <View style={styles.sumRow}>
            <Text style={styles.sumLabel}>Metode Pembayaran</Text>
            <View style={styles.payRow}>
              {/* [DIUBAH] Sebelumnya tulisan tetap "QRIS Statis"; sekarang metode asli transaksi */}
              <MaterialCommunityIcons name={ikonMetode} size={15} color="#0052CC" />
              <Text style={styles.sumValue}>{trx.metode}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.sumRow}>
            <Text style={styles.grandLabel}>Total Pembayaran</Text>
            <Text style={styles.grandValue}>{formatRupiah(total)}</Text>
          </View>
        </View>

        {/* Barcode */}
        <View style={styles.card}>
          <Text style={styles.barcodeHint}>Pindai Barcode / Serahkan ke Logistik</Text>
          <View style={styles.barcodeBox}>
            <View style={styles.barsRow}>
              {bars.map((b, i) => (
                <View key={i} style={{ width: b.w, height: 50, backgroundColor: '#0F172A', marginRight: b.gap }} />
              ))}
            </View>
          </View>
          <Text style={styles.barcodeText}>{trx.id}</Text>
        </View>
      </ScrollView>

      {/* Tombol Bawah */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity style={styles.printBtn} onPress={() => Alert.alert('Cetak', 'Printer belum terhubung.')}>
          <MaterialCommunityIcons name="printer-outline" size={22} color="#0052CC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(app)/transaksi')} activeOpacity={0.85}>
          <MaterialCommunityIcons name="history" size={20} color="#FFFFFF" />
          <Text style={styles.backText}>Kembali ke Riwayat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  storeLogo: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#0052CC', justifyContent: 'center', alignItems: 'center' },
  storeName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  branch: { fontSize: 12, fontWeight: '600', color: '#0052CC', marginTop: 2 },
  successBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#DCFCE7', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  successText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  twoCol: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 11, color: '#64748B', marginBottom: 3 },
  labelSmall: { fontSize: 10, color: '#94A3B8', marginTop: 1 },
  value: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  stockInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EEF2F7',
    borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0',
  },
  stockIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  stockInfoText: { flex: 1, fontSize: 12, color: '#334155', lineHeight: 17 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  sectionCount: { fontSize: 11, color: '#64748B' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  itemRowBorder: { borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  itemImageBox: { width: 62, height: 62, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%' },
  tempTag: { position: 'absolute', top: 3, left: 3, backgroundColor: 'rgba(15,23,42,0.75)', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  tempTagText: { fontSize: 8, color: '#FFFFFF', fontWeight: '700' },
  itemName: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  itemQty: { fontSize: 12, color: '#64748B', marginTop: 3 },
  itemQtyBold: { fontWeight: '700', color: '#0052CC' },
  itemTotal: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  itemSync: { fontSize: 11, fontWeight: '600', color: '#15803D', marginTop: 4 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sumLabel: { fontSize: 13, color: '#64748B' },
  sumValue: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  grandLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  grandValue: { fontSize: 19, fontWeight: '700', color: '#0052CC' },
  barcodeHint: { fontSize: 12, color: '#64748B', textAlign: 'center', marginBottom: 10 },
  barcodeBox: { backgroundColor: '#EEF2F7', borderRadius: 10, paddingVertical: 12, alignItems: 'center', overflow: 'hidden' },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end' },
  barcodeText: { fontSize: 12, fontWeight: '700', color: '#0F172A', textAlign: 'center', letterSpacing: 1.5, marginTop: 8 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12,
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
  printBtn: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#EBF2FF', justifyContent: 'center', alignItems: 'center' },
  backBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#1D5FDB', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  backText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});