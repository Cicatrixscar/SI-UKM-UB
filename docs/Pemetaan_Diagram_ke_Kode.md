# Matriks Pemetaan: Diagram Enterprise Architect → Implementasi Kode Riil
**Sistem Informasi Pendaftaran UKM Universitas Brawijaya (SI UKM UB)**

Dokumen ini memetakan secara presisi setiap **Use Case / Sequence Diagram** dan setiap **Class pada Class Diagram** ke dalam file kode JavaScript, service, komponen, dan skema database PostgreSQL Supabase.

---

## 1. Pemetaan Diagram Alur (Sequence & Activity Diagram) ke Kode

Berikut tabel implementasi 10 Diagram Alur utama ke dalam baris kode proyek kita:

| No | Nama Diagram di EA | Aktor Utama | Diimplementasikan di File Mana Saja? | Fungsi & Tanggung Jawab Kode |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Registrasi Akun Mahasiswa Baru & Verifikasi OTP** | Mahasiswa | • `src/pages/auth/DaftarMahasiswaPage.js`<br>• `src/pages/auth/VerifikasiOtpPage.js`<br>• `src/services/registrasiService.js`<br>• `src/utils/validatorAuth.js`<br>• `src/utils/crypto.js` | Form input registrasi, validasi regex email `@student.ub.ac.id`, pengiriman 6-digit OTP via Supabase Auth, verifikasi token OTP, hashing password SHA-512 + Salt email, dan insert akun ke tabel `pengguna`. |
| **2** | **Masuk Ke Sistem (Login Mahasiswa)** | Mahasiswa | • `src/pages/auth/LoginMahasiswaPage.js`<br>• `src/services/loginService.js`<br>• `src/state/session.js`<br>• `src/utils/crypto.js`<br>• `src/router.js` | Menangkap input email/sandi, query data user ke Supabase, mencocokkan hash SHA-512, menyimpan sesi aktif ke `localStorage`, dan mengarahkan navigasi ke Katalog. |
| **3** | **Daftar UKM Secara Online (Wizard 3 Tahap)** | Mahasiswa | • `src/pages/mahasiswa/KatalogUKMPage.js`<br>• `src/pages/mahasiswa/DetailUKMPage.js`<br>• `src/pages/mahasiswa/FormPendaftaranPage.js`<br>• `src/components/ui/Stepper.js`<br>• `src/services/pendaftaranUKMService.js`<br>• `src/utils/validatorBerkas.js` | **Langkah 1**: Auto-fill data diri terkunci.<br>**Langkah 2**: Upload berkas (KTM, Transkrip, CV) dengan validasi format PDF/JPG & ukuran < 5MB.<br>**Langkah 3**: Review & submit transaksi pendaftaran ke tabel `pendaftaran` serta upload file ke Supabase Storage bucket `dokumen`. |
| **4** | **Memantau Status Pendaftaran Mahasiswa (Pelacakan Riwayat)** | Mahasiswa & SuperAdmin | • `src/pages/mahasiswa/RiwayatPendaftaranPage.js`<br>• `src/components/ui/Stepper.js`<br>• `src/services/pendaftaranUKMService.js` | Mengambil seluruh riwayat pendaftaran mahasiswa yang login (`getRiwayatPendaftaran()`), merender stepper 5-tahap pelacakan, serta menampilkan catatan evaluasi berkas dari admin UKM. |
| **5** | **Mengumumkan Hasil Seleksi Secara Broadcast** | Admin UKM & Mahasiswa | • `src/pages/mahasiswa/HasilSeleksiPage.js`<br>• `src/pages/mahasiswa/NotifikasiPage.js`<br>• `src/services/hasilSeleksiService.js`<br>• `src/services/notifikasiService.js`<br>• `src/layouts/AppShell.js` | Membaca status seleksi (*DITERIMA / DITOLAK / PENDING*). Menampilkan instruksi langkah selanjutnya (Link grup WA resmi), memicu badge merah lonceng notifikasi di navbar, dan menampilkan daftar notifikasi broadcast. |
| **6** | **Membuka Periode Pendaftaran UKM** | Admin UKM | • `src/pages/mahasiswa/DetailUKMPage.js`<br>• `src/utils/permissions.js`<br>• `src/utils/format.js` (`formatSisaWaktu`)<br>• Kolom `tanggal_buka` & `tanggal_tutup` di database | Menghitung sisa masa aktif pendaftaran secara live countdown. Jika tanggal melewati `tanggal_tutup`, sistem secara otomatis mengunci formulir pendaftaran (`bolehAksesForm() = false`). |
| **7** | **Periksa Kelengkapan Berkas** | Admin UKM | • `src/pages/mahasiswa/RiwayatPendaftaranPage.js`<br>• `src/enums/statusBerkas.js`<br>• Kolom `status_berkas` & `catatan_admin` di tabel `pendaftaran` | Perubahan status berkas oleh admin UKM (*MENUNGGU_VERIFIKASI, LENGKAP, TIDAK_LENGKAP, SIAP_SELEKSI*) langsung terbaca dan direfleksikan di stepper status pelacakan milik mahasiswa. |
| **8** | **Menentukan Status Penerimaan (Diterima / Ditolak)** | Admin UKM | • `src/pages/mahasiswa/HasilSeleksiPage.js`<br>• `src/enums/statusSeleksi.js`<br>• Kolom `status_seleksi` & `catatan_seleksi` di tabel `pendaftaran` | Keputusan seleksi admin UKM ditampilkan dalam format kartu hasil seleksi ber-badge resmi beserta catatan motivasi/evaluasi resmi. |
| **9** | **Meninjau dan Memverifikasi UKM Baru** | SuperAdmin | • `src/services/pendaftaranUKMService.js` (`getKatalogUKM`)<br>• Kolom `status_verifikasi` di tabel `ukm` | Filter query katalog mahasiswa yang secara ketat hanya menarik data UKM dengan status `status_verifikasi = 'TERVERIFIKASI'`. |
| **10** | **Menjawab Pertanyaan Mahasiswa** | Admin UKM & Mahasiswa | • `src/models/Pertanyaan.js`<br>• `src/models/Jawaban.js`<br>• Panel kontak resmi di `DetailUKMPage.js` & `HasilSeleksiPage.js` | Model data disiapkan pada sistem, dan pada UI difasilitasi melalui integrasi saluran komunikasi langsung (WhatsApp koordinator & Email resmi UKM). |

