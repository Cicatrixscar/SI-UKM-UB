/**
 * Halaman: Katalog UKM (stub untuk sprint UC003/UC004).
 *
 * [DOKUMEN] AI.md §1: "Katalog dan Detail UKM versi stub: hanya menampilkan data
 *           dummy dan tombol 'Daftar Sekarang' / 'Daftar' yang mengarah ke form.
 *           Tanpa search, filter, pagination, tab Tanya Jawab, dan countdown."
 * [DOKUMEN] AI.md §11 T2: "Buat KatalogUKMPage dan DetailUKMPage versi stub
 *           dengan data dummy dari ukm.dummy.js. Jangan tambahkan search, filter,
 *           pagination, atau tab."
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-01 — judul "Katalog UKM" dan subjudul
 *           "Temukan komunitas untuk mengembangkan minat dan potensimu."
 * [DOKUMEN] AI.md §4: "Setiap halaman punya state loading, kosong, error, dan
 *           sukses." + "Halaman hanya memanggil services/."
 */

import { pasang } from '../../layouts/AppShell.js'
import { getKatalogUKM } from '../../services/pendaftaranUKMService.js'
import { getDaftarKategori } from '../../services/kategoriService.js'
import { buatUKMCard } from '../../components/ukm/UKMCard.js'
import { PESAN, TEKS_TOMBOL } from '../../utils/errors.js'

/** Dipanggil router. */
export async function render(el, ctx = {}) {
  const konten = pasang(el, { jalur: '/mahasiswa/katalog' })
  konten.innerHTML = `
    <header class="halaman__kepala">
      <div>
        <h1 class="halaman__judul">Katalog UKM</h1>
        <p class="halaman__subjudul">Temukan komunitas untuk mengembangkan minat dan potensimu.</p>
      </div>
    </header>
    <div data-daftar></div>
  `

  const wadah = konten.querySelector('[data-daftar]')
  wadah.innerHTML = `<div class="state"><span class="spinner" role="status" aria-label="Memuat"></span><p>Memuat katalog UKM…</p></div>`

  const ulang = () => render(el, ctx)

  try {
    // AI.md §4: halaman hanya memanggil services/, tidak mengimpor mock.
    const [daftar, kategori] = await Promise.all([getKatalogUKM(), getDaftarKategori()])

    if (!daftar.length) {
      wadah.innerHTML = `
        <div class="state">
          <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-inbox"></use></svg>
          <p>${PESAN.BELUM_ADA_AKTIVITAS}</p>
          <button class="tombol tombol--cadangan" type="button" data-coba-lagi>${TEKS_TOMBOL.COBA_LAGI}</button>
        </div>
      `
      wadah.querySelector('[data-coba-lagi]')?.addEventListener('click', ulang)
      return
    }

    // Grid kartu — tanpa search, filter, atau pagination (AI.md §11 T2).
    const grid = document.createElement('div')
    grid.className = 'katalog-grid'
    for (const ukm of daftar) {
      const kat = kategori.find((k) => k.idKategori === ukm.idKategori)
      grid.appendChild(buatUKMCard(ukm, { namaKategori: kat?.namaKategori }))
    }
    wadah.replaceChildren(grid)
  } catch (err) {
    console.error(err)
    wadah.innerHTML = `
      <div class="state">
        <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-triangle-alert"></use></svg>
        <p>${PESAN.GAGAL_MEMUAT_DATA}</p>
        <button class="tombol tombol--utama" type="button" data-coba-lagi>${TEKS_TOMBOL.COBA_LAGI}</button>
      </div>
    `
    wadah.querySelector('[data-coba-lagi]')?.addEventListener('click', ulang)
  }
}
