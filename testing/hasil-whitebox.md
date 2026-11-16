# Hasil Pengujian Whitebox

Dokumen ini berisi hasil eksekusi nyata, bukan rencana. Rencana dan dasar
perhitungan V(G) ada di [`README.md`](README.md).

## Identitas pengujian

| Hal | Nilai |
|---|---|
| Tanggal eksekusi | 16 November 2026 |
| Node.js | v24.14.0 |
| Vitest | 2.1.9 |
| Perintah | `npm run test:coverage` |
| Zona waktu tes | Asia/Jakarta (dipaku di `vite.config.js`) |

## Ringkasan hasil

```
Test Files  4 passed (4)
     Tests  132 passed (132)
  Duration  ~1,2 s
```

| Berkas tes | Jumlah tes | Hasil |
|---|---|---|
| `tests/validators.test.js` | 34 | lulus |
| `tests/permissions.test.js` | 52 | lulus |
| `tests/format.test.js` | 28 | lulus |
| `tests/pendaftaranUKMService.test.js` | 18 | lulus |

Tidak ada tes yang gagal. Tidak ada tes yang dilewati.

## Cakupan kode (keluaran `npm run test:coverage`)

```
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |     100 |    99.45 |   97.29 |     100 |
 services          |     100 |      100 |     100 |     100 |
  pemetaanBaris.js |     100 |      100 |     100 |     100 |
 utils             |     100 |     99.4  |   96.55 |     100 |
  errors.js        |     100 |      100 |       0 |     100 |
  format.js        |     100 |    98.43 |     100 |     100 |
  permissions.js   |     100 |      100 |     100 |     100 |
  validators.js    |     100 |      100 |     100 |     100 |
-------------------|---------|----------|---------|---------|
```

Dua angka yang tidak 100% punya alasan yang bisa dipertanggungjawabkan:

- `errors.js` — 0% fungsi karena berkas ini hanya berisi objek konstanta teks,
  tidak ada fungsi yang bisa dieksekusi.
- `format.js` baris 86 — cabang `Number.isNaN(acuan) ? Date.now() : acuan` hanya
  aktif bila `config.tanggalDemo` berisi tanggal tidak sah. Nilai itu konstanta
  yang benar, jadi cabang ini tidak bisa dicapai dari tes tanpa mengubah
  konfigurasi saat runtime.

Angka di atas hanya menghitung logika murni (`src/utils/` dan
`src/services/pemetaanBaris.js`). Service lain dan halaman tidak diukur karena
memanggil jaringan dan DOM.

## Temuan: satu bug nyata, sudah diperbaiki

Tes `tahapRiwayat` untuk data tidak lengkap gagal pada eksekusi pertama.

```
AssertionError: expected [ 'selesai', 'aktif', 'belum', 'selesai', 'aktif' ]
                to deeply equal [ 'selesai', 'aktif', 'belum', 'belum', 'belum' ]
```

Penyebab, `src/utils/permissions.js`:

```js
// sebelum
const seleksiSelesai = seleksi !== STATUS_SELEKSI.PENDING
```

Bila `statusSeleksi` kosong atau `undefined`, perbandingan itu bernilai `true`,
sehingga stepper menampilkan tahap "Seleksi: Selesai" dan "Pengumuman: Sedang
berlangsung" untuk pendaftaran yang datanya belum lengkap. Perbaikan:

```js
// sesudah
const seleksiSelesai = Boolean(seleksi) && seleksi !== STATUS_SELEKSI.PENDING
```

Setelah perbaikan, seluruh 132 tes lulus. Ini contoh whitebox yang berguna:
jalur yang tidak pernah dilewati data normal tetap menyimpan bug.

## Basis path dan hasilnya

### 1. `validasiBerkas(file)` — V(G) = 3

| Path | Kasus uji | Hasil |
|---|---|---|
| 1→2 | format `application/zip` → `FORMAT_FILE` | lulus |
| 1→3→4 | PDF 10 MB → `UKURAN_FILE` | lulus |
| 1→3→5 | PDF 1 MB → `FORMAT_VALID` | lulus |
| tambahan | `null` → `FORMAT_FILE` | lulus |

Ketiga path independen tertutup. Kasus keempat menutup cabang pertahanan
`if (!file)` di `validasiFormatBerkas`.

### 2. `bolehSubmitPendaftaran(ukm, sekarang)` — V(G) = 3

| Path | Kasus uji | Hasil |
|---|---|---|
| 1→2 | `ukm = null` | lulus |
| 1→3→4 | status `DITUTUP` | lulus |
| 1→3→5 | `DIBUKA`, 20 Oktober 2026 | lulus |
| 1→3→5 | `DIBUKA`, 1 November 2026 (lewat periode) | lulus |

### 3. `dalamPeriodeAktif(ukm, sekarang)` — V(G) = 7

| Kasus | Input | Hasil |
|---|---|---|
| 1 | tanpa `tanggalBuka` | lulus (`true`) |
| 2 | tanpa `tanggalTutup` | lulus (`true`) |
| 3 | tanggal tidak bisa di-parse | lulus (`true`) |
| 4 | 1 Oktober 2026 (sebelum buka) | lulus (`false`) |
| 5 | 20 Oktober 2026 (di tengah) | lulus (`true`) |
| 6 | 1 November 2026 (setelah tutup) | lulus (`false`) |
| 7 | tepat detik pembukaan | lulus (`true`) |
| 8 | tepat detik penutupan | lulus (`true`) |

