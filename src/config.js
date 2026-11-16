/**
 * Pilihan implementasi service.
 *
 * Sumber: PRD v0.3 §4 (tabel "Tech stack dan aturan coding", baris "Backend")
 *         -> "Pilihan service lewat config.js (USE_MOCK). Halaman tidak boleh
 *             import mock langsung."
 */
export const config = {
  /**
   * Dulu pemilih implementasi service (mock in-memory / http). Sejak service
   * memakai Supabase langsung, nilainya tetap ada untuk kompatibilitas saja dan
   * selalu false.
   */
  USE_MOCK: false,

  /** Nama aplikasi, dipakai di title dan AppShell. */
  namaAplikasi: 'Portal UKM',
  institusi: 'Universitas Brawijaya',

  /** Sumber: LP (Modul I) §1.6 Lingkungan / SRS-MHS-NF-02 — 5 MB. */
  batasUkuranFile: 5 * 1024 * 1024,

  /** Sumber: PRD §11.2 / LP SRS-MHS-NF-02 — hanya PDF dan JPEG. */
  formatFileDiizinkan: ['application/pdf', 'image/jpeg'],
  formatFileLabel: 'PDF dan JPEG',

  /** Sumber: UIX §5 M-03 — batas alasan bergabung (keputusan G6). */
  batasKarakterAlasan: 500,

  /**
   * Waktu acuan ("jam demo") untuk hitung mundur pendaftaran, sisa waktu,
   * dan jarak waktu notifikasi.
   *
   * [USULAN] PRD tidak memuat jam demo. Data dummy pendaftaran bersifat statis
   *          (rentang 15-30 Oktober 2026, keputusan G501), sehingga memakai
   *          `new Date()` membuat countdown "Tutup dalam 5 hari 3 jam" pada
   *          desain Hi-Fi tidak akan pernah cocok. Nilai dipilih agar selisih
   *          ke `tanggalTutup` UKM DIBUKA (2026-10-30T23:59+07:00) tepat
   *          "5 hari 3 jam".
   *
   * Catatan: tes memakai fake timer `2026-10-26T10:00:00+07:00`; jam demo tidak
   *          dipakai di logika yang diuji tes, sehingga tes tidak terpengaruh.
   */
  tanggalDemo: '2026-10-25T20:59:00+07:00',

  /**
   * Paksa mock submit gagal.
   * [DOKUMEN] AI.md §10 DoD: "Tombol Retry muncul dan berfungsi saat mock dipaksa
   *           gagal."
   * [USULAN] PRD tidak memuat sakelar ini. Aktifkan dari console browser:
   *          `import('/src/config.js').then(m => m.config.paksaGagalSimpan = true)`
   */
  paksaGagalSimpan: false,
}

export const USE_MOCK = config.USE_MOCK
export const batasUkuranFile = config.batasUkuranFile
export const formatFileDiizinkan = config.formatFileDiizinkan
export const formatFileLabel = config.formatFileLabel
export const batasKarakterAlasan = config.batasKarakterAlasan
export const tanggalDemo = config.tanggalDemo
export const namaAplikasi = config.namaAplikasi
export const institusi = config.institusi
