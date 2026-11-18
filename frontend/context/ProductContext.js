import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  BASE_URL,
  ambilSemuaProduk,
  tambahProdukKeServer,
  ubahProdukDiServer,
  hapusProdukDiServer,
} from '../services/produkService';

const ProductContext = createContext();

// Gambar 4 produk bawaan, dicocokkan lewat barcode/SKU
const GAMBAR_BAWAAN = {
  'SKU-CKN01': require('../assets/images/kanzler.jpeg'),
  'SKU-BFF02': require('../assets/images/sapi.jpg'),
  'SKU-FSH03': require('../assets/images/fish roll.jpeg'),
  'SKU-BKS04': require('../assets/images/bakso.jpg'),
};

// Bentuk database -> bentuk layar
function dariDatabase(row) {
  let image = null;
  if (row.image_url) image = { uri: `${BASE_URL}${row.image_url}` };
  else if (GAMBAR_BAWAAN[row.barcode]) image = GAMBAR_BAWAAN[row.barcode];

  return {
    id: String(row.id_produk),
    nama: row.nama_produk,
    kategori: row.kategori,
    sku: row.barcode,
    harga: `Rp${Number(row.harga_jual).toLocaleString('id-ID')}`,
    stok: `${row.stok_terakhir} pcs`,
    temp: '-18°C',
    image,
    deskripsi: row.deskripsi || '',
  };
}

// Bentuk layar -> data kirim ke server (hanya field yang ada)
function keDataServer(p) {
  const data = {};
  if (p.nama !== undefined) data.nama_produk = p.nama;
  if (p.kategori !== undefined) data.kategori = p.kategori;
  if (p.sku !== undefined) data.barcode = p.sku;
  if (p.harga !== undefined) data.harga_jual = String(p.harga).replace(/\D/g, '');
  if (p.stok !== undefined) data.stok_terakhir = String(parseInt(p.stok, 10) || 0);
  if (p.deskripsi !== undefined) data.deskripsi = p.deskripsi;
  return data;
}

// Foto hanya diunggah kalau berasal dari HP (bukan alamat dari server)
function fotoLokal(p) {
  const uri = p.image?.uri;
  return uri && !uri.startsWith('http') ? uri : null;
}

export function ProductProvider({ children }) {
  const { token } = useAuth();
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(false);

  const muatProduk = useCallback(async () => {
    if (!token) {
      setProdukList([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await ambilSemuaProduk(token);
      setProdukList(rows.map(dariDatabase));
    } catch (e) {
      console.log('Gagal memuat produk:', e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    muatProduk();
  }, [muatProduk]);

  // Mengembalikan produk yang tersimpan (id dari database)
  const addProduct = async (produkBaru) => {
    const row = await tambahProdukKeServer(token, keDataServer(produkBaru), fotoLokal(produkBaru));
    const tersimpan = dariDatabase(row);
    setProdukList((prev) => [tersimpan, ...prev]);
    return tersimpan;
  };

  const updateProduct = async (id, perubahan) => {
    const row = await ubahProdukDiServer(token, id, keDataServer(perubahan), fotoLokal(perubahan));
    const tersimpan = dariDatabase(row);
    setProdukList((prev) => prev.map((p) => (p.id === id ? tersimpan : p)));
    return tersimpan;
  };

  const deleteProduct = async (id) => {
    await hapusProdukDiServer(token, id);
    setProdukList((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ProductContext.Provider
      value={{ produkList, loading, refresh: muatProduk, addProduct, updateProduct, deleteProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}