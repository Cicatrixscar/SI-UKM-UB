-- =============================================================================
-- Script: Simulasi Pengumuman Hasil Seleksi & Notifikasi Backend (Supabase)
-- Jalankan di: Supabase Dashboard -> SQL Editor (Project: ovllmshveqvfiyeoeuzj)
-- Target Pengguna: Ascarya Haldis (USR-FKCPHQD)
-- Target Pendaftaran: UKM Basket (PD-2026-1887)
-- =============================================================================

-- 1. Perbarui status pendaftaran menjadi DITERIMA dan berkas SIAP_SELEKSI
UPDATE pendaftaran
SET 
  status_berkas = 'SIAP_SELEKSI',
  status_seleksi = 'DITERIMA',
  terkunci = true,
  tanggal_diumumkan = now(),
  catatan_admin = 'Semua berkas (KTM, Transkrip, CV) telah diverifikasi dan dinyatakan LENGKAP.',
  catatan_seleksi = 'Selamat! Anda dinyatakan DITERIMA sebagai anggota baru UKM Basket Universitas Brawijaya 2026.'
WHERE id_pendaftaran = 'PD-2026-1887';

-- 2. Lengkapi informasi Langkah Selanjutnya untuk UKM Basket
UPDATE ukm
SET langkah_selanjutnya = jsonb_build_object(
  'kontak',       'Kapten Basket: Dimas · 0812 9876 5432',
  'grupWA',       'Grup WhatsApp: Mahasiswa Baru UKM Basket 2026',
  'linkGrupWA',   'https://chat.whatsapp.com/basketub2026',
  'pertemuan',    'Latihan Perdana & Welcoming Party: 25 November 2026',
  'waktuLokasi',  '16.00 WIB · GOR Pertamina Universitas Brawijaya'
)
WHERE id_ukm = 'UKM-BASKET';

-- 3. Masukkan notifikasi pengumuman hasil seleksi ke tabel notifikasi
INSERT INTO notifikasi (
  id_notifikasi, id_mahasiswa, judul, pesan, dibaca, timestamp, kategori, aksi_label, aksi_jalur
) VALUES
  (
    'NTF-2026-0098',
    'USR-FKCPHQD',
    'Pendaftaran berhasil dikirim · UKM Basket',
    'Pendaftaran Anda dengan No. UKM-2026-1887 telah berhasil masuk ke sistem.',
    true,
    now() - interval '5 minutes',
    'Pendaftaran',
    'Lihat detail',
    '#/mahasiswa/riwayat/PD-2026-1887'
  ),
  (
    'NTF-2026-0099',
    'USR-FKCPHQD',
    'Hasil seleksi tersedia · UKM Basket',
    'Selamat! Anda diterima di UKM Basket. Silakan lihat pengumuman dan langkah selanjutnya.',
    false,
    now(),
    'Hasil seleksi',
    'Lihat hasil',
    '#/mahasiswa/hasil'
  )
ON CONFLICT (id_notifikasi) DO UPDATE
SET 
  judul = excluded.judul,
  pesan = excluded.pesan,
  dibaca = excluded.dibaca,
  timestamp = excluded.timestamp;
