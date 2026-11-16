/**
 * Halaman: Riwayat Pendaftaran — daftar (M-08) dan detail (M-06).
 *
 * [DOKUMEN] UI/UX Wireframe Brief §4.3 — route `#/mahasiswa/riwayat` (daftar)
 *           dan `#/mahasiswa/riwayat/:idPendaftaran` (detail).
 * [DOKUMEN] Brief §5 M-06 — breadcrumb "Riwayat Pendaftaran > Detail", judul
 *           UKM + "Tanggal daftar: … · No. …", badge status di kanan atas,
 *           stepper 5 tahap, dua kolom (Data Pendaftaran + Dokumen Terunggah |
 *           Hasil Pemeriksaan Berkas).
 * [DOKUMEN] Brief §5 M-08 — kartu pendaftaran: nama UKM, nomor pendaftaran,
 *           tanggal daftar, badge status, tombol "Lihat Detail", terbaru di atas.
 * [DOKUMEN] Brief §6.1 — teks kosong riwayat.
 * [DOKUMEN] Brief §6.1 dan bagian 3 — baris dokumen "Belum tersedia", tombol
 *           "Lihat" membuka preview (di mock `fileUrl` kosong → pesan PRD §14).
 * [DOKUMEN] AI.md §4: empat state (loading/kosong/error/sukses) dan "Halaman
 *           hanya memanggil services/".
 *
 * [USULAN] M-08 tidak punya desain awal (Brief §7); kartu memakai kelas
 *          `.riwayat-kartu` mengikuti gaya kartu M-01.
 */

import { pasang } from '../../layouts/AppShell.js'
import {
  getRiwayatPendaftaran,
  getDetailPendaftaran,
} from '../../services/pendaftaranUKMService.js'
import { tahapRiwayat, nomorTahapAktif } from '../../utils/permissions.js'
import { PESAN, TEKS_TOMBOL } from '../../utils/errors.js'
import { STATUS_BERKAS, LABEL_STATUS_BERKAS } from '../../enums/statusBerkas.js'
import {
  formatTanggal,
  formatTanggalWaktu,
  formatUkuranFile,
} from '../../utils/format.js'
import { getSesi } from '../../state/session.js'

/** Ikon baris dokumen (data ikon, bukan teks pesan). */
const IKON_DOKUMEN = {
  KTM: 'i-id-card',
  TRANSKRIP: 'i-file-text',
  CV: 'i-award',
}

function ikon(id, kelas = 'ikon') {
  return `<svg class="${kelas}" aria-hidden="true"><use href="#${id}"></use></svg>`
}

/**
 * Badge status pendaftaran (M-08) / status berkas (M-06).
 * Warna mengikuti desain Hi-Fi: peringatan saat menunggu, merah saat tidak
 * lengkap, hijau setelah lengkap.
 */
function badgeStatusBerkas(status) {
  const bahaya = status === STATUS_BERKAS.TIDAK_LENGKAP
  const menunggu = status === STATUS_BERKAS.MENUNGGU_VERIFIKASI_BERKAS
  const gaya = bahaya ? 'badge--bahaya' : menunggu ? 'badge--peringatan' : 'badge--positif'
  const idIkon = bahaya ? 'i-alert-circle' : menunggu ? 'i-clock' : 'i-check-circle'
  const label = LABEL_STATUS_BERKAS[status] ?? status ?? ''
  return `
    <span class="badge ${gaya}">
      ${ikon(idIkon, 'ikon ikon--kecil')}
      ${label}
    </span>
  `
}

/* ===========================================================================
   M-08 — daftar riwayat pendaftaran
   =========================================================================== */

function bannerDaftar() {
  return `
    <header class="banner">
      <div>
        <h1 class="banner__judul">Riwayat Pendaftaran</h1>
        <p class="banner__sub">Pantau seluruh pendaftaran UKM yang pernah Anda ikuti.</p>
      </div>
      <div class="banner__kanan">Periode pendaftaran · Oktober 2026</div>
    </header>
  `
}

