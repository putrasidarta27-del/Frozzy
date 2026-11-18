import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Modal, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProducts } from '../../context/ProductContext';

const daftarKategori = ['Frozen Food', 'Seafood', 'Daging', 'Dimsum & Pau', 'Sayuran & Olahan'];
const MAX_NAMA = 50;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // sesuai teks desain: maksimal 2MB

export default function EditProdukScreen() {
  const params = useLocalSearchParams();
  const { produkList, updateProduct } = useProducts();
  const insets = useSafeAreaInsets();

  const produk = produkList.find((p) => p.id === params.id);

  // Nilai awal diambil dari produk yang dipilih
  const [nama, setNama] = useState(produk?.nama || '');
  const [kategori, setKategori] = useState(produk?.kategori || 'Frozen Food');
  const [barcode, setBarcode] = useState(produk?.sku || '');
  const [harga, setHarga] = useState(String(produk?.harga || '').replace(/\D/g, ''));
  const [stok, setStok] = useState(parseInt(produk?.stok, 10) || 0);
  const [fotoBaru, setFotoBaru] = useState(null); // hanya terisi kalau foto diganti
  const [modalKategori, setModalKategori] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false); // [DITAMBAHKAN]

  if (!produk) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#64748B' }}>Produk tidak ditemukan.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: '#0052CC', fontWeight: '700' }}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const gambarTampil = fotoBaru
    ? { uri: fotoBaru }
    : (typeof produk.image === 'string' ? { uri: produk.image } : produk.image);

  const prosesHasilFoto = (result) => {
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
      Alert.alert('Foto terlalu besar', 'Ukuran foto maksimal 2MB. Silakan pilih atau ambil foto lain.');
      return;
    }
    setFotoBaru(asset.uri);
  };

  const ambilFoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin kamera ditolak', 'Aktifkan izin kamera di pengaturan HP.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    prosesHasilFoto(result);
  };

  const pilihDariGaleri = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin galeri ditolak', 'Aktifkan izin galeri di pengaturan HP.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    prosesHasilFoto(result);
  };

  const handleUbahFoto = () => {
    Alert.alert('Ubah Foto', 'Pilih sumber foto', [
      { text: 'Kamera', onPress: ambilFoto },
      { text: 'Galeri', onPress: pilihDariGaleri },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const ubahStok = (delta) => setStok((s) => Math.max(0, s + delta));

  const handleSimpan = async () => { // [DIUBAH] jadi async
    if (!nama.trim() || !harga) {
      Alert.alert('Perhatian', 'Nama produk dan harga jual wajib diisi.');
      return;
    }

    const perubahan = {
      nama: nama.trim(),
      kategori,
      sku: barcode.trim() || produk.sku,
      harga: `Rp${parseInt(harga, 10).toLocaleString('id-ID')}`,
      stok: `${stok} pcs`,
    };
    if (fotoBaru) perubahan.image = { uri: fotoBaru };

    // [DIUBAH] Simpan perubahan ke server
    try {
      setMenyimpan(true);
      await updateProduct(produk.id, perubahan);
      router.replace({
        pathname: '/(app)/edit-produk-sukses',
        params: { id: produk.id },
      });
    } catch (e) {
      Alert.alert('Gagal Menyimpan', e.message);
    } finally {
      setMenyimpan(false);
    }
  };

  const stokTersedia = stok > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Edit Data Produk</Text>
            <Text style={styles.headerSub}>SKU: {produk.sku}</Text>
          </View>
        </View>
        <View style={styles.tempBadge}>
          <MaterialCommunityIcons name="snowflake" size={12} color="#0052CC" />
          <Text style={styles.tempBadgeText}>{produk.temp}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Foto Utama */}
        <View style={styles.photoCard}>
          <View style={styles.photoBox}>
            {gambarTampil ? (
              <Image source={gambarTampil} style={styles.photoImage} resizeMode="cover" />
            ) : (
              <MaterialCommunityIcons name="package-variant-closed" size={34} color="#94A3B8" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.photoTitle}>Foto Utama Produk</Text>
            <Text style={styles.photoDesc}>Format JPG/PNG max 2MB. Disarankan foto kemasan berlabel suhu beku.</Text>
            <TouchableOpacity style={styles.changePhotoBtn} onPress={handleUbahFoto} activeOpacity={0.8}>
              <MaterialCommunityIcons name="pencil" size={13} color="#0052CC" />
              <Text style={styles.changePhotoText}>Ubah Foto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nama Produk */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Nama Produk</Text>
          <Text style={styles.counter}>{nama.length} / {MAX_NAMA}</Text>
        </View>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.inputField}
            value={nama}
            onChangeText={setNama}
            maxLength={MAX_NAMA}
            placeholder="Nama produk"
            placeholderTextColor="#94A3B8"
          />
          {nama.trim().length > 0 && <MaterialCommunityIcons name="check-circle-outline" size={20} color="#0052CC" />}
        </View>

        {/* Kategori */}
        <Text style={[styles.label, { marginTop: 18 }]}>Kategori</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {daftarKategori.map((k) => {
            const aktif = k === kategori;
            return (
              <TouchableOpacity
                key={k}
                style={[styles.chip, aktif && styles.chipActive]}
                onPress={() => setKategori(k)}
                activeOpacity={0.8}
              >
                {aktif && <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />}
                <Text style={[styles.chipText, aktif && styles.chipTextActive]}>{k}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <TouchableOpacity style={styles.inputBox} onPress={() => setModalKategori(true)} activeOpacity={0.8}>
          <Text style={[styles.inputField, { paddingVertical: 0 }]}>{kategori}</Text>
          <MaterialCommunityIcons name="chevron-down" size={22} color="#334155" />
        </TouchableOpacity>

        {/* Barcode */}
        <Text style={[styles.label, { marginTop: 18 }]}>Kode Barcode</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={[styles.inputField, { letterSpacing: 1 }]}
            value={barcode}
            onChangeText={setBarcode}
            autoCapitalize="characters"
            maxLength={12} // [DITAMBAHKAN] kolom barcode di database maksimal 12 karakter
            placeholder="Kode barcode / SKU"
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity onPress={() => Alert.alert('Barcode', 'Pemindai barcode belum tersedia.')}>
            <MaterialCommunityIcons name="barcode-scan" size={22} color="#0052CC" />
          </TouchableOpacity>
        </View>

        {/* Harga & Stok */}
        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Harga Jual</Text>
            <View style={styles.inputBox}>
              <Text style={styles.prefix}>Rp</Text>
              <TextInput
                style={styles.inputField}
                value={harga ? parseInt(harga, 10).toLocaleString('id-ID') : ''}
                onChangeText={(t) => setHarga(t.replace(/\D/g, ''))}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.suffix}>/pcs</Text>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Stok Saat Ini</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => ubahStok(-1)} activeOpacity={0.7}>
                <MaterialCommunityIcons name="minus" size={18} color="#0052CC" />
              </TouchableOpacity>
              <TextInput
                style={styles.stepValue}
                value={String(stok)}
                onChangeText={(t) => setStok(parseInt(t.replace(/\D/g, ''), 10) || 0)}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.stepBtn} onPress={() => ubahStok(1)} activeOpacity={0.7}>
                <MaterialCommunityIcons name="plus" size={18} color="#0052CC" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Status Ketersediaan */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status Ketersediaan</Text>
            <View style={[styles.statusBadge, !stokTersedia && styles.statusBadgeEmpty]}>
              <Text style={[styles.statusBadgeText, !stokTersedia && styles.statusBadgeTextEmpty]}>
                {stokTersedia ? 'Stock Ready' : 'Stok Habis'}
              </Text>
            </View>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusRow}>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="warehouse" size={14} color="#0052CC" />
              <Text style={styles.statusLabel}>Lokasi Freezer:</Text>
            </View>
            <Text style={styles.locationValue}>Chiller B-03 (Depan)</Text>
          </View>
        </View>
      </ScrollView>

      {/* Tombol Bawah */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Batal</Text>
        </TouchableOpacity>
        {/* [DIUBAH] tombol dikunci saat sedang menyimpan */}
        <TouchableOpacity
          style={[styles.saveBtn, menyimpan && { opacity: 0.6 }]}
          onPress={handleSimpan}
          disabled={menyimpan}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="content-save-outline" size={19} color="#FFFFFF" />
          <Text style={styles.saveText}>{menyimpan ? 'Menyimpan...' : 'Simpan Produk'}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Pilih Kategori */}
      <Modal animationType="fade" transparent visible={modalKategori} onRequestClose={() => setModalKategori(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kategori Produk</Text>
              <TouchableOpacity onPress={() => setModalKategori(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={daftarKategori}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, kategori === item && { backgroundColor: '#F8FAFC' }]}
                  onPress={() => {
                    setKategori(item);
                    setModalKategori(false);
                  }}
                >
                  <Text style={[styles.modalItemText, kategori === item && { color: '#0052CC', fontWeight: '700' }]}>{item}</Text>
                  {kategori === item && <MaterialCommunityIcons name="check" size={18} color="#0052CC" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  headerSub: { fontSize: 11, color: '#64748B', marginTop: 1 },
  tempBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EBF2FF', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  tempBadgeText: { fontSize: 11, fontWeight: '700', color: '#0052CC' },
  scrollContent: { padding: 16, paddingBottom: 130 },
  photoCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
    alignItems: 'center',
  },
  photoBox: { width: 78, height: 78, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoImage: { width: '100%', height: '100%' },
  photoTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
  photoDesc: { fontSize: 11, color: '#64748B', lineHeight: 15, marginBottom: 8 },
  changePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: '#EBF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  changePhotoText: { fontSize: 12, fontWeight: '700', color: '#0052CC' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  counter: { fontSize: 11, color: '#94A3B8', marginBottom: 6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },
  inputField: { flex: 1, fontSize: 14, color: '#0F172A' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#0052CC' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#FFFFFF' },
  twoCol: { flexDirection: 'row', gap: 12, marginTop: 18 },
  prefix: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  suffix: { fontSize: 12, color: '#94A3B8' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 8,
  },
  stepBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#EBF2FF', justifyContent: 'center', alignItems: 'center' },
  stepValue: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#0F172A' },
  statusCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', padding: 14, marginTop: 18 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 12, color: '#475569' },
  statusBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusBadgeEmpty: { backgroundColor: '#FEE2E2' },
  statusBadgeText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  statusBadgeTextEmpty: { color: '#B91C1C' },
  statusDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationValue: { fontSize: 12, fontWeight: '700', color: '#0F172A' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  saveBtn: { flex: 2, height: 48, borderRadius: 12, backgroundColor: '#0052CC', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  saveText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, maxHeight: 350 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalItemText: { fontSize: 13, color: '#334155' },
});