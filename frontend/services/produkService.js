// Penghubung aplikasi ke API produk di backend
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// [DIUBAH] Memakai XMLHttpRequest supaya upload foto (FormData) didukung di Expo Go.
// Content-Type TIDAK diatur manual agar FormData mendapat boundary otomatis.
function kirim(path, token, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', `${BASE_URL}${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 30000;

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch (e) {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data?.pesan || 'Request gagal'));
      }
    };
    xhr.onerror = () => reject(new Error('Tidak bisa terhubung ke server'));
    xhr.ontimeout = () => reject(new Error('Server terlalu lama merespons'));

    xhr.send(options.body || null);
  });
}

function buatFormData(data, fotoUri) {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  });
  if (fotoUri) {
    const png = fotoUri.toLowerCase().endsWith('.png');
    form.append('foto', {
      uri: fotoUri,
      name: png ? 'foto.png' : 'foto.jpg',
      type: png ? 'image/png' : 'image/jpeg',
    });
  }
  return form;
}

export function ambilSemuaProduk(token) {
  return kirim('/produk', token);
}

export function tambahProdukKeServer(token, data, fotoUri) {
  return kirim('/produk', token, { method: 'POST', body: buatFormData(data, fotoUri) });
}

export function ubahProdukDiServer(token, id, data, fotoUri) {
  return kirim(`/produk/${id}`, token, { method: 'PUT', body: buatFormData(data, fotoUri) });
}

export function hapusProdukDiServer(token, id) {
  return kirim(`/produk/${id}`, token, { method: 'DELETE' });
}