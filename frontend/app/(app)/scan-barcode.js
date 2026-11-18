import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProducts } from '../../context/ProductContext';
import { BASE_URL } from '../../services/produkService';

export default function ScanBarcodeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasilScan, setHasilScan] = useState(null);
  const { produkList } = useProducts();
  const [qty, setQty] = useState(1);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.textNormal}>Memeriksa izin kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="camera-off" size={48} color="#64748B" style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Izin Kamera Dibutuhkan</Text>
        <Text style={styles.description}>
          Frozzy membutuhkan akses kamera untuk memindai barcode produk di gudang.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>Izinkan Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.secondaryButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Cari produk berdasarkan barcode/SKU hasil scan
  const produkCocok = hasilScan
    ? produkList.find(
        (p) => String(p.sku || '').trim().toLowerCase() === String(hasilScan.data || '').trim().toLowerCase()
      )
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pemindai Barcode Gudang</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!hasilScan ? (
          <>
            <Text style={styles.instructionText}>
              Arahkan kamera ke barcode produk (Code 128 / EAN) pada kemasan frozen food.
            </Text>

            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
                }}
                onBarcodeScanned={({ data, type }) => {
                  setHasilScan({ data, type });
                  setQty(1);
                }}
              />
              <View style={styles.scanOverlayBox}>
                <View style={styles.scanLaser} />
              </View>
            </View>

            <View style={styles.tipsCard}>
              <MaterialCommunityIcons name="information-outline" size={18} color="#0052CC" />
              <Text style={styles.tipsText}>
                Pastikan pencahayaan cukup agar pemindai dapat membaca garis barcode dengan cepat.
              </Text>
            </View>
          </>
        ) : produkCocok ? (
          /* ==================================================== */
          /* HALAMAN 14 FIGMA: PRODUK KETEMU & COCOK              */
          /* ==================================================== */
          <View style={styles.resultCard}>
            <View style={styles.badgeSuccess}>
              <MaterialCommunityIcons name="check-circle" size={14} color="#16A34A" />
              <Text style={styles.badgeSuccessText}>Barcode Dikenali</Text>
            </View>

            <View style={styles.productRow}>
              {produkCocok.image ? (
                <Image source={produkCocok.image} style={styles.productImage} resizeMode="cover" />
              ) : (
                <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' }]}>
                  <MaterialCommunityIcons name="cube-outline" size={28} color="#64748B" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.productCategory}>{produkCocok.kategori}</Text>
                <Text style={styles.productName}>{produkCocok.nama}</Text>
                <Text style={styles.productSku}>SKU: {produkCocok.sku}</Text>
                <Text style={styles.productPrice}>{produkCocok.harga}</Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoBoxItem}>
                <Text style={styles.infoBoxLabel}>Stok Tersedia</Text>
                <Text style={styles.infoBoxValue}>{produkCocok.stok}</Text>
              </View>
              <View style={styles.infoBoxItem}>
                <Text style={styles.infoBoxLabel}>Suhu Ruang</Text>
                <Text style={[styles.infoBoxValue, { color: '#0052CC' }]}>{produkCocok.temp || '-18°C'}</Text>
              </View>
            </View>

            {/* Stepper Jumlah */}
            <View style={styles.stepperSection}>
              <Text style={styles.inputLabel}>Jumlah Ambil</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQty(Math.max(1, qty - 1))}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="minus" size={18} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{qty}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQty(qty + 1)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#0F172A" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                // Lempar ke halaman penjualan atau beri konfirmasi berhasil
                router.push({
                  pathname: '/(app)/penjualan',
                  params: { scanBarcode: produkCocok.sku, scanQty: qty },
                });
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="cart-plus" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Masukkan ke Penjualan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setHasilScan(null)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="scan-helper" size={18} color="#0F172A" />
              <Text style={styles.secondaryButtonText}>Scan Ulang Barcode Lain</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ==================================================== */
          /* HALAMAN 15 FIGMA: PRODUK TIDAK DITEMUKAN             */
          /* ==================================================== */
          <View style={styles.resultCard}>
            <View style={styles.badgeDanger}>
              <MaterialCommunityIcons name="alert-circle" size={14} color="#DC2626" />
              <Text style={styles.badgeDangerText}>Tidak Terdaftar di Database</Text>
            </View>

            <View style={styles.notFoundBox}>
              <MaterialCommunityIcons name="barcode-off" size={48} color="#94A3B8" style={{ marginBottom: 10 }} />
              <Text style={styles.notFoundTitle}>Produk Tidak Ditemukan</Text>
              <Text style={styles.notFoundCode}>Nomor Barcode: {hasilScan.data}</Text>
              <Text style={styles.notFoundDesc}>
                Barcode ini belum terdaftar pada sistem inventaris Frozzy. Anda dapat mendaftarkannya melalui menu Tambah Produk.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                router.push('/(app)/tambah-produk');
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus-box" size={18} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Daftarkan Produk Baru</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setHasilScan(null)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="refresh" size={18} color="#0F172A" />
              <Text style={styles.secondaryButtonText}>Scan Ulang</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F8FAFC' },
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  instructionText: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  cameraContainer: {
    width: '100vw',
    height: 380,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
    marginBottom: 16,
  },
  camera: { flex: 1 },
  scanOverlayBox: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    height: 180,
    borderWidth: 2,
    borderColor: 'rgba(0, 82, 204, 0.8)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLaser: { width: '90%', height: 2, backgroundColor: '#EF4444', shadowColor: '#EF4444', shadowRadius: 6, shadowOpacity: 0.8 },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tipsText: { flex: 1, fontSize: 12, color: '#1E40AF', lineHeight: 16 },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    marginBottom: 14,
  },
  badgeSuccessText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },
  badgeDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    marginBottom: 14,
  },
  badgeDangerText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
  productRow: { flexDirection: 'row', gap: 14, marginBottom: 16, alignItems: 'center' },
  productImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F1F5F9' },
  productCategory: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  productName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  productSku: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#0052CC' },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  infoBoxItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  infoBoxLabel: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  infoBoxValue: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  stepperSection: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, height: 46, gap: 20 },
  stepperBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E1' },
  stepperValue: { fontSize: 15, fontWeight: '700', color: '#0F172A', minWidth: 30, textAlign: 'center' },
  notFoundBox: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 10 },
  notFoundTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  notFoundCode: { fontSize: 13, fontWeight: '600', color: '#0052CC', marginBottom: 10, backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  notFoundDesc: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
    shadowColor: '#0052CC',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryButtonText: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  description: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  textNormal: { fontSize: 14, color: '#0F172A' },
});