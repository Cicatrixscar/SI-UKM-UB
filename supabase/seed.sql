-- =============================================================================
-- SI UKM UB · Data dummy (seed)
-- Sumber: app/src/mock/data/*.dummy.js — isi harus sama persis dengan mock,
-- supaya tampilan tidak berubah saat service dipindah ke Supabase.
-- Jalankan setelah schema.sql. Aman diulang (on conflict do nothing).
-- =============================================================================

-- ---------- Kategori ----------
insert into kategori (id_kategori, nama_kategori, deskripsi, icon_url) values
  ('KAT-SENI',      'Seni & Kreativitas', 'UKM di bidang seni pertunjukan dan seni rupa.',      'i-palette'),
  ('KAT-OLAHRAGA',  'Olahraga',           'UKM di bidang olahraga dan kebugaran.',              'i-basketball'),
  ('KAT-ALAM',      'Alam',               'UKM di bidang alam dan lingkungan.',                 'i-mountain'),
  ('KAT-TEKNOLOGI', 'Teknologi',          'UKM di bidang teknologi dan riset.',                 'i-cpu'),
  ('KAT-PENALARAN', 'Penalaran',          'UKM di bidang argumentasi dan kajian ilmiah.',       'i-book-open')
on conflict (id_kategori) do nothing;

-- ---------- Persyaratan dokumen ----------
insert into persyaratan_dokumen (kode, nama, deskripsi, wajib) values
  ('KTM',       'KTM',       'Identitas diri',            true),
  ('TRANSKRIP', 'Transkrip', 'Nilai akademik terbaru',    true),
  ('CV',        'CV',        'Pengalaman & keterampilan', true)
on conflict (kode) do nothing;

-- ---------- UKM ----------
-- Periode DIBUKA  : 15 Okt 2026 00.00 – 30 Okt 2026 23.59
-- Periode DITUTUP : 1 Okt 2026 00.00 – 20 Okt 2026 23.59
insert into ukm (id_ukm, nama_ukm, id_kategori, deskripsi, visi_misi, email_ukm, icon, foto,
                 status_pendaftaran, status_verifikasi, tanggal_buka, tanggal_tutup,
                 langkah_selanjutnya) values
  ('UKM-FOTO', 'UKM Fotografi', 'KAT-SENI',
   'Belajar menangkap cerita melalui lensa dan karya fotografi.',
   'UKM Fotografi adalah ruang belajar dan berkarya bagi mahasiswa yang tertarik pada seni visual. Melalui kelas dasar, berburu foto, pameran, dan dokumentasi kegiatan kampus, kamu dapat mengembangkan teknik sekaligus menemukan sudut pandang baru.',
   'fotografi@ukm.ub.ac.id', 'i-camera', '/img/ukm-fotografi.jpg',
   'DIBUKA', 'TERVERIFIKASI', '2026-10-15T00:00:00+07:00', '2026-10-30T23:59:00+07:00',
   jsonb_build_object(
     'kontak',       'Nadia · 0812 3456 7890',
     'grupWA',       'Grup WhatsApp: Fotografi 2026',
     'linkGrupWA',   'https://chat.whatsapp.com/fotografi2026',
     'pertemuan',    'Pertemuan perdana: 24 Oktober 2026',
     'waktuLokasi',  '09.00 WIB · Sekretariat UKM Fotografi'
   )),

  ('UKM-BASKET', 'UKM Basket', 'KAT-OLAHRAGA',
   'Asah kemampuan, kekompakan tim, dan semangat kompetisi.',
   'UKM Basket mempertemukan mahasiswa yang senang bermain dan menonton bola basket. Latihan rutin, liga internal, dan pertandingan antar-fakultas menjadi ruang untuk melatih fisik, kerja sama tim, dan sportivitas.',
   'basket@ukm.ub.ac.id', 'i-basketball', '/img/ukm-basket.jpg',
   'DIBUKA', 'TERVERIFIKASI', '2026-10-15T00:00:00+07:00', '2026-10-30T23:59:00+07:00', null),

  ('UKM-PADUANSUARA', 'UKM Paduan Suara', 'KAT-SENI',
   'Satukan suara dan tampil di panggung bersama tim kampus.',
   'UKM Paduan Suara melatih vokal, penampilan panggung, dan kekompakan kor. Kegiatan rutin meliputi latihan teknik vokal, rekaman, dan penampilan pada kegiatan universitas serta kompetisi paduan suara nasional.',
   'paduansuara@ukm.ub.ac.id', 'i-music', '/img/ukm-paduan-suara.jpg',
   'DIBUKA', 'TERVERIFIKASI', '2026-10-15T00:00:00+07:00', '2026-10-30T23:59:00+07:00', null),

  ('UKM-PECINTAALAM', 'UKM Pecinta Alam', 'KAT-ALAM',
   'Jelajahi alam dan berkontribusi dalam kegiatan konservasi.',
   'UKM Pecinta Alam membawa mahasiswa mengenal alam sekaligus menjaganya. Kegiatan meliputi pelatihan dasar pendakian, ekspedisi, penanaman pohon, dan edukasi konservasi bersama komunitas sekitar kampus.',
   'pecintaalam@ukm.ub.ac.id', 'i-mountain', '/img/ukm-pecinta-alam.jpg',
   'DIBUKA', 'TERVERIFIKASI', '2026-10-15T00:00:00+07:00', '2026-10-30T23:59:00+07:00', null),

  ('UKM-TEATER', 'UKM Teater', 'KAT-SENI',
   'Kembangkan ekspresi, akting, dan kreativitas di atas panggung.',
   'UKM Teater adalah ruang eksplorasi seni pertunjukan bagi mahasiswa. Melalui kelas akting, penulisan naskah, pementasan, dan festival teater kampus, anggota belajar berani tampil dan bercerita.',
   'teater@ukm.ub.ac.id', 'i-palette', '/img/ukm-teater.jpg',
   'DIBUKA', 'TERVERIFIKASI', '2026-10-15T00:00:00+07:00', '2026-10-30T23:59:00+07:00', null),

  ('UKM-ROBOTIKA', 'UKM Robotika', 'KAT-TEKNOLOGI',
   'Rancang inovasi dan ikuti kompetisi robotika bersama tim.',
   'UKM Robotika mempertemukan mahasiswa yang gemar merakit dan memprogram. Kegiatan meliputi kelas dasar elektronika, pengembangan prototipe robot, dan persiapan kompetisi robotika nasional maupun internasional.',
   'robotika@ukm.ub.ac.id', 'i-box', '/img/ukm-robotika.jpg',
   'DIBUKA', 'TERVERIFIKASI', '2026-10-15T00:00:00+07:00', '2026-10-30T23:59:00+07:00', null),

  ('UKM-BADMINTON', 'UKM Badminton', 'KAT-OLAHRAGA',
   'Latihan rutin dan kompetisi untuk pecinta bulu tangkis.',
   'UKM Badminton menghimpun mahasiswa pecinta bulu tangkis. Latihan teknik dasar, sparring antar-divisi, dan turnamen internal menjadi agenda rutin untuk menjaga performa dan sportivitas.',
   'badminton@ukm.ub.ac.id', 'i-trophy', '/img/ukm-badminton.jpg',
   'DITUTUP', 'TERVERIFIKASI', '2026-10-01T00:00:00+07:00', '2026-10-20T23:59:00+07:00', null),

  ('UKM-DEBAT', 'UKM Debat', 'KAT-PENALARAN',
   'Latih berpikir kritis dan menyampaikan argumen yang kuat.',
   'UKM Debat melatih kemampuan berpikir kritis, menyusun argumen, dan berbicara di depan umum. Anggota berlatih debat parlementer dan bahasa Inggris, serta mengikuti kejuaraan debat antar-kampus.',
   'debat@ukm.ub.ac.id', 'i-messages-square', '/img/ukm-debat.jpg',
   'DITUTUP', 'TERVERIFIKASI', '2026-10-01T00:00:00+07:00', '2026-10-20T23:59:00+07:00', null)
on conflict (id_ukm) do nothing;

-- ---------- Timeline pendaftaran ----------
-- Dua varian: UKM DIBUKA (15–30 Okt) dan UKM DITUTUP (1–20 Okt).
delete from timeline_ukm;

insert into timeline_ukm (id_ukm, urutan, tahap, tanggal_label, mulai, selesai)
select u.id_ukm, t.urutan, t.tahap, t.tanggal_label, t.mulai, t.selesai
from ukm u
cross join (values
  (1, 'Pendaftaran Dibuka', '15 Okt 2026',   '2026-10-15T00:00:00+07:00'::timestamptz, '2026-10-30T23:59:00+07:00'::timestamptz),
  (2, 'Ditutup',            '30 Okt 2026',   '2026-10-30T23:59:00+07:00'::timestamptz, '2026-10-30T23:59:00+07:00'::timestamptz),
  (3, 'Pemeriksaan Berkas', '31 Okt–2 Nov',  '2026-10-31T00:00:00+07:00'::timestamptz, '2026-11-02T23:59:00+07:00'::timestamptz),
  (4, 'Seleksi',            '3–5 Nov 2026',  '2026-11-03T00:00:00+07:00'::timestamptz, '2026-11-05T23:59:00+07:00'::timestamptz),
  (5, 'Pengumuman',         '7 Nov 2026',    '2026-11-07T00:00:00+07:00'::timestamptz, '2026-11-07T23:59:00+07:00'::timestamptz)
) as t(urutan, tahap, tanggal_label, mulai, selesai)
where u.status_pendaftaran = 'DIBUKA';

insert into timeline_ukm (id_ukm, urutan, tahap, tanggal_label, mulai, selesai)
select u.id_ukm, t.urutan, t.tahap, t.tanggal_label, t.mulai, t.selesai
from ukm u
cross join (values
  (1, 'Pendaftaran Dibuka', '1 Okt 2026',    '2026-10-01T00:00:00+07:00'::timestamptz, '2026-10-20T23:59:00+07:00'::timestamptz),
  (2, 'Ditutup',            '20 Okt 2026',   '2026-10-20T23:59:00+07:00'::timestamptz, '2026-10-20T23:59:00+07:00'::timestamptz),
  (3, 'Pemeriksaan Berkas', '21–23 Okt 2026','2026-10-21T00:00:00+07:00'::timestamptz, '2026-10-23T23:59:00+07:00'::timestamptz),
  (4, 'Seleksi',            '24–25 Okt 2026','2026-10-24T00:00:00+07:00'::timestamptz, '2026-10-25T23:59:00+07:00'::timestamptz),
  (5, 'Pengumuman',         '27 Okt 2026',   '2026-10-27T00:00:00+07:00'::timestamptz, '2026-10-27T23:59:00+07:00'::timestamptz)
) as t(urutan, tahap, tanggal_label, mulai, selesai)
where u.status_pendaftaran = 'DITUTUP';

-- ---------- Pengguna (nim fiktif, tanpa password: login lewat Supabase Auth) ----------
insert into pengguna (id_user, nama, email, role, nim, nomor_telepon, program_studi, fakultas) values
  ('USR-001', 'Rusdi',        'rusdi@student.ub.ac.id', 'MAHASISWA', '225150400111024', '081234567890', 'Teknik Informatika', 'Fakultas Teknik'),
  ('USR-002', 'Ayu Larasati', 'ayu@student.ub.ac.id',   'MAHASISWA', '225150400111037', '081298765432', 'Manajemen',          'Fakultas Ekonomi dan Bisnis')
on conflict (id_user) do nothing;

-- ---------- Pendaftaran ----------
-- Fotografi DITERIMA (konsisten di Riwayat, Hasil Seleksi, Notifikasi).
-- Paduan Suara TIDAK_LENGKAP (layar "Perbaiki Berkas").
insert into pendaftaran (id_pendaftaran, nomor_pendaftaran, id_ukm, id_mahasiswa, tanggal_daftar,
                         status_berkas, status_seleksi, terkunci, tanggal_diumumkan,
                         tanggal_update_berkas, catatan_admin, catatan_seleksi) values
  ('PD-2026-0142', 'UKM-2026-0142', 'UKM-FOTO', 'USR-001',
   '2026-10-16T09:15:00+07:00', 'SIAP_SELEKSI', 'DITERIMA', true,
   '2026-10-20T15:00:00+07:00', '2026-10-17T10:00:00+07:00',
   'Berkas lengkap dan lolos verifikasi.',
   'Selamat bergabung! Silakan cek kontak di bawah untuk informasi selanjutnya.'),

  ('PD-2026-0139', 'UKM-2026-0139', 'UKM-BASKET', 'USR-001',
   '2026-10-14T10:20:00+07:00', 'SIAP_SELEKSI', 'DITOLAK', true,
   '2026-10-20T15:00:00+07:00', '2026-10-15T11:00:00+07:00',
   'Kuota tahun ini sudah terpenuhi.',
   'Terima kasih telah mendaftar. Kuota tahun ini sudah terpenuhi.'),

  ('PD-2026-0151', 'UKM-2026-0151', 'UKM-PADUANSUARA', 'USR-001',
   '2026-10-24T14:30:00+07:00', 'TIDAK_LENGKAP', 'PENDING', false,
   null, '2026-10-25T09:15:00+07:00',
   'KTM belum diunggah, silakan upload ulang', null)
on conflict (id_pendaftaran) do nothing;

-- ---------- Dokumen pendaftaran ----------
-- file_url kosong: file asli tidak ada di mock, preview memakai pesan PRD §14.
insert into dokumen_pendaftaran (id_dokumen, id_pendaftaran, nama_file, kode_dokumen,
                                 tipe_dokumen, file_url, ukuran_file, tanggal_unggah) values
  ('DKM-0142-01', 'PD-2026-0142', 'KTM_Rusdi.jpg',      'KTM',       'image/jpeg', '', 1258291, '2026-10-16T09:13:00+07:00'),
  ('DKM-0142-02', 'PD-2026-0142', 'Transkrip_Rusdi.pdf','TRANSKRIP', 'application/pdf', '', 2516582, '2026-10-16T09:14:00+07:00'),
  ('DKM-0142-03', 'PD-2026-0142', 'CV_Rusdi.pdf',       'CV',        'application/pdf', '', 1887436, '2026-10-16T09:15:00+07:00'),
  ('DKM-0139-01', 'PD-2026-0139', 'KTM_Rusdi.jpg',      'KTM',       'image/jpeg', '', 1258291, '2026-10-14T10:18:00+07:00'),
  ('DKM-0139-02', 'PD-2026-0139', 'Transkrip_Rusdi.pdf','TRANSKRIP', 'application/pdf', '', 2516582, '2026-10-14T10:19:00+07:00'),
  ('DKM-0139-03', 'PD-2026-0139', 'CV_Rusdi.pdf',       'CV',        'application/pdf', '', 1887436, '2026-10-14T10:20:00+07:00'),
  ('DKM-0151-01', 'PD-2026-0151', 'Transkrip_Rusdi.pdf','TRANSKRIP', 'application/pdf', '', 2516582, '2026-10-24T14:28:00+07:00'),
  ('DKM-0151-02', 'PD-2026-0151', 'CV_Rusdi.pdf',       'CV',        'application/pdf', '', 1887436, '2026-10-24T14:28:00+07:00')
on conflict (id_dokumen) do nothing;

-- ---------- Notifikasi ----------
-- Timestamp disusun terhadap config.tanggalDemo = 2026-10-25T20:59+07:00
-- agar label waktu sama dengan desain Hi-Fi.
insert into notifikasi (id_notifikasi, id_mahasiswa, judul, pesan, dibaca, timestamp,
                        kategori, aksi_label, aksi_jalur) values
  ('NTF-2026-0051', 'USR-001', 'Berkas perlu diperbaiki · UKM Paduan Suara',
   'KTM belum diunggah. Lengkapi berkas untuk melanjutkan pendaftaran.',
   false, '2026-10-25T20:44:00+07:00', 'Pemeriksaan berkas', 'Perbaiki berkas', '#/mahasiswa/riwayat/PD-2026-0151'),

  ('NTF-2026-0050', 'USR-001', 'Jadwal seleksi tersedia · UKM Basket',
   'Seleksi dilaksanakan 13 November 2026, pukul 15.00 WIB di GOR kampus.',
   false, '2026-10-25T19:59:00+07:00', 'Jadwal seleksi', 'Lihat jadwal', '#/mahasiswa/riwayat/PD-2026-0139'),

  ('NTF-2026-0048', 'USR-001', 'Pendaftaran berhasil dikirim · UKM Fotografi',
   'Pendaftaran Anda sudah diterima dan menunggu verifikasi berkas.',
   true, '2026-10-24T14:30:00+07:00', 'Pendaftaran', 'Lihat detail', '#/mahasiswa/riwayat/PD-2026-0142'),

  ('NTF-2026-0041', 'USR-001', 'Hasil seleksi tersedia · UKM Fotografi',
   'Selamat! Anda diterima di UKM Fotografi. Lihat informasi langkah selanjutnya.',
   true, '2026-10-20T15:00:00+07:00', 'Hasil seleksi', 'Lihat hasil', '#/mahasiswa/hasil'),

  ('NTF-2026-0039', 'USR-001', 'Pendaftaran segera ditutup · UKM Teater',
   'Pastikan data diri dan dokumen sudah lengkap sebelum pendaftaran ditutup.',
   true, '2026-10-19T09:00:00+07:00', 'Pengingat', 'Lihat UKM', '#/mahasiswa/ukm/UKM-TEATER')
on conflict (id_notifikasi) do nothing;
