/**
 * Klien Supabase (satu instance untuk seluruh aplikasi).
 *
 * [DOKUMEN] AI.md §4: halaman hanya memanggil `services/`, jadi klien ini
 *           dipakai dari file di `services/` — bukan langsung dari halaman.
 *
 * Kredensial diambil dari `.env` (lihat `.env.example`):
 *   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<publishable/anon key>
 */

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && anonKey ? createClient(url, anonKey) : null

/**
 * Klien yang dijamin ada. Melempar error jelas bila `.env` belum diisi,
 * supaya halaman menampilkan "Gagal memuat data" alih-alih error 401 samar.
 */
export function ambilSupabase() {
  if (!supabase) {
    throw new Error('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env')
  }
  return supabase
}

/** Lempar error Supabase supaya tertangkap `try/catch` halaman. */
export function pastikan(error, bawaan) {
  if (error) throw new Error(bawaan ?? error.message)
}
