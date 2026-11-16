# Pengujian Whitebox

Folder ini berisi rencana dan bukti pengujian whitebox (uji berdasarkan
struktur kode). Kode tesnya sendiri tetap di `tests/`; folder ini hanya memuat
dokumen: apa yang diuji, berapa jalur independennya, dan hasilnya.

## Kondisi saat ini

| Bagian | Tes | Cakupan cabang |
|---|---|---|
| `src/utils/validators.js` | 28 tes di `tests/validators.test.js` | hampir penuh |
| `src/utils/permissions.js` | belum ada | 0% |
| `src/services/pemetaanBaris.js` | 16 tes | penuh untuk jalur normal |
| `src/services/*.js` | tidak diuji langsung | memanggil jaringan |

Artinya bahan laporan paling banyak datang dari `validators.js`, sedangkan
`permissions.js` adalah celah terbesar.

## Metode menghitung V(G)

Semua angka di dokumen ini memakai satu aturan yang sama:

```
V(G) = jumlah titik keputusan + 1
titik keputusan = setiap if, ternary (? :), operator ||, operator &&, dan loop
```

Operator `??` dan optional chaining `?.` tidak dihitung karena hanya
penggantian nilai, bukan percabangan alur. Tulis aturan ini di laporan supaya
hitungan Anda dan dosen memakai dasar yang sama.

## Prioritas pengujian

Prioritas ditentukan dari akibat kalau logikanya salah, bukan dari jumlah baris.

### Prioritas 1 — wajib, dipakai langsung saat submit

| Fungsi | Berkas | V(G) | Kasus minimum | Status |
|---|---|---|---|---|
| `validasiBerkas` | `src/utils/validators.js` | 3 | 3 | sudah |
| `validasiFormatBerkas` | `src/utils/validators.js` | 3 | 3 | sudah (4 tes) |
| `validasiUkuranBerkas` | `src/utils/validators.js` | 4 | 4 | 3 tes, 1 cabang belum |
| `bolehSubmitPendaftaran` | `src/utils/permissions.js` | 3 | 4 | belum |
| `dalamPeriodeAktif` | `src/utils/permissions.js` | 7 | 6 | belum |
| `tahapRiwayat` | `src/utils/permissions.js` | 11 | 16 kombinasi | belum |

Alasan: `validasiBerkas` menentukan pesan error PRD §14 yang dilihat pengguna.
`bolehSubmitPendaftaran` dan `dalamPeriodeAktif` adalah gerbang terakhir sebelum
data ditulis; kalau salah, mahasiswa bisa mengirim ke UKM yang sudah ditutup
atau malah terblokir padahal periode masih buka. `tahapRiwayat` menentukan
stepper 5 tahap; kalau salah, status pendaftaran menyesatkan.

### Prioritas 2 — penting, tapi efeknya terbatas pada satu layar

| Fungsi | Berkas | V(G) | Kasus minimum | Status |
|---|---|---|---|---|
| `semuaBerkasValid` | `src/utils/validators.js` | 4 | 4 | 3 tes, cabang non-array belum |
| `validasiDataDiri` | `src/utils/validators.js` | 2 | 5 | sudah |
| `validasiAlasan` | `src/utils/validators.js` | 3 | 3 | sudah |
| `bolehAksesForm` | `src/utils/permissions.js` | 2 | 3 | belum |
| `bolehLanjutDokumen` | `src/utils/permissions.js` | 2 | 4 | belum |
| `bolehKirimPendaftaran` | `src/utils/permissions.js` | 1 | 2 | belum |
| `petakanUkm`, `petakanPendaftaran` | `src/services/pemetaanBaris.js` | 2 | 3 | sudah |

### Prioritas 3 — pelengkap

| Fungsi | Berkas | V(G) | Kasus minimum | Status |
|---|---|---|---|---|
| `nomorTahapAktif` | `src/utils/permissions.js` | 2 | 2 | belum |
| `statusTahapTimeline` | `src/utils/permissions.js` | 7 | 5 | belum |

### Tidak diuji whitebox, dan alasannya

- `src/services/*.js` — hasil bergantung pada isi database dan jaringan, jadi
  jalur tidak deterministik. Uji lewat blackbox (klik UI) saja.
- `src/pages/*.js`, `src/layouts/*.js` — logikanya di DOM; lebih tepat diuji
  blackbox.
- `src/services/supabaseClient.js` — pembungkus library pihak ketiga.

## Basis path Prioritas 1

### `validasiBerkas(file)` — V(G) = 3

Titik keputusan: `if (!format.valid)`, `if (!ukuran.valid)`.

