/**
 * Teks pesan standar — semua diambil persis dari
 * PRD v0.3 §14 "Teks pesan standar (copy persis)" (hal. baris 679-702).
 *
 * AI.md §9: "Jangan membuat teks pesan sendiri. Semua pesan diambil dari
 * errors.js, yang isinya harus sama dengan PRD bagian 14."
 *
 * Pesan di bawah memakai tanda kutip sesuai kolom "Teks" PRD §14 (dengan tanda kutip).
 * Nama konstan mengikuti situasinya.
 *
 * [USULAN] Pesan yang hanya dipakai Admin UKM / Super Admin tetap dicatat di sini
 *          karena PRD §14 adalah satu-satunya sumber teks; ia tidak dipanggil
 *          dari UI sprint UC003/UC004.
 */

export const PESAN = Object.freeze({
  UKM_TIDAK_DITEMUKAN:
    'UKM tidak ditemukan. Silakan pilih UKM lain atau gunakan fitur pencarian',

  UKURAN_FILE:
    'Ukuran file melebihi batas maksimal 5MB. Silakan upload file yang lebih kecil',

  FORMAT_FILE:
    'Format file tidak didukung. Hanya PDF dan JPEG yang diperbolehkan',

  FORMAT_VALID: 'Format dokumen valid',

  PENDAFTARAN_BERHASIL:
    'Pendaftaran Anda berhasil disimpan. Anda dapat melihat status di menu Riwayat Pendaftaran',

  BATAL_PENDAFTARAN: 'Apakah Anda yakin ingin membatalkan pendaftaran?',

  FIELD_WAJIB: 'Field ini wajib diisi',

  TANGGAL_TUTUP:
    'Tanggal tutup tidak boleh lebih awal dari tanggal buka. Silakan periksa kembali tanggal Anda',

  GAGAL_SIMPAN: 'Gagal menyimpan data. Silakan coba beberapa saat lagi',

  PENDAFTARAN_UKM_DIBUKA: 'Pendaftaran UKM berhasil dibuka!',

  DOKUMEN_GAGAL_TAMPIL:
    'Dokumen tidak dapat ditampilkan. File mungkin rusak atau format tidak didukung',

  STATUS_PEMERIKSAAN_BERHASIL: 'Status pemeriksaan berhasil disimpan',

  STATUS_SELEKSI_TERSIMPAN: (nama) =>
    `Status seleksi berhasil disimpan untuk ${nama}`,

  PENGUMUMAN_TERKUNCI:
    'Pengumuman hasil sudah dirilis. Status tidak dapat diubah lagi',

  PENGUMUMAN_SUKSES: 'Pengumuman hasil seleksi berhasil dikirim!',

  JAWABAN_TERSIMPAN: 'Jawaban berhasil disimpan',

  JAWABAN_KOSONG: 'Jawaban tidak boleh kosong',

  SEMUA_PERTANYAAN_TERJAWAB:
    'Semua pertanyaan sudah terjawab! Tidak ada pertanyaan yang tertunda saat ini',

  SESI_HABIS: 'Sesi Anda telah berakhir, silakan login kembali',

  GAGAL_MEMUAT_DATA: 'Gagal memuat data',

  TIDAK_ADA_HASIL_FILTER:
    'Tidak ada data yang sesuai dengan filter yang dipilih. Coba ubah tanggal atau UKM yang dipilih',

  BELUM_ADA_AKTIVITAS:
    'Belum ada aktivitas pendaftaran. Silakan tunggu UKM membuka pendaftaran atau periksa filter yang digunakan',
})

/** Teks tombol pendukung yang disebut PRD §14. [USULAN] sumber kolom situasi. */
export const TEKS_TOMBOL = Object.freeze({
  COBA_LAGI: 'Coba Lagi',
  RETRY: 'Retry',
  RESET_FILTER: 'Reset Filter',
})
