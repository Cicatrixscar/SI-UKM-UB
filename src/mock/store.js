/**
 * Penyimpanan data in-memory.
 *
 * [DOKUMEN] AI.md §4: "Data: in-memory di src/mock/store.js. localStorage tidak
 *           dipakai kecuali diminta."
 * [DOKUMEN] PRD v0.3 §5.1 (struktur folder) — mock/store.js.
 *
 * Catatan:
 *   - Tabel di modul/KD menyimpan foreign key (`idUKM`, `idMahasiswa`,
 *     `idKategori`), bukan objek bersarang — diterapkan apa adanya.
 *   - Isi store berupa salinan mutabel dari data dummy agar mock bisa
 *     menambahkan/mengubah data tanpa mengubah file dummy.
 */

import { PENGGUNA_DUMMY } from './data/pengguna.dummy.js'
import { UKM_DUMMY } from './data/ukm.dummy.js'
import { KATEGORI_DUMMY } from './data/kategori.dummy.js'
import { PENDAFTARAN_DUMMY, DOKUMEN_DUMMY } from './data/pendaftaran.dummy.js'

/** Salinan mutabel agar mock aman menambah data. */
export const store = {
  pengguna: [...PENGGUNA_DUMMY],
  ukm: [...UKM_DUMMY],
  kategori: [...KATEGORI_DUMMY],
  pendaftaran: [...PENDAFTARAN_DUMMY],
  dokumen: [...DOKUMEN_DUMMY],
}

/**
 * Kembalikan store ke keadaan awal (dipakai tes agar tidak bocor antar kasus).
 * [USULAN] PRD tidak memuat fungsi reset; dibutuhkan `tests/*.test.js`.
 */
export function resetStore() {
  store.pengguna = [...PENGGUNA_DUMMY]
  store.ukm = [...UKM_DUMMY]
  store.kategori = [...KATEGORI_DUMMY]
  store.pendaftaran = [...PENDAFTARAN_DUMMY]
  store.dokumen = [...DOKUMEN_DUMMY]
  return store
}
