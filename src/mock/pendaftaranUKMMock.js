/**
 * Mock layer: pendaftaran UKM.
 *
 * [DOKUMEN] MP2 §3.4.3 Rincian Spesifikasi Control:
 *           - PendaftaranUKMController, hal. 74-75:
 *             getKatalogUKM(), getDetailUKM(idUKM), validasiDokumen(...),
 *             submitPendaftaran(...)
 *           - PendaftaranUKMService, hal. 75:
 *             getUKMdibuka(), getDetailUKM(...), validasiDokumen(...),
 *             saveData(...), saveDokumen(...)
 *           - KategoriController.getDaftarKategori, hal. 77.
 * [DOKUMEN] MP2 §3.6 Pseudo-Code:
 *           PC-01 getKatalogUKM() hal. 83; PC-02 getDetailUKM(idUKM) hal. 83;
 *           PC-03 validasiDokumen(dataMahasiswa, dokumen) hal. 83-84;
 *           PC-04 submitPendaftaran(dataForm, file) hal. 84.
 * [DOKUMEN] PRD v0.3 §7.2, §11.1-11.2.
 * [DOKUMEN] AI.md §3 (signature submitPendaftaran/validasiDokumen) dan §4
 *           (Promise + delay).
 *
 * [USULAN] `delay` diduplikasi di tiap file mock (lihat authMock.js).
 */

import { store } from './store.js'
import { config } from '../config.js'
import { findByStatus, findById, queryDataUKM } from '../models/UKM.js'
import { saveData as simpanKeStorePendaftaran } from '../models/Pendaftaran.js'
import {
  saveDokumen as simpanKeStoreDokumen,
  getDokumenByID,
} from '../models/DokumenPendaftaran.js'
import { persyaratanWajib } from '../models/PersyaratanDokumen.js'
import { STATUS_PENDAFTARAN } from '../enums/statusPendaftaran.js'
import { STATUS_BERKAS } from '../enums/statusBerkas.js'
import {
  validasiDataDiri,
  validasiBerkas,
  semuaBerkasValid,
} from '../utils/validators.js'
import { bolehSubmitPendaftaran } from '../utils/permissions.js'
import { PESAN } from '../utils/errors.js'
import { PERSYARATAN_DOKUMEN_DUMMY } from './data/kategori.dummy.js'

function delay(ms = 350) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Katalog UKM.
 *
 * [DOKUMEN] MP2 §3.6 PC-01 hal. 83 — `getKatalogUKM()`:
 *           "daftarUKM ← PendaftaranUKMService.getUKMdibuka() // service memanggil
 *            UKM.findByStatus(status = "DIBUKA")".
 *           Output PC-01: "daftar UKM dengan status pendaftaran DIBUKA".
 *
 * [USULAN] Konflik: PC-01 dan PRD §7.2 mengembalikan hanya DIBUKA, sedangkan
 *          screenshot `Katalog UKM.png` menampilkan UKM DITUTUP dengan tombol
 *          "Daftar" nonaktif, dan AI.md §6 mewajibkan "UKM berstatus DITUTUP:
 *          tombol 'Daftar' nonaktif". AI.md §2 menempatkan UI/UX Wireframe Brief
 *          sebagai prioritas tertinggi, sehingga katalog menampilkan UKM
 *          TERVERIFIKASI (DIBUKA dan DITUTUP). `getUKMdibuka()` tetap mengikuti
 *          modul: hanya DIBUKA.
 */
export async function mockGetKatalogUKM() {
  await delay()
  return queryDataUKM(store.ukm).filter(u => u.statusVerifikasi === 'TERVERIFIKASI')
}

/**
 * UKM dengan pendaftaran DIBUKA.
 * [DOKUMEN] MP2 §3.4.3 hal. 75 — PendaftaranUKMService.getUKMdibuka().
 *           MP2 §3.3 SD-UC003 pesan 4 (hal. 36): UKM.findByStatus(status = "DIBUKA").
 */
