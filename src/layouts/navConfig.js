/**
 * Konfigurasi menu navbar Mahasiswa.
 *
 * [DOKUMEN] AI.md §5: "src/layouts/navConfig.js (hanya menu Mahasiswa)".
 * [DOKUMEN] AI.md §11 T1: "navbar Mahasiswa sesuai screenshot `Katalog_UKM.png`
 *           (bagian atas, tanpa sidebar)".
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-01 — item navbar: Katalog UKM, Riwayat
 *           Pendaftaran, Hasil Seleksi; ditambah Notifikasi sesuai desain Hi-Fi
 *           (semua layar Hi-Fi masuk lingkup per user).
 * [DOKUMEN] Brief §4.3 — rute `#/mahasiswa/katalog`, `#/mahasiswa/riwayat`,
 *           `#/mahasiswa/hasil`, `#/mahasiswa/notifikasi`.
 *
 * [USULAN] Halaman "Segera hadir" dihapus: seluruh menu kini berfungsi (Riwayat,
 *          Hasil Seleksi, Notifikasi dirender halaman asli).
 */

/**
 * @typedef {{label: string, jalur: string,
 *            halaman: (() => Promise<object>) | {render: (el: HTMLElement) => void}}} ItemMenu
 */

/** @type {ItemMenu[]} */
export const menuMahasiswa = Object.freeze([
  Object.freeze({
    label: 'Katalog UKM',
    jalur: '/mahasiswa/katalog',
    halaman: () => import('../pages/mahasiswa/KatalogUKMPage.js'),
  }),
  Object.freeze({
    label: 'Riwayat Pendaftaran',
    jalur: '/mahasiswa/riwayat',
    halaman: () => import('../pages/mahasiswa/RiwayatPendaftaranPage.js'),
  }),
  Object.freeze({
    label: 'Hasil Seleksi',
    jalur: '/mahasiswa/hasil',
    halaman: () => import('../pages/mahasiswa/HasilSeleksiPage.js'),
  }),
  Object.freeze({
    label: 'Notifikasi',
    jalur: '/mahasiswa/notifikasi',
    halaman: () => import('../pages/mahasiswa/NotifikasiPage.js'),
  }),
])
