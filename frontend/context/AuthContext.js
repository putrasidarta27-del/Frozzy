import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '../services/api';
import { router } from 'expo-router';

const AuthContext = createContext(null);
const TOKEN_KEY = 'access_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const saved = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!saved) return;

      // [DIUBAH] Tanpa akun cadangan: kalau token tidak valid, sesi dihapus
      const me = await apiFetch('/auth/me', {
        headers: { Authorization: `Bearer ${saved}` },
      });
      setToken(saved);
      setUser(me);
    } catch (e) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    // [DIUBAH] Kalau gagal, error dilempar ke layar login
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    // Pindah otomatis ke beranda setelah berhasil login
    router.replace('/(app)/beranda');
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
    router.replace('/sign-in');
  }

  // [DITAMBAHKAN] Ubah nama / email lewat PUT /auth/profil
  async function updateProfile(nama, email) {
    const data = await apiFetch('/auth/profil', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nama, email }),
    });
    setUser(data.user); // profil di layar ikut berubah
    return data;
  }

  return (
    <AuthContext.Provider
      value={{ token, user, loading, signIn, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// [DIUBAH] Blok updateProfile kedua yang tadinya menumpuk di dalam useAuth
// dikeluarkan dari kode aktif (tidak pernah berjalan, dan memakai setUser yang
// tidak ada di sana). Versi yang dipakai adalah updateProfile di dalam AuthProvider.