export async function mockGetUKMdibuka() {
  await delay()
  return findByStatus(store.ukm, STATUS_PENDAFTARAN.DIBUKA)
}

/**
 * Detail UKM + periode pendaftaran aktif.
 * [DOKUMEN] MP2 §3.4.3 hal. 75 — PendaftaranUKMService.getDetailUKM.
 *           MP2 §3.6 PC-02 hal. 83 — output: "Detail UKM ... dan periode aktif".
 *           PRD §7.2: `getDetailUKM(idUKM)` → "UKM + periode aktif".
 * [USULAN] `periodeAktif` berasal dari PeriodePendaftaran (PRD §6.9 [USULAN]).
 *           `persyaratanDokumen` disusun terstruktur (AI.md §3 keputusan K2).
 */
export async function mockGetDetailUKM(idUKM) {
  await delay()
  const ukm = findById(store.ukm, idUKM)
  if (!ukm) return null
  return {
    ...ukm,
    periodeAktif: {
      idUKM: ukm.idUKM,
      tanggalBuka: ukm.tanggalBuka,
      tanggalTutup: ukm.tanggalTutup,
      persyaratanDokumen: persyaratanWajib(PERSYARATAN_DOKUMEN_DUMMY),
    },
  }
}

/**
 * Daftar kategori (read-only).
 * [DOKUMEN] MP2 §3.4.3 hal. 77 — KategoriController.getDaftarKategori().
 *           PRD §7.8 kategoriService.
 */
export async function mockGetDaftarKategori() {
  await delay(200)
  return [...store.kategori]
}

/**
 * Validasi satu berkas.
 * [DOKUMEN] MP2 §3.4.3 hal. 75 dan §3.6 PC-03 hal. 84:
 *           "cek format PDF/JPEG dan ukuran maksimal 5 MB".
 *           Modul memakai signature `validasiDokumen(dataMahasiswa, dokumen)`;
 *           AI.md §3: "Di sprint ini pakai `validasiDokumen(file)` untuk satu file."
 * [DOKUMEN] PRD §11.2: "Validasi saat pilih file dan ulang saat submit."
 */
export async function mockValidasiDokumen(file) {
  await delay(120)
  const hasil = validasiBerkas(file)
  return { valid: hasil.valid, pesan: hasil.pesan }
}

/**
 * Validasi kelengkapan seluruh berkas.
 * [DOKUMEN] AI.md §3: "`validasiSemuaBerkas(berkas[])` untuk memeriksa kelengkapan."
 * [DOKUMEN] AI.md §6 M-04: "Ketiga dokumen wajib (KTM, Transkrip, CV) harus valid."
 * @param {Array<{kode: string, file: File}>} berkas
 */
export async function mockValidasiSemuaBerkas(berkas) {
  await delay(150)
  const daftarFile = (berkas ?? []).map(b => b?.file ?? b)
  const wajib = persyaratanWajib(PERSYARATAN_DOKUMEN_DUMMY)
  if (daftarFile.length < wajib.length) {
    return { valid: false, pesan: PESAN.FORMAT_FILE }
  }
  if (!semuaBerkasValid(daftarFile)) {
    const pertama = daftarFile.find(f => !validasiBerkas(f).valid)
    return { valid: false, pesan: validasiBerkas(pertama).pesan }
  }
  return { valid: true, pesan: PESAN.FORMAT_VALID }
}

