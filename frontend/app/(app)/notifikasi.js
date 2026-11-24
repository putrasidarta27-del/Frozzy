import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import {
  ambilNotifikasi,
  tandaiDibaca,
  tandaiSemuaDibaca,
} from '../../services/notificationService';

// Tampilan tiap jenis notifikasi (sesuai jenis yang dibuat backend)
const JENIS = {
  stok_menipis: { icon: 'alert-outline', warna: '#B45309', bg: '#FEF3C7', label: 'Stok Menipis' },
  stok_habis: { icon: 'alert-circle-outline', warna: '#B91C1C', bg: '#FEE2E2', label: 'Stok Habis' },
  pegawai_login: { icon: 'account-check-outline', warna: '#0052CC', bg: '#EBF2FF', label: 'Aktivitas Pegawai' },
};
const JENIS_LAIN = { icon: 'bell-outline', warna: '#475569', bg: '#F1F5F9', label: 'Info' };

const dua = (n) => String(n).padStart(2, '0');

// Kunci hari dalam zona waktu HP, mis. "2026-11-24"
const kunciHari = (d) => `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;

function labelHari(d) {
  const sekarang = new Date();
  const kemarin = new Date();
  kemarin.setDate(sekarang.getDate() - 1);
  if (kunciHari(d) === kunciHari(sekarang)) return 'Hari Ini';
  if (kunciHari(d) === kunciHari(kemarin)) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function labelWaktu(d) {
  const selisihMenit = Math.floor((Date.now() - d.getTime()) / 60000);
  if (kunciHari(d) === kunciHari(new Date())) {
    if (selisihMenit < 1) return 'Baru saja';
    if (selisihMenit < 60) return `${selisihMenit} menit lalu`;
    return `${Math.floor(selisihMenit / 60)} jam lalu`;
  }
  return `${dua(d.getHours())}:${dua(d.getMinutes())}`;
}

// Kelompokkan daftar (sudah terbaru dulu) per hari
function kelompokkan(daftar) {
  const urutan = [];
  const peta = {};
  daftar.forEach((n) => {
    const tgl = new Date(n.dibuat_pada);
    const kunci = kunciHari(tgl);
    if (!peta[kunci]) {
      peta[kunci] = { label: labelHari(tgl), item: [] };
      urutan.push(kunci);
    }
    peta[kunci].item.push(n);
  });
  return urutan.map((k) => peta[k]);
}

export default function NotifikasiScreen() {
  const { token } = useAuth();

  const [daftar, setDaftar] = useState([]);
  const [belumDibaca, setBelumDibaca] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('semua'); // 'semua' | 'belum'

  const muat = useCallback(async () => {
    if (!token) return;
    try {
      const hasil = await ambilNotifikasi(token);
      setDaftar(hasil.daftar);
      setBelumDibaca(hasil.belumDibaca);
      setError('');
    } catch (e) {
      setError(e.message || 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // Muat ulang setiap layar ini dibuka
  useFocusEffect(
    useCallback(() => {
      muat();
    }, [muat])
  );

  const kembali = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/beranda');
  };

  const bukaNotifikasi = async (item) => {
    if (!item.dibaca) {
      // Ubah tampilan dulu, lalu kabari server
      setDaftar((lama) => lama.map((n) => (n.id === item.id ? { ...n, dibaca: true } : n)));
      setBelumDibaca((j) => Math.max(0, j - 1));
      try {
        await tandaiDibaca(token, item.id);
      } catch (e) {
        muat(); // gagal: samakan lagi dengan data server
      }
    }
    const layar = item.data?.screen;
    if (layar) router.replace(layar);
  };

  const tandaiSemua = async () => {
    if (belumDibaca === 0) return;
    try {
      await tandaiSemuaDibaca(token);
      setDaftar((lama) => lama.map((n) => ({ ...n, dibaca: true })));
      setBelumDibaca(0);
    } catch (e) {
      alert(e.message || 'Gagal menandai notifikasi');
    }
  };

  const tampil = tab === 'belum' ? daftar.filter((n) => !n.dibaca) : daftar;
  const kelompok = kelompokkan(tampil);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={kembali} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifikasi</Text>
        </View>
        <TouchableOpacity
          style={styles.readAllButton}
          onPress={tandaiSemua}
          disabled={belumDibaca === 0}
        >
          <MaterialCommunityIcons
            name="check-all"
            size={18}
            color={belumDibaca === 0 ? '#94A3B8' : '#0052CC'}
          />
          <Text style={[styles.readAllText, belumDibaca === 0 && styles.readAllTextOff]}>
            Tandai Dibaca
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabChip, tab === 'semua' && styles.tabChipActive]}
          onPress={() => setTab('semua')}
        >
          <Text style={[styles.tabText, tab === 'semua' && styles.tabTextActive]}>
            Semua ({daftar.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabChip, tab === 'belum' && styles.tabChipActive]}
          onPress={() => setTab('belum')}
        >
          <Text style={[styles.tabText, tab === 'belum' && styles.tabTextActive]}>
            Belum Dibaca ({belumDibaca})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#0052CC" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                muat();
              }}
              colors={['#0052CC']}
            />
          }
        >
          {error !== '' && (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#B91C1C" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={muat}>
                <Text style={styles.retryText}>Coba lagi</Text>
              </TouchableOpacity>
            </View>
          )}

          {error === '' && kelompok.length === 0 && (
            <View style={styles.emptyBox}>
              <View style={styles.emptyCircle}>
                <MaterialCommunityIcons name="bell-off-outline" size={34} color="#0052CC" />
              </View>
              <Text style={styles.emptyTitle}>
                {tab === 'belum' ? 'Tidak ada yang belum dibaca' : 'Belum ada notifikasi'}
              </Text>
              <Text style={styles.emptySub}>
                Info stok menipis, stok habis, dan aktivitas pegawai akan muncul di sini.
              </Text>
            </View>
          )}

          {kelompok.map((grup) => (
            <View key={grup.label}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>{grup.label}</Text>
                <Text style={styles.sectionCount}>{grup.item.length} Notifikasi</Text>
              </View>

              {grup.item.map((n) => {
                const j = JENIS[n.jenis] || JENIS_LAIN;
                return (
                  <TouchableOpacity
                    key={n.id}
                    style={[styles.card, !n.dibaca && styles.cardUnread]}
                    onPress={() => bukaNotifikasi(n)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.iconBox, { backgroundColor: j.bg }]}>
                      <MaterialCommunityIcons name={j.icon} size={22} color={j.warna} />
                    </View>

                    <View style={styles.cardBody}>
                      <View style={styles.cardTopRow}>
                        <View style={[styles.tagPill, { backgroundColor: j.bg }]}>
                          <Text style={[styles.tagText, { color: j.warna }]}>{j.label}</Text>
                        </View>
                        <View style={styles.timeRow}>
                          {!n.dibaca && <View style={styles.unreadDot} />}
                          <Text style={styles.timeText}>{labelWaktu(new Date(n.dibuat_pada))}</Text>
                        </View>
                      </View>
                      <Text style={styles.cardTitle}>{n.judul}</Text>
                      <Text style={styles.cardDesc}>{n.isi}</Text>
                    </View>

                    {n.data?.screen ? (
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
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
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  readAllButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  readAllText: { fontSize: 12, fontWeight: '700', color: '#0052CC' },
  readAllTextOff: { color: '#94A3B8' },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  tabChipActive: { backgroundColor: '#0052CC' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#FFFFFF' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155' },
  sectionCount: { fontSize: 11, color: '#64748B' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardUnread: { borderColor: '#BFD4F6', backgroundColor: '#F5F9FF' },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#0052CC' },
  timeText: { fontSize: 11, color: '#64748B' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  cardDesc: { fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 17 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 12, color: '#B91C1C' },
  retryText: { fontSize: 12, fontWeight: '700', color: '#0052CC' },
  emptyBox: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  emptyCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  emptySub: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },
});
