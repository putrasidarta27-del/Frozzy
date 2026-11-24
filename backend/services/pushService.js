// backend/services/pushService.js
// Tugas file ini: mengirim notifikasi ke Expo Push Service.
// Expo lalu meneruskannya ke FCM dan sampai ke HP Android.

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Token Expo selalu berbentuk ExponentPushToken[...] atau ExpoPushToken[...]
export function tokenExpoValid(token) {
  return (
    typeof token === 'string' &&
    /^(ExponentPushToken|ExpoPushToken)\[.+\]$/.test(token)
  );
}

// Kirim satu pesan ke satu token.
export async function kirimExpoPush(token, judul, isi, data = {}) {
  return kirimExpoPushBanyak([token], judul, isi, data);
}

// Kirim pesan yang sama ke banyak token sekaligus.
// Fungsi ini TIDAK melempar error: kalau gagal, hasilnya berisi pesan error.
// Tujuannya supaya transaksi atau login tidak ikut gagal gara-gara push.
export async function kirimExpoPushBanyak(daftarToken, judul, isi, data = {}) {
  const tokenValid = (daftarToken || []).filter(tokenExpoValid);

  if (tokenValid.length === 0) {
    return { terkirim: 0, hasil: [], pesan: 'Tidak ada token valid' };
  }

  const pesan = tokenValid.map((to) => ({
    to,
    title: judul,
    body: isi,
    data,
    sound: 'default',
    channelId: 'default',
  }));

  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pesan),
    });

    const json = await res.json();
    return { terkirim: tokenValid.length, hasil: json.data || json };
  } catch (e) {
    console.error('Gagal kirim push ke Expo:', e.message);
    return { terkirim: 0, hasil: [], pesan: e.message };
  }
}