/**
 * Simpan pendaftaran beserta seluruh berkasnya.
 * [DOKUMEN] MP2 §3.4.3 hal. 75 — PendaftaranUKMService.saveData dan saveDokumen.
 *           MP2 §3.6 PC-04 hal. 84 — "idPendaftaran ← saveData(dataForm)", lalu
 *           "untuk setiap berkas: saveDokumen(idPendaftaran, berkas)".
 *           MP2 §3.3 SD-UC003 pesan 24 dan 27 (hal. 37).
 * [DOKUMEN] PRD §11.2: "Submit: simpanPendaftaran menyimpan Pendaftaran dengan
 *           statusBerkas = MENUNGGU_VERIFIKASI_BERKAS, lalu DokumenPendaftaran."
 * [DOKUMEN] AI.md §3: signature `submitPendaftaran(dataForm, berkas[])`.
 *           AI.md §9: "Beri komentar // USULAN: sebelumnya satu file."
 *
 * @param {object} dataForm { idUKM, idMahasiswa, nama, nim, email, nomorTelepon, alasan }
 * @param {Array<{kode: string, file: File}>} berkas
 * @returns {Promise<{berhasil: boolean, idPendaftaran: string|null, pesan: string}>}
 */
export async function mockSimpanPendaftaran(dataForm, berkas) {
  await delay()
  const ukm = findById(store.ukm, dataForm?.idUKM)
  if (!ukm) {
    return { berhasil: false, idPendaftaran: null, pesan: PESAN.UKM_TIDAK_DITEMUKAN }
  }
  if (!bolehSubmitPendaftaran(ukm)) {
    return { berhasil: false, idPendaftaran: null, pesan: PESAN.UKM_TIDAK_DITEMUKAN }
  }
  const data = validasiDataDiri(dataForm)
  if (!data.valid) {
    return { berhasil: false, idPendaftaran: null, pesan: data.pesan }
  }
  const cekBerkas = await mockValidasiSemuaBerkas(berkas)
  if (!cekBerkas.valid) {
    return { berhasil: false, idPendaftaran: null, pesan: cekBerkas.pesan }
  }

  // [USULAN] sakelar memaksa gagal — DoD AI.md §10: "Tombol Retry muncul dan
  //          berfungsi saat mock dipaksa gagal". Aktifkan dari console dengan
  //          mengubah `config.paksaGagalSimpan = true`.
  if (config.paksaGagalSimpan) {
    return { berhasil: false, idPendaftaran: null, pesan: PESAN.GAGAL_SIMPAN }
  }

  const idPendaftaran = await mockSaveData(dataForm)
  for (const item of berkas ?? []) {
    await mockSaveDokumen(idPendaftaran, item?.file, item?.kode)
  }
  return { berhasil: true, idPendaftaran, pesan: PESAN.PENDAFTARAN_BERHASIL }
}

/**
 * Service — `saveData(dataForm)` -> idPendaftaran.
 * [DOKUMEN] MP2 §3.4.3 hal. 75, §3.6 PC-04 hal. 84 ("idPendaftaran ← saveData(dataForm)"),
 *           dan entitas Pendaftaran.saveData(dataForm): String (MP2 §3.4.1 hal. 67).
 * @returns {Promise<string>}
 */
export async function mockSaveData(dataForm) {
  await delay(80)
  return simpanKeStorePendaftaran(store.pendaftaran, {
    idUKM: dataForm.idUKM,
    idMahasiswa: dataForm.idMahasiswa,
    statusBerkas: STATUS_BERKAS.MENUNGGU_VERIFIKASI_BERKAS,
  })
}

/**
 * Service — `saveDokumen(idPendaftaran, file)` -> boolean.
 * [DOKUMEN] MP2 §3.4.3 hal. 75, §3.3 SD-UC003 pesan 24 (hal. 37), dan entitas
 *           DokumenPendaftaran.saveDokumen (MP2 §3.4.1 hal. 68).
 * [USULAN] parameter `kodeDokumen` — menghubungkan unggahan dengan
 *          PersyaratanDokumen.kode untuk layar M-06.
 * @returns {Promise<boolean>}
 */
export async function mockSaveDokumen(idPendaftaran, file, kodeDokumen) {
  await delay(80)
  return simpanKeStoreDokumen(store.dokumen, idPendaftaran, file, kodeDokumen)
}

/**
 * Ambil dokumen milik satu pendaftaran.
 * [DOKUMEN] MP2 §3.4.1 hal. 68 — DokumenPendaftaran.getDokumenByID.
 * [USULAN] Tidak dipakai layar sprint ini; disediakan karena tercantum di modul.
 */
