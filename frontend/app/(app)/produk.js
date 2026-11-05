import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function ProdukScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Data dummy produk lengkap dengan properti 'image'
  // Kamu tinggal mengganti/mengisi path gambar di dalam 'image: ...' sesuai kebutuhanmu
  const produkList = [
    {
      id: '1',
      nama: 'Nugget Kanzler Kriuk 500g',
      kategori: 'Frozen Food',
      sku: 'SKU-CKN01',
      harga: 'Rp42.000',
      stok: '45 pcs',
      temp: '-18°C',
      image: require('../../assets/images/kanzler.jpeg'),// Contoh: require('../../assets/images/nugget.jpg') atau 'https://url-gambar.com/nugget.jpg'
    },
    {
      id: '2',
      nama: 'Sosis Sapi Premium 500g',
      kategori: 'Frozen Food',
      sku: 'SKU-BFF02',
      harga: 'Rp48.000',
      stok: '32 pcs',
      temp: '-18°C',
      image: require('../../assets/images/sapi.jpg'), // Ganti di sini jika ingin memasukkan gambar untuk Sosis Sapi
    },
    {
      id: '3',
      nama: 'Fish Roll Olahan Ikan 500g',
      kategori: 'Seafood',
      sku: 'SKU-FSH03',
      harga: 'Rp35.000',
      stok: '20 pcs',
      temp: '-20°C',
      image:require('../../assets/images/fish roll.jpeg'), // Ganti di sini jika ingin memasukkan gambar untuk Fish Roll
    },
    {
      id: '4',
      nama: 'Bakso Sapi Super 500g',
      kategori: 'Daging',
      sku: 'SKU-BKS04',
      harga: 'Rp55.000',
      stok: '18 pcs',
      temp: '-18°C',
      image: require('../../assets/images/bakso.jpg'), // Ganti di sini jika ingin memasukkan gambar untuk Bakso Sapi
    },
  ];

  // Filter produk berdasarkan pencarian nama atau SKU
  const filteredProduk = produkList.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fungsi inisial untuk avatar kanan atas
  const getInitials = (name) => {
    if (!name) return 'FZ';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.nama || user?.name || user?.email || 'Pengguna Frozzy';
  const userInitials = getInitials(displayName);

  return (
    <View style={styles.container}>
      {/* Header Atas */}
      <View style={styles.header}>
        <View style={styles.logoArea}>
          <View style={styles.logoIconBox}>
            <Text style={styles.snowflakeText}>❄</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Katalog Produk</Text>
            <Text style={styles.headerSub}>Cold Storage UMKM</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifButton} onPress={() => alert('Notifikasi')}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.redDot} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(app)/profil')}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{userInitials}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Kolom Pencarian & Tombol Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama atau barcode produk"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton} onPress={() => alert('Filter ditekan')}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Tombol Tambah Produk */}
        <TouchableOpacity style={styles.addButton} onPress={() => alert('Tambah Produk')}>
          <Text style={styles.addButtonText}>+ + Tambah Produk</Text>
        </TouchableOpacity>

        {/* Status SKU Terdaftar */}
        <View style={styles.statusInfoRow}>
          <View style={styles.skuBadgeContainer}>
            <Text style={styles.skuBadgeIcon}>📦</Text>
            <Text style={styles.skuBadgeText}>{filteredProduk.length} SKU Terdaftar</Text>
          </View>
          <View style={styles.optimalBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.optimalText}>-18°C Optimal</Text>
          </View>
        </View>

        {/* Daftar Kartu Produk */}
        {filteredProduk.length > 0 ? (
          filteredProduk.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                <View style={styles.productImageBox}>
                  {item.image ? (
                    <Image 
                      source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
                      style={styles.productImageActual} 
                      resizeMode="cover" 
                    />
                  ) : (
                    <Text style={styles.productPlaceholderEmoji}>🥩</Text>
                  )}
                </View>
                <View style={styles.tempTag}>
                  <Text style={styles.tempTagText}>{item.temp}</Text>
                </View>
              </View>

              <View style={styles.productInfo}>
                <View style={styles.productTopRow}>
                  <Text style={styles.productName}>{item.nama}</Text>
                  <TouchableOpacity onPress={() => alert(`Opsi untuk ${item.nama}`)}>
                    <Text style={styles.optionsIcon}>⋮</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.categoryRow}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{item.kategori}</Text>
                  </View>
                  <Text style={styles.skuText}>{item.sku}</Text>
                </View>

                <View style={styles.productBottomRow}>
                  <Text style={styles.productPrice}>{item.harga}</Text>
                  <View style={styles.stockBox}>
                    <Text style={styles.stockLabel}>Stok: </Text>
                    <Text style={styles.stockValue}>{item.stok}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Produk tidak ditemukan</Text>
          </View>
        )}

      </ScrollView>

      {/* Navigasi Menu Bawah (Produk Aktif) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(app)/beranda')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(app)/produk')}>
          <Text style={styles.navIconActive}>📦</Text>
          <Text style={styles.navTextActive}>Produk</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => alert('Penjualan')}>
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navText}>Penjualan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => alert('Transaksi')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Transaksi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(app)/profil')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Profil</Text>
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
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIconBox: {
    width: 36,
    height: 36,
    backgroundColor: '#EBF2FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snowflakeText: {
    fontSize: 18,
    color: '#0052CC',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifIcon: {
    fontSize: 16,
  },
  redDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    backgroundColor: '#0052CC',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 46,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  filterButton: {
    width: 46,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#0052CC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0052CC',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statusInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  skuBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skuBadgeIcon: {
    fontSize: 14,
  },
  skuBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  optimalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  optimalText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 12,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImageBox: {
    width: 72,
    height: 72,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImageActual: {
    width: '100%',
    height: '100%',
  },
  productPlaceholderEmoji: {
    fontSize: 32,
  },
  tempTag: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tempTagText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
  },
  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  optionsIcon: {
    fontSize: 16,
    color: '#94A3B8',
    paddingLeft: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  categoryPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  skuText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  productBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0052CC',
  },
  stockBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  stockLabel: {
    fontSize: 11,
    color: '#854D0E',
  },
  stockValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854D0E',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 16,
    opacity: 0.5,
  },
  navIconActive: {
    fontSize: 16,
  },
  navText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  navTextActive: {
    fontSize: 10,
    color: '#0052CC',
    fontWeight: '700',
    marginTop: 2,
  },
});