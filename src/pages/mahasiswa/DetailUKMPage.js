/**
 * Halaman: Detail UKM (M-02).
 *
 * [DOKUMEN] UI/UX Wireframe Brief §4.3 — route `#/mahasiswa/ukm/:id`.
 * [DOKUMEN] Brief §5 M-02 — breadcrumb, banner foto (ikon, nama, chip kategori,
 *           badge status), tab "Deskripsi / Persyaratan Dokumen / Timeline /
 *           Tanya Jawab", kartu "Tentang UKM", kartu "Persyaratan Dokumen",
 *           kartu "Timeline Pendaftaran", kartu "Status Pendaftaran" (badge,
 *           tanggal buka, tanggal tutup, sisa waktu, "Daftar Sekarang"),
 *           kartu "Ada pertanyaan?" + email.
 * [DOKUMEN] Brief §5 M-02 baris 205 — teks sumber aturan, jangan diubah:
 *           "Semua dokumen wajib diunggah · PDF atau JPEG, maks. 5MB".
 * [DOKUMEN] Brief §8 G14 — tab ditambahkan ke detail UKM.
 * [DOKUMEN] AI.md §6: UKM DITUTUP → tombol "Daftar Sekarang" nonaktif;
 *           "Jika URL diakses langsung (tanpa navigasi) tetap tampilkan pesan
 *           dan redirect".
 * [DOKUMEN] AI.md §4: empat state (loading/kosong/error/sukses), halaman hanya
 *           memanggil services/.
 *
 * [USULAN] Tab, timeline, dan hitung mundur sebelumnya ditahan AI.md §1;
 *          lingkup diperluas user sehingga seluruh layar Hi-Fi dibuat.
 */

import { pasang } from '../../layouts/AppShell.js'
import { getDetailUKM } from '../../services/pendaftaranUKMService.js'
import { getDaftarKategori } from '../../services/kategoriService.js'
import { STATUS_PENDAFTARAN, LABEL_STATUS_PENDAFTARAN } from '../../enums/statusPendaftaran.js'
import { statusTahapTimeline } from '../../utils/permissions.js'
import { formatTanggal, formatJam, formatSisaWaktu } from '../../utils/format.js'
import { PESAN, TEKS_TOMBOL } from '../../utils/errors.js'

/** Tab detail UKM (Brief §8 G14). */
const TAB = Object.freeze([
  { id: 'deskripsi', label: 'Deskripsi' },
  { id: 'persyaratan', label: 'Persyaratan Dokumen' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'tanya-jawab', label: 'Tanya Jawab' },
])

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

/** Kartu "Tentang UKM". */
function kartuTentang(ukm) {
  return `
    <section class="kartu" data-bagian="deskripsi">
      <h2 class="kartu__judul">Tentang UKM</h2>
      <p>${ukm.visiMisi || ukm.deskripsi || ''}</p>
    </section>
  `
}

/** Kartu "Persyaratan Dokumen". */
function kartuPersyaratan(persyaratan) {
  return `
    <section class="kartu" data-bagian="persyaratan">
      <h2 class="kartu__judul">Persyaratan Dokumen</h2>
      <ul class="persyaratan">${persyaratan.map(barisPersyaratan).join('')}</ul>
      <p class="kartu__catatan text-muted">Semua dokumen wajib diunggah · PDF atau JPEG, maks. 5MB</p>
    </section>
  `
}

/** Kartu "Timeline Pendaftaran" — 5 tahap bertanggal (keputusan G3). */
function kartuTimeline(ukm) {
  const daftar = ukm.timeline ?? []
  if (!daftar.length) return ''

  const tahap = daftar.map((t, i) => {
    const status = statusTahapTimeline(t)
    const penanda = status === 'selesai'
      ? '<svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-check"></use></svg>'
      : String(i + 1)
    return `
      <li class="timeline__tahap timeline__tahap--${status}">
        <div class="timeline__garis-baris">
          <span class="timeline__penanda" aria-hidden="true">${penanda}</span>
          ${i < daftar.length - 1 ? '<span class="timeline__hubung"></span>' : ''}
        </div>
        <p class="timeline__label">${t.tahap}</p>
        <p class="timeline__tanggal">${t.tanggal}</p>
      </li>
    `
  }).join('')

  return `
    <section class="kartu" data-bagian="timeline">
      <h2 class="kartu__judul">Timeline Pendaftaran</h2>
      <ol class="timeline">${tahap}</ol>
    </section>
  `
}

