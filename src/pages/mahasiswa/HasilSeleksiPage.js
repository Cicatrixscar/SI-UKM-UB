/**
 * Halaman: Hasil Seleksi (M-07).
 *
 * [DOKUMEN] UI/UX Wireframe Brief §4.3 — route `#/mahasiswa/hasil`.
 * [DOKUMEN] Brief §5 M-07 — judul + subjudul, banner biru "Pengumuman hasil
 *           dirilis sesuai UKM masing-masing", tiga kartu hasil (DITERIMA /
 *           DITOLAK / MENUNGGU PENGUMUMAN), catatan kaki.
 * [DOKUMEN] Brief §5 M-07 "Isi kartu" — ikon UKM, nama, chip kategori, badge
 *           hasil, "Diumumkan pada [tanggal]", pesan hasil, panel "Langkah
 *           Selanjutnya" (DITERIMA), panel abu (DITOLAK), kartu redup (PENDING).
 * [DOKUMEN] Brief §6.1 — teks kosong hasil seleksi.
 * [DOKUMEN] PRD v0.3 §7.10 — `hasilSeleksiService.getHasilSeleksi(idMahasiswa)`.
 * [DOKUMEN] PRD v0.3 §11.5 — pengumuman dilakukan per UKM; kartu hanya untuk
 *           UKM tempat mahasiswa pernah mendaftar.
 * [DOKUMEN] AI.md §4 — empat state; halaman hanya memanggil `services/`.
 *
 * [USULAN] M-07 tidak memuat method "kosong"; daftar kosong ditentukan dari
 *          hasil `getHasilSeleksi` (tidak ada pendaftaran → teks §6.1).
 */

import { pasang } from '../../layouts/AppShell.js'
import { getHasilSeleksi } from '../../services/hasilSeleksiService.js'
import { STATUS_SELEKSI, LABEL_STATUS_SELEKSI } from '../../enums/statusBerkas.js'
import { PESAN, TEKS_TOMBOL } from '../../utils/errors.js'
import { formatTanggal } from '../../utils/format.js'
import { getSesi } from '../../state/session.js'

function ikon(id, kelas = 'ikon') {
  return `<svg class="${kelas}" aria-hidden="true"><use href="#${id}"></use></svg>`
}

/** Badge hasil — warna mengikuti Hi-Fi (hijau/merah/abu). */
function badgeHasil(status) {
  const gaya =
    status === STATUS_SELEKSI.DITERIMA
      ? 'badge--positif'
      : status === STATUS_SELEKSI.DITOLAK
        ? 'badge--bahaya'
        : 'badge--netral'
  const idIkon =
    status === STATUS_SELEKSI.DITERIMA
      ? 'i-check-circle'
      : status === STATUS_SELEKSI.DITOLAK
        ? 'i-x-circle'
        : 'i-clock'
  return `
    <span class="badge ${gaya}">
      ${ikon(idIkon, 'ikon ikon--kecil')}
      ${LABEL_STATUS_SELEKSI[status] ?? status}
    </span>
  `
}

/** Panel "Langkah Selanjutnya" (kartu DITERIMA, Brief G7). */
function langkahSelanjutnya(ukm) {
  const l = ukm.langkahSelanjutnya
  if (!l) return ''
  return `
    <div class="langkah-panel">
      <p class="langkah-panel__judul">Langkah Selanjutnya</p>
      <p class="langkah-panel__baris">${l.kontak ?? ''}</p>
      <p class="langkah-panel__baris">${l.grupWA ?? ''}</p>
      <p class="langkah-panel__baris langkah-panel__baris--redup">${l.pertemuan ?? ''}</p>
      <p class="langkah-panel__baris langkah-panel__baris--redup">${l.waktuLokasi ?? ''}</p>
    </div>
  `
}

