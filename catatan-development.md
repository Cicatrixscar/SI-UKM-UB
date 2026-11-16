# Catatan Development

Dokumen kerja, bukan dokumen laporan. Isinya keputusan teknis yang belum
terlihat di kode, plus rencana yang sengaja ditunda. Untuk setup dan cara
menjalankan aplikasi, lihat [`README.md`](README.md).

## 1. Di mana "backend"-nya?

Repo ini tidak punya folder `server/` atau `backend/` karena tidak ada proses
server yang dijalankan sendiri. Backend-nya adalah project Supabase
(`https://ovllmshveqvfiyeoeuzj.supabase.co`) yang sudah online. Yang ada di repo
hanya definisi dan konfigurasinya:

| Bagian backend | Letaknya | Cara "deploy" |
|---|---|---|
| Struktur tabel, enum, index | `supabase/schema.sql` | dijalankan sekali di SQL Editor |
| Data dummy | `supabase/seed.sql` | dijalankan sekali di SQL Editor |
| Izin tulis dan bucket Storage | `supabase/rls-tulis.sql` | dijalankan sekali di SQL Editor |
| REST API | dibuat otomatis oleh Supabase (PostgREST) | sudah hidup bersama project |
| Klien database untuk frontend | `src/services/supabaseClient.js` | ikut bundle Vite |

Skrip SQL di `supabase/` adalah migrasi, bukan aplikasi. Setelah dijalankan,
skrip itu tidak berjalan lagi dan tidak perlu hosting.

Lapisan yang paling mirip "kode backend" adalah `src/services/`. Di situlah
query, pemetaan kolom, unggah berkas, dan aturan alur pendaftaran ditulis.
Bedanya, lapisan ini dieksekusi di browser, bukan di server sendiri.

Konsekuensi untuk deploy: frontend ke Vercel, backend sudah selesai di
Supabase. Render tidak dipakai karena tidak ada proses yang perlu dijalankan.

## 2. Rencana: pertanyaan kustom per UKM (sisi Admin UKM)

Status: **belum dikerjakan**, ditunda sampai sprint Admin UKM dimulai. Saat ini
aplikasi baru mencakup sisi mahasiswa.

### Kebutuhan

Admin UKM dapat menambahkan pertanyaan sendiri, dan tiap UKM punya daftar
pertanyaan berbeda. Jawaban mahasiswa harus bisa dikorelasikan kembali dengan
pertanyaan dan pendaftarannya, termasuk untuk rekap dan filter.

### Keputusan: tetap SQL, bukan NoSQL

Jumlah pertanyaan yang berbeda antar UKM bukan alasan pindah ke NoSQL. Ini
relasi satu-ke-banyak biasa:

- satu UKM punya N pertanyaan,
- satu pendaftaran punya N jawaban.

Bentuk yang salah adalah menjadikan pertanyaan sebagai kolom, sehingga skema
tabel berubah tiap ada UKM baru. Bentuk yang benar adalah baris: satu
pertanyaan satu baris, satu jawaban satu baris.

`jsonb` tetap dipakai, tetapi hanya untuk bagian yang memang fleksibel, misalnya
daftar opsi pada pertanyaan tipe `PILIHAN`. Jawaban tidak disimpan sebagai satu
`jsonb` di tabel `pendaftaran`, karena rekap per pertanyaan jadi sulit.

### Skema dasar

```sql
create table pertanyaan_ukm (
  id_pertanyaan text primary key,
  id_ukm        text not null references ukm (id_ukm) on delete cascade,
  urutan        int  not null default 0,
  teks          text not null,
  tipe          text not null default 'TEKS'
                check (tipe in ('TEKS', 'ANGKA', 'PILIHAN', 'BERKAS')),
  wajib         boolean not null default true,
  pilihan       jsonb,
  aktif         boolean not null default true
);

create table jawaban_pendaftaran (
  id_pendaftaran text not null references pendaftaran (id_pendaftaran) on delete cascade,
  id_pertanyaan  text not null references pertanyaan_ukm (id_pertanyaan) on delete cascade,
  nilai          text,
  primary key (id_pendaftaran, id_pertanyaan)
);
```

### Cara korelasinya

Tidak perlu kolom penghubung tambahan, karena `id_ukm` sudah ada di dua tempat:

- `pertanyaan_ukm.id_ukm` menandai pertanyaan itu milik UKM mana,
- `pendaftaran.id_ukm` menandai mahasiswa itu mendaftar ke UKM mana.

Jadi pertanyaan yang berlaku untuk seorang pendaftar adalah pertanyaan yang
`id_ukm`-nya sama dengan `pendaftaran.id_ukm`. Tabel `jawaban_pendaftaran`
menyimpan pasangan `(id_pendaftaran, id_pertanyaan)` beserta nilainya.

```
ukm ──< pertanyaan_ukm ──┐
 │                        │
 └──< pendaftaran ──< jawaban_pendaftaran >──┘
          │
          └──< pengguna (mahasiswa)
```

### Query yang dibutuhkan

Form mahasiswa: pertanyaan UKM beserta jawaban lama bila ada.

```sql
select p.id_pertanyaan, p.teks, p.tipe, p.wajib, p.pilihan, j.nilai
from pertanyaan_ukm p
left join jawaban_pendaftaran j
  on j.id_pertanyaan  = p.id_pertanyaan
 and j.id_pendaftaran = 'PD-2026-0142'
where p.id_ukm = 'UKM-FOTO'
  and p.aktif
order by p.urutan;
```

