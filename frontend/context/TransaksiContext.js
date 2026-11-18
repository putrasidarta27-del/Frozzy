import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useProducts } from './ProductContext';
import {
  ambilSemuaTransaksi,
  ambilDetailTransaksi,
  buatTransaksiDiServer,
} from '../services/transaksiService';

const TransaksiContext = createContext();

// Daftar metode pembayaran di SATU tempat. Nama harus sama dengan METODE_VALID di backend.
// Menambah metode: tambah satu baris di sini dan satu item di backend/routes/transaksi.js.
export const METODE_PEMBAYARAN = [
  { key: 'Tunai', label: 'Tunai', icon: 'cash' },
  { key: 'QRIS', label: 'QRIS', icon: 'qrcode-scan' },
  { key: 'Transfer', label: 'Transfer', icon: 'bank-transfer' },
];

const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const BULAN_PANJANG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const dua = (n) => String(n).padStart(2, '0');

// Server mengirim waktu UTC (huruf Z). Di sini diubah ke WIB (UTC+7),
// dihitung manual supaya hasilnya sama di HP mana pun.
function waktuWib(iso) {
  const d = new Date(new Date(iso).getTime() + 7 * 60 * 60 * 1000);
  const tgl = d.getUTCDate();
  const bln = d.getUTCMonth();
  const thn = d.getUTCFullYear();
  return {
    tanggalPendek: `${tgl} ${BULAN_PENDEK[bln]} ${thn}`,
    tanggalLengkap: `${tgl} ${BULAN_PANJANG[bln]} ${thn}`,
    jam: `${dua(d.getUTCHours())}:${dua(d.getUTCMinutes())}`,
    kunciTanggal: `${thn}-${dua(bln + 1)}-${dua(tgl)}`, // untuk filter periode nanti
  };
}

// Bentuk dari server -> bentuk untuk layar
// Catatan: daftar (GET /transaksi) tidak membawa items, hanya total & jumlahItem.
function dariServer(row) {
  const w = waktuWib(row.tanggal);
  return {
    id: row.kode, // contoh: TRX-20261118-001
    idTransaksi: row.id_transaksi,
    tanggalPendek: w.tanggalPendek,
    tanggalLengkap: w.tanggalLengkap,
    jam: w.jam,
    kunciTanggal: w.kunciTanggal,
    metode: row.metode,
    kanal: row.kanal,
    kasir: row.kasir,
    total: row.total_transaksi,
    jumlahItem: row.jumlah_item,
    items: (row.items || []).map((i) => ({
      idProduk: i.id_produk,
      sku: i.barcode,
      nama: i.nama_produk,
      qty: i.jumlah,
      harga: i.harga_satuan,
      subtotal: i.subtotal,
      imageUrl: i.image_url,
    })),
  };
}

export function TransaksiProvider({ children }) {
  const { token } = useAuth();
  const { refresh: refreshProduk } = useProducts();
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(false);

  const muatTransaksi = useCallback(async () => {
    if (!token) {
      setTransaksiList([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await ambilSemuaTransaksi(token);
      setTransaksiList(rows.map(dariServer));
    } catch (e) {
      console.log('Gagal memuat transaksi:', e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    muatTransaksi();
  }, [muatTransaksi]);

  // Simpan penjualan. items: [{ id_produk, jumlah }]. Mengembalikan transaksi lengkap.
  const buatTransaksi = async (metode, items) => {
    const row = await buatTransaksiDiServer(token, metode, items);
    const trx = dariServer(row);
    setTransaksiList((prev) => [trx, ...prev]);
    refreshProduk(); // stok di katalog ikut diperbarui
    return trx;
  };

  // Ambil satu transaksi lengkap dengan itemnya (untuk nota)
  const ambilDetail = async (idTransaksi) => {
    const row = await ambilDetailTransaksi(token, idTransaksi);
    return dariServer(row);
  };

  return (
    <TransaksiContext.Provider
      value={{ transaksiList, loading, refresh: muatTransaksi, buatTransaksi, ambilDetail }}
    >
      {children}
    </TransaksiContext.Provider>
  );
}

export function useTransaksi() {
  return useContext(TransaksiContext);
}