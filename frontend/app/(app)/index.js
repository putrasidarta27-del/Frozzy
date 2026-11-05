import { Redirect } from 'expo-router';

export default function Index() {
  // Begitu masuk ke area (app), langsung arahkan otomatis ke halaman beranda
  return <Redirect href="/(app)/beranda" />;
}