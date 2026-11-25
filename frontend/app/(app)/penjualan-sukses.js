import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransaksi } from '../../context/TransaksiContext';

const rupiah = (n) => `Rp${Number(n).toLocaleString('id-ID')}`;

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
export default function PenjualanSuksesScreen() {
  const params = useLocalSearchParams();
  const { transaksiList } = useTransaksi();
  const insets = useSafeAreaInsets();

  // Transaksi yang baru dibuat ada di urutan teratas daftar
  const trx = transaksiList.find((t) => t.id === params.id) || transaksiList[0];

  // [DITAMBAHKAN] Data stok sebelum -> sesudah, dikirim dari layar pembayaran (Figma hal. 20)
  let stokBerubah = [];
  try {
    stokBerubah = JSON.parse(params.stok || '[]');
  } catch (e) {
    stokBerubah = [];
  }

  const downloadStrukPDF = async () => {
    if (!trx) {
      Alert.alert('Gagal', 'Data transaksi tidak ditemukan.');
      return;
    }

    try {
      const daftarProduk = (trx.items || []).map((it) => `
        <tr>
          <td>
            <strong>${escapeHtml(it.nama)}</strong><br/>
            <small>${Number(it.qty)} x ${rupiah(it.harga)}</small>
          </td>
          <td class="right">${rupiah(it.subtotal)}</td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8"/>
          <style>
            @page { size: 80mm auto; margin: 2mm; }
            * { box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              color: #1e293b;
              font-size: 12px;
              width: 76mm;
              margin: 0 auto;
            }
            header { text-align: center; margin-bottom: 18px; }
            h1 { color: #0052CC; font-size: 27px; margin: 0 0 5px; }
            h2 { font-size: 15px; margin: 8px 0; }
            .muted { color: #64748b; font-size: 10px; }
            .line { border-top: 1px dashed #94a3b8; margin: 12px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 7px 0; vertical-align: top; }
            .right { text-align: right; white-space: nowrap; }
            .total { font-size: 16px; font-weight: bold; color: #0052CC; }
            .footer { text-align: center; margin-top: 22px; }
          </style>
        </head>
        <body>
          <header>
            <h1>FROZZY</h1>
            <div class="muted">STRUK PEMBELANJAAN</div>
            <h2>Terima kasih sudah berbelanja!</h2>
          </header>

          <div class="line"></div>
          <div>No. Transaksi: ${escapeHtml(trx.id)}</div>
          <div>Tanggal: ${escapeHtml(trx.tanggalPendek)}</div>
          <div>Waktu: ${escapeHtml(trx.jam)} WIB</div>
          <div>Kasir: ${escapeHtml(trx.kasir || '-')}</div>
          <div class="line"></div>

          <table>
            ${daftarProduk}
          </table>

          <div class="line"></div>
          <table>
            <tr>
              <td>Metode Pembayaran</td>
              <td class="right">${escapeHtml(trx.metode)}</td>
            </tr>
            <tr>
              <td>Total Item</td>
              <td class="right">${Number(trx.jumlahItem)} pcs</td>
            </tr>
            <tr>
              <td class="total">TOTAL</td>
              <td class="right total">${rupiah(trx.total)}</td>
            </tr>
          </table>

          <div class="line"></div>
          <div class="footer">
            <strong>FROZZY</strong><br/>
            <span class="muted">Sampai jumpa kembali!</span>
          </div>
        </body>
        </html>
      `;

      await Print.printAsync({ html });
    } catch (error) {
      console.error('Gagal membuat struk PDF:', error);
      Alert.alert('Gagal Membuat PDF', error?.message || String(error));
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.successOuter}>
          <View style={styles.successMiddle}>
            <View style={styles.successInner}>
              <MaterialCommunityIcons name="check" size={38} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Transaksi Berhasil Disimpan</Text>
        <Text style={styles.subtitle}>Transaksi tersimpan di database dan stok produk sudah dikurangi.</Text>

        {trx && (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.kode}>{trx.id}</Text>
              <View style={styles.badge}>
                <View style={styles.dot} />
                <Text style={styles.badgeText}>Berhasil</Text>
              </View>
            </View>
            <Text style={styles.waktu}>{trx.tanggalPendek}, {trx.jam} WIB</Text>

            <View style={styles.divider} />

            {trx.items.map((it, i) => (
              <View key={it.sku + i} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNama}>{it.nama}</Text>
                  <Text style={styles.itemQty}>{it.qty}x @{rupiah(it.harga)}</Text>
                </View>
                <Text style={styles.itemTotal}>{rupiah(it.subtotal)}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.rowBetween}>
              <Text style={styles.label}>Metode Pembayaran</Text>
              <Text style={styles.value}>{trx.metode}</Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <Text style={styles.label}>Total Item</Text>
              <Text style={styles.value}>{trx.jumlahItem} pcs</Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <Text style={styles.grandLabel}>Total Transaksi</Text>
              <Text style={styles.grandValue}>{rupiah(trx.total)}</Text>
            </View>
          </View>
        )}

        {/* [DITAMBAHKAN] Rincian pengurangan stok */}
        {stokBerubah.length > 0 && (
          <View style={styles.stokCard}>
            <View style={styles.stokHeader}>
              <MaterialCommunityIcons name="archive-check-outline" size={20} color="#15803D" />
              <Text style={styles.stokTitle}>Stok Berhasil Dikurangi Otomatis</Text>
            </View>
            {stokBerubah.map((s, i) => (
              <View key={s.nama + i} style={styles.stokRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stokNama}>{s.nama}</Text>
                  <Text style={styles.stokAngka}>
                    {s.sebelum} {'â†’'} <Text style={styles.stokBaru}>{s.sesudah} pcs</Text>
                  </Text>
                </View>
                <View style={styles.minusBadge}>
                  <Text style={styles.minusText}>-{s.jumlah}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {trx && (
          <TouchableOpacity
            style={styles.pdfBtn}
            onPress={downloadStrukPDF}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={21} color="#FFFFFF" />
            <Text style={styles.primaryText}>Download Struk PDF</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(app)/penjualan')} activeOpacity={0.85}>
          <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.primaryText}>Transaksi Baru</Text>
        </TouchableOpacity>

        {/* [DITAMBAHKAN] Lihat Detail Transaksi (Figma hal. 20) */}
        {trx && (
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => router.push({ pathname: '/(app)/detail-transaksi', params: { id: trx.id } })}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="receipt-text-outline" size={20} color="#0052CC" />
            <Text style={styles.outlineText}>Lihat Detail Transaksi</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(app)/beranda')} activeOpacity={0.7}>
          <MaterialCommunityIcons name="home-outline" size={20} color="#475569" />
          <Text style={styles.secondaryText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 270 },
  successOuter: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#E6F9EF',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  successMiddle: {
    width: 92, height: 92, borderRadius: 46, backgroundColor: '#BBF7D0',
    justifyContent: 'center', alignItems: 'center',
  },
  successInner: {
    width: 68, height: 68, borderRadius: 34, backgroundColor: '#15803D',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  card: {
    width: '100%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kode: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#16A34A' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  waktu: { fontSize: 12, color: '#64748B', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  itemNama: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  itemQty: { fontSize: 12, color: '#64748B', marginTop: 2 },
  itemTotal: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  label: { fontSize: 13, color: '#64748B' },
  value: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  grandLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  grandValue: { fontSize: 19, fontWeight: '700', color: '#0052CC' },
  stokCard: {
    width: '100%', backgroundColor: '#F0FDF4', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  stokHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  stokTitle: { fontSize: 14, fontWeight: '700', color: '#15803D' },
  stokRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF',
    borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#DCFCE7', marginBottom: 8,
  },
  stokNama: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  stokAngka: { fontSize: 12, color: '#64748B', marginTop: 3 },
  stokBaru: { fontWeight: '700', color: '#0052CC' },
  minusBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  minusText: { fontSize: 12, fontWeight: '700', color: '#B91C1C' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F8FAFC',
    paddingHorizontal: 20, paddingTop: 12, gap: 10,
  },
  pdfBtn: {
    flexDirection: 'row',
    backgroundColor: '#15803D',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },  primaryBtn: {
    flexDirection: 'row', backgroundColor: '#0052CC', paddingVertical: 15, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  outlineBtn: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#0052CC',
  },
  outlineText: { color: '#0052CC', fontSize: 14, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  secondaryText: { color: '#475569', fontSize: 13, fontWeight: '600' },
});
