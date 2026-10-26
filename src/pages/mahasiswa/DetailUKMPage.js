/**
 * Halaman: Detail UKM (stub untuk sprint UC003/UC004).
 *
 * [DOKUMEN] UI/UX Wireframe Brief §4.3 hal. 144 — route `#/mahasiswa/ukm/:id`.
 *           Brief §5 M-02 (baris 195-213) — susunan: breadcrumb, kartu header
 *           (ikon, nama, chip kategori, badge status), kartu "Tentang UKM",
 *           kartu "Persyaratan Dokumen" (tiga item + catatan kaki), kartu
 *           "Status Pendaftaran" (badge, tanggal buka, tanggal tutup, tombol
 *           "Daftar Sekarang", catatan kecil), kartu "Ada pertanyaan?" + email.
 * [DOKUMEN] Brief §5 M-02 baris 205 — teks sumber aturan, jangan diubah:
 *           "Semua dokumen wajib diunggah · PDF atau JPEG, maks. 5MB".
 * [DOKUMEN] AI.md §1: stub detail "Tanpa search, filter, pagination, tab Tanya
 *           Jawab, dan countdown" + larangan "Tab Persyaratan, Timeline, dan
 *           Tanya Jawab di Detail UKM" — karena itu tidak ada bar tab; isi
 *           disusun bertumpuk.
 * [DOKUMEN] AI.md §6: UKM DITUTUP → tombol "Daftar Sekarang" nonaktif;
 *           "Jika URL diakses langsung (tanpa navigasi) tetap tampilkan pesan
 *           dan redirect".
 * [DOKUMEN] AI.md §4: empat state (loading/kosong/error/sukses), halaman hanya
 *           memanggil services/.
 *
 * [USULAN] Kartu "Timeline Pendaftaran" (Brief M-02 butir 4 dan G3) tidak
 *          dibuat: tidak ada entitas/tahap timeline pada daftar file sprint
 *          (AI.md §5) maupun data dummy, sehingga menampilkannya berarti
 *          mengarang data. Menunggu keputusan.
 */

import { pasang } from '../../layouts/AppShell.js'
import { getDetailUKM } from '../../services/pendaftaranUKMService.js'
import { getDaftarKategori } from '../../services/kategoriService.js'
import { STATUS_PENDAFTARAN, LABEL_STATUS_PENDAFTARAN } from '../../enums/statusPendaftaran.js'
import { formatTanggal } from '../../utils/format.js'
import { PESAN, TEKS_TOMBOL } from '../../utils/errors.js'

/** Ikon per persyaratan dokumen (data ikon, bukan teks pesan). */
const IKON_DOKUMEN = {
  KTM: 'i-id-card',
  TRANSKRIP: 'i-file-text',
  CV: 'i-award',
}

function badgeStatus(status) {
  const dibuka = status === STATUS_PENDAFTARAN.DIBUKA
  return `
    <span class="badge ${dibuka ? 'badge--positif' : 'badge--netral'}">
      <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#${dibuka ? 'i-check-circle' : 'i-clock'}"></use></svg>
      ${LABEL_STATUS_PENDAFTARAN[status] ?? status}
    </span>
  `
}

function barisPersyaratan(item) {
  const ikon = IKON_DOKUMEN[item.kode] ?? 'i-file-text'
  return `
    <li class="persyaratan__item">
      <span class="persyaratan__ikon" aria-hidden="true"><svg class="ikon"><use href="#${ikon}"></use></svg></span>
      <span class="persyaratan__teks">
        <strong>${item.nama}</strong>
        <span class="text-muted">${item.deskripsi ?? ''}</span>
      </span>
    </li>
  `
}

