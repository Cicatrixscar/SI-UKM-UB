/**
 * Halaman: Form Pendaftaran (tiga langkah) — kerangka untuk tahap T2.
 *
 * [DOKUMEN] AI.md §5: "src/pages/mahasiswa/FormPendaftaranPage.js (utama,
 *           tiga langkah)".
 * [DOKUMEN] UI/UX Wireframe Brief §4.3 hal. 145-147 — route:
 *           `#/mahasiswa/daftar/:id/data`, `.../dokumen`, `.../review`.
 * [DOKUMEN] Brief §5 M-03 baris 218-219: judul "Form Pendaftaran", tautan
 *           "Batal" di kanan atas; baris "Pendaftaran untuk [ikon] UKM Fotografi"
 *           dengan keterangan "Tidak dapat diubah" (abu kecil).
 * [DOKUMEN] Brief §5 M-03 baris 220: stepper 3 langkah.
 * [DOKUMEN] AI.md §6: "UKM berstatus DITUTUP: ... form tidak bisa dibuka (akses
 *           langsung ke URL form juga harus menampilkan pesan dan redirect)."
 * [DOKUMEN] AI.md §11 T2 DoD: "Dari katalog, klik Lihat Detail, lalu Daftar
 *           Sekarang, dan form terbuka." — isian langkah 1 dikerjakan pada T4.
 * [DOKUMEN] AI.md §4: empat state; halaman hanya memanggil services/.
 */

import { pasang } from '../../layouts/AppShell.js'
import { getDetailUKM } from '../../services/pendaftaranUKMService.js'
import { getDaftarKategori } from '../../services/kategoriService.js'
import { bolehAksesForm } from '../../utils/permissions.js'
import { LABEL_STATUS_PENDAFTARAN } from '../../enums/statusPendaftaran.js'
import { PESAN, TEKS_TOMBOL } from '../../utils/errors.js'
import { buatStepper } from '../../components/ui/Stepper.js'

/** Dua kemungkinan penolakan akses form. */
function stateDitolak({ ukm, tidakDitemukan }) {
  // AI.md §9: teks pesan harus dari PRD §14. Tidak ada teks "pendaftaran
  // ditutup" di PRD §14, sehingga yang ditampilkan adalah label status
  // (PRD §14/Tabel status) tanpa menyusun kalimat baru.
  const judul = tidakDitemukan
    ? PESAN.UKM_TIDAK_DITEMUKAN
    : LABEL_STATUS_PENDAFTARAN[ukm?.statusPendaftaran] ?? ukm?.statusPendaftaran ?? ''

  return `
    <div class="state">
      <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-lock"></use></svg>
      <p>${judul}</p>
      <a class="tombol tombol--utama" href="#/mahasiswa/katalog">Kembali ke Katalog UKM</a>
    </div>
  `
}

/** Dipanggil router dengan `ctx.param.idUKM` dan `ctx.path`. */
export async function render(el, ctx = {}) {
  const idUKM = ctx.param?.idUKM
  // Tahap dibaca dari path agar tiap rute memakai pola persis Brief §4.3.
  const tahap = ctx.path?.endsWith('/dokumen')
    ? 'dokumen'
    : ctx.path?.endsWith('/review')
      ? 'review'
      : 'data'
  const konten = pasang(el, { jalur: '/mahasiswa/katalog' })
  const ulang = () => render(el, ctx)

  konten.innerHTML = `<div class="state"><span class="spinner" role="status" aria-label="Memuat"></span><p>Memuat form pendaftaran…</p></div>`

  try {
    const [ukm, kategori] = await Promise.all([getDetailUKM(idUKM), getDaftarKategori()])

    const akses = bolehAksesForm(ukm)
    if (!akses.boleh) {
      konten.innerHTML = stateDitolak({ ukm, tidakDitemukan: akses.tidakDitemukan })
      return
    }

    const kat = kategori.find((k) => k.idKategori === ukm.idKategori)
    const langkah = tahap === 'dokumen' ? 2 : tahap === 'review' ? 3 : 1

    konten.innerHTML = `
      <header class="halaman__kepala">
        <h1 class="halaman__judul">Form Pendaftaran</h1>
        <a class="tautan" href="#/mahasiswa/ukm/${ukm.idUKM}" data-batal>Batal</a>
      </header>

      <div class="form__pita">
        <p class="form__ukm">
          <span class="text-muted">Pendaftaran untuk</span>
          <span class="form__ukm-nama">
            <svg class="ikon" aria-hidden="true"><use href="#${ukm.ikon}"></use></svg>
            ${ukm.namaUKM}
          </span>
          ${kat ? `<span class="badge badge--chip">${kat.namaKategori}</span>` : ''}
        </p>
        <p class="form__kunci text-muted">Tidak dapat diubah</p>
      </div>

      <div class="form__stepper" data-stepper></div>

      <div class="form__isi" data-langkah></div>
    `

    konten.querySelector('[data-stepper]')?.appendChild(buatStepper(langkah))
    // Isi langkah 1 diisi pada tahap T4 (AI.md §11 T4).
    const wadah = konten.querySelector('[data-langkah]')
    if (wadah) wadah.innerHTML = ''
  } catch (err) {
    console.error(err)
    konten.innerHTML = `
      <div class="state">
        <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-triangle-alert"></use></svg>
        <p>${PESAN.GAGAL_MEMUAT_DATA}</p>
        <button class="tombol tombol--utama" type="button" data-coba-lagi>${TEKS_TOMBOL.COBA_LAGI}</button>
      </div>
    `
    konten.querySelector('[data-coba-lagi]')?.addEventListener('click', ulang)
  }
}
