# Bedah Detail: Pemetaan Seluruh Diagram EA Sisi Mahasiswa vs Implementasi Kode Riil
**Proyek: Sistem Informasi Pendaftaran UKM Universitas Brawijaya (SI UKM UB)**

Dokumen ini membedah secara teknis baris demi baris, fungsi demi fungsi, dan method demi method hubungan antara **seluruh Sequence Diagram sisi mahasiswa** dan **Class Diagram** di Enterprise Architect (EA) dengan **Kode Program JavaScript & Database Supabase**.

---

## 1. Bedah SD-1: Registrasi Akun Mahasiswa Baru & Verifikasi OTP
*File EA: `Registrasi Akun Mahasiswa Baru & Verifikasi Akun OTP.qea`*

```mermaid
sequenceDiagram
    autonumber
    actor Mahasiswa
    participant View1 as DaftarMahasiswaPage
    participant View2 as VerifikasiOtpPage
    participant Service as registrasiService.js
    participant Auth as Supabase Auth (Email OTP)
    participant DB as Supabase DB (pengguna)

    Mahasiswa->>View1: 1. Input Data (Nama, NIM, Email student, Password)
    View1->>View1: 2. validasiEmailMahasiswa(email) (@student.ub.ac.id)
    View1->>Service: 3. kirimOtpRegistrasi(email)
    Service->>Auth: 4. signInWithOtp({ email })
    Auth-->>Mahasiswa: 5. Kirim 6-digit OTP ke Email UB
    Service-->>View1: 6. OTP Terkirim
    View1->>View2: 7. Simpan State Sementara & Navigasi ke Halaman OTP
    Mahasiswa->>View2: 8. Input 6-Digit Token OTP
    View2->>Service: 9. verifikasiOtpDanDaftar(dataMahasiswa, token)
    Service->>Auth: 10. verifyOtp({ email, token, type: 'email' })
    Auth-->>Service: 11. Token Valid (Session OK)
    Service->>Service: 12. hashPassword(password, email) (SHA-512 + Salt)
    Service->>DB: 13. INSERT INTO pengguna (id_user, role='MAHASISWA', ...)
    DB-->>Service: 14. Record Tersimpan
    Service-->>View2: 15. Pendaftaran Sukses
    View2-->>Mahasiswa: 16. Alert Sukses & Redirect ke Login
```

### Rincian Fungsi yang Terlibat:
1. **`validasiEmailMahasiswa(email)`** di `src/utils/validatorAuth.js`:
   * Memastikan domain email berakhiran `@student.ub.ac.id`.
2. **`kirimOtpRegistrasi(email)`** di `src/services/registrasiService.js`:
   * Mengirimkan OTP 6-digit asli via SMTP Supabase Auth.
3. **`hashPassword(password, email)`** di `src/utils/crypto.js`:
   * Mengamankan kata sandi menggunakan Web Crypto API: `crypto.subtle.digest('SHA-512', salt + password)`.
4. **`simpanDataRegistrasiSementara()`** di `src/state/registrasiTemp.js`:
   * Menampung data form langkah 1 di memori sementara sebelum diverifikasi OTP.

---

## 2. Bedah SD-2: Masuk Ke Sistem (Login Mahasiswa)
*File EA: `Masuk Ke Sistem.qea`*

```mermaid
sequenceDiagram
    autonumber
    actor Mahasiswa
    participant View as LoginMahasiswaPage
    participant Service as loginService.js
    participant Crypto as utils/crypto.js
    participant DB as Supabase DB (pengguna)
    participant State as state/session.js

    Mahasiswa->>View: 1. Input Email & Password, Klik Masuk
    View->>View: 2. validasiEmailMahasiswa() & validasiWajib()
    View->>Service: 3. login(email, password)
    Service->>DB: 4. SELECT * FROM pengguna WHERE email = emailBersih
    DB-->>Service: 5. Data Pengguna (termasuk password_hash)
    Service->>Crypto: 6. verifikasiPassword(passwordInput, hash, emailBersih)
    Crypto-->>Service: 7. Cocok (true)
    Service->>State: 8. setSesi(user) (Simpan ke localStorage 'si_ukm_sesi')
    Service-->>View: 9. Berhasil (Objek Sesi Mahasiswa)
    View-->>Mahasiswa: 10. Navigasi ke Katalog UKM
```