---

## 2. Pemetaan Class Diagram ke Kode Riil

Di dalam file `Class Diagram 2.qea`, terdapat **15 Class**. Berikut lokasi implementasi konkretnya di kode program dan database Supabase:

| Nama Class di Diagram EA | Tipe Class | Lokasi File Model di Kode (`src/models/`) | Tabel Database Supabase | Kolom & Atribut Penting yang Diimplementasikan |
| :--- | :---: | :--- | :--- | :--- |
| **`Pengguna`** | Entity (Parent) | `src/models/Pengguna.js` | `pengguna` | `id_user`, `email`, `role`, `password_hash`, `status_akun`, `dibuat_pada` |
| **`Mahasiswa`** | Entity (Child) | `src/models/Mahasiswa.js` | `pengguna` (kolom mahasiswa) | Mewarisi `Pengguna` + atribut: `nim`, `nama_lengkap`, `fakultas`, `program_studi`, `no_telepon` |
| **`AdminUKM`** | Entity (Child) | `src/models/AdminUKM.js` | `pengguna` + relasi ke `ukm` | Mewarisi `Pengguna` + atribut: `id_ukm`, `nama_lengkap`, `hak_akses` |
| **`SuperAdmin`** | Entity (Child) | `src/models/Pengguna.js` (Role SUPERADMIN) | `pengguna` | Mewarisi `Pengguna` dengan hak akses verifikasi sistem global. |
| **`UKM`** | Entity | `src/models/UKM.js` | `ukm` | `id_ukm`, `nama_ukm`, `id_kategori`, `deskripsi`, `visi_misi`, `status_pendaftaran`, `tanggal_buka`, `tanggal_tutup`, `langkah_selanjutnya` |
| **`Kategori`** | Entity | `src/models/Kategori.js` | `kategori` | `id_kategori`, `nama_kategori`, `deskripsi`, `icon_url` |
| **`Pendaftaran`** | Entity | `src/models/Pendaftaran.js` | `pendaftaran` | `id_pendaftaran`, `nomor_pendaftaran`, `id_ukm`, `id_mahasiswa`, `status_berkas`, `status_seleksi`, `tanggal_daftar`, `catatan_admin`, `catatan_seleksi` |
| **`DokumenPendaftaran`** | Entity | `src/models/DokumenPendaftaran.js` | `dokumen_pendaftaran` | `id_dokumen`, `id_pendaftaran`, `nama_file`, `kode_dokumen`, `tipe_dokumen`, `file_url`, `ukuran_file`, `tanggal_unggah` |
| **`Notifikasi`** | Entity | `src/models/Notifikasi.js` | `notifikasi` | `id_notifikasi`, `id_mahasiswa`, `judul`, `pesan`, `sudah_dibaca`, `waktu_kirim`, `aksi_jalur` |
| **`PersyaratanDokumen`** | Entity | `src/models/PersyaratanDokumen.js` | `persyaratan_dokumen` | `kode`, `nama`, `deskripsi`, `wajib` (KTM, Transkrip, CV) |
| **`Pertanyaan`** | Entity | `src/models/Pertanyaan.js` | `pertanyaan` (skema disiapkan) | `id_pertanyaan`, `id_mahasiswa`, `id_ukm`, `teks_pertanyaan`, `status`, `waktu_kirim` |
| **`Jawaban`** | Entity | `src/models/Jawaban.js` | `jawaban` (skema disiapkan) | `id_jawaban`, `id_pertanyaan`, `id_admin`, `teks_jawaban`, `waktu_jawab` |
| **`DokumenUKM`** | Entity | Model dokumen legalitas UKM | `dokumen_ukm` (skema disiapkan) | `id_dokumen_ukm`, `id_ukm`, `jenis_dokumen`, `path_file`, `nama_file` |
| **`RiwayatVerifikasi`** | Entity | Model verifikasi UKM baru | `riwayat_verifikasi` | Pencatatan audit trail persetujuan UKM oleh SuperAdmin. |
| **`LogAktivitas`** | Entity | Model audit trail sistem | `log_aktivitas` | Mencatat riwayat perubahan data dan timestamp admin. |

