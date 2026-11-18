import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = '#0052CC';
const INACTIVE_COLOR = '#334155';

// Daftar menu: icon biasa (outline) dan icon saat aktif (terisi)
const NAV_ITEMS = [
  { key: 'beranda', label: 'Beranda', icon: 'home-outline', iconActive: 'home', route: '/(app)/beranda' },
  { key: 'produk', label: 'Produk', icon: 'archive-outline', iconActive: 'archive', route: '/(app)/produk' },
  { key: 'penjualan', label: 'Penjualan', icon: 'cash-register', iconActive: 'cash-register', route: '/(app)/penjualan' },
  { key: 'transaksi', label: 'Transaksi', icon: 'receipt-text-outline', iconActive: 'receipt-text', route: '/(app)/transaksi' },
  { key: 'profil', label: 'Profil', icon: 'account-outline', iconActive: 'account', route: '/(app)/profil' },
];

export default function BottomNav({ active }) {
  const insets = useSafeAreaInsets();

  const handlePress = (item) => {
    if (item.key === active) return;

    if (item.route) {
      router.replace(item.route);
    } else {
      // Halaman belum dibuat
      Alert.alert(item.label, 'Halaman ini belum tersedia.');
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => handlePress(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isActive ? item.iconActive : item.icon}
              size={25}
              color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  labelActive: {
    color: '#0052CC',
    fontWeight: '700',
  },
});