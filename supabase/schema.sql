-- =============================================================================
-- SI UKM UB · Skema database Supabase
-- Jalankan sekali di Supabase Dashboard → SQL Editor → New query → Run.
-- Nama kolom mengikuti atribut model di app/src/models/*.js (camelCase → snake_case).
-- =============================================================================

-- ---------- Enum ----------
create type status_pendaftaran as enum ('DIBUKA', 'DITUTUP');
create type status_verifikasi_ukm as enum ('PENDING_VERIFIKASI', 'TERVERIFIKASI', 'DITOLAK');
create type status_berkas as enum ('MENUNGGU_VERIFIKASI_BERKAS', 'LENGKAP', 'TIDAK_LENGKAP', 'SIAP_SELEKSI');
create type status_seleksi as enum ('PENDING', 'DITERIMA', 'DITOLAK');
create type role_pengguna as enum ('MAHASISWA', 'ADMIN_UKM');

-- ---------- Kategori ----------
create table kategori (
  id_kategori   text primary key,
  nama_kategori text not null,
  deskripsi     text,
  icon_url      text
);

-- ---------- UKM ----------
create table ukm (
  id_ukm             text primary key,
  nama_ukm           text not null,
  id_kategori        text not null references kategori (id_kategori),
  deskripsi          text,
  visi_misi          text,
  email_ukm          text,
  icon               text,
  foto               text,
  status_pendaftaran status_pendaftaran not null default 'DITUTUP',
  status_verifikasi  status_verifikasi_ukm not null default 'PENDING_VERIFIKASI',
  tanggal_buka       timestamptz,
  tanggal_tutup      timestamptz,
  -- Konten panel "Langkah Selanjutnya" pada hasil seleksi DITERIMA.
  langkah_selanjutnya jsonb
);

create index ukm_kategori_idx on ukm (id_kategori);
create index ukm_status_idx on ukm (status_pendaftaran);

-- ---------- Timeline pendaftaran (5 tahap per UKM) ----------
create table timeline_ukm (
  id            bigint generated always as identity primary key,
  id_ukm        text not null references ukm (id_ukm) on delete cascade,
  urutan        int not null,
  tahap         text not null,
  tanggal_label text not null,
  mulai         timestamptz,
  selesai       timestamptz,
  unique (id_ukm, urutan)
);

-- ---------- Persyaratan dokumen ----------
-- shortcut: persyaratan berlaku global untuk semua UKM; buat tabel pivot
-- persyaratan_ukm kalau tiap UKM punya syarat berbeda.
create table persyaratan_dokumen (
  kode      text primary key,
  nama      text not null,
  deskripsi text,
  wajib     boolean not null default true
);

-- ---------- Pengguna ----------
create table pengguna (
  id_user       text primary key,
  -- Diisi saat login Supabase Auth disambungkan ke profil ini.
  auth_id       uuid unique references auth.users (id) on delete set null,
  nama          text not null,
  email         text not null unique,
  role          role_pengguna not null default 'MAHASISWA',
  nim           text unique,
  nomor_telepon text,
  program_studi text,
  fakultas      text,
  dibuat_pada   timestamptz not null default now()
);

-- ---------- Pendaftaran ----------
create table pendaftaran (
  id_pendaftaran         text primary key,
  nomor_pendaftaran      text not null unique,
  id_ukm                 text not null references ukm (id_ukm),
  id_mahasiswa           text not null references pengguna (id_user),
  tanggal_daftar         timestamptz not null default now(),
  status_berkas          status_berkas not null default 'MENUNGGU_VERIFIKASI_BERKAS',
  status_seleksi         status_seleksi not null default 'PENDING',
  terkunci               boolean not null default false,
  tanggal_diumumkan      timestamptz,
  tanggal_update_berkas  timestamptz,
  catatan_admin          text,
  catatan_seleksi        text
);

create index pendaftaran_mahasiswa_idx on pendaftaran (id_mahasiswa, tanggal_daftar desc);
create index pendaftaran_ukm_idx on pendaftaran (id_ukm);

-- ---------- Dokumen pendaftaran ----------
create table dokumen_pendaftaran (
  id_dokumen     text primary key,
  id_pendaftaran text not null references pendaftaran (id_pendaftaran) on delete cascade,
  nama_file      text not null,
  kode_dokumen   text not null references persyaratan_dokumen (kode),
  tipe_dokumen   text not null,
  file_url       text,
  ukuran_file    int,
  tanggal_unggah timestamptz not null default now()
);

create index dokumen_pendaftaran_idx on dokumen_pendaftaran (id_pendaftaran);

-- ---------- Notifikasi ----------
create table notifikasi (
  id_notifikasi text primary key,
  id_mahasiswa  text not null references pengguna (id_user) on delete cascade,
  judul         text not null,
  pesan         text not null,
  dibaca        boolean not null default false,
  timestamp     timestamptz not null default now(),
  kategori      text,
  aksi_label    text,
  aksi_jalur    text
);

create index notifikasi_mahasiswa_idx on notifikasi (id_mahasiswa, timestamp desc);

-- =============================================================================
-- Row Level Security
-- =============================================================================
-- shortcut: baca terbuka untuk anon karena login Supabase Auth belum
-- disambungkan ke frontend (data masih dummy). Ganti ke auth.uid() saat login
-- nyata dipakai; jangan biarkan begini untuk data mahasiswa asli.
alter table kategori            enable row level security;
alter table ukm                 enable row level security;
alter table timeline_ukm        enable row level security;
alter table persyaratan_dokumen enable row level security;
alter table pengguna            enable row level security;
alter table pendaftaran         enable row level security;
alter table dokumen_pendaftaran enable row level security;
alter table notifikasi          enable row level security;

create policy "baca publik" on kategori            for select to anon, authenticated using (true);
create policy "baca publik" on ukm                 for select to anon, authenticated using (true);
create policy "baca publik" on timeline_ukm        for select to anon, authenticated using (true);
create policy "baca publik" on persyaratan_dokumen for select to anon, authenticated using (true);
create policy "baca publik" on pengguna            for select to anon, authenticated using (true);
create policy "baca publik" on pendaftaran         for select to anon, authenticated using (true);
create policy "baca publik" on dokumen_pendaftaran for select to anon, authenticated using (true);
create policy "baca publik" on notifikasi          for select to anon, authenticated using (true);