function kartuRiwayat(p) {
  return `
    <article class="riwayat-kartu">
      <div class="riwayat-kartu__kepala">
        ${p.foto
          ? `<img class="riwayat-kartu__foto" src="${p.foto}" alt="" aria-hidden="true" />`
          : `<span class="riwayat-kartu__foto" aria-hidden="true">${ikon(p.ikon ?? 'i-award', 'ikon ikon--besar')}</span>`}
        <div>
          <h2 class="riwayat-kartu__nama">${p.namaUKM}</h2>
          ${badgeStatusBerkas(p.statusBerkas)}
        </div>
      </div>
      <p class="riwayat-kartu__baris">
        <span>Nomor pendaftaran</span>
        <strong>${p.nomorPendaftaran ?? p.idPendaftaran}</strong>
      </p>
      <p class="riwayat-kartu__baris">
        <span>Tanggal daftar</span>
        <strong>${formatTanggal(p.tanggalDaftar)}</strong>
      </p>
      <div class="riwayat-kartu__aksi">
        <a class="tombol tombol--cadangan tombol--blok" href="#/mahasiswa/riwayat/${p.idPendaftaran}">Lihat Detail</a>
      </div>
    </article>
  `
}

/** Wujud sukses M-08. */
function isiDaftar(daftar) {
  if (!daftar.length) {
    return `
      <div class="state">
        ${ikon('i-inbox', 'ikon ikon--besar')}
        <p>Belum ada pendaftaran. Mulai dari Katalog UKM untuk mendaftar.</p>
        <a class="tombol tombol--utama" href="#/mahasiswa/katalog">Ke Katalog UKM</a>
      </div>
    `
  }
  return `<div class="riwayat-grid">${daftar.map(kartuRiwayat).join('')}</div>`
}

/* ===========================================================================
   M-06 — detail riwayat pendaftaran
   =========================================================================== */

/** Stepper 5 tahap (pemetaan ada di `utils/permissions.js`). */
function stepperRiwayat(pendaftaran) {
  const tahap = tahapRiwayat(pendaftaran)
  const aktif = nomorTahapAktif(pendaftaran)

  const butir = tahap.map((t, i) => {
    const penanda = t.status === 'selesai'
      ? ikon('i-check', 'ikon ikon--kecil')
      : String(i + 1)
    const arah = t.status === 'aktif' ? ' aria-current="step"' : ''
    return `
      <li class="tahap-riwayat__item tahap-riwayat__item--${t.status}"${arah}>
        <div class="tahap-riwayat__garis">
          <span class="tahap-riwayat__penanda" aria-hidden="true">${penanda}</span>
          ${i < tahap.length - 1 ? '<span class="tahap-riwayat__hubung"></span>' : ''}
        </div>
        <p class="tahap-riwayat__label">${t.nama}</p>
        <p class="tahap-riwayat__ket">${t.keterangan}</p>
      </li>
    `
  }).join('')

  return `
    <section class="kartu kartu-tahap">
      <ol class="tahap-riwayat" data-aktif="${aktif}">${butir}</ol>
    </section>
  `
}

/** Baris satu dokumen: terunggah (tombol Lihat) atau "Belum tersedia". */
function barisDokumen(persyaratan, dokumen) {
  const kode = persyaratan.kode
  const d = dokumen.find(x => x.kodeDokumen === kode)
  const idIkon = IKON_DOKUMEN[kode] ?? 'i-file-text'

  if (!d) {
    return `
      <div class="dokumen-baris">
        <div class="dokumen-baris__kiri">
          <span class="dokumen-baris__ikon" aria-hidden="true">${ikon('i-file-x')}</span>
          <div>
            <p class="dokumen-baris__nama">${persyaratan.nama}</p>
          </div>
        </div>
        <span class="badge badge--netral">${ikon('i-clock', 'ikon ikon--kecil')} Belum tersedia</span>
      </div>
    `
  }

  return `
    <div class="dokumen-baris">
      <div class="dokumen-baris__kiri">
        <span class="dokumen-baris__ikon" aria-hidden="true">${ikon(idIkon)}</span>
        <div>
          <p class="dokumen-baris__nama">${persyaratan.nama} · ${d.namaFile}</p>
          <p class="dokumen-baris__meta">${formatUkuranFile(d.ukuranFile)} · Diunggah ${formatTanggalWaktu(d.tanggalUnggah)}</p>
        </div>
      </div>
      <button class="tombol tombol--cadangan tombol--konten" type="button" data-lihat="${d.idDokumen}">Lihat</button>
    </div>
  `
}

