import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext'; // Pastikan import ini ada
import { router } from 'expo-router';
import BottomNav from '../../components/BottomNav';

export default function ProdukScreen() {
  const { user } = useAuth();
  
  // Perbaikan di sini: Ambil produkList dari ProductContext secara bersih
  const { produkList } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  
  // State untuk mengontrol buka/tutup Modal Filter
  const [modalVisible, setModalVisible] = useState(false);
  // State sementara di dalam modal sebelum tombol "Terapkan" ditekan
  const [tempCategory, setTempCategory] = useState('Semua Kategori');

  // Daftar kategori sesuai produk sendiri beserta deskripsinya (icon = nama ikon MaterialCommunityIcons)
  const categoriesData = [
    { label: 'Semua Kategori', desc: 'Tampilkan seluruh komoditas', icon: 'view-grid-outline' },
    { label: 'Frozen Food', desc: 'Nugget, sosis & aneka olahan', icon: 'snowflake' },
    { label: 'Seafood', desc: 'Fish roll & aneka olahan ikan', icon: 'fish' },
    { label: 'Daging', desc: 'Bakso sapi & aneka daging', icon: 'food-steak' },
  ];

  // Filter produk berdasarkan pencarian (nama/SKU) DAN kategori yang dipilih
  const filteredProduk = produkList.filter((item) => {
    const matchesSearch = 
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'Semua Kategori' || item.kategori === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
            <MaterialCommunityIcons name="snowflake" size={20} color="#0052CC" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Katalog Produk</Text>
            <Text style={styles.headerSub}>Cold Storage UMKM</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifButton} onPress={() => alert('Notifikasi')}>
            <MaterialCommunityIcons name="bell-outline" size={20} color="#334155" />
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
        
        {/* Kolom Pencarian & Tombol Filter (Memicu Modal Pop-up) */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama atau barcode produk"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <MaterialCommunityIcons name="close" size={14} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => {
              setTempCategory(selectedCategory);
              setModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="tune-variant" size={20} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* Indikator Kategori Aktif di Halaman Utama */}
        {selectedCategory !== 'Semua Kategori' && (
          <View style={styles.activeFilterBanner}>
            <Text style={styles.activeFilterText}>Filter Aktif: <Text style={{fontWeight: '700'}}>{selectedCategory}</Text></Text>
            <TouchableOpacity onPress={() => setSelectedCategory('Semua Kategori')}>
              <Text style={styles.clearFilterText}>Reset Filter</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tombol Tambah Produk */}
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(app)/tambah-produk')}>
          <Text style={styles.addButtonText}>+  Tambah Produk</Text>
        </TouchableOpacity>

        {/* Status SKU Terdaftar */}
        <View style={styles.statusInfoRow}>
          <View style={styles.skuBadgeContainer}>
            <MaterialCommunityIcons name="package-variant-closed" size={18} color="#334155" />
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
            <TouchableOpacity 
              key={item.id} 
              style={styles.productCard}
              onPress={() => router.push({
                pathname: '/(app)/detail-produk',
                params: {
                  nama: item.nama,
                  kategori: item.kategori,
                  sku: item.sku,
                  harga: item.harga,
                  stok: item.stok,
                  temp: item.temp,
                }
              })}
              activeOpacity={0.8}
            >
              <View style={styles.productImageContainer}>
                <View style={styles.productImageBox}>
                  {item.image ? (
                    <Image 
                      source={typeof item.image === 'string' ? { uri: item.image } : item.image} 
                      style={styles.productImageActual} 
                      resizeMode="cover" 
                    />
                  ) : (
                    <MaterialCommunityIcons name="food-steak" size={32} color="#94A3B8" />
                  )}
                </View>
                {/* Tag Suhu di pojok gambar produk */}
                <View style={styles.tempTag}>
                  <Text style={styles.tempTagText}>{item.temp}</Text>
                </View>
              </View>

              <View style={styles.productInfo}>
                <View style={styles.productTopRow}>
                  <Text style={styles.productName}>{item.nama}</Text>
                  <TouchableOpacity onPress={() => alert(`Opsi untuk ${item.nama}`)}>
                    <MaterialCommunityIcons name="dots-vertical" size={20} color="#94A3B8" />
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
            </TouchableOpacity>
          ))
        ) : (
          /* Tampilan State Kosong (Empty State) Sesuai Figma */
          <View style={styles.emptyStateContainer}>
            <View style={styles.illustrationCircle}>
              <View style={styles.illustrationBox}>
                <MaterialCommunityIcons name="package-variant-closed" size={38} color="#0052CC" />
              </View>
              <View style={styles.searchMagnifierBadge}>
                <MaterialCommunityIcons name="magnify-close" size={18} color="#FFFFFF" />
              </View>
              <MaterialCommunityIcons name="snowflake" size={16} color="#94A3B8" style={styles.snow1} />
              <MaterialCommunityIcons name="snowflake" size={18} color="#0052CC" style={styles.snow2} />
              <MaterialCommunityIcons name="snowflake" size={14} color="#0052CC" style={styles.snow3} />
            </View>

            <Text style={styles.emptyTitle}>Produk tidak ditemukan</Text>
            <Text style={styles.emptySubtitle}>
              Periksa kembali nama atau barcode produk.
            </Text>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('Semua Kategori');
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>Reset Pencarian</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.barcodeButton}
              onPress={() => router.push('/(app)/scan-barcode')}
            >
              <MaterialCommunityIcons name="barcode-scan" size={18} color="#334155" />
              <Text style={styles.barcodeButtonText}>Atau gunakan pemindai barcode gudang</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* MODAL / POP-UP FILTER KATEGORI */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Garis Drag Handle di Atas Modal */}
            <View style={styles.modalHandle} />

            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Filter Kategori Produk</Text>
                <Text style={styles.modalSubtitle}>Pilih kategori untuk menyaring stok freezer</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Daftar Pilihan Kategori */}
            <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight: 360}}>
              {categoriesData.map((item) => {
                const isSelected = tempCategory === item.label;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.modalItemCard, isSelected && styles.modalItemCardActive]}
                    onPress={() => setTempCategory(item.label)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.modalItemLeft}>
                      <View style={styles.modalIconBox}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={20}
                          color={isSelected ? '#0052CC' : '#475569'}
                        />
                      </View>
                      <View>
                        <Text style={styles.modalItemTitle}>{item.label}</Text>
                        <Text style={styles.modalItemDesc}>{item.desc}</Text>
                      </View>
                    </View>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Tombol Aksi Bawah (Reset & Terapkan) */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={() => setTempCategory('Semua Kategori')}
              >
                <Text style={styles.modalResetText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => {
                  setSelectedCategory(tempCategory);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalApplyText}>Terapkan</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* Navigasi Menu Bawah */}
      <BottomNav active="produk" />
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
    paddingBottom: 120,
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
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
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
  activeFilterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#0052CC',
  },
  clearFilterText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '700',
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
  emptyStateContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  illustrationCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  illustrationBox: {
    width: 76,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  boxIcon: {
    fontSize: 34,
  },
  searchMagnifierBadge: {
    position: 'absolute',
    bottom: 35,
    right: 35,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0052CC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeSearchIcon: {
    fontSize: 12,
  },
  snow1: { position: 'absolute', top: 20, left: 25, fontSize: 16, color: '#94A3B8' },
  snow2: { position: 'absolute', top: 30, right: 30, fontSize: 18, color: '#0052CC' },
  snow3: { position: 'absolute', bottom: 35, left: 30, fontSize: 14, color: '#0052CC' },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
    marginBottom: 12,
    shadowColor: '#0052CC',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  barcodeButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  barcodeButtonIcon: {
    fontSize: 15,
  },
  barcodeButtonText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseIcon: {
    fontSize: 18,
    color: '#64748B',
    padding: 4,
  },
  modalItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  modalItemCardActive: {
    borderColor: '#0052CC',
    backgroundColor: '#F8FAFC',
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalItemDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#0052CC',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0052CC',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalResetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalResetText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  modalApplyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#0052CC',
  },
  modalApplyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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