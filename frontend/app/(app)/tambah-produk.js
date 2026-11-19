import { useState, useEffect } from 'react'; // [DIUBAH] tambah useEffect
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Modal, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router'; // [DIUBAH]
import * as ImagePicker from 'expo-image-picker';
import { useProducts } from '../../context/ProductContext';

export default function TambahProdukScreen() {
  const { addProduct } = useProducts();

  const [namaProduk, setNamaProduk] = useState('');
  const [kategori, setKategori] = useState('Pilih Kategori');
  const [barcode, setBarcode] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [menyimpan, setMenyimpan] = useState(false); // [DITAMBAHKAN]

  // [DITAMBAHKAN] Menerima kode dari layar scan:
  // - "Daftarkan Produk Baru" mengirim params.barcode
  // - tombol scan di form ini mengirim params.kodeScan
  const params = useLocalSearchParams();
  useEffect(() => {
    if (params.kodeScan) setBarcode(String(params.kodeScan).slice(0, 20));
  }, [params.kodeScanId]);
  useEffect(() => {
    if (params.barcode) setBarcode(String(params.barcode).slice(0, 20));
  }, [params.barcode]);

  const [modalKategoriVisible, setModalKategoriVisible] = useState(false);
  const daftarKategori = ['Frozen Food', 'Seafood', 'Daging', 'Dimsum & Pau', 'Sayuran & Olahan'];

  // Batas ukuran foto sesuai teks di UI (maksimal 3MB)
  const MAX_FILE_SIZE = 3 * 1024 * 1024;

  // Memeriksa hasil foto lalu menyimpannya ke state
  const prosesHasilFoto = (result) => {
    if (result.canceled) return;

    const asset = result.assets[0];

    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
      Alert.alert('Foto terlalu besar', 'Ukuran foto maksimal 3MB. Silakan pilih atau ambil foto lain.');
      return;
    }

    setImageUri(asset.uri);
  };

  // Buka kamera untuk memotret produk
  const ambilFoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin kamera ditolak', 'Aktifkan izin kamera di pengaturan HP untuk mengambil foto produk.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    prosesHasilFoto(result);
  };

  // Pilih foto yang sudah ada di galeri
  const pilihDariGaleri = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin galeri ditolak', 'Aktifkan izin galeri di pengaturan HP untuk memilih foto produk.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    prosesHasilFoto(result);
  };

  // Menampilkan pilihan: Kamera / Galeri
  const handlePilihFoto = () => {
    Alert.alert('Foto Produk', 'Pilih sumber foto', [
      { text: 'Kamera', onPress: ambilFoto },
      { text: 'Galeri', onPress: pilihDariGaleri },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const handleSimpan = async () => { // [DIUBAH] jadi async
    if (!namaProduk || kategori === 'Pilih Kategori' || !harga || !stok) {
      Alert.alert('Perhatian', 'Mohon lengkapi seluruh field wajib yang bertanda bintang (*), termasuk kategori produk.');
      return;
    }

    const produkBaru = {
      id: Date.now().toString(), // id sementara; id asli dari database diberikan server
      nama: namaProduk,
      kategori: kategori,
      sku: barcode.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`, // [DIUBAH] tambah trim()
      harga: `Rp${parseInt(harga).toLocaleString('id-ID')}`,
      stok: `${stok} pcs`,
      temp: '-18°C',
      image: imageUri ? { uri: imageUri } : null,
      deskripsi: `Produk ${namaProduk} kategori ${kategori} kualitas premium. Simpan beku di suhu -18°C.`,
    };

    // [DIUBAH] Simpan ke server, pakai id dari database
    try {
      setMenyimpan(true);
      const tersimpan = await addProduct(produkBaru);

      // Buka layar sukses (replace agar tombol back tidak kembali ke form)
      router.replace({
        pathname: '/(app)/tambah-produk-sukses',
        params: { id: tersimpan.id },
      });
    } catch (e) {
      Alert.alert('Gagal Menyimpan', e.message);
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah Produk Baru</Text>
        <View style={styles.skuNewBadge}>
          <Text style={styles.skuNewText}>SKU Baru</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>❄</Text>
          <Text style={styles.infoBannerText}>
            Pastikan suhu penyimpanan beku (<Text style={{fontWeight: '700', color: '#0052CC'}}>-18°C</Text>) dan SKU tercatat akurat untuk sinkronisasi inventaris rantai dingin.
          </Text>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama Produk <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.textInput}
              placeholder="Contoh: Sosis Sapi Premium 500g"
              placeholderTextColor="#94A3B8"
              value={namaProduk}
              onChangeText={setNamaProduk}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Kategori <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={styles.dropdownBox} 
              onPress={() => setModalKategoriVisible(true)}
            >
              <Text style={[styles.dropdownText, kategori !== 'Pilih Kategori' && {color: '#0F172A', fontWeight: '600'}]}>
                {kategori}
              </Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroupLast}>
            <Text style={styles.inputLabel}>Kode Barcode</Text>
            <View style={styles.barcodeRow}>
              <TextInput
                style={[styles.textInput, {flex: 1, marginBottom: 0}]}
                placeholder="Scan atau ketik kode barcode"
                placeholderTextColor="#94A3B8"
                value={barcode}
                onChangeText={setBarcode}
                maxLength={20} // [DIUBAH] sebelumnya 12; kolom database sekarang varchar(20)
              />
              {/* [DIUBAH] sebelumnya alert('Membuka pemindai kamera barcode gudang') */}
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => router.push({ pathname: '/(app)/scan-barcode', params: { mode: 'isi', kembaliKe: '/(app)/tambah-produk' } })}
              >
                <Text style={styles.scanButtonIcon}>❚║│█║▌</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.cardSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Harga Jual <Text style={styles.required}>*</Text></Text>
            <View style={styles.priceInputBox}>
              <Text style={styles.pricePrefix}>Rp</Text>
              <TextInput
                style={styles.priceInputField}
                placeholder="0"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={harga}
                onChangeText={setHarga}
              />
            </View>
          </View>

          <View style={styles.inputGroupLast}>
            <View style={styles.labelRowWithBadge}>
              <Text style={styles.inputLabel}>Stok Awal <Text style={styles.required}>*</Text></Text>
              <View style={styles.perdanaBadge}>
                <Text style={styles.perdanaBadgeText}>HITUNGAN PERDANA</Text>
              </View>
            </View>
            <TextInput
              style={[styles.textInput, {marginBottom: 4}]}
              placeholder="Jumlah stok awal (pcs)"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={stok}
              onChangeText={setStok}
            />
            <Text style={styles.inputHint}>
              *Stok awal dicatat sebagai kuantitas masuk pertama saat SKU diterbitkan, bukan restock.
            </Text>
          </View>
        </View>

        <View style={styles.cardSection}>
          <Text style={styles.inputLabel}>Foto Produk</Text>
          <TouchableOpacity 
            style={styles.uploadBox} 
            onPress={handlePilihFoto}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <View style={{alignItems: 'center'}}>
                <Image source={{ uri: imageUri }} style={{width: 120, height: 90, borderRadius: 10, marginBottom: 8}} resizeMode="cover" />
                <Text style={{fontSize: 12, color: '#16A34A', fontWeight: '700'}}>Foto Terunggah (Ketuk untuk ganti)</Text>
              </View>
            ) : (
              <>
                <View style={styles.uploadIconCircle}>
                  <Text style={styles.uploadCameraIcon}>📸</Text>
                </View>
                <Text style={styles.uploadTitle}>Tambah Foto Produk (Opsional)</Text>
                <Text style={styles.uploadSubtitle}>Format JPG, PNG (Maksimal 3MB)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalKategoriVisible}
        onRequestClose={() => setModalKategoriVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>Pilih Kategori Produk</Text>
              <TouchableOpacity onPress={() => setModalKategoriVisible(false)}>
                <Text style={{fontSize: 18, fontWeight: '700', color: '#64748B'}}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={daftarKategori}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalCategoryItem, kategori === item && styles.modalCategoryItemActive]}
                  onPress={() => {
                    setKategori(item);
                    setModalKategoriVisible(false);
                  }}
                >
                  <Text style={[styles.modalCategoryText, kategori === item && {color: '#0052CC', fontWeight: '700'}]}>
                    {item}
                  </Text>
                  {kategori === item && <Text style={{color: '#0052CC', fontWeight: '700'}}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.footerContainer}>
        {/* [DIUBAH] tombol dikunci saat sedang menyimpan */}
        <TouchableOpacity
          style={[styles.simpanButton, menyimpan && { opacity: 0.6 }]}
          onPress={handleSimpan}
          disabled={menyimpan}
          activeOpacity={0.8}
        >
          <Text style={styles.simpanButtonIcon}>✓</Text>
          <Text style={styles.simpanButtonText}>{menyimpan ? 'Menyimpan...' : 'Simpan Produk'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.batalButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.batalButtonText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
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
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: '#0F172A', fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  skuNewBadge: { backgroundColor: '#EBF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  skuNewText: { fontSize: 11, fontWeight: '700', color: '#0052CC' },
  scrollContent: { padding: 16, paddingBottom: 130 },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoBannerIcon: { fontSize: 16, color: '#0052CC', marginTop: 1 },
  infoBannerText: { flex: 1, fontSize: 12, color: '#1E40AF', lineHeight: 18 },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  inputGroupLast: { marginBottom: 0 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  required: { color: '#EF4444' },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    color: '#0F172A',
  },
  dropdownBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  dropdownText: { fontSize: 13, color: '#64748B' },
  dropdownIcon: { fontSize: 11, color: '#64748B' },
  barcodeRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  scanButton: {
    width: 52,
    height: 46,
    backgroundColor: '#EBF2FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  scanButtonIcon: { fontSize: 13, fontWeight: '700', color: '#0052CC', letterSpacing: 0.5 },
  priceInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  pricePrefix: { fontSize: 14, fontWeight: '700', color: '#0052CC' },
  priceInputField: { flex: 1, fontSize: 13, color: '#0F172A' },
  labelRowWithBadge: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  perdanaBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  perdanaBadgeText: { fontSize: 9, fontWeight: '700', color: '#64748B' },
  inputHint: { fontSize: 11, color: '#64748B', lineHeight: 15 },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  uploadIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EBF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  uploadCameraIcon: { fontSize: 18 },
  uploadTitle: { fontSize: 13, fontWeight: '700', color: '#0052CC', marginBottom: 2 },
  uploadSubtitle: { fontSize: 11, color: '#64748B' },
  footerContainer: {
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
  simpanButton: {
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
  simpanButtonIcon: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  simpanButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  batalButton: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
  batalButtonText: { color: '#334155', fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', padding: 20 },
  modalContentBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, maxHeight: 350 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalHeaderTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  modalCategoryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalCategoryItemActive: { backgroundColor: '#F8FAFC' },
  modalCategoryText: { fontSize: 13, color: '#334155' },
});