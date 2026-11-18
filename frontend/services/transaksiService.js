// Penghubung aplikasi ke API transaksi di backend
import { BASE_URL } from './produkService';

// Request JSON biasa (tanpa foto), jadi cukup memakai fetch
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

export function ambilSemuaTransaksi(token) {
  return kirimJson('/transaksi', token);
}

export function ambilDetailTransaksi(token, id) {
  return kirimJson(`/transaksi/${id}`, token);
}

// items: [{ id_produk: 3, jumlah: 2 }]
export function buatTransaksiDiServer(token, metode, items) {
  return kirimJson('/transaksi', token, {
    method: 'POST',
    body: JSON.stringify({ metode, items }),
  });
}