/**
 * Halaman: Pilih Peran (PilihPeranPage).
 *
 * Tanggung Jawab (Single Responsibility):
 * - Menampilkan pilihan login sebagai Mahasiswa atau Admin
 * - Mengarahkan pengguna ke halaman login yang sesuai
 */

import { config } from '../../config.js'
import { navigasi } from '../../router.js'

function logo() {
  return `<img class="masuk__logo" src="/img/logo-ub.png" alt="Logo Universitas Brawijaya" />`
}

/**
 * Render halaman Pemilihan Peran.
 * @param {HTMLElement} el
 */
export function render(el) {
  el.innerHTML = `
    <section class="masuk">
      <div class="masuk__kartu">
        ${logo()}
        <h1 class="masuk__judul">Masuk ke ${config.namaAplikasi}</h1>
        <p class="masuk__subjudul text-muted">Pilih peran Anda untuk melanjutkan</p>

        <div class="masuk__pilihan-peran">
          <button class="tombol tombol--utama tombol--blok" type="button" data-aksi="pilih-mahasiswa">
            Masuk sebagai Mahasiswa
          </button>
          <button class="tombol tombol--cadangan tombol--blok" type="button" disabled aria-disabled="true" title="Fitur login admin belum dibuka">
            Masuk sebagai Admin <span class="masuk__badge-segera">Segera Hadir</span>
          </button>
        </div>
      </div>
    </section>
  `

  el.querySelector('[data-aksi="pilih-mahasiswa"]')?.addEventListener('click', () => {
    navigasi('/masuk')
  })
}