/** Wujud sukses halaman. */
function isiSukses(ukm, namaKategori) {
  const dibuka = ukm.statusPendaftaran === STATUS_PENDAFTARAN.DIBUKA
  const periode = ukm.periodeAktif ?? {}
  const persyaratan = periode.persyaratanDokumen ?? []

  const tombolDaftar = dibuka
    ? `<a class="tombol tombol--utama tombol--lebar" href="#/mahasiswa/daftar/${ukm.idUKM}/data">Daftar Sekarang</a>`
    : `<span class="tombol tombol--utama tombol--lebar" aria-disabled="true" data-daftar-nonaktif>Daftar Sekarang</span>`

  return `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="#/mahasiswa/katalog">Katalog UKM</a>
      <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-chevron-right"></use></svg>
      <span aria-current="page">${ukm.namaUKM}</span>
    </nav>

    <header class="detail__header kartu">
      <span class="detail__ikon" aria-hidden="true"><svg class="ikon ikon--besar"><use href="#${ukm.ikon}"></use></svg></span>
      <div>
        <h1 class="detail__nama">${ukm.namaUKM}</h1>
        <div class="detail__lencana">
          ${namaKategori ? `<span class="badge badge--chip">${namaKategori}</span>` : ''}
          ${badgeStatus(ukm.statusPendaftaran)}
        </div>
      </div>
    </header>

    <div class="detail__isi">
      <div class="detail__kiri">
        <section class="kartu">
          <h2 class="kartu__judul">Tentang UKM</h2>
          <p>${ukm.deskripsi ?? ''}</p>
        </section>

        <section class="kartu">
          <h2 class="kartu__judul">Persyaratan Dokumen</h2>
          <ul class="persyaratan">
            ${persyaratan.map(barisPersyaratan).join('')}
          </ul>
          <p class="kartu__catatan text-muted">Semua dokumen wajib diunggah · PDF atau JPEG, maks. 5MB</p>
        </section>
      </div>

      <aside class="detail__kanan">
        <section class="kartu">
          <h2 class="kartu__judul">Status Pendaftaran</h2>
          ${badgeStatus(ukm.statusPendaftaran)}
          <dl class="status__daftar">
            <div>
              <dt class="text-muted">Tanggal buka</dt>
              <dd>${periode.tanggalBuka ? formatTanggal(periode.tanggalBuka) : '—'}</dd>
            </div>
            <div>
              <dt class="text-muted">Tanggal tutup</dt>
              <dd>${periode.tanggalTutup ? formatTanggal(periode.tanggalTutup) : '—'}</dd>
            </div>
          </dl>
          ${tombolDaftar}
          <p class="kartu__catatan text-muted">Pastikan data diri dan dokumen sudah disiapkan sebelum mendaftar.</p>
        </section>

        <section class="kartu">
          <h2 class="kartu__judul">Ada pertanyaan?</h2>
          <p class="text-muted">Hubungi pengurus UKM terkait pendaftaran.</p>
          <p><a class="tautan" href="mailto:${ukm.emailUKM}">${ukm.emailUKM}</a></p>
        </section>
      </aside>
    </div>
  `
}

/** State UKM tidak ditemukan (AI.md §6). */
function isiTidakDitemukan() {
  return `
    <div class="state">
      <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-triangle-alert"></use></svg>
      <p>${PESAN.UKM_TIDAK_DITEMUKAN}</p>
      <a class="tombol tombol--utama" href="#/mahasiswa/katalog">Kembali ke Katalog UKM</a>
    </div>
  `
}

/** Dipanggil router dengan `ctx.param.idUKM`. */
export async function render(el, ctx = {}) {
  const idUKM = ctx.param?.idUKM
  const konten = pasang(el, { jalur: '/mahasiswa/katalog' })
  const ulang = () => render(el, ctx)

  konten.innerHTML = `<div class="state"><span class="spinner" role="status" aria-label="Memuat"></span><p>Memuat detail UKM…</p></div>`

  try {
    const [ukm, kategori] = await Promise.all([getDetailUKM(idUKM), getDaftarKategori()])

    if (!ukm) {
      konten.innerHTML = isiTidakDitemukan()
      return
    }

    const kat = kategori.find((k) => k.idKategori === ukm.idKategori)
    konten.innerHTML = isiSukses(ukm, kat?.namaKategori)
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
