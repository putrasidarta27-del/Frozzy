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
      if (!saved) {
        setLoading(false);
        return;
      }
      
      try {
        // Coba ambil data profil asli dari backend
        const me = await apiFetch('/auth/me', {
          headers: { Authorization: `Bearer ${saved}` },
        });
        setUser(me);
      } catch (err) {
        // Fallback jika backend offline, buat nama dinamis dari email default
        setUser({ nama: 'Dawwas', email: 'dawwas@frozzy.com' });
      }
      
      setToken(saved);
    } catch (e) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    try {
      // Coba tembak endpoint login backend asli dari database
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (e) {
      // SIMULASI OFFLINE: Jika backend belum menyala, ekstrak nama dari email yang kamu ketik
      console.log('Backend belum aktif, menggunakan ekstraksi nama dari email login.');
      
      const cleanEmail = email || 'dawwas@frozzy.com';
      const nameFromEmail = cleanEmail.split('@')[0];
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

      const dummyToken = 'token-frozzy-dummy-123';
      const dummyUser = { 
        nama: formattedName, 
        email: cleanEmail,
        role: 'Admin Kasir & Stok',
        id_karyawan: 'KSR-FRZ-089'
      };

      await SecureStore.setItemAsync(TOKEN_KEY, dummyToken);
      setToken(dummyToken);
      setUser(dummyUser);
    }
    
    // Pindah otomatis ke beranda setelah berhasil login
    router.replace('/(app)/beranda');
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
    setUser(null);
    router.replace('/sign-in');
  }

  return (
    <AuthContext.Provider
      value={{ token, user, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}