---

## 3. Cara Menjelaskan Hubungan Diagram vs Kode ke Dosen Besok

Saat dosen menunjuk salah satu diagram dan bertanya: *"Bagaimana kalian membuktikan diagram ini benar-benar di-coding di aplikasi kalian?"*

Gunakan formula jawaban berikut:

1. **Untuk Alur Pendaftaran (Sequence Diagram Wizard 3-Langkah):**
   > *"Di diagram terdapat 3 lifeline boundary yang terpisah: `KatalogUKMPage`, `DetailUKMPage`, dan `FormPendaftaranPage`. Di kode kami, ini diimplementasikan secara modular pada folder `src/pages/mahasiswa/`. Logika pengiriman datanya dikontrol oleh `pendaftaranUKMService.js`, di mana data formulir masuk ke tabel `pendaftaran` dan file fisiknya diunggah ke Supabase Cloud Storage bucket `dokumen` lalu URL-nya disimpan di tabel `dokumen_pendaftaran`."*

2. **Untuk Class Diagram (Entitas & Relasi):**
   > *"Setiap kelas di Class Diagram memiliki padanan berkas model OOP di folder `src/models/`, misalnya `UKM.js`, `Pendaftaran.js`, dan `Pengguna.js`. Struktur atributnya sinkron 1:1 dengan tabel database PostgreSQL Supabase yang kami definisikan di `supabase/schema.sql`. Dan untuk menjembatani perbedaan snake_case di database dengan camelCase di JavaScript, kami menggunakan pola Data Mapper pada `src/services/pemetaanBaris.js`."*
