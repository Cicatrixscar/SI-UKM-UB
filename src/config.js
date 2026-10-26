/**
 * Pilihan implementasi service.
 *
 * Sumber: PRD v0.3 §4 (tabel "Tech stack dan aturan coding", baris "Backend")
 *         -> "Pilihan service lewat config.js (USE_MOCK). Halaman tidak boleh
 *             import mock langsung."
 */
export const config = {
  /** true = pakai mock in-memory; false = pakai http (belum ada backend). */
  USE_MOCK: true,

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
export const namaAplikasi = config.namaAplikasi
export const institusi = config.institusi
