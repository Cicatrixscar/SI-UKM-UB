/**
 * Service: pendaftaran UKM.
 *
 * [DOKUMEN] PRD v0.3 §7.2 (dua tabel: PendaftaranUKMController dan
 *           PendaftaranUKMService). Karena AI.md §5 hanya memuat satu file
 *           service, nama dari kedua tabel diekspor di sini dan tiap method
 *           diberi komentar asal tabelnya.
 *
 * PendaftaranUKMController [DOKUMEN: MP2 §3.4.3 hal. 74-75 / PRD §7.2]
 *   | getKatalogUKM()                            | —   | UKM[] (status DIBUKA) |
 *   | getDetailUKM(idUKM)                        | String | UKM + periode aktif |
 *   | validasiDokumen(dataMahasiswa, dokumen)    | Object, File | `{ valid, pesan }` |
 *   | submitPendaftaran(dataForm, file)          | Object, File | `{ berhasil, pesan }` |
 *
 * PendaftaranUKMService [DOKUMEN: MP2 §3.4.3 hal. 75 / PRD §7.2]
 *   | getUKMdibuka()                             | —   | UKM[] |
 *   | getDetailUKM(idUKM)                        | String | UKM |
 *   | validasiDokumen(dataMahasiswa, dokumen)    | Object, File | `{ valid, pesan }` |
 *   | simpanPendaftaran(dataForm, file)          | Object, File | `{ berhasil, idPendaftaran }` |
 *   | saveData(dataForm)                         | Object | idPendaftaran |
 *   | saveDokumen(idPendaftaran, file)           | String, File | boolean |
 *
 * Pengecualian signature [DOKUMEN: AI.md §3]:
 *   - `submitPendaftaran(dataForm, berkas[])` — berkas berisi `{ kode, file }`.
 *   - `simpanPendaftaran(dataForm, berkas[])` — mengikuti signature submit.
 *   - `validasiDokumen(file)` untuk satu file; `validasiSemuaBerkas(berkas[])`
 *     untuk kelengkapan.
 * [DOKUMEN] AI.md §4: setiap service mengembalikan Promise.
 *
 * Data dibaca/ditulis ke Supabase (tabel `ukm`, `pendaftaran`,
 * `dokumen_pendaftaran`, `persyaratan_dokumen`, `timeline_ukm`) dan berkas
 * diunggah ke bucket Storage `dokumen`.
 */

import { config } from '../config.js'
import { ambilSupabase, pastikan } from './supabaseClient.js'
import {
  petakanUkm,
  petakanPersyaratan,
  petakanTimeline,
  petakanPendaftaran,
  petakanDokumen,
} from './pemetaanBaris.js'
import { STATUS_BERKAS } from '../enums/statusBerkas.js'
import { KODE_DOKUMEN, persyaratanWajib } from '../models/PersyaratanDokumen.js'
import { validasiDataDiri, validasiBerkas, semuaBerkasValid } from '../utils/validators.js'
import { bolehSubmitPendaftaran } from '../utils/permissions.js'
import { PESAN } from '../utils/errors.js'

/** Nama bucket Storage untuk berkas pendaftaran. */
const BUCKET_DOKUMEN = 'dokumen'

/** Urutan tampil persyaratan pada Detail UKM (M-02). */
const URUTAN_KODE = Object.values(KODE_DOKUMEN)

/** Baris `ukm` + kategori ter-embed → objek UKM datar. */
function lengkapiKategori(baris) {
  return {
    ...petakanUkm(baris),
    namaKategori: baris?.kategori?.nama_kategori ?? '',
  }
}

/**
 * Katalog UKM.
 *
 * [DOKUMEN] MP2 §3.6 PC-01 hal. 83 — output "daftar UKM dengan status DIBUKA".
 * [USULAN] Katalog menampilkan UKM TERVERIFIKASI (DIBUKA dan DITUTUP) agar
 *          tombol "Daftar" nonaktif pada UKM DITUTUP tetap terlihat (UIX M-01).
 */
