/**
 * Entitas: Notifikasi.
 *
 * Sumber: Kelas Diagram Package (KD) hal. 1.
 * Sumber: PRD v0.3 §6.10.
 */

/**
 * @typedef {object} Notifikasi
 * @property {string} idNotifikasi
 * @property {string} idMahasiswa
 * @property {string} judul
 * @property {string} pesan
 * @property {boolean} dibaca
 * @property {string} timestamp
 * @property {string} [kategori]     [USULAN] label jenis notifikasi (Hi-Fi).
 * @property {string} [aksiLabel]    [USULAN] teks tautan aksi (Hi-Fi).
 * @property {string} [aksiJalur]    [USULAN] hash tujuan tautan aksi (Hi-Fi).
 */

/** Factory entitas Notifikasi. */
export function createNotifikasi(data) {
  return new Notifikasi(data)
}

/**
 * Sumber: KD hal. 1, PRD v0.3 §6.10 — Notifikasi.simpanNotifikasiBatch(listPendaftar)
 * [USULAN] parameter `daftarNotifikasi`.
 */
export function simpanNotifikasiBatch(daftarNotifikasi, listPendaftar, judul = '', pesan = '') {
  if (!Array.isArray(listPendaftar)) return false
  for (const p of listPendaftar) {
    const idNotifikasi = `NTF-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    daftarNotifikasi.push(
      new Notifikasi({
        idNotifikasi,
        idMahasiswa: p.idMahasiswa ?? p,
        judul,
        pesan,
        dibaca: false,
      })
    )
  }
  return true
}

/**
 * Kelas: Notifikasi
 * [DOKUMEN] KD hal. 1, PRD v0.3 §6.10.
 */
export class Notifikasi {
  /**
   * @param {object} data
   */
  constructor(data = {}) {
    this.idNotifikasi = data.idNotifikasi
    this.idMahasiswa = data.idMahasiswa
    this.judul = data.judul ?? ''
    this.pesan = data.pesan ?? ''
    this.dibaca = data.dibaca ?? false
    this.timestamp = data.timestamp ?? new Date().toISOString()
    // [USULAN] tampilan baris notifikasi pada desain Hi-Fi.
    this.kategori = data.kategori ?? ''
    this.aksiLabel = data.aksiLabel ?? ''
    this.aksiJalur = data.aksiJalur ?? ''
  }

  /**
   * Static method: simpanNotifikasiBatch(daftarNotifikasi, listPendaftar, judul, pesan)
   */
  static simpanNotifikasiBatch(daftarNotifikasi, listPendaftar, judul, pesan) {
    return simpanNotifikasiBatch(daftarNotifikasi, listPendaftar, judul, pesan)
  }
}