/** State kosong tab Tanya Jawab (Brief §6.1). */
function kartuTanyaJawab() {
  return `
    <section class="kartu" data-bagian="tanya-jawab">
      <div class="state">
        <svg class="ikon ikon--besar" aria-hidden="true"><use href="#i-messages-square"></use></svg>
        <p>Belum ada pertanyaan untuk UKM ini. Jadilah yang pertama bertanya.</p>
      </div>
    </section>
  `
}

/** Kartu "Status Pendaftaran" (kolom kanan). */
function kartuStatus(ukm) {
  const dibuka = ukm.statusPendaftaran === STATUS_PENDAFTARAN.DIBUKA
  const periode = ukm.periodeAktif ?? {}

  const tombolDaftar = dibuka
    ? `<a class="tombol tombol--utama tombol--blok" href="#/mahasiswa/daftar/${ukm.idUKM}/data">Daftar Sekarang</a>`
    : `<span class="tombol tombol--utama tombol--blok" aria-disabled="true" data-daftar-nonaktif>Daftar Sekarang</span>`

  const sisa = dibuka && periode.tanggalTutup
    ? `
      <div class="kartu-status__box">
        <p class="kartu-status__box-label">Sisa waktu pendaftaran</p>
        <p class="kartu-status__box-angka">${formatSisaWaktu(periode.tanggalTutup)}</p>
      </div>
    `
    : ''

  const tutupTeks = periode.tanggalTutup
    ? `${formatTanggal(periode.tanggalTutup)}, ${formatJam(periode.tanggalTutup)} WIB`
    : '—'

  return `
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
          <dd>${tutupTeks}</dd>
        </div>
      </dl>
      ${sisa}
      ${tombolDaftar}
      <p class="kartu__catatan text-muted">Pastikan data diri dan dokumen sudah disiapkan sebelum mendaftar.</p>
    </section>
  `
}

/** Wujud sukses halaman. */
function isiSukses(ukm, namaKategori, tabAktif) {
  const persyaratan = ukm.periodeAktif?.persyaratanDokumen ?? []

  const bagian =
    tabAktif === 'persyaratan'
      ? kartuPersyaratan(persyaratan)
      : tabAktif === 'timeline'
        ? kartuTimeline(ukm)
        : tabAktif === 'tanya-jawab'
          ? kartuTanyaJawab()
          : `${kartuTentang(ukm)}${kartuPersyaratan(persyaratan)}${kartuTimeline(ukm)}`

  const barisTab = TAB.map(
    t => `
      <button class="tab" type="button" role="tab" data-tab="${t.id}"
              aria-selected="${t.id === tabAktif}">${t.label}</button>
    `
  ).join('')

  return `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="#/mahasiswa/katalog">Katalog UKM</a>
      <svg class="ikon ikon--kecil" aria-hidden="true"><use href="#i-chevron-right"></use></svg>
      <span aria-current="page">${ukm.namaUKM}</span>
    </nav>

    <div class="detail__isi">
      <div class="detail__kiri">
        <header class="detail-banner">
          ${ukm.foto ? `<img class="detail-banner__foto" src="${ukm.foto}" alt="" aria-hidden="true" />` : ''}
          <span class="detail-banner__overlay" aria-hidden="true"></span>
          <div class="detail-banner__isi">
            <span class="detail-banner__ikon" aria-hidden="true">
              <svg class="ikon ikon--besar"><use href="#${ukm.ikon}"></use></svg>
            </span>
            <div>
              <h1 class="detail-banner__nama">${ukm.namaUKM}</h1>
              <div class="detail-banner__meta">
                ${namaKategori ? `<span>${namaKategori}</span>` : ''}
                ${badgeStatus(ukm.statusPendaftaran)}
              </div>
            </div>
          </div>
        </header>

        <div class="tab-bar" role="tablist" aria-label="Bagian detail UKM">${barisTab}</div>

        <div data-bagian-wadah>${bagian}</div>
      </div>

      <aside class="detail__kanan">
        ${kartuStatus(ukm)}
        <section class="kartu kartu--lembut">
          <h2 class="kartu__judul">Ada pertanyaan?</h2>
          <p class="text-muted">Lihat tab Tanya Jawab atau hubungi pengurus UKM.</p>
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
    let tabAktif = 'deskripsi'

    const gambar = () => {
      konten.innerHTML = isiSukses(ukm, kat?.namaKategori, tabAktif)
      konten.querySelectorAll('[data-tab]').forEach((t) =>
        t.addEventListener('click', () => {
          tabAktif = t.dataset.tab
          gambar()
        })
      )
    }
    gambar()
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
