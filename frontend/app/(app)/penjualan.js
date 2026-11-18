import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProducts } from '../../context/ProductContext';

const rupiah = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;
const angka = (teks) => parseInt(String(teks).replace(/\D/g, ''), 10) || 0;

export default function PenjualanScreen() {
  const { produkList, loading } = useProducts();
  const insets = useSafeAreaInsets();
  const [cari, setCari] = useState('');
  const [keranjang, setKeranjang] = useState({}); // { idProduk: jumlah }

  const kata = cari.trim().toLowerCase();
  const daftar = produkList.filter(
    (p) => !kata || p.nama.toLowerCase().includes(kata) || p.sku.toLowerCase().includes(kata)
  );

  const ubahJumlah = (produk, delta) => {
    const sekarang = keranjang[produk.id] || 0;
    const stok = angka(produk.stok);
    const baru = sekarang + delta;

    if (delta > 0 && baru > stok) {
      Alert.alert('Stok tidak cukup', `Stok "${produk.nama}" hanya ${stok} pcs.`);
      return;
    }

    setKeranjang((prev) => {
      const salinan = { ...prev };
      if (baru <= 0) delete salinan[produk.id];
      else salinan[produk.id] = baru;
      return salinan;
    });
  };

  // [DITAMBAHKAN] Hapus satu produk dari keranjang dengan konfirmasi (Figma hal. 18)
  const hapusDariKeranjang = (produk) => {
    const jumlah = keranjang[produk.id] || 0;
    Alert.alert(
      'Hapus Produk dari Keranjang?',
      `${produk.nama} (${jumlah} pcs) akan dihapus dari transaksi penjualan saat ini.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () =>
            setKeranjang((prev) => {
              const salinan = { ...prev };
              delete salinan[produk.id];
              return salinan;
            }),
        },
      ]
    );
  };

  const totalItem = Object.values(keranjang).reduce((s, n) => s + n, 0);
  const totalHarga = produkList.reduce((s, p) => s + angka(p.harga) * (keranjang[p.id] || 0), 0);

  const lanjut = () => {
    if (totalItem === 0) return;
    const items = Object.entries(keranjang).map(([id, jumlah]) => ({ id_produk: Number(id), jumlah }));
    router.push({ pathname: '/(app)/pembayaran', params: { keranjang: JSON.stringify(items) } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(app)/beranda')} style={styles.iconBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#0052CC" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Penjualan</Text>
          <Text style={styles.headerSub}>Pilih produk yang dibeli</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau barcode produk"
            placeholderTextColor="#94A3B8"
            value={cari}
            onChangeText={setCari}
          />
          {cari.length > 0 && (
            <TouchableOpacity onPress={() => setCari('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {daftar.length === 0 && (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="package-variant-closed" size={42} color="#94A3B8" />
            <Text style={styles.emptyText}>
              {loading ? 'Memuat produk...' : 'Produk tidak ditemukan.'}
            </Text>
          </View>
        )}

        {daftar.map((p) => {
          const jumlah = keranjang[p.id] || 0;
          const stok = angka(p.stok);
          const habis = stok <= 0;
          const gambar = p.image ? (typeof p.image === 'string' ? { uri: p.image } : p.image) : null;

          return (
            <View key={p.id} style={[styles.card, jumlah > 0 && styles.cardAktif]}>
              <View style={styles.imageBox}>
                {gambar ? (
                  <Image source={gambar} style={styles.image} resizeMode="cover" />
                ) : (
                  <MaterialCommunityIcons name="package-variant-closed" size={26} color="#94A3B8" />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.nama} numberOfLines={2}>{p.nama}</Text>
                <Text style={styles.sku}>{p.sku}</Text>
                <Text style={styles.harga}>{p.harga}</Text>
                <Text style={[styles.stok, habis && { color: '#B91C1C' }]}>
                  {habis ? 'Stok habis' : `Stok: ${stok} pcs`}
                </Text>
              </View>

              {habis ? (
                <View style={styles.habisBadge}>
                  <Text style={styles.habisText}>Habis</Text>
                </View>
              ) : jumlah === 0 ? (
                <TouchableOpacity style={styles.tambahBtn} onPress={() => ubahJumlah(p, 1)} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="plus" size={16} color="#FFFFFF" />
                  <Text style={styles.tambahText}>Tambah</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.stepper}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => ubahJumlah(p, -1)} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="minus" size={16} color="#0052CC" />
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>{jumlah}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => ubahJumlah(p, 1)} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="plus" size={16} color="#0052CC" />
                  </TouchableOpacity>
                  {/* [DITAMBAHKAN] tombol hapus dari keranjang */}
                  <TouchableOpacity style={styles.hapusBtn} onPress={() => hapusDariKeranjang(p)} activeOpacity={0.7}>
                    <MaterialCommunityIcons name="trash-can-outline" size={16} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.footerLabel}>{totalItem} item di keranjang</Text>
          <Text style={styles.footerTotal}>{rupiah(totalHarga)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.lanjutBtn, totalItem === 0 && { opacity: 0.45 }]}
          onPress={lanjut}
          disabled={totalItem === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.lanjutText}>Lanjut ke Pembayaran</Text>
          <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
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
  searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, height: 46,
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  scrollContent: { padding: 16, paddingBottom: 140 },
  emptyBox: { alignItems: 'center', marginTop: 40, gap: 10 },
  emptyText: { fontSize: 13, color: '#64748B' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF',
    borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10,
  },
  cardAktif: { borderColor: '#0052CC', backgroundColor: '#F5F9FF' },
  imageBox: {
    width: 64, height: 64, borderRadius: 10, backgroundColor: '#F1F5F9',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  nama: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  sku: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  harga: { fontSize: 14, fontWeight: '700', color: '#0052CC', marginTop: 3 },
  stok: { fontSize: 11, color: '#64748B', marginTop: 2 },
  tambahBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0052CC',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  tambahText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  habisBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  habisText: { fontSize: 11, fontWeight: '700', color: '#B91C1C' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: '#EBF2FF',
    justifyContent: 'center', alignItems: 'center',
  },
  stepValue: { minWidth: 20, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#0F172A' },
  // [DITAMBAHKAN] style tombol hapus
  hapusBtn: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: '#FEF2F2',
    justifyContent: 'center', alignItems: 'center',
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 10,
  },
  footerLabel: { fontSize: 11, color: '#64748B' },
  footerTotal: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  lanjutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#0052CC',
    paddingHorizontal: 16, height: 48, borderRadius: 12,
  },
  lanjutText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});