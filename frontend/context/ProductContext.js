import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductContext = createContext();

const STORAGE_KEY = 'frozzy_custom_products';
const EDITS_KEY = 'frozzy_default_edits';
// [DITAMBAHKAN] Kunci untuk menyimpan id produk bawaan yang sudah dihapus
const DELETED_KEY = 'frozzy_deleted_defaults';
const DEFAULT_IDS = ['1', '2', '3', '4'];

export function ProductProvider({ children }) {
  const [produkList, setProdukList] = useState([
    {
      id: '1',
      nama: 'Nugget Kanzler Kriuk 500g',
      kategori: 'Frozen Food',
      sku: 'SKU-CKN01',
      harga: 'Rp42.000',
      stok: '45 pcs',
      temp: '-18°C',
      image: require('../assets/images/kanzler.jpeg'),
      deskripsi: 'Nugget ayam renyah kualitas premium. Simpan beku di suhu -18°C.',
    },
    {
      id: '2',
      nama: 'Sosis Sapi Premium 500g',
      kategori: 'Frozen Food',
      sku: 'SKU-BFF02',
      harga: 'Rp48.000',
      stok: '32 pcs',
      temp: '-18°C',
      image: require('../assets/images/sapi.jpg'),
      deskripsi: 'Sosis sapi pilihan berkualitas. Simpan beku di suhu -18°C.',
    },
    {
      id: '3',
      nama: 'Fish Roll Olahan Ikan 500g',
      kategori: 'Seafood',
      sku: 'SKU-FSH03',
      harga: 'Rp35.000',
      stok: '20 pcs',
      temp: '-20°C',
      image: require('../assets/images/fish roll.jpeg'),
      deskripsi: 'Fish roll olahan ikan segar. Simpan beku di suhu -18°C.',
    },
    {
      id: '4',
      nama: 'Bakso Sapi Super 500g',
      kategori: 'Daging',
      sku: 'SKU-BKS04',
      harga: 'Rp55.000',
      stok: '18 pcs',
      temp: '-18°C',
      image: require('../assets/images/bakso.jpg'),
      deskripsi: 'Bakso sapi super lezat. Simpan beku di suhu -18°C.',
    },
  ]);

  const [loaded, setLoaded] = useState(false);
  const [defaultEdits, setDefaultEdits] = useState({});
  // [DITAMBAHKAN] Id produk bawaan yang sudah dihapus
  const [deletedIds, setDeletedIds] = useState([]);

  // Muat produk tambahan, hasil edit, dan daftar hapus saat aplikasi dibuka
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const savedEdits = await AsyncStorage.getItem(EDITS_KEY);
        const savedDeleted = await AsyncStorage.getItem(DELETED_KEY); // [DITAMBAHKAN]
        const customProducts = saved ? JSON.parse(saved) : [];
        const edits = savedEdits ? JSON.parse(savedEdits) : {};
        const deleted = savedDeleted ? JSON.parse(savedDeleted) : []; // [DITAMBAHKAN]

        setDefaultEdits(edits);
        setDeletedIds(deleted); // [DITAMBAHKAN]
        setProdukList((prevList) => [
          ...customProducts,
          ...prevList
            .filter((p) => !deleted.includes(p.id)) // [DITAMBAHKAN] buang produk bawaan yang sudah dihapus
            .map((p) => (edits[p.id] ? { ...p, ...edits[p.id] } : p)),
        ]);
      } catch (e) {
        console.log('Gagal memuat produk:', e);
      } finally {
        setLoaded(true);
      }
    };
    loadProducts();
  }, []);

  // Simpan otomatis produk tambahan setiap daftar berubah
  useEffect(() => {
    if (!loaded) return;
    const customProducts = produkList.filter((p) => !DEFAULT_IDS.includes(p.id));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(customProducts)).catch((e) =>
      console.log('Gagal menyimpan produk:', e)
    );
  }, [produkList, loaded]);

  // Simpan otomatis hasil edit produk bawaan
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(EDITS_KEY, JSON.stringify(defaultEdits)).catch((e) =>
      console.log('Gagal menyimpan perubahan produk bawaan:', e)
    );
  }, [defaultEdits, loaded]);

  // [DITAMBAHKAN] Simpan otomatis daftar produk bawaan yang dihapus
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds)).catch((e) =>
      console.log('Gagal menyimpan daftar hapus:', e)
    );
  }, [deletedIds, loaded]);

  const addProduct = (newProduct) => {
    setProdukList((prevList) => [newProduct, ...prevList]);
  };

  const updateProduct = (id, perubahan) => {
    setProdukList((prevList) =>
      prevList.map((p) => (p.id === id ? { ...p, ...perubahan } : p))
    );
    if (DEFAULT_IDS.includes(id)) {
      setDefaultEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...perubahan } }));
    }
  };

  // [DITAMBAHKAN] Hapus produk berdasarkan id
  const deleteProduct = (id) => {
    setProdukList((prevList) => prevList.filter((p) => p.id !== id));
    if (DEFAULT_IDS.includes(id)) {
      setDeletedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
  };

  return (
    <ProductContext.Provider value={{ produkList, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}