### Rincian Fungsi yang Terlibat:
1. **`login(email, pass)`** di `src/services/loginService.js`:
   * Mengambil data akun berdasarkan email, memverifikasi hash kata sandi, dan memetakan baris dengan `petakanPengguna()`.
2. **`setSesi(pengguna)`** di `src/state/session.js`:
   * Menyimpan sesi login ke `localStorage` agar sesi tidak hilang saat halaman di-refresh.

---

## 3. Bedah SD-3: Pendaftaran UKM Online (Wizard 3 Tahap)
*File EA: `Daftar UKM Secara Online.qea`*

```mermaid
sequenceDiagram
    autonumber
    actor Mahasiswa
    participant View as KatalogUKMPage / FormPendaftaranPage
    participant Service as pendaftaranUKMService.js
    participant DB as Supabase DB (pendaftaran)
    participant Storage as Supabase Storage (Bucket dokumen)

    Mahasiswa->>View: 1. Buka Halaman Katalog & Pilih UKM
    View->>Service: 2. getIdUKMTerdaftarMahasiswa(idMahasiswa)
    Service->>DB: 3. SELECT id_ukm FROM pendaftaran WHERE id_mahasiswa = id
    DB-->>Service: 4. Set daftar ID UKM yang sudah didaftari
    Service-->>View: 5. Render Tombol ("Daftar" atau abu-abu "Sudah Terdaftar")
    
    Mahasiswa->>View: 6. Isi Form 3 Tahap (Data Diri, Upload Berkas, Review)
    Mahasiswa->>View: 7. Klik "Kirim Pendaftaran"
    View->>Service: 8. submitPendaftaran(dataForm, berkasArr)
    Service->>Service: 9. cekSudahDaftar(idMahasiswa, idUKM) (Guard Anti-Duplikasi)
    Service->>DB: 10. INSERT INTO pendaftaran (id_pendaftaran, status_berkas, status_seleksi)
    DB-->>Service: 11. idPendaftaran (PD-2026-XXXX)
    
    loop Setiap Berkas Wajib (KTM, Transkrip, CV)
        Service->>Storage: 12. upload(path, file)
        Storage-->>Service: 13. publicUrl
        Service->>DB: 14. INSERT INTO dokumen_pendaftaran (metadata & URL)
    end
    Service-->>View: 15. Return Berhasil
    View-->>Mahasiswa: 16. Dialog Berhasil & Redirect ke Riwayat Pendaftaran
```

### Rincian Fungsi yang Terlibat:
1. **`getIdUKMTerdaftarMahasiswa(idMahasiswa)`** di `src/services/pendaftaranUKMService.js`:
   * Mengambil seluruh ID UKM yang telah didaftari mahasiswa untuk menonaktifkan tombol di katalog.
2. **`bolehAksesForm(ukm, sudahTerdaftar)`** di `src/utils/permissions.js`:
   * Menolak akses form jika mahasiswa sudah terdaftar atau masa pendaftaran telah berakhir.
3. **`submitPendaftaran(dataForm, berkas)`** di `src/services/pendaftaranUKMService.js`:
   * Menyimpan pendaftaran secara atomik ke database dan mengunggah fisik file ke cloud storage.

---

## 4. Bedah SD-4: Pemantauan Riwayat & Verifikasi Berkas (Stepper 5-Tahap)
*File EA: `Memantau Status Pendaftaran Mahasiswa Setiap UKM.qea`*

