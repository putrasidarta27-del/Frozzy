import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function ProfilScreen() {
  const { user, signOut } = useAuth();

  // Fungsi untuk mengambil huruf depan nama (contoh: "Budi Santoso" jadi "BS")
  const getInitials = (name) => {
    if (!name) return 'BS';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.nama || user?.name || user?.email || 'Budi Santoso';
  const displayRole = user?.role || user?.peran || 'Admin Kasir & Stok';
  const displayId = user?.id_karyawan || user?.id || 'KSR-FRZ-089';
  const initials = getInitials(displayName);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoArea}>
          <Text style={styles.snowflakeIcon}>❄</Text>
          <Text style={styles.headerTitle}>Profil Saya</Text>
        </View>
        <TouchableOpacity style={styles.notifButton} onPress={() => alert('Notifikasi')}>
          <Text style={styles.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.onlineStatusDot} />
            </View>

            <View style={styles.profileMainInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.verifiedBadge}>☑</Text>
              </View>
              
              <View style={styles.rolePill}>
                <Text style={styles.rolePillIcon}>💼</Text>
                <Text style={styles.rolePillText}>{displayRole}</Text>
              </View>

              <Text style={styles.branchText}>🏢 Frozzy Frozen Mart - Cabang Utama</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileBottomRow}>
            <View style={styles.tempStatus}>
              <Text style={styles.tempIcon}>🌡️</Text>
              <Text style={styles.tempLabel}>Cold-Room #02: </Text>
              <Text style={styles.tempValue}>-18.4°C</Text>
            </View>
            <View style={styles.shiftBadge}>
              <Text style={styles.shiftText}>Shift Pagi</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <View style={styles.infoTitleRow}>
              <Text style={styles.infoTitleIcon}>👤</Text>
              <Text style={styles.infoTitle}>Informasi Akun</Text>
            </View>
            <Text style={styles.infoSubText}>ID Karyawan Resmi</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Lengkap</Text>
            <Text style={styles.infoValueBold}>{displayName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Karyawan</Text>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>{displayId} 📄</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Peran</Text>
            <Text style={styles.infoValueBold}>{displayRole}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status Akun</Text>
            <View style={styles.activeStatusBadge}>
              <Text style={styles.activeStatusText}>● Aktif (Terverifikasi)</Text>
            </View>
          </View>

          <View style={styles.infoRowLast}>
            <Text style={styles.infoLabel}>Versi Aplikasi</Text>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.infoValueBold}>Frozzy v2.4.1–rc</Text>
              <Text style={styles.offlineText}>☁ Offline Ready</Text>
            </View>
          </View>
        </View>

        <View style={styles.printerCard}>
          <View style={styles.printerIconBox}>
            <Text style={styles.printerIcon}>🖨️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.printerTitle}>Thermal POS Printer</Text>
            <Text style={styles.printerStatus}>Bluetooth Terhubung (RP-58A)</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </View>

        <TouchableOpacity style={styles.editButton} activeOpacity={0.85}>
          <Text style={styles.editButtonText}>✏️ Edit Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut} activeOpacity={0.85}>
          <Text style={styles.logoutButtonText}>↪ Keluar / Logout</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Navigasi Menu Bawah */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(app)/beranda')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navText}>Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(app)/produk')}>
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

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(app)/profil')}>
          <Text style={styles.navIconActive}>👤</Text>
          <Text style={styles.navTextActive}>Profil</Text>
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
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  snowflakeIcon: {
    fontSize: 20,
    color: '#0052CC',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0052CC',
  },
  notifButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifIcon: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C6D8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0052CC',
  },
  onlineStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16A34A',
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#0052CC',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 6,
    gap: 4,
  },
  rolePillIcon: {
    fontSize: 10,
  },
  rolePillText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '600',
  },
  branchText: {
    fontSize: 11,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  profileBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempIcon: {
    fontSize: 12,
  },
  tempLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  tempValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  shiftBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shiftText: {
    fontSize: 10,
    color: '#3730A3',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoTitleIcon: {
    fontSize: 14,
    color: '#0052CC',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  infoSubText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  infoRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  idBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  activeStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeStatusText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
  },
  offlineText: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },
  printerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  printerIconBox: {
    width: 38,
    height: 38,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  printerIcon: {
    fontSize: 18,
  },
  printerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  printerStatus: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 18,
    color: '#94A3B8',
  },
  editButton: {
    backgroundColor: '#0052CC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
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