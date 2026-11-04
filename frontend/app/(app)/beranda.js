import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function BerandaScreen() {
  const { user, signOut } = useAuth();

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
            <Text style={styles.avatarInitials}>BS</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Kartu Sapaan & Status Offline */}
        <View style={styles.greetingCard}>
          <View>
            <Text style={styles.greetingSub}>Selamat bertugas,</Text>
            <Text style={styles.greetingName}>Halo, {user?.nama || 'Budi Santoso'}</Text>
          </View>
          <View style={styles.offlinePill}>
            <View style={styles.blueDot} />
            <Text style={styles.offlinePillText}>Mode Offline Siap</Text>
          </View>
        </View>

        {/* Statistik Dua Kotak: Total Produk & Total Stok */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={styles.statBoxTop}>
              <Text style={styles.statLabel}>Total Produk</Text>
              <Text style={styles.statIconBadge}>📦</Text>
            </View>
            <Text style={styles.statNumber}>148</Text>
            <Text style={styles.statFooter}>SKU Tersedia</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statBoxTop}>
              <Text style={styles.statLabel}>Total Stok</Text>
              <Text style={styles.statIconBadge}>🗄️</Text>
            </View>
            <Text style={styles.statNumber}>2.850</Text>
            <Text style={styles.statFooter}>Unit dalam freezer</Text>
          </View>
        </View>

        {/* Judul Seksi: Aksi Cepat Kasir */}
        <Text style={styles.sectionHeading}>Aksi Cepat Kasir</Text>

        {/* Tombol Biru Utama: Mulai Penjualan */}
        <TouchableOpacity 
          style={styles.mainActionButton}
          onPress={() => alert('Mulai Penjualan')}
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
          <TouchableOpacity onPress={() => alert('Lihat semua transaksi')}>
            <Text style={styles.newTrxBadge}>2 Baru</Text>
          </TouchableOpacity>
        </View>

        {/* Kartu Transaksi 1 */}
        <View style={styles.trxCard}>
          <View style={styles.trxRowTop}>
            <Text style={styles.trxCodeText}>TRX-20250924-001</Text>
            <View style={styles.greenStatusBadge}>
              <Text style={styles.greenStatusText}>Berhasil</Text>
            </View>
          </View>
          <View style={styles.trxRowBottom}>
            <Text style={styles.trxInfoText}>24 Sep 2025, 14:32  •  4 item</Text>
            <Text style={styles.trxPriceText}>Rp160.000</Text>
          </View>
        </View>

        {/* Kartu Transaksi 2 */}
        <View style={styles.trxCard}>
          <View style={styles.trxRowTop}>
            <Text style={styles.trxCodeText}>TRX-20250924-002</Text>
            <View style={styles.greenStatusBadge}>
              <Text style={styles.greenStatusText}>Berhasil</Text>
            </View>
          </View>
          <View style={styles.trxRowBottom}>
            <Text style={styles.trxInfoText}>24 Sep 2025, 12:15  •  2 item</Text>
            <Text style={styles.trxPriceText}>Rp85.000</Text>
          </View>
        </View>

      </ScrollView>

      {/* Navigasi Menu Bawah persis Figma */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navTextActive}>Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => alert('Produk')}>
          <Text style={styles.navIcon}>📦</Text>
          <Text style={styles.navText}>Produk</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => alert('Penjualan')}>
          <Text style={styles.navIcon}>🛒</Text>
          <Text style={styles.navText}>Penjualan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => alert('Transaksi')}>
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navText}>Transaksi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={signOut}>
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
    paddingBottom: 90,
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