Daftar pendaftar untuk Admin UKM: satu baris per pendaftar, jawaban dibentuk
sebagai objek JSON agar jumlah pertanyaan boleh berbeda tiap UKM.

```sql
select d.id_pendaftaran, d.nomor_pendaftaran, m.nama,
       jsonb_object_agg(p.id_pertanyaan, j.nilai order by p.urutan) as jawaban
from pendaftaran d
join pengguna m on m.id_user = d.id_mahasiswa
join pertanyaan_ukm p on p.id_ukm = d.id_ukm and p.aktif
left join jawaban_pendaftaran j
  on j.id_pendaftaran = d.id_pendaftaran
 and j.id_pertanyaan  = p.id_pertanyaan
where d.id_ukm = 'UKM-FOTO'
group by d.id_pendaftaran, d.nomor_pendaftaran, m.nama
order by d.tanggal_daftar desc;
```

Filter berdasarkan satu jawaban, dipakai untuk rekap:

```sql
select d.nomor_pendaftaran, m.nama, j.nilai
from jawaban_pendaftaran j
join pendaftaran d on d.id_pendaftaran = j.id_pendaftaran
join pengguna    m on m.id_user        = d.id_mahasiswa
where j.id_pertanyaan = 'Q-FOTO-03'
  and j.nilai = 'Pernah'
order by d.tanggal_daftar;
```

Di frontend, kolom tabel admin dibentuk dari daftar pertanyaan, bukan dari
skema tetap. Tiap sel membaca `jawaban[id_pertanyaan]`.

### Validasi saat submit

Ditambahkan di `src/services/pendaftaranUKMService.js`, setelah `pendaftaran`
berhasil dibuat:

1. Ambil pertanyaan aktif UKM yang `wajib`.
2. Tolak bila ada pertanyaan wajib tanpa jawaban; pakai pesan dari `errors.js`.
3. Cek tipe: `ANGKA` harus numerik, `PILIHAN` harus salah satu isi `pilihan`.
4. Insert semua jawaban sekaligus ke `jawaban_pendaftaran`.

Primary key gabungan otomatis mencegah jawaban ganda untuk pertanyaan yang sama.

### Jebakan yang harus dihindari

- **Jangan hapus pertanyaan secara fisik.** `on delete cascade` akan ikut
  menghapus jawaban mahasiswa. Pakai `update pertanyaan_ukm set aktif = false`.
- **Jangan simpan semua jawaban sebagai satu `jsonb`** di tabel `pendaftaran`.
  Filter dan rekap per pertanyaan jadi mahal dan rawan salah tulis kunci.
- **Jangan pindah ke database kedua.** Semua relasi di proyek ini jelas
  relasional; menambah MongoDB atau Firestore berarti dua sumber kebenaran.

### Pengaman opsional: cegah jawaban menempel ke UKM lain

FK biasa belum mencegah jawaban pertanyaan Fotografi menempel ke pendaftaran
Basket. Bisa dikunci di database dengan kolom `id_ukm` pada tabel jawaban dan
dua composite foreign key:

```sql
alter table pertanyaan_ukm add constraint pertanyaan_ukm_ukm_unique unique (id_pertanyaan, id_ukm);
alter table pendaftaran    add constraint pendaftaran_ukm_unique    unique (id_pendaftaran, id_ukm);

create table jawaban_pendaftaran (
  id_pendaftaran text not null,
  id_pertanyaan  text not null,
  id_ukm         text not null,
  nilai          text,
  primary key (id_pendaftaran, id_pertanyaan),
  foreign key (id_pendaftaran, id_ukm) references pendaftaran   (id_pendaftaran, id_ukm) on delete cascade,
  foreign key (id_pertanyaan,  id_ukm) references pertanyaan_ukm (id_pertanyaan,  id_ukm) on delete cascade
);
```

Belum dipakai. Putuskan saat tabelnya benar-benar dibuat; kalau dipakai, kolom
`id_ukm` harus ikut diisi saat insert jawaban.

### Sisa pekerjaan bila rencana ini dieksekusi

1. Migrasi SQL dua tabel di `supabase/` (berkas baru, jangan ubah `schema.sql`
   yang sudah dijalankan).
2. Policy RLS: baca pertanyaan terbuka, tulis hanya untuk Admin UKM pemilik
   `id_ukm`. Ini menunggu Supabase Auth, karena tanpa `auth.uid()` batas
   "hanya UKM-nya sendiri" tidak bisa ditegakkan.
3. `src/services/pertanyaanUKMService.js` untuk ambil, simpan, nonaktifkan
   pertanyaan, dan simpan jawaban.
4. Validasi jawaban di `pendaftaranUKMService.js` sebelum insert.
5. Tambahan data seed contoh pertanyaan untuk satu UKM agar bisa diuji.

## 3. Keputusan lain yang sudah diambil

- Backend: Supabase saja. Render tidak dipakai.
- Database: PostgreSQL (Supabase), bukan NoSQL. `jsonb` hanya untuk kolom
  fleksibel seperti `ukm.langkah_selanjutnya`.
- Pemisahan uji: `src/utils/**` dan `src/services/pemetaanBaris.js` diuji
  whitebox; service jaringan dan halaman diuji blackbox manual.
