-- =============================================================================
-- SI UKM UB · Izin tulis + bucket Storage
-- Jalankan setelah schema.sql. Diperlukan agar form pendaftaran bisa menyimpan
-- data dan mengunggah berkas dari frontend (key publishable/anon).
--
-- Peringatan: policy di bawah terbuka untuk anon karena Supabase Auth belum
-- disambungkan. Ganti ke auth.uid() sebelum dipakai dengan data asli.
-- =============================================================================

-- ---------- Tabel: izin tulis ----------
create policy "tulis pendaftaran" on pendaftaran
  for insert to anon, authenticated with check (true);

create policy "tulis dokumen" on dokumen_pendaftaran
  for insert to anon, authenticated with check (true);

create policy "ubah notifikasi" on notifikasi
  for update to anon, authenticated using (true) with check (true);

-- ---------- Storage: bucket berkas pendaftaran ----------
insert into storage.buckets (id, name, public)
values ('dokumen', 'dokumen', true)
on conflict (id) do update set public = true;

create policy "unggah dokumen" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'dokumen');

create policy "baca dokumen" on storage.objects
  for select to anon, authenticated using (bucket_id = 'dokumen');