export async function getKatalogUKM() {
  const { data, error } = await ambilSupabase()
    .from('ukm')
    .select('*, kategori(nama_kategori)')
    .eq('status_verifikasi', 'TERVERIFIKASI')
    .order('id_ukm')
  pastikan(error)
  return (data ?? []).map(lengkapiKategori)
}

/**
 * UKM dengan pendaftaran DIBUKA.
 * [DOKUMEN] MP2 §3.4.3 hal. 75 — PendaftaranUKMService.getUKMdibuka().
 */
export async function getUKMdibuka() {
  const { data, error } = await ambilSupabase()
    .from('ukm')
    .select('*, kategori(nama_kategori)')
    .eq('status_pendaftaran', 'DIBUKA')
    .order('id_ukm')
  pastikan(error)
  return (data ?? []).map(lengkapiKategori)
}

/**
 * Detail UKM + periode pendaftaran aktif.
 * [DOKUMEN] MP2 §3.4.3 hal. 75, MP2 §3.6 PC-02 hal. 83, PRD §7.2.
 * [USULAN] `periodeAktif` berisi tanggal periode + persyaratan dokumen wajib.
 * @returns {Promise<object|null>}
 */
export async function getDetailUKM(idUKM) {
  const db = ambilSupabase()
  const [ukmRes, syaratRes, timelineRes] = await Promise.all([
    db.from('ukm').select('*').eq('id_ukm', idUKM).maybeSingle(),
    db.from('persyaratan_dokumen').select('*').eq('wajib', true),
    db.from('timeline_ukm').select('*').eq('id_ukm', idUKM).order('urutan'),
  ])
  pastikan(ukmRes.error)
  pastikan(syaratRes.error)
  pastikan(timelineRes.error)

  if (!ukmRes.data) return null

  const persyaratan = (syaratRes.data ?? [])
    .map(petakanPersyaratan)
    .sort((a, b) => URUTAN_KODE.indexOf(a.kode) - URUTAN_KODE.indexOf(b.kode))

  const ukm = petakanUkm(ukmRes.data)
  return {
    ...ukm,
    timeline: (timelineRes.data ?? []).map(petakanTimeline),
    periodeAktif: {
      idUKM: ukm.idUKM,
      tanggalBuka: ukm.tanggalBuka,
      tanggalTutup: ukm.tanggalTutup,
      persyaratanDokumen: persyaratanWajib(persyaratan),
    },
  }
}

/**
 * Validasi satu berkas.
 * [DOKUMEN] MP2 §3.4.3 hal. 75 dan §3.6 PC-03 hal. 84.
 * @returns {Promise<{valid: boolean, pesan: string}>}
 */
export async function validasiDokumen(file) {
  const hasil = validasiBerkas(file)
  return { valid: hasil.valid, pesan: hasil.pesan }
}

/**
 * Validasi kelengkapan seluruh berkas.
 * [DOKUMEN] AI.md §3 dan §6 M-04: "Ketiga dokumen wajib (KTM, Transkrip, CV) harus valid."
 * @param {Array<{kode: string, file: File}>} berkas
 * @returns {Promise<{valid: boolean, pesan: string}>}
 */
export async function validasiSemuaBerkas(berkas) {
  const daftarFile = (berkas ?? []).map(b => b?.file ?? b)
  if (daftarFile.length < URUTAN_KODE.length) {
    return { valid: false, pesan: PESAN.FORMAT_FILE }
  }
  if (!semuaBerkasValid(daftarFile)) {
    const pertama = daftarFile.find(f => !validasiBerkas(f).valid)
    return { valid: false, pesan: validasiBerkas(pertama).pesan }
  }
  return { valid: true, pesan: PESAN.FORMAT_VALID }
}

/**
 * Buat nomor pendaftaran tampilan (M-08/M-06) dan id pendaftaran.
 * shortcut: nomor memakai 4 digit acak; cukup untuk demo, urutan sebenarnya
 * harus dari sequence Postgres kalau dipakai bersamaan oleh banyak mahasiswa.
 */
