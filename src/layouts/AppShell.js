/**
 * AppShell — navbar Mahasiswa dan wadah konten halaman.
 *
 * [DOKUMEN] AI.md §5 daftar file: src/layouts/AppShell.js.
 * [DOKUMEN] AI.md §11 T1: "AppShell dengan navbar Mahasiswa sesuai screenshot
 *           `Katalog_UKM.png` (bagian atas, tanpa sidebar)".
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-01 — logo + nama aplikasi + label role,
 *           menu tengah, ikon notifikasi dengan badge, avatar inisial + nama +
 *           chevron.
 * [DOKUMEN] UI/UX Wireframe Brief §3.4 — avatar memakai inisial dari nama (G17).
 * [DOKUMEN] Desain Hi-Fi: logo gambar UB, menu termasuk Notifikasi, lonceng
 *           bundar dengan badge jumlah belum dibaca, avatar bulat.
 *
 * [USULAN] API `pasang(el, { aktif })` yang mengembalikan elemen konten tidak
 *          ada di PRD; dipilih agar halaman mengisi konten sendiri (termasuk
 *          state loading/kosong/error/sukses sesuai AI.md §4).
 */

import { config } from '../config.js'
import { getSesi, hapusSesi } from '../state/session.js'
import { menuMahasiswa } from './navConfig.js'
import { inisialDariNama } from '../utils/format.js'

function butirMenu(item, jalurSaatIni) {
  const aktif = jalurSaatIni === item.jalur ? ' aria-current="page"' : ''
  return `<a class="nav__tautan${jalurSaatIni === item.jalur ? ' nav__tautan--aktif' : ''}" href="#${item.jalur}"${aktif}>${item.label}</a>`
}

/**
 * Pasang shell di `el` dan kembalikan elemen konten yang siap diisi halaman.
 * @param {HTMLElement} el
 * @param {{ jalur?: string }} opsi
 * @returns {HTMLElement} elemen `#konten`
 */
export function pasang(el, opsi = {}) {
  const sesi = getSesi()
  const jalurSaatIni = opsi.jalur ?? ''
  const nama = sesi?.nama ?? 'Mahasiswa'

  el.innerHTML = `
    <header class="nav">
      <div class="nav__wadah">
        <a class="nav__merek" href="#/mahasiswa/katalog">
          <img class="nav__logo" src="/img/logo-ub.png" alt="" aria-hidden="true" width="44" height="44" />
          <span class="nav__merek-teks">
            <span class="nav__nama-aplikasi">${config.namaAplikasi}</span>
            <span class="nav__role">Mahasiswa</span>
          </span>
        </a>

        <nav class="nav__menu" aria-label="Menu utama">
          ${menuMahasiswa.map(item => butirMenu(item, jalurSaatIni)).join('')}
        </nav>

        <div class="nav__aksi">
          <a class="nav__ikon-tombol" href="#/mahasiswa/notifikasi" aria-label="Notifikasi" data-notifikasi>
            <svg class="ikon" aria-hidden="true"><use href="#i-bell"></use></svg>
            <span class="nav__lencana" aria-hidden="true" data-lencana-notifikasi hidden>0</span>
          </a>
          <div class="nav__pengguna">
            <span class="nav__avatar" aria-hidden="true">${inisialDariNama(nama)}</span>
            <span class="nav__nama">${nama}</span>
            <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-chevron-down"></use></svg>
            <button class="nav__keluar" type="button" data-keluar>Keluar</button>
          </div>
        </div>
      </div>
    </header>

    <main id="konten" class="konten" tabindex="-1"></main>
  `

  el.querySelector('[data-keluar]')?.addEventListener('click', () => {
    hapusSesi()
    location.hash = '#/'
  })

  // Lencana lonceng = jumlah notifikasi belum dibaca (Hi-Fi: badge "2").
  // [USULAN] diambil dari service (bukan mock) agar AppShell tetap lapisan UI.
  if (sesi) {
    import('../services/notifikasiService.js')
      .then(m => m.getNotifikasiSaya(sesi.idUser))
      .then(daftar => {
        const belum = daftar.filter(n => !n.dibaca).length
        const lencana = el.querySelector('[data-lencana-notifikasi]')
        if (!lencana) return
        lencana.hidden = belum === 0
        lencana.textContent = String(belum)
      })
      .catch(() => {
        /* lencana disembunyikan bila service gagal; halaman tetap berfungsi */
      })
  }

  return el.querySelector('#konten')
}
