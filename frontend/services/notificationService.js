// Penghubung aplikasi ke API notifikasi di backend
import { BASE_URL } from './produkService';

// Request JSON biasa (pola sama dengan transaksiService.js)
async function kirimJson(path, token, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.pesan || 'Request gagal');
  }
  return data;
}

// Daftar notifikasi milik user yang login + jumlah yang belum dibaca.
export async function ambilNotifikasi(token) {
  // Respons backend: { belum_dibaca: 6, data: [ ... ] }
  const hasil = await kirimJson('/notifications', token);
  return {
    daftar: hasil.data || [],
    belumDibaca: Number(hasil.belum_dibaca || 0),
  };
}

// Hanya jumlahnya, untuk titik merah di lonceng
export async function ambilJumlahBelumDibaca(token) {
  // Respons backend: { jumlah: 6 }
  const hasil = await kirimJson('/notifications/belum-dibaca', token);
  return Number(hasil.jumlah || 0);
}

// Tandai satu notifikasi (milik sendiri) sebagai dibaca
export function tandaiDibaca(token, id) {
  return kirimJson(`/notifications/${id}/dibaca`, token, { method: 'PUT' });
}

// Tandai semua notifikasi milik sendiri sebagai dibaca
export function tandaiSemuaDibaca(token) {
  return kirimJson('/notifications/dibaca-semua', token, { method: 'PUT' });
}

// Mendaftarkan token push HP ini ke backend (milik user yang sedang login)
export function daftarkanTokenPush(token, expoPushToken) {
  return kirimJson('/notifications/token', token, {
    method: 'POST',
    body: JSON.stringify({ expo_push_token: expoPushToken }),
  });
}


  
