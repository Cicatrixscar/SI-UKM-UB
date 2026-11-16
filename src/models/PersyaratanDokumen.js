/**
 * Entitas: PersyaratanDokumen  [USULAN]
 *
 * TIDAK ADA di modul. Sumber keputusan:
 *   - AI.md §3 keputusan sementara K2: "Daftar terstruktur:
 *     { kode, nama, deskripsi, wajib }. Bukan teks bebas."
 *   - UI/UX Wireframe Brief §8 G1: "persyaratan dokumen tampil sebagai daftar
 *     terstruktur (nama, keterangan, wajib)" — pada modul/PRD masih String.
 *   - PRD v0.3 §6.9 menyimpannya di PeriodePendaftaran [USULAN].
 *
 * Jumlah dokumen wajib sprint ini (AI.md §6): KTM, Transkrip, CV.
 */

export const KODE_DOKUMEN = Object.freeze({
  KTM: 'KTM',
  TRANSKRIP: 'TRANSKRIP',
  CV: 'CV',
})

/**
 * @typedef {object} PersyaratanDokumen
 * @property {string} kode
 * @property {string} nama
 * @property {string} deskripsi
 * @property {boolean} wajib
 */

/** Factory entitas PersyaratanDokumen [USULAN] — AI.md §3 (K2). */
export function createPersyaratanDokumen(data) {
  return new PersyaratanDokumen(data)
}

/**
 * Ambil hanya persyaratan berstatus wajib.
 * [USULAN] dipakai FormPendaftaranPage langkah 2 (AI.md §6:
 *          "Ketiga dokumen wajib (KTM, Transkrip, CV) harus valid").
 */
export function persyaratanWajib(daftarPersyaratan) {
  return (daftarPersyaratan ?? []).filter(p => p.wajib)
}

/**
 * Kelas: PersyaratanDokumen [USULAN]
 */
export class PersyaratanDokumen {
  /**
   * @param {object} data
   */
  constructor(data = {}) {
    this.kode = data.kode
    this.nama = data.nama
    this.deskripsi = data.deskripsi ?? ''
    this.wajib = Boolean(data.wajib)
  }

  /**
   * Static method: persyaratanWajib(daftarPersyaratan)
   */
  static persyaratanWajib(daftarPersyaratan) {
    return persyaratanWajib(daftarPersyaratan)
  }
}

