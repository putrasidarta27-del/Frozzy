import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useProducts } from '../../context/ProductContext';

export default function DetailProdukScreen() {
  const params = useLocalSearchParams();
  const { produkList, deleteProduct } = useProducts(); // [DIUBAH] tambah deleteProduct

  // Cari produk asli di ProductContext berdasarkan SKU yang diklik
  const found = produkList.find((p) => p.sku === params.sku);

  // Gambar bisa berupa require() (angka/objek) atau string URL
  const rawImage = found?.image || params.image;
  const imageSource = rawImage
    ? (typeof rawImage === 'string' ? { uri: rawImage } : rawImage)
    : require('../../assets/images/kanzler.jpeg');

  // Menerima data produk dari halaman katalog, dengan fallback yang sesuai
  const product = {
    nama: found?.nama || params.nama || 'Chicken Nugget Crispy 500g',
    kategori: found?.kategori || params.kategori || 'Frozen Food',
    sku: found?.sku || params.sku || 'SKU-CKN01',
    harga: found?.harga || params.harga || 'Rp42.000',
    stok: found?.stok || params.stok || '45 pcs',
    temp: found?.temp || params.temp || '-18°C Suhu Beku',
    deskripsi: found?.deskripsi || params.deskripsi || 'Nugget ayam renyah kemasan 500 gram kualitas premium. Simpan beku di suhu -18°C.',
    image: imageSource,
  };

  // [DIUBAH] Hapus produk sungguhan lalu buka layar sukses
  const handleHapus = () => {
    Alert.alert(
      'Hapus Produk',
      `Apakah kamu yakin ingin menghapus "${product.nama}" dari sistem?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          // [DIUBAH] Hapus dari server dulu, baru buka layar sukses
          onPress: async () => {
            try {
              if (found?.id) await deleteProduct(found.id);
              router.replace('/(app)/hapus-produk-sukses');
            } catch (e) {
              Alert.alert('Gagal Menghapus', e.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Atas */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Produk</Text>
        <TouchableOpacity onPress={() => alert('Opsi Lainnya')} style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Banner Gambar Produk dengan Tag Suhu */}
        <View style={styles.imageBannerBox}>
          <Image source={product.image} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.tempBannerTag}>
            <Text style={styles.tempBannerText}>❄ {product.temp}</Text>
          </View>
        </View>

        {/* Kartu Informasi Detail */}
        <View style={styles.infoCard}>
          {/* Bar Kategori & Stok */}
          <View style={styles.badgeRow}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillIcon}>📦</Text>
              <Text style={styles.categoryPillText}>{product.kategori}</Text>
            </View>
            <View style={styles.stockPill}>
              <Text style={styles.stockPillIcon}>🗄️</Text>
              <Text style={styles.stockPillText}>Stok: {product.stok}</Text>
            </View>
          </View>

          {/* Nama & Harga Produk */}
          <Text style={styles.productName}>{product.nama}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>{product.harga}</Text>
            <Text style={styles.priceUnit}> / pack</Text>
          </View>

          <View style={styles.divider} />

          {/* Deskripsi & Petunjuk */}
          <Text style={styles.sectionLabel}>Deskripsi & Petunjuk</Text>
          <Text style={styles.productDesc}>{product.deskripsi}</Text>

          {/* Kotak Barcode Code 128 */}
          <View style={styles.barcodeCard}>
            <View style={styles.barcodeHeader}>
              <Text style={styles.barcodeTitle}>Kode Barcode / Code 128</Text>
              <Text style={styles.barcodeStatus}>Aktif</Text>
            </View>
            <View style={styles.barcodeVisualBox}>
              <View style={styles.barcodeLines}>
                <Text style={styles.barcodeLinesText}>||| ||| || |||| | |||||</Text>
              </View>
              {/* Menampilkan SKU produk secara dinamis */}
              <Text style={styles.barcodeNumberText}>{product.sku}</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Tombol Aksi Bawah */}
      <View style={styles.footerActionContainer}>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => router.push({ pathname: '/(app)/edit-produk', params: { id: found?.id } })}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonIcon}>✏️</Text>
          <Text style={styles.editButtonText}>Edit Data & Harga Produk</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleHapus}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonIcon}>🗑️</Text>
          <Text style={styles.deleteButtonText}>Hapus Produk</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 130,
  },
  imageBannerBox: {
    width: '100%',
    height: 200,
    backgroundColor: '#E2E8F0',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  tempBannerTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tempBannerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  categoryPillText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  stockPillText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0052CC',
  },
  priceUnit: {
    fontSize: 13,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  productDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  barcodeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  barcodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  barcodeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  barcodeStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  barcodeVisualBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  barcodeLines: {
    marginBottom: 4,
  },
  barcodeLinesText: {
    fontSize: 22,
    letterSpacing: 3,
    color: '#0F172A',
    fontWeight: '700',
  },
  barcodeNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0052CC',
    letterSpacing: 1,
  },
  footerActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
    elevation: 10,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0052CC',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
});