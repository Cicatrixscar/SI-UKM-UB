# SI UKM UB — Frontend

Antarmuka pendaftaran UKM Universitas Brawijaya (sprint UC003 & UC004).
JavaScript ES Modules + Vite, data disimpan di Supabase (Postgres + Storage).

## Prasyarat

- Node.js 18 atau lebih baru
- Akun Supabase (gratis) beserta satu project kosong

## 1. Siapkan Supabase

Buka **SQL Editor** di Supabase Dashboard, lalu jalankan tiga berkas berikut
**berurutan**. Tiap berkas dijalankan sebagai satu skrip (satu kali Run).

| Urutan | Berkas | Isi |
|---|---|---|
| 1 | `supabase/schema.sql` | 8 tabel, 5 enum, index, RLS baca publik |
| 2 | `supabase/seed.sql` | Data dummy (8 UKM, 3 pendaftaran, 5 notifikasi) |
| 3 | `supabase/rls-tulis.sql` | Izin insert/update + bucket Storage `dokumen` |

`seed.sql` memakai jam demo 25 Oktober 2026. Kalau tabel sudah berisi data,
kosongkan dulu agar seed tidak bentrok.

## 2. Isi kredensial

1. Salin `.env.example` menjadi `.env`.
2. Isi dua nilai dari Dashboard → **Project Settings → API Keys**:
   - `VITE_SUPABASE_URL` — Project URL, contoh `https://abcdefghijkl.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` — publishable key (`sb_publishable_...`)

Jangan pernah memakai secret key (`sb_secret_...`) di frontend. `.env` sudah
masuk `.gitignore`.

## 3. Jalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Di layar Masuk, tombol login cepat memakai akun
mahasiswa pertama pada tabel `pengguna`.

Perintah lain:

```bash
npm run build      # hasil produksi di dist/
npm run preview    # cek hasil build
npm test           # 132 tes (vitest)
npm run test:coverage  # tes + laporan cakupan di coverage/
npm run test:watch # tes mode pantau
```

## Struktur

Rencana pengujian whitebox (fungsi mana yang diuji, V(G), dan basis path) ada di
[`testing/README.md`](testing/README.md), hasil eksekusinya di
[`testing/hasil-whitebox.md`](testing/hasil-whitebox.md).

```
src/
  pages/        satu berkas per layar
  services/     satu-satunya lapisan yang menyentuh Supabase
  models/       entitas + aturan data
  enums/        konstanta status dan peran
  utils/        validasi, izin, teks pesan (errors.js)
  state/        sesi login in-memory
supabase/       skrip SQL (schema, seed, izin tulis)
tests/          tes vitest
testing/        dokumen rencana whitebox
```

Halaman hanya memanggil `services/`. Pemetaan kolom `snake_case` dari database
ke atribut `camelCase` milik model dikumpulkan di
`src/services/pemetaanBaris.js`.

## Catatan implementasi

Beberapa bagian sengaja disederhanakan untuk demo. Semuanya ditandai komentar
`shortcut:` di kode:

- Login hanya mencocokkan email pada tabel `pengguna`; password belum
  diverifikasi dan Supabase Auth belum disambungkan.
- Sesi login disimpan di memori, jadi hilang saat halaman dimuat ulang.
- Nomor pendaftaran memakai 4 digit acak, bukan sequence Postgres.
- Policy RLS tulis terbuka untuk anon karena Auth belum dipakai.

Data contoh:

| Nomor | UKM | Berkas | Hasil seleksi |
|---|---|---|---|
| `PD-2026-0142` | Fotografi | SIAP_SELEKSI | DITERIMA |
| `PD-2026-0139` | Basket | SIAP_SELEKSI | DITOLAK |
| `PD-2026-0151` | Paduan Suara | TIDAK_LENGKAP | PENDING |