```mermaid
sequenceDiagram
    autonumber
    actor Mahasiswa
    participant View as RiwayatPendaftaranPage
    participant Stepper as components/ui/Stepper.js
    participant Service as pendaftaranUKMService.js
    participant DB as Supabase DB

    Mahasiswa->>View: 1. Buka Menu "Riwayat Pendaftaran"
    View->>Service: 2. getRiwayatPendaftaran(idMahasiswa)
    Service->>DB: 3. SELECT * FROM pendaftaran JOIN ukm WHERE id_mahasiswa = id
    DB-->>Service: 4. Daftar Riwayat Pendaftaran
    Service-->>View: 5. Data Riwayat Terpetakan
    View->>Stepper: 6. buatStepperPelacakan(statusBerkas, statusSeleksi)
    Stepper-->>View: 7. Render Indikator Visual 5-Tahap
    View-->>Mahasiswa: 8. Tampilkan Kartu Riwayat, Stepper & Catatan Admin
```

### Rincian Fungsi yang Terlibat:
1. **`getRiwayatPendaftaran(idMahasiswa)`** di `src/services/pendaftaranUKMService.js`:
   * Mengambil seluruh pendaftaran mahasiswa beserta detail UKM terkait.
2. **`Stepper 5-Tahap`** di `src/components/ui/Stepper.js`:
   * Mengkalkulasikan status aktif (*1. Terdaftar $\rightarrow$ 2. Verifikasi Berkas $\rightarrow$ 3. Seleksi $\rightarrow$ 4. Pengumuman $\rightarrow$ 5. Selesai*).
3. **Umpan Balik Berkas:**
   * Jika admin memberi status `TIDAK_LENGKAP`, sistem menampilkan kotak catatan evaluasi admin (`catatan_admin`) agar mahasiswa mengetahui perbaikan yang diperlukan.

---

## 5. Bedah SD-5: Pengumuman Hasil Seleksi & Langkah Selanjutnya
*File EA: `Mengumumkan Hasil Seleksi Secara broadcast.qea`*

```mermaid
sequenceDiagram
    autonumber
    actor Mahasiswa
    participant Navbar as AppShell.js (Lonceng)
    participant ViewHasil as HasilSeleksiPage
    participant ViewNotif as NotifikasiPage
    participant ServiceHasil as hasilSeleksiService.js
    participant ServiceNotif as notifikasiService.js
    participant DB as Supabase DB

    Navbar->>ServiceNotif: 1. getNotifikasiBelumDibaca(idMahasiswa)
    ServiceNotif->>DB: 2. SELECT COUNT(*) WHERE dibaca = false
    DB-->>Navbar: 3. Render Badge Merah Counter di Lonceng
    
    Mahasiswa->>ViewHasil: 4. Buka Halaman "Hasil Seleksi"
    ViewHasil->>ServiceHasil: 5. getHasilSeleksi(idMahasiswa)
    ServiceHasil->>DB: 6. SELECT pendaftaran.*, ukm.nama_ukm, ukm.langkah_selanjutnya
    DB-->>ServiceHasil: 7. Data Hasil Seleksi
    ServiceHasil-->>ViewHasil: 8. Objek Hasil Seleksi
    
    alt Status PENDING
        ViewHasil-->>Mahasiswa: 9a. Tampilkan Kartu Redup "Hasil seleksi belum diumumkan"
    else Status DITOLAK
        ViewHasil-->>Mahasiswa: 9b. Tampilkan Badge Merah DITOLAK & Catatan Semangat
    else Status DITERIMA
        ViewHasil-->>Mahasiswa: 9c. Tampilkan Badge Hijau DITERIMA + Panel "Langkah Selanjutnya" (Link Grup WA & Jadwal)
    end
```

### Rincian Fungsi yang Terlibat:
1. **`getHasilSeleksi(idMahasiswa)`** di `src/services/hasilSeleksiService.js`:
   * Mengambil data keputusan seleksi dan konfigurasi `langkah_selanjutnya` milik UKM.
