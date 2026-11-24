import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import BottomNav from '../../components/BottomNav';
import NotifBell from '../../components/NotifBell';

export default function ProfilScreen() {
  const { user, signOut } = useAuth();
  const [modalKeluarVisible, setModalKeluarVisible] = useState(false);

  // [DIUBAH] Ambil inisial dari nama asli pengguna, cadangan 'FZ' (bukan 'BS' Budi Santoso)
  const getInitials = (name) => {
    if (!name) return 'FZ';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // [DIUBAH] Gunakan data nyata dari server; hindari nama/data karangan
  const displayName = user?.nama || user?.email || 'Pengguna Frozzy';
  const displayEmail = user?.email || '-';
  const displayRole = user?.role || 'Pegawai';
  const displayId = user?.id ? `USR-${String(user.id).padStart(3, '0')}` : '-';
  const initials = getInitials(displayName);

  // Format tanggal bergabung jika tersedia dari GET /auth/me
  const formatTanggal = (tgl) => {
    if (!tgl) return 'Terdaftar di sistem';
    const date = new Date(tgl);
    if (isNaN(date.getTime())) return 'Terdaftar di sistem';
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleKonfirmasiKeluar = async () => {
    setModalKeluarVisible(false);
    await signOut();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoArea}>
          <View style={styles.logoIconBox}>
            <MaterialCommunityIcons name="snowflake" size={20} color="#0052CC" />
          </View>
          <Text style={styles.headerTitle}>Profil Saya</Text>
        </View>
       <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
  <View style={styles.serverBadge}>
    <View style={styles.greenDot} />
    <Text style={styles.serverBadgeText}>Online</Text>
  </View>
  <NotifBell />
</View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Kartu Utama Profil */}
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
                <MaterialCommunityIcons name="check-decagram" size={18} color="#0052CC" />
              </View>

              <View style={styles.rolePill}>
                <MaterialCommunityIcons
                  name={displayRole === 'Pemilik' ? 'shield-account' : 'account-tie'}
                  size={13}
                  color="#0052CC"
                />
                <Text style={styles.rolePillText}>{displayRole}</Text>
              </View>

              <View style={styles.branchRow}>
                <MaterialCommunityIcons name="storefront-outline" size={14} color="#64748B" />
                <Text style={styles.branchText}>Frozzy Cold Storage UMKM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Kartu Informasi Akun (Data Nyata dari Tabel users) */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <View style={styles.infoTitleRow}>
              <MaterialCommunityIcons name="account-card-details-outline" size={18} color="#0052CC" />
              <Text style={styles.infoTitle}>Informasi Akun</Text>
            </View>
            <Text style={styles.infoSubText}>Data Server</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Lengkap</Text>
            <Text style={styles.infoValueBold}>{displayName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Akun</Text>
            <Text style={styles.infoValueBold}>{displayEmail}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Pengguna</Text>
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>{displayId}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Peran Akses</Text>
            <Text style={styles.infoValueBold}>{displayRole}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status Akun</Text>
            <View style={styles.activeStatusBadge}>
              <Text style={styles.activeStatusText}>Aktif</Text>
            </View>
          </View>

          <View style={styles.infoRowLast}>
            <Text style={styles.infoLabel}>Terdaftar Sejak</Text>
            <Text style={styles.infoValueMuted}>{formatTanggal(user?.dibuat_pada)}</Text>
          </View>
        </View>

        {/* Tombol Edit Profil & Ubah Kata Sandi (Figma Hal. 25) */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/(app)/edit-profil')}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="account-edit-outline" size={18} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Profil & Kata Sandi</Text>
        </TouchableOpacity>

        {/* Tombol Keluar (Memicu Modal Figma Hal. 26) */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setModalKeluarVisible(true)}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="logout" size={18} color="#DC2626" />
          <Text style={styles.logoutButtonText}>Keluar dari Aplikasi</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* [DITAMBAHKAN] Modal Konfirmasi Keluar dari Aplikasi (Figma Halaman 26) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalKeluarVisible}
        onRequestClose={() => setModalKeluarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconCircle}>
              <MaterialCommunityIcons name="logout-variant" size={28} color="#DC2626" />
            </View>
            <Text style={styles.modalTitle}>Keluar dari Aplikasi?</Text>
            <Text style={styles.modalDesc}>
              Anda harus masuk kembali menggunakan email dan kata sandi untuk mengakses data inventaris dan kasir.
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalKeluarVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleKonfirmasiKeluar}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Navigasi Menu Bawah */}
      <BottomNav active="profil" />
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
    borderBottomColor: '#E2E8F0',
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIconBox: {
    width: 34,
    height: 34,
    backgroundColor: '#EBF2FF',
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  serverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
  },
  serverBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
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
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0052CC',
  },
  onlineStatusDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#16A34A',
    position: 'absolute',
    bottom: 1,
    right: 1,
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
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginVertical: 6,
    gap: 5,
  },
  rolePillText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '700',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  branchText: {
    fontSize: 12,
    color: '#64748B',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
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
    marginBottom: 14,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  infoSubText: {
    fontSize: 11,
    color: '#64748B',
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
  infoValueMuted: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  idBadge: {
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  idBadgeText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '700',
  },
  activeStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeStatusText: {
    fontSize: 11,
    color: '#15803D',
    fontWeight: '700',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#0052CC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#DC2626',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});