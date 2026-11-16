/**
 * Entitas: Pendaftaran.
 *
 * Sumber: Modul II (MP2) §3.4.1 Gambar Diagram Kelas Utuh, hal. 67-68
 *         "Pendaftaran | idPendaftaran, idUKM, idMahasiswa, tanggalDaftar,
 *          statusBerkas, statusSeleksi, catatanAdmin |
 *          Method: saveData(dataForm: Object): String,
 *                  fetchPendaftarList(), updateStatusBerkas(...),
 *                  updateStatusSeleksi(...), hitungJumlahSeleksi(idUKM),
 *                  cekStatusPending(idUKM), updateSemuaStatusMenjadiDiumumkan(idUKM)"
 * Sumber: Kelas Diagram Package (KD) hal. 1.
 * Sumber: PRD v0.3 §6.5.
 *
 * [DOKUMEN] Method pada baris komentar di bawah adalah method entitas yang
 *           benar-benar dipakai sprint UC003/UC004. Method lain yang tercantum
 *           di modul (fetchPendaftarList, updateStatusBerkas, updateStatusSeleksi,
 *           hitungJumlahSeleksi, cekStatusPending,
 *           updateSemuaStatusMenjadiDiumumkan, queryStatistikPendaftaran)
 *           TIDAK diimplementasikan karena di luar lingkup sprint (AI.md §1).
 *
 * [USULAN] field `catatanSeleksi` dan `terkunci` (PRD §6.5) — tidak ada di modul.
 * [USULAN] `nomorPendaftaran` dan `tanggalDiumumkan` — keputusan sementara G4
 *          dibuka kembali: Hi-Fi M-08/M-06 menampilkan nomor pendaftaran
 *          ("PD-2026-0142") dan M-07 menampilkan waktu pengumuman.
 */

import { STATUS_BERKAS, STATUS_SELEKSI } from '../enums/statusBerkas.js'

let penghitungId = 0

/**
 * @typedef {object} Pendaftaran
 * @property {string} idPendaftaran
 * @property {string} idUKM
 * @property {string} idMahasiswa
 * @property {string} tanggalDaftar  ISO 8601
 * @property {string} statusBerkas
 * @property {string} statusSeleksi
 * @property {string} catatanAdmin
 * @property {string} catatanSeleksi [USULAN]
 * @property {boolean} terkunci      [USULAN]
 * @property {string} nomorPendaftaran [USULAN] Nomor urut tampilan (M-08/M-06).
 * @property {string} [tanggalDiumumkan] [USULAN] Waktu pengumuman (M-07).
 * @property {string} [tanggalUpdateBerkas] [USULAN] Waktu pemeriksaan berkas
 *           oleh admin — dipakai M-06 "Diperiksa pada …".
 */

