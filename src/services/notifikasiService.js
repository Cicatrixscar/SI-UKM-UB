/**
 * Service: notifikasi mahasiswa (UC005, UC007).
 *
 * [DOKUMEN] PRD v0.3 §7.9 — tabel `notifikasiService` `[USULAN]`:
 *   | getNotifikasiSaya(id)    | String | Notifikasi[] | UC005, UC007 |
 *   | tandaiDibaca(idNotifikasi)| String | boolean     | UC005, UC007 |
 * [DOKUMEN] PRD v0.3 §6.10 — entitas Notifikasi.
 * [DOKUMEN] Data dibaca dari tabel `notifikasi` di Supabase.
 *
 * [USULAN] `tandaiSemuaDibaca(idMahasiswa)` — dibutuhkan tombol "Tandai semua
 *          dibaca" pada desain Hi-Fi layar Notifikasi; tidak ada di PRD.
 */

import { ambilSupabase, pastikan } from './supabaseClient.js'
import { petakanNotifikasi } from './pemetaanBaris.js'

/**
 * Ambil seluruh notifikasi milik mahasiswa (terbaru di atas).
 * [DOKUMEN] PRD v0.3 §7.9.
 * @param {string} idMahasiswa
 * @returns {Promise<import('../models/Notifikasi.js').Notifikasi[]>}
 */
export async function getNotifikasiSaya(idMahasiswa) {
  const { data, error } = await ambilSupabase()
    .from('notifikasi')
    .select('*')
    .eq('id_mahasiswa', idMahasiswa)
    .order('timestamp', { ascending: false })
  pastikan(error)
  return (data ?? []).map(petakanNotifikasi)
}

/**
 * Tandai satu notifikasi sudah dibaca.
 * [DOKUMEN] PRD v0.3 §7.9.
 * @param {string} idNotifikasi
 * @returns {Promise<boolean>}
 */
export async function tandaiDibaca(idNotifikasi) {
  const { data, error } = await ambilSupabase()
    .from('notifikasi')
    .update({ dibaca: true })
    .eq('id_notifikasi', idNotifikasi)
    .select('id_notifikasi')
  pastikan(error)
  return (data ?? []).length > 0
}

/**
 * Tandai seluruh notifikasi mahasiswa sudah dibaca.
 * [USULAN] PRD §7.9 hanya memuat `tandaiDibaca`.
 * @param {string} idMahasiswa
 * @returns {Promise<boolean>} true bila ada yang berubah
 */
export async function tandaiSemuaDibaca(idMahasiswa) {
  const { data, error } = await ambilSupabase()
    .from('notifikasi')
    .update({ dibaca: true })
    .eq('id_mahasiswa', idMahasiswa)
    .eq('dibaca', false)
    .select('id_notifikasi')
  pastikan(error)
  return (data ?? []).length > 0
}
