/**
 * Konfigurasi menu navbar Mahasiswa.
 *
 * [DOKUMEN] AI.md §5: "src/layouts/navConfig.js (hanya menu Mahasiswa)".
 * [DOKUMEN] AI.md §11 T1: "navbar Mahasiswa sesuai screenshot `Katalog_UKM.png`
 *           (bagian atas, tanpa sidebar)" dan "Menu Riwayat dan Hasil Seleksi
 *           tampil tetapi belum berfungsi (tautan ke halaman 'Segera hadir')".
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-01 — item navbar.
 *
 * [USULAN] Halaman "Segera hadir" dirender inline (bukan file terpisah) karena
 *          daftar file AI.md §5 tidak memuat halaman tersebut.
 */

import { PESAN } from '../utils/errors.js'

/** Halaman cadangan untuk menu yang belum berfungsi di sprint ini. */
function halamanSegeraHadir(namaMenu) {
  return {
    render(el) {
      el.innerHTML = `
        <section class="halaman kosong">
          <h1 class="halaman__judul">Segera hadir</h1>
          <p class="halaman__subjudul">${namaMenu} belum tersedia pada sprint UC003 dan UC004.</p>
          <p class="halaman__subjudul text-muted">${PESAN.BELUM_ADA_AKTIVITAS}</p>
          <p><a class="tombol tombol--utama" href="#/mahasiswa/katalog">Kembali ke Katalog UKM</a></p>
        </section>
      `
    },
  }
}

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
    // [USULAN] di luar lingkup sprint (AI.md §1) — tampil, belum berfungsi.
    halaman: halamanSegeraHadir('Riwayat Pendaftaran'),
  }),
  Object.freeze({
    label: 'Hasil Seleksi',
    jalur: '/mahasiswa/hasil',
    // [USULAN] di luar lingkup sprint (AI.md §1) — tampil, belum berfungsi.
    halaman: halamanSegeraHadir('Hasil Seleksi'),
  }),
])
