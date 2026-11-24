import { useCallback, useState } from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ambilJumlahBelumDibaca } from '../services/notificationService';

// Lonceng notifikasi: titik merah hanya muncul bila ada notifikasi belum dibaca.
// Jumlah diambil dari server setiap layar yang memakai lonceng ini dibuka.
export default function NotifBell() {
  const { token } = useAuth();
  const [jumlah, setJumlah] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!token) return undefined;
      let batal = false;

      ambilJumlahBelumDibaca(token)
        .then((n) => {
          if (!batal) setJumlah(n);
        })
        .catch(() => {
          // Gagal memuat: biarkan tampilan terakhir, tanpa pesan error
        });

      return () => {
        batal = true;
      };
    }, [token])
  );

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push('/(app)/notifikasi')}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name="bell-outline" size={20} color="#334155" />
      {jumlah > 0 && <View style={styles.redDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    backgroundColor: '#F4F5F7',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  redDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});
