/**
 * Halaman: Notifikasi mahasiswa.
 *
 * [DOKUMEN] PRD v0.3 §7.9 — `notifikasiService.getNotifikasiSaya`,
 *           `tandaiDibaca` (dan `tandaiSemuaDibaca` [USULAN]).
 * [DOKUMEN] UI/UX Wireframe Brief §4.3 — route `#/mahasiswa/notifikasi`.
 * [DOKUMEN] Desain Hi-Fi layar Notifikasi — banner navy dengan tombol putih
 *           "Tandai semua dibaca", tab "Semua (n)" / "Belum dibaca (n)",
 *           "Urutkan: Terbaru", baris notifikasi (ikon, judul, pesan, waktu +
 *           kategori, status "Baru"/"Dibaca", tautan aksi), kartu "Ringkasan",
 *           kartu "Jangan lewatkan pembaruan", catatan kaki.
 * [DOKUMEN] AI.md §4 — empat state; halaman hanya memanggil `services/`.
 *
 * [USULAN] Tab filter dan tombol "Tandai semua dibaca" ada di desain Hi-Fi;
 *          PRD §7.9 hanya memuat `getNotifikasiSaya` dan `tandaiDibaca`.
 */

import { pasang } from '../../layouts/AppShell.js'
import {
  getNotifikasiSaya,
  tandaiDibaca,
  tandaiSemuaDibaca,
} from '../../services/notifikasiService.js'
import { PESAN, TEKS_TOMBOL } from '../../utils/errors.js'
import { formatWaktuRelatif } from '../../utils/format.js'
import { getSesi } from '../../state/session.js'
import { navigasi } from '../../router.js'

/** Tab filter (Hi-Fi: "Semua (5)" / "Belum dibaca (2)"). */
const TAB = Object.freeze([
  { id: 'semua', label: 'Semua' },
  { id: 'belum', label: 'Belum dibaca' },
])

/** Salinan daftar terakhir (di-refresh setiap aksi). */
let daftarSemua = []
/** Tab aktif. */
let tabAktif = 'semua'

function ikon(id, kelas = 'ikon') {
  return `<svg class="${kelas}" aria-hidden="true"><use href="#${id}"></use></svg>`
}

function banner() {
  return `
    <header class="banner">
      <div>
        <h1 class="banner__judul">Notifikasi</h1>
        <p class="banner__sub">Pantau pembaruan pendaftaran, pemeriksaan berkas, dan hasil seleksi UKM Anda.</p>
      </div>
      <div class="banner__kanan">
        <button class="tombol tombol--putih" type="button" data-semua-dibaca>Tandai semua dibaca</button>
      </div>
    </header>
  `
}

function barisTab() {
  const jumlahSemua = daftarSemua.length
  const jumlahBelum = daftarSemua.filter(n => !n.dibaca).length

  const tombol = TAB.map((t) => {
    const jumlah = t.id === 'semua' ? jumlahSemua : jumlahBelum
    return `
      <button class="notif-tab" type="button" role="tab" data-tab="${t.id}"
              aria-selected="${t.id === tabAktif}">${t.label} (${jumlah})</button>
    `
  }).join('')

  return `
    <div class="notif-tabs">
      <div class="notif-tab-group" role="tablist" aria-label="Filter notifikasi">${tombol}</div>
      <span class="notif-urut">Urutkan: Terbaru</span>
    </div>
  `
}

/** Satu baris notifikasi. */
function barisNotifikasi(n) {
  const baru = !n.dibaca
  const status = baru
    ? `<span class="notif-status"><span class="notif-status__titik" aria-hidden="true"></span>Baru</span>`
    : `<span class="notif-status">Dibaca</span>`

  return `
    <article class="notif-baris${baru ? ' notif-baris--baru' : ''}">
      <span class="notif-baris__ikon" aria-hidden="true">${ikon('i-bell')}</span>
      <div class="notif-baris__isi">
        <h2 class="notif-baris__judul">${n.judul}</h2>
        <p class="notif-baris__pesan">${n.pesan}</p>
        <p class="notif-baris__meta">${formatWaktuRelatif(n.timestamp)}${n.kategori ? ` · ${n.kategori}` : ''}</p>
      </div>
      <div class="notif-baris__kanan">
        ${status}
        ${n.aksiLabel
          ? `<button class="notif-aksi" type="button" data-aksi="${n.idNotifikasi}" data-jalur="${n.aksiJalur ?? ''}">${n.aksiLabel}</button>`
          : ''}
      </div>
    </article>
  `
}