/** Kolom kiri: Data Pendaftaran + Dokumen Terunggah. */
function kolomKiri(p) {
  const data = p.dataDiri ?? {}
  const persyaratan = p.persyaratanDokumen ?? []
  const dokumen = p.dokumen ?? []
  // Hi-Fi M-06: dokumen terunggah di atas, yang belum tersedia di bawah.
  const urut = [...persyaratan].sort(
    (a, b) =>
      Number(dokumen.some(d => d.kodeDokumen === b.kode)) -
      Number(dokumen.some(d => d.kodeDokumen === a.kode))
  )

  return `
    <div class="detail__kiri">
      <section class="kartu">
        <h2 class="kartu__judul">Data Pendaftaran</h2>
        <dl class="data-dl">
          <dt>Nama lengkap</dt><dd>${data.nama ?? '-'}</dd>
          <dt>NIM</dt><dd>${data.nim ?? '-'}</dd>
          <dt>Email</dt><dd>${data.email ?? '-'}</dd>
          <dt>Nomor telepon</dt><dd>${data.nomorTelepon ?? '-'}</dd>
        </dl>
      </section>

      <section class="kartu">
        <h2 class="kartu__judul">Dokumen Terunggah</h2>
        <div data-dokumen>
          ${urut.map(item => barisDokumen(item, dokumen)).join('')}
        </div>
        <p class="field__error" role="alert" data-preview-pesan hidden></p>
      </section>
    </div>
  `
}

/** Kolom kanan: Hasil Pemeriksaan Berkas. */
function kolomKanan(p) {
  const tidakLengkap = p.statusBerkas === STATUS_BERKAS.TIDAK_LENGKAP
  const lengkap =
    p.statusBerkas === STATUS_BERKAS.LENGKAP ||
    p.statusBerkas === STATUS_BERKAS.SIAP_SELEKSI

  const diperiksa = p.tanggalUpdateBerkas
    ? `
      <p class="meta-baris">Diperiksa pada ${formatTanggalWaktu(p.tanggalUpdateBerkas)}</p>
      <p class="meta-baris">Oleh Admin ${p.namaUKM}</p>
    `
    : ''

  let panel
  if (tidakLengkap) {
    // Dokumen wajib yang belum ada — dasar teks "Unggah KTM …" pada Hi-Fi.
    const belumAda = (p.persyaratanDokumen ?? []).find(
      item => !(p.dokumen ?? []).some(d => d.kodeDokumen === item.kode)
    )
    const namaDokumen = belumAda?.nama ?? 'dokumen'
    panel = `
      <div class="panel-status panel-status--bahaya">
        <p class="panel-status__judul">${ikon('i-alert-circle', 'ikon ikon--kecil')} ${LABEL_STATUS_BERKAS[STATUS_BERKAS.TIDAK_LENGKAP]}</p>
        <p class="panel-status__isi">${p.catatanAdmin ?? ''}</p>
      </div>
      ${diperiksa}
      <p class="kartu__catatan">Unggah ${namaDokumen} untuk melengkapi berkas. Dokumen yang sudah valid tidak perlu diunggah kembali.</p>
      <a class="tombol tombol--utama tombol--blok" href="#/mahasiswa/daftar/${p.idUKM}/dokumen">Perbaiki Berkas</a>
    `
  } else if (lengkap) {
    panel = `
      <div class="panel-status panel-status--sukses">
        <p class="panel-status__judul">${ikon('i-check-circle', 'ikon ikon--kecil')} ${LABEL_STATUS_BERKAS[p.statusBerkas]}</p>
        <p class="panel-status__isi">${p.catatanAdmin ?? ''}</p>
      </div>
      ${diperiksa}
    `
  } else {
    panel = `
      <div class="panel-info">
        ${ikon('i-clock', 'ikon ikon--kecil')}
        <span>${LABEL_STATUS_BERKAS[p.statusBerkas] ?? p.statusBerkas}</span>
      </div>
      ${diperiksa}
    `
  }

  const setelahLengkap = !lengkap
    ? `
      <section class="kartu kartu--lembut">
        <h3 class="kartu__judul">Setelah berkas lengkap</h3>
        <p>${badgeStatusBerkas(STATUS_BERKAS.SIAP_SELEKSI)}</p>
        <p class="kartu__catatan text-muted">Status akan diperbarui setelah admin selesai memverifikasi perbaikan berkas.</p>
      </section>
    `
    : ''

  return `
    <div class="detail__kanan">
      <section class="kartu">
        <h2 class="kartu__judul">Hasil Pemeriksaan Berkas</h2>
        ${panel}
      </section>
      ${setelahLengkap}
    </div>
  `
}