| Path | Kondisi | Ekspektasi |
|---|---|---|
| 1 → 2 | format tidak valid | `{ valid: false, pesan: FORMAT_FILE }` |
| 1 → 3 → 4 | format valid, ukuran > 5 MB | `{ valid: false, pesan: UKURAN_FILE }` |
| 1 → 3 → 5 | format valid, ukuran ≤ 5 MB | `{ valid: true, pesan: FORMAT_VALID }` |

### `bolehSubmitPendaftaran(ukm, sekarang)` — V(G) = 3

Titik keputusan: `if (!ukm)`, `if (statusPendaftaran !== DIBUKA)`.

| Path | Kondisi | Ekspektasi |
|---|---|---|
| 1 → 2 | `ukm` null | `false` |
| 1 → 3 → 4 | status `DITUTUP` | `false` |
| 1 → 3 → 5 | `DIBUKA`, dalam periode | `true` |
| 1 → 3 → 5 | `DIBUKA`, lewat tanggal tutup | `false` |

Baris terakhir menembus `dalamPeriodeAktif`, jadi satu kasus lagi dibutuhkan
meski V(G) fungsi ini hanya 3. Inilah sebabnya kolom "kasus minimum" pada tabel
prioritas kadang lebih besar dari V(G).

### `dalamPeriodeAktif(ukm, sekarang)` — V(G) = 7

Titik keputusan: `!tanggalBuka || !tanggalTutup`, `isNaN(buka) || isNaN(tutup)`,
`t >= buka && t <= tutup`.

| Kasus | Input | Ekspektasi |
|---|---|---|
| 1 | tanpa `tanggalBuka` | `true` |
| 2 | tanpa `tanggalTutup` | `true` |
| 3 | tanggal tidak bisa di-parse | `true` |
| 4 | `sekarang` sebelum tanggal buka | `false` |
| 5 | `sekarang` di antara buka dan tutup | `true` |
| 6 | `sekarang` setelah tanggal tutup | `false` |

### `tahapRiwayat(pendaftaran)` — V(G) = 11

V(G) besar karena lima tahap dipetakan sekaligus. Menulis 11 kasus path satu per
satu tidak praktis; pakai tabel kombinasi:

```
statusBerkas    ∈ MENUNGGU_VERIFIKASI_BERKAS, LENGKAP, TIDAK_LENGKAP, SIAP_SELEKSI
statusSeleksi   ∈ PENDING, DITERIMA
terkunci        ∈ true, false
```

16 kombinasi, satu `it` per baris, dan setiap tes memeriksa kelima nilai
`status` sekaligus. Contoh tiga baris:

| statusBerkas | statusSeleksi | terkunci | Tahap 1–5 |
|---|---|---|---|
| `MENUNGGU_VERIFIKASI_BERKAS` | `PENDING` | `false` | selesai, aktif, belum, belum, belum |
| `SIAP_SELEKSI` | `PENDING` | `false` | selesai, selesai, selesai, aktif, belum |
| `SIAP_SELEKSI` | `DITERIMA` | `true` | selesai, selesai, selesai, selesai, selesai |

## Format tabel hasil

Isi tabel ini setelah tes dijalankan. Satu baris per kasus uji, nomor tes
disalin dari nama `it(...)` agar mudah dicari.

| No | Fungsi | V(G) | Path | Kasus uji | Hasil |
|---|---|---|---|---|---|
| 1 | `validasiBerkas` | 3 | 1→2 | format `application/zip` | lulus |
| 2 | `validasiBerkas` | 3 | 1→3→4 | PDF 5 MB + 1 byte | lulus |
| 3 | `validasiBerkas` | 3 | 1→3→5 | PDF 1 MB | lulus |

## Cara menjalankan

```bash
npm test                 # seluruh tes
npm run test:watch       # mode pantau saat menulis tes
```

Alat ukur cakupan belum dipasang. Kalau dibutuhkan sebagai lampiran:

```bash
npm install -D @vitest/coverage-v8
npx vitest run --coverage
```

Hasilnya tabel persen `stmt` dan `branch` per berkas, plus `coverage/index.html`
yang bisa dicetak. Pasang hanya kalau dosen meminta angka cakupan; tanpa alat
ini pun basis path di atas sudah memenuhi whitebox.

## Aturan penulisan tes

- Satu berkas tes per modul: `tests/validators.test.js`, `tests/permissions.test.js`.
- Satu `it` untuk satu path, dan nama tes menyebut kondisinya.
- Tes tidak boleh menyentuh jaringan atau database. Semua fungsi di atas murni,
  jadi tidak perlu Supabase.
- Jangan mengubah isi `src/` hanya agar tes lulus. Kalau tes menemukan bug,
  perbaiki kodenya dan catat di laporan.