Dua kasus terakhir menguji batas inklusif `t >= buka && t <= tutup`.

### 4. `tahapRiwayat(pendaftaran)` — V(G) = 11

Pendekatan: 16 kombinasi `statusBerkas × statusSeleksi × terkunci`, satu tes per
kombinasi. Setiap tes memeriksa kelima nilai `status`, kelima `nama` tahap, dan
`keterangan` yang diturunkan darinya.

| statusBerkas | statusSeleksi | terkunci | Tahap 1–5 | Hasil |
|---|---|---|---|---|
| `MENUNGGU_VERIFIKASI_BERKAS` | `PENDING` | false | selesai, aktif, belum, belum, belum | lulus |
| `MENUNGGU_VERIFIKASI_BERKAS` | `PENDING` | true | selesai, aktif, belum, belum, selesai | lulus |
| `MENUNGGU_VERIFIKASI_BERKAS` | `DITERIMA` | false | selesai, aktif, belum, selesai, aktif | lulus |
| `MENUNGGU_VERIFIKASI_BERKAS` | `DITERIMA` | true | selesai, aktif, belum, selesai, selesai | lulus |
| `LENGKAP` | `PENDING` | false | selesai, selesai, belum, belum, belum | lulus |
| `LENGKAP` | `PENDING` | true | selesai, selesai, belum, belum, selesai | lulus |
| `LENGKAP` | `DITERIMA` | false | selesai, selesai, belum, selesai, aktif | lulus |
| `LENGKAP` | `DITERIMA` | true | selesai, selesai, belum, selesai, selesai | lulus |
| `TIDAK_LENGKAP` | `PENDING` | false | selesai, aktif, belum, belum, belum | lulus |
| `TIDAK_LENGKAP` | `PENDING` | true | selesai, aktif, belum, belum, selesai | lulus |
| `TIDAK_LENGKAP` | `DITERIMA` | false | selesai, aktif, belum, selesai, aktif | lulus |
| `TIDAK_LENGKAP` | `DITERIMA` | true | selesai, aktif, belum, selesai, selesai | lulus |
| `SIAP_SELEKSI` | `PENDING` | false | selesai, selesai, selesai, aktif, belum | lulus |
| `SIAP_SELEKSI` | `PENDING` | true | selesai, selesai, selesai, aktif, selesai | lulus |
| `SIAP_SELEKSI` | `DITERIMA` | false | selesai, selesai, selesai, selesai, aktif | lulus |
| `SIAP_SELEKSI` | `DITERIMA` | true | selesai, selesai, selesai, selesai, selesai | lulus |
| data kosong | — | — | selesai, aktif, belum, belum, belum | lulus setelah perbaikan |

### 5. Fungsi prioritas 2 dan 3

| Fungsi | V(G) | Jumlah kasus | Hasil |
|---|---|---|---|
| `bolehAksesForm` | 2 | 3 | lulus |
| `bolehLanjutDataDiri` | 1 | 2 | lulus |
| `bolehLanjutDokumen` | 2 | 5 | lulus |
| `bolehKirimPendaftaran` | 1 | 3 | lulus |
| `nomorTahapAktif` | 2 | 2 | lulus |
| `statusTahapTimeline` | 7 | 7 | lulus |
| `validasiUkuranBerkas` | 4 | 5 | lulus |
| `validasiFormatBerkas` | 3 | 5 | lulus |
| `semuaBerkasValid` | 4 | 5 | lulus |
| `validasiDataDiri` | 2 | 4 | lulus |
| `validasiAlasan` | 3 | 4 | lulus |
| `petakanUkm` dan pemetaan lain | 2 | 20 | lulus |

## Catatan hasil yang menyimpang dari dokumentasi lama

1. `formatWaktuRelatif` memakai pembulatan, jadi 30 detik menghasilkan
   "1 menit lalu", bukan "Baru saja". Ambang "Baru saja" praktis di bawah 30
   detik. Perilaku ini diterima; tes disesuaikan dengan ambang sebenarnya.
2. `formatSisaWaktu` hanya menampilkan menit bila sisa waktu kurang dari satu
   jam. Contoh di komentar JSDoc sebelumnya menulis "3 jam 20 menit", padahal
   kode menghasilkan "3 jam". Komentar sudah diperbaiki agar sesuai kode.

## Kesimpulan

- 132 tes, seluruhnya lulus, tanpa jaringan dan tanpa database.
- Cakupan pernyataan 100% pada logika murni; cakupan cabang 99,45%.
- Empat fungsi inti tertutup seluruh basis path-nya.
- Satu bug ditemukan lewat pengujian dan sudah diperbaiki di kode sumber.

## Cara mengulang

```bash
npm install
npm run test:coverage
```

Laporan HTML ada di `coverage/index.html` (tidak di-commit). Buka di browser
untuk lampiran berbentuk tangkapan layar.
