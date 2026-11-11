import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductContext = createContext();

// [DITAMBAHKAN] Kunci penyimpanan & daftar id produk bawaan
const STORAGE_KEY = 'frozzy_custom_products';
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

  // [DITAMBAHKAN] Penanda bahwa proses memuat data tersimpan sudah selesai
  const [loaded, setLoaded] = useState(false);

  // [DITAMBAHKAN] Muat produk tambahan yang tersimpan saat aplikasi dibuka
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const customProducts = JSON.parse(saved);
          // Gabungkan: produk tersimpan di atas, produk bawaan tetap ada
          setProdukList((prevList) => [...customProducts, ...prevList]);
        }
      } catch (e) {
        console.log('Gagal memuat produk:', e);
      } finally {
        setLoaded(true);
      }
    };
    loadProducts();
  }, []);

  // [DITAMBAHKAN] Simpan otomatis produk tambahan setiap daftar berubah
  useEffect(() => {
    if (!loaded) return;
    const customProducts = produkList.filter((p) => !DEFAULT_IDS.includes(p.id));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(customProducts)).catch((e) =>
      console.log('Gagal menyimpan produk:', e)
    );
  }, [produkList, loaded]);

  const addProduct = (newProduct) => {
    setProdukList((prevList) => [newProduct, ...prevList]);
  };

  return (
    <ProductContext.Provider value={{ produkList, addProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductContext);
}