function buatIdPendaftaran() {
  const tahun = new Date().getFullYear()
  const urut = String(Math.floor(Math.random() * 9000) + 1000)
  return { idPendaftaran: `PD-${tahun}-${urut}`, nomorPendaftaran: `UKM-${tahun}-${urut}` }
}

/** Unggah satu berkas ke Storage dan kembalikan URL publiknya. */
async function unggahBerkas(db, idPendaftaran, file, kodeDokumen) {
  const ekstensi = String(file?.name ?? '').split('.').pop() || 'bin'
  const path = `${idPendaftaran}/${kodeDokumen}.${ekstensi}`
  const { error } = await db.storage.from(BUCKET_DOKUMEN).upload(path, file, { upsert: true })
  pastikan(error)
  const { data } = db.storage.from(BUCKET_DOKUMEN).getPublicUrl(path)
  return data?.publicUrl ?? ''
}

/**
 * Service — `saveData(dataForm)` → idPendaftaran.
 * [DOKUMEN] MP2 §3.4.3 hal. 75, §3.6 PC-04 hal. 84, PRD §11.2
 *           (statusBerkas = MENUNGGU_VERIFIKASI_BERKAS).
 * @returns {Promise<string>}
 */
export async function saveData(dataForm) {
  const { idPendaftaran, nomorPendaftaran } = buatIdPendaftaran()
  const { error } = await ambilSupabase().from('pendaftaran').insert({
    id_pendaftaran: idPendaftaran,
    nomor_pendaftaran: nomorPendaftaran,
    id_ukm: dataForm.idUKM,
    id_mahasiswa: dataForm.idMahasiswa,
    status_berkas: STATUS_BERKAS.MENUNGGU_VERIFIKASI_BERKAS,
    status_seleksi: 'PENDING',
  })
  pastikan(error)
  return idPendaftaran
}

/**
 * Service — `saveDokumen(idPendaftaran, file)` → boolean.
 * [DOKUMEN] MP2 §3.4.3 hal. 75 dan entitas DokumenPendaftaran.saveDokumen.
 * @returns {Promise<boolean>}
 */