export async function mockGetDokumenByID(idPendaftaran) {
  await delay(120)
  return getDokumenByID(store.dokumen, idPendaftaran)
}

/* ===========================================================================
   Riwayat pendaftaran mahasiswa (layar M-08 dan M-06)
   =========================================================================== */

/**
 * Daftar riwayat pendaftaran milik satu mahasiswa, terbaru di atas.
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-08 — "Daftar kartu pendaftaran milik
 *           mahasiswa. Setiap kartu: nama UKM, nomor pendaftaran, tanggal
 *           daftar, badge status pendaftaran, dan tombol 'Lihat Detail'.
 *           Urutan terbaru di atas."
 * [DOKUMEN] BUC UC1 post condition — menu Riwayat Pendaftaran.
 * [USULAN] PRD tidak memuat nama method riwayat; bentuk return menggabungkan
 *          Pendaftaran + UKM + kategori agar halaman tidak menggabungkan data.
 * @param {string} idMahasiswa
 * @returns {Promise<Array<object>>}
 */
export async function mockGetRiwayatPendaftaran(idMahasiswa) {
  await delay()
  return store.pendaftaran
    .filter(p => p.idMahasiswa === idMahasiswa)
    .map(p => {
      const ukm = findById(store.ukm, p.idUKM)
      const kategori = store.kategori.find(k => k.idKategori === ukm?.idKategori)
      return {
        ...p,
        namaUKM: ukm?.namaUKM ?? '',
        ikon: ukm?.ikon ?? 'i-award',
        foto: ukm?.foto ?? '',
        emailUKM: ukm?.emailUKM ?? '',
        namaKategori: kategori?.namaKategori ?? '',
      }
    })
    .sort(
      (a, b) =>
        new Date(b.tanggalDaftar).getTime() - new Date(a.tanggalDaftar).getTime()
    )
}

/**
 * Detail satu riwayat pendaftaran (M-06).
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-06 — kartu "Data Pendaftaran" (nama,
 *           NIM, email, nomor telepon), kartu "Dokumen Terunggah" (termasuk
 *           dokumen wajib yang belum tersedia), dan kartu "Hasil Pemeriksaan
 *           Berkas".
 * [USULAN] PRD tidak memuat method ini; `dataDiri` diambil dari entitas
 *          Mahasiswa karena pendaftaran menyimpan referensi `idMahasiswa`.
 * @param {string} idPendaftaran
 * @returns {Promise<object|null>}
 */
export async function mockGetDetailPendaftaran(idPendaftaran) {
  await delay()
  const p = store.pendaftaran.find(x => x.idPendaftaran === idPendaftaran)
  if (!p) return null

  const ukm = findById(store.ukm, p.idUKM)
  const kategori = store.kategori.find(k => k.idKategori === ukm?.idKategori)
  const pengguna = store.pengguna.find(u => u.idUser === p.idMahasiswa)

  return {
    ...p,
    namaUKM: ukm?.namaUKM ?? '',
    ikon: ukm?.ikon ?? 'i-award',
    foto: ukm?.foto ?? '',
    emailUKM: ukm?.emailUKM ?? '',
    statusPendaftaranUKM: ukm?.statusPendaftaran ?? '',
    namaKategori: kategori?.namaKategori ?? '',
    // Urut sesuai persyaratan; dokumen yang belum diunggah tidak ada di store.
    persyaratanDokumen: persyaratanWajib(PERSYARATAN_DOKUMEN_DUMMY),
    dokumen: getDokumenByID(store.dokumen, idPendaftaran).map(d => ({ ...d })),
    dataDiri: pengguna
      ? {
          nama: pengguna.nama ?? '',
          nim: pengguna.nim ?? '',
          email: pengguna.email ?? '',
          nomorTelepon: pengguna.nomorTelepon ?? '',
        }
      : null,
  }
}
