-- =============================================================================
-- SI UKM UB · Izin tulis + bucket Storage + Pembaruan Periode
-- Jalankan di Supabase Dashboard -> SQL Editor
-- Script ini idempotent (aman dijalankan berkali-kali).
-- =============================================================================

-- ---------- Tabel: izin tulis & pembaruan data ----------
drop policy if exists "tulis pendaftaran" on pendaftaran;
create policy "tulis pendaftaran" on pendaftaran
  for insert to anon, authenticated with check (true);

drop policy if exists "ubah pendaftaran" on pendaftaran;
create policy "ubah pendaftaran" on pendaftaran
  for update to anon, authenticated using (true) with check (true);

drop policy if exists "tulis dokumen" on dokumen_pendaftaran;
create policy "tulis dokumen" on dokumen_pendaftaran
  for insert to anon, authenticated with check (true);

drop policy if exists "tulis notifikasi" on notifikasi;
create policy "tulis notifikasi" on notifikasi
  for insert to anon, authenticated with check (true);

drop policy if exists "ubah notifikasi" on notifikasi;
create policy "ubah notifikasi" on notifikasi
  for update to anon, authenticated using (true) with check (true);

drop policy if exists "ubah pengguna" on pengguna;
create policy "ubah pengguna" on pengguna
  for update to anon, authenticated using (true) with check (true);

drop policy if exists "ubah ukm" on ukm;
create policy "ubah ukm" on ukm
  for update to anon, authenticated using (true) with check (true);

-- ---------- Pembaruan tanggal tutup pendaftaran UKM DIBUKA ke 30 November 2026 ----------
update ukm
set tanggal_tutup = '2026-11-30T23:59:00+07:00'
where status_pendaftaran = 'DIBUKA';

-- ---------- Pencegahan pendaftaran ganda (1 mahasiswa hanya 1 pendaftaran per UKM) ----------
create unique index if not exists pendaftaran_ukm_mahasiswa_uniq on pendaftaran (id_ukm, id_mahasiswa);

-- ---------- Storage: bucket berkas pendaftaran ----------
insert into storage.buckets (id, name, public)
values ('dokumen', 'dokumen', true)
on conflict (id) do update set public = true;

drop policy if exists "unggah dokumen" on storage.objects;
create policy "unggah dokumen" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'dokumen');

drop policy if exists "baca dokumen" on storage.objects;
create policy "baca dokumen" on storage.objects
  for select to anon, authenticated using (bucket_id = 'dokumen');