export async function saveDokumen(idPendaftaran, file, kodeDokumen) {
  if (!idPendaftaran || !file || !validasiBerkas(file).valid) return false
  const db = ambilSupabase()
  try {
    const fileUrl = await unggahBerkas(db, idPendaftaran, file, kodeDokumen)
    const { error } = await db.from('dokumen_pendaftaran').insert({
      id_dokumen: `DKM-${Date.now()}-${kodeDokumen}`,
      id_pendaftaran: idPendaftaran,
      nama_file: file.name,
      kode_dokumen: kodeDokumen,
      tipe_dokumen: file.type,
      file_url: fileUrl,
      ukuran_file: file.size,
    })
    pastikan(error)
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

/**
 * Controller — `submitPendaftaran(dataForm, berkas[])`.
 * [DOKUMEN] MP2 §3.4.3 hal. 74, SD-UC003 (hal. 34-37), PRD §7.2, AI.md §3.
 * @param {object} dataForm
 * @param {Array<{kode: string, file: File}>} berkas
 * @returns {Promise<{berhasil: boolean, idPendaftaran: string|null, pesan: string}>}
 */
export async function submitPendaftaran(dataForm, berkas) {
  try {
    const ukm = await getDetailUKM(dataForm?.idUKM)
    if (!ukm || !bolehSubmitPendaftaran(ukm)) {
      return { berhasil: false, idPendaftaran: null, pesan: PESAN.UKM_TIDAK_DITEMUKAN }
    }

    if (dataForm?.idMahasiswa && dataForm?.idUKM) {
      const sudah = await cekSudahDaftar(dataForm.idMahasiswa, dataForm.idUKM)
      if (sudah) {
        return { berhasil: false, idPendaftaran: null, pesan: 'Anda sudah terdaftar di UKM ini.' }
      }
    }

    const data = validasiDataDiri(dataForm)
    if (!data.valid) {
      return { berhasil: false, idPendaftaran: null, pesan: data.pesan }
    }

    const cekBerkas = await validasiSemuaBerkas(berkas)
    if (!cekBerkas.valid) {
      return { berhasil: false, idPendaftaran: null, pesan: cekBerkas.pesan }
    }

    // [USULAN] Sakelar memaksa gagal — DoD AI.md §10: "Tombol Retry muncul dan
    //          berfungsi saat mock dipaksa gagal". Aktifkan dari console dengan
    //          mengubah `config.paksaGagalSimpan = true`.
    if (config.paksaGagalSimpan) {
      return { berhasil: false, idPendaftaran: null, pesan: PESAN.GAGAL_SIMPAN }
    }

    const idPendaftaran = await saveData(dataForm)
    for (const item of berkas ?? []) {
      await saveDokumen(idPendaftaran, item?.file, item?.kode)
    }
    return { berhasil: true, idPendaftaran, pesan: PESAN.PENDAFTARAN_BERHASIL }
  } catch (err) {
    console.error(err)
    return { berhasil: false, idPendaftaran: null, pesan: PESAN.GAGAL_SIMPAN }
  }
}

/**
 * Service — `simpanPendaftaran(dataForm, berkas[])`.
 * [DOKUMEN] MP2 §3.4.3 hal. 75 dan PRD §7.2 ("saveData lalu saveDokumen").
 */
export async function simpanPendaftaran(dataForm, berkas) {
  return submitPendaftaran(dataForm, berkas)
}

/**
 * Riwayat pendaftaran milik mahasiswa (menu "Riwayat Pendaftaran", M-08).
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-08 dan BUC UC1 post condition.
 * @param {string} idMahasiswa
 * @returns {Promise<Array<object>>}
 */
export async function getRiwayatPendaftaran(idMahasiswa) {
  const { data, error } = await ambilSupabase()
    .from('pendaftaran')
    .select('*, ukm(nama_ukm, icon, foto, email_ukm, kategori(nama_kategori))')
    .eq('id_mahasiswa', idMahasiswa)
    .order('tanggal_daftar', { ascending: false })
  pastikan(error)
  return (data ?? []).map(p => ({
    ...petakanPendaftaran(p),
    namaUKM: p.ukm?.nama_ukm ?? '',
    ikon: p.ukm?.icon ?? 'i-award',
    foto: p.ukm?.foto ?? '',
    emailUKM: p.ukm?.email_ukm ?? '',
    namaKategori: p.ukm?.kategori?.nama_kategori ?? '',
  }))
}

/**
 * Ambil himpunan id_ukm yang sudah didaftari oleh seorang mahasiswa.
 * @param {string} idMahasiswa
 * @returns {Promise<Set<string>>}
 */
export async function getIdUKMTerdaftarMahasiswa(idMahasiswa) {
  if (!idMahasiswa) return new Set()
  try {
    const { data, error } = await ambilSupabase()
      .from('pendaftaran')
      .select('id_ukm')
      .eq('id_mahasiswa', idMahasiswa)
    if (error) {
      console.error(error)
      return new Set()
    }
    return new Set((data ?? []).map((row) => row.id_ukm))
  } catch (err) {
    console.error(err)
    return new Set()
  }
}

/**
 * Cek apakah seorang mahasiswa sudah terdaftar di UKM tertentu.
 * @param {string} idMahasiswa
 * @param {string} idUKM
 * @returns {Promise<boolean>}
 */
export async function cekSudahDaftar(idMahasiswa, idUKM) {
  if (!idMahasiswa || !idUKM) return false
  try {
    const { data, error } = await ambilSupabase()
      .from('pendaftaran')
      .select('id_pendaftaran')
      .eq('id_mahasiswa', idMahasiswa)
      .eq('id_ukm', idUKM)
      .maybeSingle()
    if (error) {
      console.error(error)
      return false
    }
    return Boolean(data)
  } catch (err) {
    console.error(err)
    return false
  }
}

/**
 * Detail satu riwayat pendaftaran (M-06).
 * [DOKUMEN] UI/UX Wireframe Brief §5 M-06 — kartu "Data Pendaftaran",
 *           "Dokumen Terunggah", dan "Hasil Pemeriksaan Berkas".
 * @param {string} idPendaftaran
 * @returns {Promise<object|null>}
 */
export async function getDetailPendaftaran(idPendaftaran) {
  const db = ambilSupabase()
  const { data: baris, error } = await db
    .from('pendaftaran')
    .select('*, ukm(nama_ukm, icon, foto, email_ukm, status_pendaftaran, kategori(nama_kategori))')
    .eq('id_pendaftaran', idPendaftaran)
    .maybeSingle()
  pastikan(error)
  if (!baris) return null

  const [dokumenRes, syaratRes, penggunaRes] = await Promise.all([
    db.from('dokumen_pendaftaran').select('*').eq('id_pendaftaran', idPendaftaran),
    db.from('persyaratan_dokumen').select('*').eq('wajib', true),
    db.from('pengguna').select('*').eq('id_user', baris.id_mahasiswa).maybeSingle(),
  ])
  pastikan(dokumenRes.error)
  pastikan(syaratRes.error)
  pastikan(penggunaRes.error)

  const persyaratan = (syaratRes.data ?? [])
    .map(petakanPersyaratan)
    .sort((a, b) => URUTAN_KODE.indexOf(a.kode) - URUTAN_KODE.indexOf(b.kode))
  const pengguna = penggunaRes.data

  return {
    ...petakanPendaftaran(baris),
    namaUKM: baris.ukm?.nama_ukm ?? '',
    ikon: baris.ukm?.icon ?? 'i-award',
    foto: baris.ukm?.foto ?? '',
    emailUKM: baris.ukm?.email_ukm ?? '',
    statusPendaftaranUKM: baris.ukm?.status_pendaftaran ?? '',
    namaKategori: baris.ukm?.kategori?.nama_kategori ?? '',
    persyaratanDokumen: persyaratanWajib(persyaratan),
    dokumen: (dokumenRes.data ?? []).map(petakanDokumen),
    dataDiri: pengguna
      ? {
          nama: pengguna.nama ?? '',
          nim: pengguna.nim ?? '',
          email: pengguna.email ?? '',
          nomorTelepon: pengguna.nomor_telepon ?? '',
        }
      : null,
  }
}

/**
 * Controller: PendaftaranUKMController
 * [DOKUMEN] KD hal. 1, MP2 §3.4.3 hal. 74-75, PRD v0.3 §7.2.
 */
export class PendaftaranUKMController {
  static async getKatalogUKM() {
    return getKatalogUKM()
  }

  static async getDetailUKM(idUKM) {
    return getDetailUKM(idUKM)
  }

  static async validasiDokumen(file, dokumen) {
    return validasiDokumen(dokumen ?? file)
  }

  static async submitPendaftaran(dataForm, berkas) {
    return submitPendaftaran(dataForm, berkas)
  }

  /**
   * Alias: buatPendaftaran(dataForm, berkas)
   * Sesuai label pesan di Sequence Diagram 1
   */
  static async buatPendaftaran(dataForm, berkas) {
    return submitPendaftaran(dataForm, berkas)
  }
}

/**
 * Alias fungsi buatPendaftaran sesuai label pesan di Sequence Diagram 1
 */
export const buatPendaftaran = submitPendaftaran

/**
 * Service: PendaftaranUKMService
 * [DOKUMEN] MP2 §3.4.3 hal. 75, PRD v0.3 §7.2.
 */
export class PendaftaranUKMService {
  static async getUKMdibuka() {
    return getUKMdibuka()
  }

  static async getDetailUKM(idUKM) {
    return getDetailUKM(idUKM)
  }

  static async validasiDokumen(file, dokumen) {
    return validasiDokumen(dokumen ?? file)
  }

  static async validasiSemuaBerkas(berkas) {
    return validasiSemuaBerkas(berkas)
  }

  static async simpanPendaftaran(dataForm, berkas) {
    return simpanPendaftaran(dataForm, berkas)
  }

  static async saveData(dataForm) {
    return saveData(dataForm)
  }

  static async saveDokumen(idPendaftaran, file, kodeDokumen) {
    return saveDokumen(idPendaftaran, file, kodeDokumen)
  }
}