/** Factory entitas Pendaftaran. Atribut sesuai MP2 §3.4.1 hal. 67. */
export function createPendaftaran(data) {
  return new Pendaftaran(data)
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 67 — Pendaftaran.saveData(dataForm): String
 *         Sumber: MP2 §3.6 PC-04 hal. 84 — "idPendaftaran ← saveData(dataForm)".
 * [USULAN] parameter `daftarPendaftaran` karena method pada modul bersifat
 *          class-level; penyimpanan nyata dilakukan service ke Supabase.
 * [USULAN] format idPendaftaran (keputusan sementara G4: nomor pendaftaran tidak dibuat).
 */
export function saveData(daftarPendaftaran, dataForm) {
  penghitungId += 1
  const idPendaftaran = `PD-${Date.now()}-${String(penghitungId).padStart(3, '0')}`
  const pendaftaran = createPendaftaran({
    idPendaftaran,
    idUKM: dataForm.idUKM,
    idMahasiswa: dataForm.idMahasiswa,
    tanggalDaftar: new Date().toISOString(),
    statusBerkas: STATUS_BERKAS.MENUNGGU_VERIFIKASI_BERKAS,
    statusSeleksi: STATUS_SELEKSI.PENDING,
  })
  daftarPendaftaran.push(pendaftaran)
  return idPendaftaran
}

/**
 * Sumber: KD hal. 1 — Pendaftaran.fetchPendaftarList()
 * @param {Array<Pendaftaran>} daftarPendaftaran
 * @param {string} [idUKM]
 * @returns {Array<Pendaftaran>}
 */
export function fetchPendaftarList(daftarPendaftaran, idUKM) {
  if (!idUKM) return [...(daftarPendaftaran ?? [])]
  return (daftarPendaftaran ?? []).filter(p => p.idUKM === idUKM)
}

/**
 * Sumber: KD hal. 1 — Pendaftaran.updateStatusBerkas(status, catatan, timestamp)
 */
export function updateStatusBerkas(daftarPendaftaran, idPendaftaran, status, catatan = '', timestamp = new Date().toISOString()) {
  const p = (daftarPendaftaran ?? []).find(item => item.idPendaftaran === idPendaftaran)
  if (!p) return false
  p.statusBerkas = status
  p.catatanAdmin = catatan
  p.tanggalUpdateBerkas = timestamp
  return true
}

/**
 * Sumber: KD hal. 1 — Pendaftaran.updateStatusSeleksi(idPendaftaran, status)
 */
export function updateStatusSeleksi(daftarPendaftaran, idPendaftaran, status) {
  const p = (daftarPendaftaran ?? []).find(item => item.idPendaftaran === idPendaftaran)
  if (!p || p.terkunci) return false
  p.statusSeleksi = status
  return true
}

/**
 * Sumber: KD hal. 1 — Pendaftaran.hitungJumlahSeleksi(idUKM)
 */
export function hitungJumlahSeleksi(daftarPendaftaran, idUKM) {
  const list = fetchPendaftarList(daftarPendaftaran, idUKM)
  return {
    total: list.length,
    diterima: list.filter(p => p.statusSeleksi === STATUS_SELEKSI.DITERIMA).length,
    ditolak: list.filter(p => p.statusSeleksi === STATUS_SELEKSI.DITOLAK).length,
    pending: list.filter(p => p.statusSeleksi === STATUS_SELEKSI.PENDING).length,
  }
}

/**
 * Sumber: KD hal. 1 — Pendaftaran.cekStatusPending(idUKM)
 */
export function cekStatusPending(daftarPendaftaran, idUKM) {
  const list = fetchPendaftarList(daftarPendaftaran, idUKM)
  return list.some(p => p.statusSeleksi === STATUS_SELEKSI.PENDING)
}

/**
 * Sumber: KD hal. 1 — Pendaftaran.updateSemuaStatusMenjadiDiumumkan(idUKM)
 */
export function updateSemuaStatusMenjadiDiumumkan(daftarPendaftaran, idUKM) {
  const list = fetchPendaftarList(daftarPendaftaran, idUKM)
  for (const p of list) {
    p.terkunci = true
  }
  return true
}

/**
 * Sumber: KD hal. 1 — Pendaftaran.queryStatistikPendaftaran()
 */
export function queryStatistikPendaftaran(daftarPendaftaran, idUKM) {
  return hitungJumlahSeleksi(daftarPendaftaran, idUKM)
}

/**
 * Sumber: SD-UC014, PRD v0.3 §6.5 — Pendaftaran.findByStatusBerkasLengkap()
 */
export function findByStatusBerkasLengkap(daftarPendaftaran, idUKM) {
  const list = fetchPendaftarList(daftarPendaftaran, idUKM)
  return list.filter(p => p.statusBerkas === STATUS_BERKAS.LENGKAP || p.statusBerkas === STATUS_BERKAS.SIAP_SELEKSI)
}

/**
 * Kelas: Pendaftaran
 * [DOKUMEN] KD hal. 1, MP2 §3.4.1 hal. 67-68, PRD v0.3 §6.5.
 */
export class Pendaftaran {
  /**
   * @param {object} data
   */
  constructor(data = {}) {
    this.idPendaftaran = data.idPendaftaran
    this.idUKM = data.idUKM
    this.idMahasiswa = data.idMahasiswa
    this.tanggalDaftar = data.tanggalDaftar ?? new Date().toISOString()
    this.statusBerkas = data.statusBerkas ?? STATUS_BERKAS.MENUNGGU_VERIFIKASI_BERKAS
    this.statusSeleksi = data.statusSeleksi ?? STATUS_SELEKSI.PENDING
    this.catatanAdmin = data.catatanAdmin ?? ''
    // [USULAN] PRD §6.5 — catatan internal, tidak terlihat pendaftar.
    this.catatanSeleksi = data.catatanSeleksi ?? ''
    // [USULAN] PRD §6.5 — true setelah broadcast pengumuman.
    this.terkunci = data.terkunci ?? false
    // [USULAN] Nomor urut tampilan; id internal tetap dipakai sebagai kunci.
    this.nomorPendaftaran = data.nomorPendaftaran ?? null
    // [USULAN] Waktu pengumuman hasil seleksi (M-07).
    this.tanggalDiumumkan = data.tanggalDiumumkan ?? null
    // [USULAN] Waktu terakhir admin memeriksa berkas (M-06 "Diperiksa pada …").
    this.tanggalUpdateBerkas = data.tanggalUpdateBerkas ?? null
  }

  /**
   * Instance method: updateStatusBerkas
   */
  updateStatusBerkas(status, catatan = '', timestamp = new Date().toISOString()) {
    this.statusBerkas = status
    this.catatanAdmin = catatan
    this.tanggalUpdateBerkas = timestamp
    return true
  }

  /**
   * Instance method: updateStatusSeleksi
   */
  updateStatusSeleksi(status) {
    if (this.terkunci) return false
    this.statusSeleksi = status
    return true
  }

  /**
   * Static method: saveData(daftarPendaftaran, dataForm)
   */
  static saveData(daftarPendaftaran, dataForm) {
    return saveData(daftarPendaftaran, dataForm)
  }

  /**
   * Static method: fetchPendaftarList(daftarPendaftaran, idUKM)
   */
  static fetchPendaftarList(daftarPendaftaran, idUKM) {
    return fetchPendaftarList(daftarPendaftaran, idUKM)
  }

  /**
   * Static method: updateStatusBerkas
   */
  static updateStatusBerkas(daftarPendaftaran, idPendaftaran, status, catatan, timestamp) {
    return updateStatusBerkas(daftarPendaftaran, idPendaftaran, status, catatan, timestamp)
  }

  /**
   * Static method: updateStatusSeleksi
   */
  static updateStatusSeleksi(daftarPendaftaran, idPendaftaran, status) {
    return updateStatusSeleksi(daftarPendaftaran, idPendaftaran, status)
  }

  /**
   * Static method: hitungJumlahSeleksi(daftarPendaftaran, idUKM)
   */
  static hitungJumlahSeleksi(daftarPendaftaran, idUKM) {
    return hitungJumlahSeleksi(daftarPendaftaran, idUKM)
  }

  /**
   * Static method: cekStatusPending(daftarPendaftaran, idUKM)
   */
  static cekStatusPending(daftarPendaftaran, idUKM) {
    return cekStatusPending(daftarPendaftaran, idUKM)
  }

  /**
   * Static method: updateSemuaStatusMenjadiDiumumkan(daftarPendaftaran, idUKM)
   */
  static updateSemuaStatusMenjadiDiumumkan(daftarPendaftaran, idUKM) {
    return updateSemuaStatusMenjadiDiumumkan(daftarPendaftaran, idUKM)
  }

  /**
   * Static method: queryStatistikPendaftaran(daftarPendaftaran, idUKM)
   */
  static queryStatistikPendaftaran(daftarPendaftaran, idUKM) {
    return queryStatistikPendaftaran(daftarPendaftaran, idUKM)
  }

  /**
   * Static method: findByStatusBerkasLengkap(daftarPendaftaran, idUKM)
   */
  static findByStatusBerkasLengkap(daftarPendaftaran, idUKM) {
    return findByStatusBerkasLengkap(daftarPendaftaran, idUKM)
  }
}

/**
 * Alias entitas PendaftaranUKM sesuai lifeline di Sequence Diagram 1
 */
export const PendaftaranUKM = Pendaftaran

