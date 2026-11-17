import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../../components/BottomNav';
import { daftarTransaksi, formatRupiah, hitungTotal, hitungItem } from '../../data/transaksiData';

const filterTabs = [
  { key: 'semua', label: 'Semua' },
  { key: 'hari-ini', label: 'Hari Ini' },
  { key: 'minggu-ini', label: 'Minggu Ini' },
];

export default function TransaksiScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('semua');

  // Semua transaksi contoh bertanggal 24 Sep 2025, jadi chip periode tidak mengubah isi daftar.
  const filteredTransaksi = daftarTransaksi.filter((trx) =>
    trx.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header Atas */}
      <View style={styles.header}>
        <View style={styles.logoArea}>
          <View style={styles.logoIconBox}>
            <MaterialCommunityIcons name="snowflake" size={20} color="#0052CC" />
          </View>
          <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        </View>

        <View style={styles.syncPill}>
          <MaterialCommunityIcons name="cellphone-check" size={14} color="#0052CC" />
          <Text style={styles.syncText}>Lokal</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Kolom Pencarian & Tombol Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nomor transaksi TRX..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="characters"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <MaterialCommunityIcons name="close" size={14} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => Alert.alert('Filter', 'Filter lanjutan belum tersedia.')}
          >
            <MaterialCommunityIcons name="tune-variant" size={20} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* Chip Periode */}
        <View style={styles.chipRow}>
          {filterTabs.map((tab) => {
            const aktif = tab.key === activeFilter;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.chip, aktif && styles.chipActive]}
                onPress={() => setActiveFilter(tab.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, aktif && styles.chipTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Judul Seksi */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>HARI INI (24 SEP 2025)</Text>
          <Text style={styles.sectionCount}>{filteredTransaksi.length} Transaksi</Text>
        </View>

        {/* Daftar Transaksi */}
        {filteredTransaksi.length > 0 ? (
          filteredTransaksi.map((trx) => (
            <TouchableOpacity
              key={trx.id}
              style={styles.trxCard}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/(app)/detail-transaksi', params: { id: trx.id } })}
            >
              <View style={styles.trxTopRow}>
                <View style={styles.trxIconBox}>
                  <MaterialCommunityIcons name="receipt-text-outline" size={22} color="#0052CC" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trxCode}>{trx.id}</Text>
                  <Text style={styles.trxDate}>{trx.tanggalPendek}, {trx.jam} WIB</Text>
                </View>
                <View style={styles.successBadge}>
                  <Text style={styles.successText}>Berhasil</Text>
                </View>
              </View>

              <View style={styles.trxBottomRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trxLabel}>Item Pembelian</Text>
                  <Text style={styles.trxItems} numberOfLines={1}>
                    {hitungItem(trx)} item
                  </Text>
                </View>
                <View style={styles.totalBox}>
                  <Text style={styles.trxLabel}>Total Tagihan</Text>
                  <Text style={styles.trxTotal}>{formatRupiah(hitungTotal(trx))}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="receipt-text-remove-outline" size={46} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Transaksi tidak ditemukan</Text>
            <Text style={styles.emptySubtitle}>Periksa kembali nomor transaksi atau periode yang dipilih.</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery('');
                setActiveFilter('semua');
              }}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>Reset Pencarian</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Catatan Bawah */}
        {filteredTransaksi.length > 0 && (
          <View style={styles.notePill}>
            <MaterialCommunityIcons name="lock-outline" size={13} color="#475569" />
            <Text style={styles.noteText}>Semua transaksi tersimpan di perangkat</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigasi Menu Bawah */}
      <BottomNav active="transaksi" />
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EBF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
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
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
  },
  chipActive: {
    backgroundColor: '#0052CC',
    borderColor: '#0052CC',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  trxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trxTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  trxIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EBF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trxCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  trxDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  successBadge: {
    borderWidth: 1,
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  successText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  trxBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  trxLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 3,
  },
  trxItems: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  trxItemsDetail: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
  },
  totalBox: {
    alignItems: 'flex-end',
  },
  trxTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0052CC',
  },
  notePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 8,
  },
  noteText: {
    fontSize: 11,
    color: '#475569',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#0052CC',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});