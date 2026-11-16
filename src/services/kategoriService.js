/**
 * Service: kategori (read-only).
 *
 * [DOKUMEN] MP2 §3.4.3 hal. 77 — KategoriController.getDaftarKategori().
 * [DOKUMEN] PRD v0.3 §7.8 kategoriService:
 *           | getDaftarKategori() | — | Kategori[] |
 * [DOKUMEN] Data dibaca dari tabel `kategori` di Supabase (lihat supabase/schema.sql).
 */

import { ambilSupabase, pastikan } from './supabaseClient.js'
import { petakanKategori } from './pemetaanBaris.js'

/** @returns {Promise<Array<{idKategori: string, namaKategori: string, deskripsi: string, iconUrl: string}>>} */
export async function getDaftarKategori() {
  const { data, error } = await ambilSupabase().from('kategori').select('*').order('id_kategori')
  pastikan(error)
  return (data ?? []).map(petakanKategori)
}

/**
 * Controller: KategoriController
 * [DOKUMEN] KD hal. 1, MP2 §3.4.3 hal. 77.
 */
export class KategoriController {
  static async getDaftarKategori() {
    return getDaftarKategori()
  }
}

/**
 * Service: KategoriService
 * [DOKUMEN] PRD v0.3 §7.8.
 */
export class KategoriService {
  static async getDaftarKategori() {
    return getDaftarKategori()
  }
}