/** Wujud sukses M-06. */
function isiDetail(p) {
  const nomor = p.nomorPendaftaran ?? p.idPendaftaran
  return `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="#/mahasiswa/riwayat">Riwayat Pendaftaran</a>
      ${ikon('i-chevron-right', 'ikon ikon--kecil')}
      <span aria-current="page">Detail</span>
    </nav>

    <header class="detail-kepala">
      <div>
        <h1 class="detail-kepala__judul">${p.namaUKM}</h1>
        <p class="detail-kepala__meta">Tanggal daftar: ${formatTanggalWaktu(p.tanggalDaftar)} · No. ${nomor}</p>
      </div>
      ${badgeStatusBerkas(p.statusBerkas)}
    </header>

    ${stepperRiwayat(p)}

    <div class="detail-kolom">
      ${kolomKiri(p)}
      ${kolomKanan(p)}
    </div>
  `
}

/** State detail tidak ditemukan. */
function isiTidakDitemukan() {
  return `
    <div class="state">
      ${ikon('i-triangle-alert', 'ikon ikon--besar')}
      <p>${PESAN.UKM_TIDAK_DITEMUKAN}</p>
      <a class="tombol tombol--utama" href="#/mahasiswa/riwayat">Kembali ke Riwayat Pendaftaran</a>
    </div>
  `
}

/** State error memuat (AI.md §4). */
function isiError(kembali) {
  return `
    <div class="state">
      ${ikon('i-triangle-alert', 'ikon ikon--besar')}
      <p>${PESAN.GAGAL_MEMUAT_DATA}</p>
      <button class="tombol tombol--utama" type="button" data-coba-lagi>${TEKS_TOMBOL.COBA_LAGI}</button>
      ${kembali}
    </div>
  `
}

/* ===========================================================================
   Render
   =========================================================================== */

/** M-08 — daftar riwayat. */
async function renderDaftar(el, ctx) {
  const konten = pasang(el, { jalur: '/mahasiswa/riwayat' })
  konten.innerHTML = `
    ${bannerDaftar()}
    <div data-daftar></div>
  `
  const wadah = konten.querySelector('[data-daftar]')
  wadah.innerHTML = `<div class="state"><span class="spinner" role="status" aria-label="Memuat"></span><p>Memuat riwayat pendaftaran…</p></div>`

  try {
    const sesi = getSesi()
    const daftar = await getRiwayatPendaftaran(sesi?.idUser ?? '')
    wadah.innerHTML = isiDaftar(daftar)
  } catch (err) {
    console.error(err)
    wadah.innerHTML = isiError('')
    wadah.querySelector('[data-coba-lagi]')?.addEventListener('click', () => render(el, ctx))
  }
}

/** M-06 — detail satu pendaftaran. */
async function renderDetail(el, ctx, idPendaftaran) {
  const konten = pasang(el, { jalur: '/mahasiswa/riwayat' })
  konten.innerHTML = `<div class="state"><span class="spinner" role="status" aria-label="Memuat"></span><p>Memuat detail pendaftaran…</p></div>`

  try {
    const p = await getDetailPendaftaran(idPendaftaran)
    if (!p) {
      konten.innerHTML = isiTidakDitemukan()
      return
    }

    konten.innerHTML = isiDetail(p)

    // Tombol "Lihat" — file asli tidak ada di mock (Brief M-06 aturan preview).
    const pesan = konten.querySelector('[data-preview-pesan]')
    konten.querySelectorAll('[data-lihat]').forEach((tombol) =>
      tombol.addEventListener('click', () => {
        if (!pesan) return
        pesan.textContent = PESAN.DOKUMEN_GAGAL_TAMPIL
        pesan.hidden = false
      })
    )
  } catch (err) {
    console.error(err)
    konten.innerHTML = isiError('<a class="tombol tombol--cadangan" href="#/mahasiswa/riwayat">Kembali ke Riwayat</a>')
    konten.querySelector('[data-coba-lagi]')?.addEventListener('click', () => render(el, ctx))
  }
}

/** Dipanggil router — `ctx.param.idPendaftaran` ada pada rute detail. */
export async function render(el, ctx = {}) {
  const idPendaftaran = ctx.param?.idPendaftaran
  if (idPendaftaran) return renderDetail(el, ctx, idPendaftaran)
  return renderDaftar(el, ctx)
}