2. **`getDaftarNotifikasi(idMahasiswa)` & `tandaiDibaca()`** di `src/services/notifikasiService.js`:
   * Mengelola daftar pesan broadcast resmi dan memperbarui status baca saat diklik.

---

## 6. Bedah Mendalam Class Diagram (Struktur, Relasi, Method & Database)
*File EA: `Class Diagram 2.qea`*

Class Diagram memodelkan struktur berorientasi objek yang direfleksikan 1:1 ke kode program dan tabel database Supabase:

### A. Hirarki Pewarisan (Inheritance / Generalization)
* **Superclass:** `Pengguna` ([`src/models/Pengguna.js`](../src/models/Pengguna.js))
  * Menyimpan identitas autentikasi global: `idUser`, `email`, `role`, `passwordHash`, `statusAkun`.
* **Subclass 1:** `Mahasiswa` ([`src/models/Mahasiswa.js`](../src/models/Mahasiswa.js))
  * Mewarisi `Pengguna` dan menambahkan atribut akademik: `nim`, `namaLengkap`, `fakultas`, `programStudi`, `nomorTelepon`.
* **Subclass 2:** `AdminUKM` ([`src/models/AdminUKM.js`](../src/models/AdminUKM.js))
  * Mewarisi `Pengguna` dan menambahkan keterikatan ke UKM: `idUKM`, `namaLengkap`, `hakAkses`.
* **Subclass 3:** `SuperAdmin` ([`src/models/Pengguna.js`](../src/models/Pengguna.js))
  * Mewarisi `Pengguna` dengan wewenang verifikasi UKM baru dan statistik global.

### B. Relasi Komposisi & Asosiasi Antar Kelas
1. **Komposisi Berkas (`Pendaftaran` $\rightarrow$ `DokumenPendaftaran`):**
   * Relasi *1 to Many Composition*. Sebuah berkas dokumen tidak memiliki arti tanpa adanya entitas pendaftaran induk.
   * Di database: `dokumen_pendaftaran.id_pendaftaran` mengacu ke `pendaftaran.id_pendaftaran` dengan `ON DELETE CASCADE`.
2. **Asosiasi Pendaftaran (`Mahasiswa` $\rightarrow$ `Pendaftaran` $\leftarrow$ `UKM`):**
   * Relasi *Many-to-Many* yang dijembatani oleh entitas `Pendaftaran`.
   * Di database: Dijamin oleh `UNIQUE INDEX (id_ukm, id_mahasiswa)` untuk mencegah pendaftaran ganda pada UKM yang sama.
3. **Asosiasi Notifikasi (`Mahasiswa` $\rightarrow$ `Notifikasi`):**
   * Relasi *1 to Many*. Mahasiswa menerima banyak notifikasi terkait progres seleksi pendaftaran UKM miliknya.

### C. Implementasi Method Kelas pada Kode
* **`UKM` ([`src/models/UKM.js`](../src/models/UKM.js)):**
  * `findByStatus(daftarUKM, status)` $\rightarrow$ Filter UKM pendaftaran dibuka/ditutup.
  * `findById(daftarUKM, idUKM)` $\rightarrow$ Pencarian detail UKM.
  * `countByKategori(daftarUKM, idKategori)` $\rightarrow$ Agregasi jumlah UKM per kategori.
* **`Pendaftaran` ([`src/models/Pendaftaran.js`](../src/models/Pendaftaran.js)):**
  * `kunciPendaftaran()` $\rightarrow$ Mengunci form agar tidak bisa diubah pasca-submit.
  * `updateStatusBerkas(status, catatan)` $\rightarrow$ Memperbarui progres verifikasi berkas.
  * `updateStatusSeleksi(status, catatan)` $\rightarrow$ Memperbarui kelulusan pendaftar.
* **`Notifikasi` ([`src/models/Notifikasi.js`](../src/models/Notifikasi.js)):**
  * `tandaiDibaca()` $\rightarrow$ Mengubah flag `dibaca = true`.
