import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import BottomNav from '../../components/BottomNav';
// [DIUBAH] Data contoh tidak dipakai lagi, diganti data dari server
// import { daftarTransaksi, formatRupiah, hitungTotal, hitungItem } from '../../data/transaksiData';
import { useTransaksi } from '../../context/TransaksiContext'; // [DITAMBAHKAN]
import { useProducts } from '../../context/ProductContext'; // [DITAMBAHKAN]

const formatRupiah = (angka) => `Rp${Number(angka).toLocaleString('id-ID')}`; // [DITAMBAHKAN]

export default function BerandaScreen() {
  const { user } = useAuth();

  // [DITAMBAHKAN] Data asli dari server
  const { transaksiList } = useTransaksi();
  const { produkList } = useProducts();
  const totalSku = produkList.length;
  const totalStok = produkList.reduce((s, p) => s + (parseInt(p.stok, 10) || 0), 0);

  // Fungsi untuk mengambil inisial otomatis dari nama user
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
      {/* Header Atas: Logo Frozzy, Notifikasi, Avatar */}
      <View style={styles.header}>
        <View style={styles.logoArea}>
          <View style={styles.logoIconBox}>
            <Text style={styles.snowflakeText}>❄</Text>
          </View>
          <Text style={styles.brandTitle}>Frozzy</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifButton} onPress={() => alert('Notifikasi ditekan')}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.redDot} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{userInitials}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Kartu Sapaan & Status Server */}
        <View style={styles.greetingCard}>
          <View>
            <Text style={styles.greetingSub}>Selamat bertugas,</Text>
            <Text style={styles.greetingName}>Halo, {displayName}</Text>
          </View>
          <View style={styles.offlinePill}>
            <View style={styles.blueDot} />
            {/* [DIUBAH] Sebelumnya "Mode Offline Siap"; data sekarang tersimpan di server */}
            <Text style={styles.offlinePillText}>Terhubung Server</Text>
          </View>
        </View>

        {/* Statistik Dua Kotak: Total Produk & Total Stok */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.statBoxTop}>
              <Text style={styles.statLabel}>Total Produk</Text>
              <Text style={styles.statIconBadge}>📦</Text>
            </View>
            {/* [DIUBAH] Sebelumnya angka tetap 148 */}
            <Text style={styles.statNumber}>{totalSku}</Text>
            <Text style={styles.statFooter}>SKU Tersedia</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statBoxTop}>
              <Text style={styles.statLabel}>Total Stok</Text>
              <Text style={styles.statIconBadge}>🗄️</Text>
            </View>
            {/* [DIUBAH] Sebelumnya angka tetap 2.850 */}
            <Text style={styles.statNumber}>{totalStok.toLocaleString('id-ID')}</Text>
            <Text style={styles.statFooter}>Unit dalam freezer</Text>
          </View>
        </View>

        {/* Judul Seksi: Aksi Cepat Kasir */}
        <Text style={styles.sectionHeading}>Aksi Cepat Kasir</Text>

        {/* Tombol Biru Utama: Mulai Penjualan */}
        <TouchableOpacity 
          style={styles.mainActionButton}
          onPress={() => router.replace('/(app)/penjualan')} // [DIUBAH]
          activeOpacity={0.9}
        >
          <View style={styles.mainActionLeft}>
            <View style={styles.whiteIconBox}>
              <Text style={styles.iconInsideWhite}>🛒</Text>
            </View>
            <View>
              <Text style={styles.mainActionTitle}>Mulai Penjualan</Text>
              <Text style={styles.mainActionDesc}>Buka mesin kasir dan input pesanan</Text>
            </View>
          </View>
          <Text style={styles.rightArrowWhite}>→</Text>
        </TouchableOpacity>

        {/* Tombol Putih: Scan Barcode Produk */}
        <TouchableOpacity 
          style={styles.subActionButton}
          onPress={() => alert('Scan Barcode')}
          activeOpacity={0.8}
        >
          <View style={styles.mainActionLeft}>
            <View style={styles.blueIconBox}>
              <Text style={styles.iconInsideBlue}>📷</Text>
            </View>
            <View>
              <Text style={styles.subActionTitle}>Scan Barcode Produk</Text>
              <Text style={styles.subActionDesc}>Cek harga & info stok instan</Text>
            </View>
          </View>
          <Text style={styles.rightArrowGray}>›</Text>
        </TouchableOpacity>

        {/* Judul Seksi: Transaksi Terakhir */}
        <View style={styles.trxHeaderRow}>
          <Text style={styles.sectionHeading}>Transaksi Terakhir</Text>
          <TouchableOpacity onPress={() => router.replace('/(app)/transaksi')}>
            <Text style={styles.newTrxBadge}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {/* [DITAMBAHKAN] Tampilan bila belum ada transaksi */}
        {transaksiList.length === 0 && (
          <View style={styles.trxCard}>
            <Text style={styles.trxInfoText}>Belum ada transaksi.</Text>
          </View>
        )}

        {/* [DIUBAH] Sebelumnya daftarTransaksi (data contoh), sekarang transaksiList (database) */}
        {transaksiList.slice(0, 2).map((trx) => (
          <TouchableOpacity
            key={trx.id}
            style={styles.trxCard}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/(app)/detail-transaksi', params: { id: trx.id } })}
          >
            <View style={styles.trxRowTop}>
              <Text style={styles.trxCodeText}>{trx.id}</Text>
              <View style={styles.greenStatusBadge}>
                <Text style={styles.greenStatusText}>Berhasil</Text>
              </View>
            </View>
            <View style={styles.trxRowBottom}>
              {/* [DIUBAH] jumlah item dan total langsung dari server */}
              <Text style={styles.trxInfoText}>{trx.tanggalPendek}, {trx.jam}  •  {trx.jumlahItem} item</Text>
              <Text style={styles.trxPriceText}>{formatRupiah(trx.total)}</Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Navigasi Menu Bawah */}
      <BottomNav active="beranda" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
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
    borderBottomColor: '#F0F2F5',
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIconBox: {
    width: 32,
    height: 32,
    backgroundColor: '#EBF1FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snowflakeText: {
    fontSize: 16,
    color: '#0052CC',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0052CC',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F4F5F7',
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
    backgroundColor: '#FF3B30',
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
  greetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDF1F5',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  greetingSub: {
    fontSize: 12,
    color: '#8C939F',
  },
  greetingName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 2,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0052CC',
  },
  offlinePillText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF1F5',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  statBoxTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8C939F',
    fontWeight: '500',
  },
  statIconBadge: {
    fontSize: 14,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
  },
  statFooter: {
    fontSize: 11,
    color: '#A0AEC0',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 10,
  },
  mainActionButton: {
    backgroundColor: '#0052CC',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#0052CC',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  whiteIconBox: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInsideWhite: {
    fontSize: 18,
  },
  mainActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mainActionDesc: {
    fontSize: 11,
    color: '#D2E3FC',
    marginTop: 2,
  },
  rightArrowWhite: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subActionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDF1F5',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  blueIconBox: {
    width: 38,
    height: 38,
    backgroundColor: '#EAF2FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInsideBlue: {
    fontSize: 18,
  },
  subActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
  subActionDesc: {
    fontSize: 11,
    color: '#8C939F',
    marginTop: 2,
  },
  rightArrowGray: {
    fontSize: 20,
    color: '#A0AEC0',
    fontWeight: '700',
  },
  trxHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  newTrxBadge: {
    fontSize: 12,
    color: '#0052CC',
    fontWeight: '700',
  },
  trxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF1F5',
  },
  trxRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  trxCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A202C',
  },
  greenStatusBadge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  greenStatusText: {
    fontSize: 10,
    color: '#137333',
    fontWeight: '700',
  },
  trxRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trxInfoText: {
    fontSize: 11,
    color: '#8C939F',
  },
  trxPriceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0052CC',
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
    borderTopColor: '#EDF1F5',
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
    color: '#8C939F',
    marginTop: 2,
  },
  navTextActive: {
    fontSize: 10,
    color: '#0052CC',
    fontWeight: '700',
    marginTop: 2,
  },
});