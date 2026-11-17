import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProducts } from '../../context/ProductContext';

export default function TambahProdukSuksesScreen() {
  const params = useLocalSearchParams();
  const { produkList } = useProducts();
  const insets = useSafeAreaInsets();

  // Ambil produk yang baru ditambahkan berdasarkan id
  const produk = produkList.find((p) => p.id === params.id) || produkList[0];

  const imageSource = produk?.image
    ? (typeof produk.image === 'string' ? { uri: produk.image } : produk.image)
    : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ikon Sukses */}
        <View style={styles.successOuter}>
          <View style={styles.successMiddle}>
            <View style={styles.successInner}>
              <MaterialCommunityIcons name="check" size={38} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Produk Berhasil Ditambahkan</Text>
        <Text style={styles.subtitle}>Data produk baru telah tersimpan di katalog Frozzy.</Text>

        {/* Kartu Ringkasan Produk */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.tempBadge}>
              <MaterialCommunityIcons name="snowflake" size={13} color="#0052CC" />
              <Text style={styles.tempBadgeText}>{produk?.temp} Suhu Aman</Text>
            </View>
            <View style={styles.savedBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.savedBadgeText}>Tersimpan</Text>
            </View>
          </View>

          <View style={styles.productRow}>
            <View style={styles.productImageBox}>
              {imageSource ? (
                <Image source={imageSource} style={styles.productImage} resizeMode="cover" />
              ) : (
                <MaterialCommunityIcons name="package-variant-closed" size={34} color="#0052CC" />
              )}
            </View>

            <View style={styles.productInfo}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{produk?.kategori}</Text>
              </View>
              <Text style={styles.productName}>{produk?.nama}</Text>
              <Text style={styles.productPrice}>{produk?.harga}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Ketersediaan</Text>
              <View style={styles.detailValueRow}>
                <MaterialCommunityIcons name="archive-outline" size={16} color="#16A34A" />
                <Text style={styles.detailValue}>Stok: {produk?.stok}</Text>
              </View>
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Nomor Barcode</Text>
              <View style={styles.detailValueRow}>
                <MaterialCommunityIcons name="barcode" size={16} color="#475569" />
                <Text style={styles.detailValue} numberOfLines={1}>{produk?.sku}</Text>
              </View>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="warehouse" size={14} color="#64748B" />
              <Text style={styles.locationText}>Lokasi: Freezer Zone A-02</Text>
            </View>
            <Text style={styles.idText}>ID #{produk?.sku}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Tombol Aksi Bawah */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/(app)/produk')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="clipboard-list-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Kembali ke Katalog</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace('/(app)/tambah-produk')}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#0052CC" />
          <Text style={styles.secondaryButtonText}>Tambah Produk Lain</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 80, paddingBottom: 200 },
  successOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E6F9EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successMiddle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#BBF7D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#15803D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
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
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  tempBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tempBadgeText: { fontSize: 11, fontWeight: '600', color: '#0052CC' },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  greenDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#16A34A' },
  savedBadgeText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  productRow: { flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 14 },
  productImageBox: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: '100%' },
  productInfo: { flex: 1 },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  categoryText: { fontSize: 10, fontWeight: '600', color: '#64748B' },
  productName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  productPrice: { fontSize: 17, fontWeight: '700', color: '#0052CC' },
  detailRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  detailBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  detailLabel: { fontSize: 11, color: '#64748B', marginBottom: 6 },
  detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailValue: { flex: 1, fontSize: 12, fontWeight: '700', color: '#0F172A' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 11, color: '#64748B' },
  idText: { fontSize: 11, fontWeight: '700', color: '#0052CC' },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#0052CC',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0052CC',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#F1F5FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  secondaryButtonText: { color: '#0052CC', fontSize: 14, fontWeight: '700' },
});