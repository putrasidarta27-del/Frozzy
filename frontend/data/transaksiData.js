// Data transaksi contoh bersama (dipakai Beranda, Riwayat, dan Detail).
// Harga per baris adalah harga saat transaksi terjadi, sehingga boleh berbeda dari harga katalog sekarang.
export const daftarTransaksi = [
  {
    id: 'TRX-20250924-003',
    tanggalPendek: '24 Sep 2025',
    tanggalLengkap: '24 September 2025',
    jam: '14:46',
    items: [
      { sku: 'SKU-CKN01', nama: 'Chicken Nugget Crispy 500g', qty: 2, harga: 42000 },
      { sku: 'SKU-BFF02', nama: 'Sosis Sapi Premium 500g', qty: 1, harga: 48000 },
    ],
  },
  {
    id: 'TRX-20250924-002',
    tanggalPendek: '24 Sep 2025',
    tanggalLengkap: '24 September 2025',
    jam: '12:15',
    items: [
      { sku: 'SKU-CKN01', nama: 'Nugget Kanzler Kriuk 500g', qty: 1, harga: 40000 },
      { sku: 'SKU-BFF02', nama: 'Sosis Sapi Premium 500g', qty: 1, harga: 45000 },
    ],
  },
  {
    id: 'TRX-20250924-001',
    tanggalPendek: '24 Sep 2025',
    tanggalLengkap: '24 September 2025',
    jam: '14:32',
    items: [
      { sku: 'SKU-CKN01', nama: 'Nugget Kanzler Kriuk 500g', qty: 1, harga: 42000 },
      { sku: 'SKU-BFF02', nama: 'Sosis Sapi Premium 500g', qty: 1, harga: 48000 },
      { sku: 'SKU-FSH03', nama: 'Fish Roll Olahan Ikan 500g', qty: 2, harga: 35000 },
    ],
  },
];

export const formatRupiah = (angka) => `Rp${angka.toLocaleString('id-ID')}`;
export const hitungTotal = (trx) => trx.items.reduce((s, i) => s + i.qty * i.harga, 0);
export const hitungItem = (trx) => trx.items.reduce((s, i) => s + i.qty, 0);