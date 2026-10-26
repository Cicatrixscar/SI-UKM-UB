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
 * [USULAN] `nomorPendaftaran` TIDAK dibuat (keputusan sementara G4, AI.md §3).
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
 */

/** Factory entitas Pendaftaran. Atribut sesuai MP2 §3.4.1 hal. 67. */
export function createPendaftaran(data) {
  return {
    idPendaftaran: data.idPendaftaran,
    idUKM: data.idUKM,
    idMahasiswa: data.idMahasiswa,
    tanggalDaftar: data.tanggalDaftar ?? new Date().toISOString(),
    statusBerkas: data.statusBerkas ?? STATUS_BERKAS.MENUNGGU_VERIFIKASI_BERKAS,
    statusSeleksi: data.statusSeleksi ?? STATUS_SELEKSI.PENDING,
    catatanAdmin: data.catatanAdmin ?? '',
    // [USULAN] PRD §6.5 — catatan internal, tidak terlihat pendaftar.
    catatanSeleksi: data.catatanSeleksi ?? '',
    // [USULAN] PRD §6.5 — true setelah broadcast pengumuman.
    terkunci: data.terkunci ?? false,
  }
}

/**
 * Sumber: Modul II (MP2) §3.4.1 hal. 67 — Pendaftaran.saveData(dataForm): String
 *         Sumber: MP2 §3.6 PC-04 hal. 84 — "idPendaftaran ← saveData(dataForm)".
 * [USULAN] parameter `daftarPendaftaran` karena method pada modul bersifat
 *          class-level; penyimpanan in-memory ada di mock/store.js.
 * [USULAN] format idPendaftaran (keputusan sementara G4: nomor pendaftaran tidak dibuat).
 */
export function saveData(daftarPendaftaran, dataForm) {
  penghitungId += 1
  const idPendaftaran = `PD-${Date.now()}-${String(penghitungId).padStart(3, '0')}`
  daftarPendaftaran.push(
    createPendaftaran({
      idPendaftaran,
      idUKM: dataForm.idUKM,
      idMahasiswa: dataForm.idMahasiswa,
      tanggalDaftar: new Date().toISOString(),
      statusBerkas: STATUS_BERKAS.MENUNGGU_VERIFIKASI_BERKAS,
      statusSeleksi: STATUS_SELEKSI.PENDING,
    })
  )
  return idPendaftaran
}