/** Satu kartu hasil seleksi. */
function kartuHasil(h) {
  const diterima = h.statusSeleksi === STATUS_SELEKSI.DITERIMA
  const ditolak = h.statusSeleksi === STATUS_SELEKSI.DITOLAK
  const pending = h.statusSeleksi === STATUS_SELEKSI.PENDING

  const tanggal = h.tanggalDiumumkan && !pending
    ? `<p class="hasil-kartu__tanggal">Diumumkan pada ${formatTanggal(h.tanggalDiumumkan)}</p>`
    : ''

  let isi
  if (diterima) {
    isi = `
      <p class="hasil-kartu__pesan">${h.catatanSeleksi ?? ''}</p>
      ${langkahSelanjutnya(h)}
      ${h.langkahSelanjutnya?.linkGrupWA
        ? `<div class="hasil-kartu__aksi">
             <a class="tombol tombol--utama tombol--blok" href="${h.langkahSelanjutnya.linkGrupWA}" target="_blank" rel="noopener">Bergabung ke Grup WA</a>
           </div>`
        : ''}
    `
  } else if (ditolak) {
    isi = `
      <p class="hasil-kartu__pesan">${h.catatanSeleksi ?? ''}</p>
      <div class="panel-abu">Jangan berkecil hati, masih ada UKM lain yang membuka pendaftaran.</div>
      <div class="hasil-kartu__aksi">
        <a class="tombol tombol--cadangan tombol--blok" href="#/mahasiswa/katalog">Jelajahi UKM Lain</a>
      </div>
    `
  } else {
    isi = `
      <p class="hasil-kartu__pesan">Hasil seleksi belum diumumkan. Anda akan menerima notifikasi saat hasil sudah tersedia.</p>
    `
  }

  return `
    <article class="hasil-kartu${pending ? ' hasil-kartu--redup' : ''}">
      <div class="hasil-kartu__kepala">
        <span class="hasil-kartu__ikon" aria-hidden="true">${ikon(h.ikon ?? 'i-award', 'ikon ikon--besar')}</span>
        <h2 class="hasil-kartu__nama">${h.namaUKM}</h2>
      </div>
      <div class="hasil-kartu__lencana">
        ${h.namaKategori ? `<span class="badge badge--chip">${h.namaKategori}</span>` : ''}
        ${badgeHasil(h.statusSeleksi)}
      </div>
      ${tanggal}
      ${isi}
    </article>
  `
}

/** Wujud sukses M-07. */
function isiSukses(daftar) {
  if (!daftar.length) {
    return `
      <div class="state">
        ${ikon('i-inbox', 'ikon ikon--besar')}
        <p>Belum ada hasil seleksi. Hasil akan tampil setelah UKM mengumumkan.</p>
        <a class="tombol tombol--utama" href="#/mahasiswa/katalog">Ke Katalog UKM</a>
      </div>
    `
  }

  return `
    <div class="panel-info">
      ${ikon('i-clock', 'ikon ikon--kecil')}
      <span>Pengumuman hasil dirilis sesuai UKM masing-masing</span>
    </div>
    <div class="hasil-grid">${daftar.map(kartuHasil).join('')}</div>
    <p class="hasil-catatan">Hasil seleksi bersifat final setelah diumumkan. Hubungi admin UKM untuk pertanyaan lebih lanjut.</p>
  `
}

/** Dipanggil router. */
export async function render(el, ctx = {}) {
  const konten = pasang(el, { jalur: '/mahasiswa/hasil' })
  konten.innerHTML = `
    <header class="banner">
      <div>
        <h1 class="banner__judul">Hasil Seleksi</h1>
        <p class="banner__sub">Pantau hasil seleksi pendaftaran UKM Anda di sini.</p>
      </div>
      <div class="banner__kanan">Pengumuman · Oktober 2026</div>
    </header>
    <div data-hasil></div>
  `

  const wadah = konten.querySelector('[data-hasil]')
  wadah.innerHTML = `<div class="state"><span class="spinner" role="status" aria-label="Memuat"></span><p>Memuat hasil seleksi…</p></div>`

  try {
    const sesi = getSesi()
    const daftar = await getHasilSeleksi(sesi?.idUser ?? '')
    wadah.innerHTML = isiSukses(daftar)
  } catch (err) {
    console.error(err)
    wadah.innerHTML = `
      <div class="state">
        ${ikon('i-triangle-alert', 'ikon ikon--besar')}
        <p>${PESAN.GAGAL_MEMUAT_DATA}</p>
        <button class="tombol tombol--utama" type="button" data-coba-lagi>${TEKS_TOMBOL.COBA_LAGI}</button>
      </div>
    `
    wadah.querySelector('[data-coba-lagi]')?.addEventListener('click', () => render(el, ctx))
  }
}
