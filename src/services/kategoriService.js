/**
 * Service: kategori (read-only).
 *
 * [DOKUMEN] MP2 §3.4.3 hal. 77 — KategoriController.getDaftarKategori().
 * [DOKUMEN] PRD v0.3 §7.8 kategoriService:
 *           | getDaftarKategori() | — | Kategori[] |
 *           Sumber: KategoriController.getDaftarKategori (KD). Dipakai untuk
 *           filter katalog UC001 (BUC UC10 post condition).
 * [DOKUMEN] AI.md §5: "src/services/kategoriService.js (hanya getDaftarKategori,
 *           untuk badge kategori)".
 */

import { mockGetDaftarKategori } from '../mock/pendaftaranUKMMock.js'

/** @returns {Promise<Array<{idKategori: string, namaKategori: string, deskripsi: string, iconUrl: string}>>} */
export async function getDaftarKategori() {
  return mockGetDaftarKategori()
}