/** Daftar sesuai tab aktif (state kosong filter mengikuti PRD §14). */
function isiDaftar() {
  const daftar =
    tabAktif === 'belum' ? daftarSemua.filter(n => !n.dibaca) : daftarSemua

  if (!daftarSemua.length) {
    return `
      <div class="state">
        ${ikon('i-inbox', 'ikon ikon--besar')}
        <p>${PESAN.BELUM_ADA_AKTIVITAS}</p>
      </div>
    `
  }
  if (!daftar.length) {
    return `
      <div class="state">
        ${ikon('i-inbox', 'ikon ikon--besar')}
        <p>${PESAN.TIDAK_ADA_HASIL_FILTER}</p>
      </div>
    `
  }
  return `<div class="notif-daftar">${daftar.map(barisNotifikasi).join('')}</div>`
}

/** Sisi kanan: Ringkasan + pengingat. */
function sisiKanan() {
  const jumlahBelum = daftarSemua.filter(n => !n.dibaca).length
  return `
    <aside class="notif-sisi">
      <section class="kartu">
        <h2 class="kartu__judul">Ringkasan</h2>
        <div class="notif-ringkasan__baris">
          <span>Belum dibaca</span>
          <strong class="notif-ringkasan__angka">${jumlahBelum}</strong>
        </div>
        <div class="notif-ringkasan__baris">
          <span>Total notifikasi</span>
          <strong class="notif-ringkasan__angka">${daftarSemua.length}</strong>
        </div>
        <p class="notif-ringkasan__catatan">Notifikasi baru ditandai dengan titik biru.</p>
      </section>

      <section class="kartu kartu--lembut">
        <h2 class="kartu__judul">Jangan lewatkan pembaruan</h2>
        <p class="text-muted">Cek notifikasi secara berkala agar tidak melewatkan perbaikan berkas, jadwal seleksi, atau pengumuman hasil.</p>
        <a class="tombol tombol--cadangan tombol--blok" href="#/mahasiswa/riwayat">Lihat Riwayat Pendaftaran</a>
      </section>
    </aside>
  `
}

/** Pasang handler tab dan aksi baris (elemen dibuat ulang tiap `gambar`). */
function pasangHandlerBaris(wadah, segarkan) {
  wadah.querySelectorAll('[data-tab]').forEach((t) =>
    t.addEventListener('click', () => {
      tabAktif = t.dataset.tab
      segarkan()
    })
  )

  wadah.querySelectorAll('[data-aksi]').forEach((t) =>
    t.addEventListener('click', async () => {
      try {
        await tandaiDibaca(t.dataset.aksi)
      } catch (err) {
        console.error(err)
      }
      if (t.dataset.jalur) navigasi(t.dataset.jalur)
      else await segarkan()
    })
  )
}

/** Pasang handler banner (elemen tetap, dipasang sekali per render). */
function pasangHandlerBanner(konten) {
  konten.querySelector('[data-semua-dibaca]')?.addEventListener('click', async (e) => {
    const sesi = getSesi()
    const tombol = e.currentTarget
    tombol.disabled = true
    try {
      await tandaiSemuaDibaca(sesi?.idUser ?? '')
      daftarSemua = await getNotifikasiSaya(sesi?.idUser ?? '')
      gambar(konten)
    } catch (err) {
      console.error(err)
      tombol.disabled = false
    }
  })
}

/** Gambar ulang isi (tab + daftar + ringkasan) tanpa memuat ulang banner. */
function gambar(konten) {
  const jumlahBelum = daftarSemua.filter(n => !n.dibaca).length

  // Lencana lonceng navbar ikut berubah tanpa memuat ulang shell.
  const lencana = document.querySelector('[data-lencana-notifikasi]')
  if (lencana) {
    lencana.hidden = jumlahBelum === 0
    lencana.textContent = String(jumlahBelum)
  }

  const wadah = konten.querySelector('[data-notifikasi]')
  wadah.innerHTML = `
    ${barisTab()}
    <div class="notif-grid">
      <div>
        ${isiDaftar()}
        <p class="hasil-catatan">Notifikasi hanya terkait aktivitas dan pendaftaran UKM Anda.</p>
      </div>
      ${sisiKanan()}
    </div>
  `

  // Tombol banner mengikuti jumlah belum dibaca.
  const tombolSemua = konten.querySelector('[data-semua-dibaca]')
  if (tombolSemua) tombolSemua.disabled = jumlahBelum === 0

  pasangHandlerBaris(wadah, () => gambar(konten))
}

/** Ambil ulang data notifikasi lalu gambar. */
async function muat(konten) {
  const sesi = getSesi()
  daftarSemua = await getNotifikasiSaya(sesi?.idUser ?? '')
  gambar(konten)
}

/** Dipanggil router. */
export async function render(el, ctx = {}) {
  const konten = pasang(el, { jalur: '/mahasiswa/notifikasi' })
  tabAktif = 'semua'
  konten.innerHTML = `
    ${banner()}
    <div data-notifikasi>
      <div class="state"><span class="spinner" role="status" aria-label="Memuat"></span><p>Memuat notifikasi…</p></div>
    </div>
  `
  const wadah = konten.querySelector('[data-notifikasi]')
  pasangHandlerBanner(konten)

  try {
    await muat(konten)
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
