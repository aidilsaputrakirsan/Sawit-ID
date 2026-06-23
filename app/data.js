/* =========================================================================
   SAWIT-AI — sumber data (mock).
   Mencerminkan pipeline pada proposal: Akuisisi kamera -> Deteksi AI
   (tupai & gejala gerekan buah) -> Peta hotspot -> Intervensi terarah
   -> Evaluasi BACI. Dipisah dari UI agar mudah disambung ke API nyata:
   ganti isi konstanta di bawah dengan fetch ke backend.
   ========================================================================= */

export const SITE = {
  nama: "Kebun Rakyat Mitra — Blok Tanjung",
  luasHa: 12.4,
  pohonContoh: 168,
  kameraTajuk: 14,
  kameraBatang: 8,
  siklusBuah: "Fase pembuahan aktif",
  periode: "Periode After — minggu ke-7",
  pembaruan: "2 menit lalu",
};

/* ---------- 1. KPI ringkasan ---------- */
export const KPI = {
  // % buah tergerek: turun pada plot perlakuan
  buahTergerek: { nilai: 8.6, satuan: "%", deltaPct: -42, baseline: 14.8 },
  // indeks aktivitas tupai (deteksi rata-rata / kamera / hari)
  aktivitasTupai: { nilai: 3.1, satuan: "/kamera·hari", deltaPct: -38, baseline: 5.0 },
  // performa model deteksi
  akurasiModel: { nilai: 91.4, satuan: "mAP@.5", deltaPct: 2.3, baseline: 89.3 },
  // pohon/blok prioritas hotspot aktif
  hotspotAktif: { nilai: 9, satuan: "pohon prioritas", deltaPct: -25, baseline: 12 },
};

/* ---------- 2. Metrik model AI (data uji) ---------- */
export const MODEL = {
  versi: "RT-DETR-S · v0.7",
  dataset: "4.820 citra terlabel",
  pembagian: "Train 70 / Val 15 / Test 15 (bebas kebocoran lokasi)",
  metrik: [
    { label: "Precision", nilai: 0.93 },
    { label: "Recall", nilai: 0.89 },
    { label: "F1-Score", nilai: 0.91 },
    { label: "mAP@.5", nilai: 0.914 },
  ],
  // performa per kelas deteksi
  kelas: [
    { kelas: "Tupai (tubuh penuh)", presisi: 0.95, recall: 0.92, dukungan: 612 },
    { kelas: "Tupai (terjeda daun)", presisi: 0.88, recall: 0.81, dukungan: 244 },
    { kelas: "Gerekan buah muda", presisi: 0.9, recall: 0.86, dukungan: 388 },
    { kelas: "Gerekan buah hampir matang", presisi: 0.94, recall: 0.9, dukungan: 421 },
  ],
};

/* ---------- 3. Identifikasi spesies tupai dominan ---------- */
export const SPESIES = [
  { nama: "Callosciurus notatus", umum: "Bajing kelapa", porsi: 58 },
  { nama: "Callosciurus nigrovittatus", umum: "Bajing garis-hitam", porsi: 27 },
  { nama: "Sundasciurus tenuis", umum: "Bajing ramping", porsi: 11 },
  { nama: "Tidak teridentifikasi", umum: "—", porsi: 4 },
];

/* ---------- 4. Aktivitas temporal (tupai aktif siang hari) ---------- */
// rata-rata deteksi per jam (06:00–18:00) — puncak pagi & sore
export const PER_JAM = [
  { jam: "06", deteksi: 4 },
  { jam: "07", deteksi: 9 },
  { jam: "08", deteksi: 13 },
  { jam: "09", deteksi: 11 },
  { jam: "10", deteksi: 7 },
  { jam: "11", deteksi: 5 },
  { jam: "12", deteksi: 3 },
  { jam: "13", deteksi: 4 },
  { jam: "14", deteksi: 6 },
  { jam: "15", deteksi: 10 },
  { jam: "16", deteksi: 14 },
  { jam: "17", deteksi: 12 },
  { jam: "18", deteksi: 6 },
];

// deteksi harian 14 hari terakhir + % buah tergerek (sensus mingguan diinterpolasi)
export const HARIAN = Array.from({ length: 14 }).map((_, i) => {
  const base = [58, 52, 49, 61, 47, 44, 51, 43, 39, 41, 36, 34, 33, 30][i];
  return {
    hari: "H-" + (14 - i),
    deteksi: base,
    tergerek: +(15.2 - i * 0.5 + (i % 3) * 0.3).toFixed(1),
  };
});

/* ---------- 5. Deteksi terbaru (umpan AI) ---------- */
export const DETEKSI = [
  { t: "08:41:22", kamera: "CAM-T03", blok: "E", objek: "Tupai", spesies: "C. notatus", conf: 0.96, posisi: "Tajuk" },
  { t: "08:37:05", kamera: "CAM-B02", blok: "E", objek: "Gerekan buah hampir matang", spesies: "—", conf: 0.91, posisi: "Tandan" },
  { t: "08:29:48", kamera: "CAM-T07", blok: "C", objek: "Tupai", spesies: "C. nigrovittatus", conf: 0.88, posisi: "Tajuk" },
  { t: "08:15:11", kamera: "CAM-T03", blok: "E", objek: "Gerekan buah muda", spesies: "—", conf: 0.84, posisi: "Tandan" },
  { t: "07:58:39", kamera: "CAM-B05", blok: "B", objek: "Tupai", spesies: "C. notatus", conf: 0.93, posisi: "Batang" },
  { t: "07:42:02", kamera: "CAM-T11", blok: "C", objek: "Tupai", spesies: "S. tenuis", conf: 0.79, posisi: "Tajuk" },
  { t: "07:20:55", kamera: "CAM-T03", blok: "E", objek: "Gerekan buah hampir matang", spesies: "—", conf: 0.9, posisi: "Tandan" },
  { t: "06:54:18", kamera: "CAM-B02", blok: "E", objek: "Tupai", spesies: "C. notatus", conf: 0.95, posisi: "Batang" },
];

/* ---------- 6. Peta kebun & hotspot (viewBox 820 x 560) ---------- */
export const BOUNDARY = [
  [70, 120], [400, 78], [752, 110], [770, 300],
  [700, 486], [380, 520], [96, 470], [52, 250],
];

// tepi hutan (sumber tupai) di sisi atas — tekanan serangan tertinggi
export const HUTAN = [
  [70, 120], [400, 78], [752, 110], [752, 40], [70, 40],
];

// pohon contoh: grid ringan dalam batas; sebagian jadi prioritas hotspot
export const POHON = (() => {
  const out = [];
  let id = 0;
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 11; c++) {
      const x = 110 + c * 58 + (r % 2) * 18;
      const y = 130 + r * 52;
      if (x > 740 || y > 470) continue;
      // intensitas hotspot: tinggi di dekat tepi hutan (y kecil) dan sisi kanan-atas
      const dekatHutan = Math.max(0, 1 - (y - 120) / 240);
      const kanan = Math.max(0, (x - 380) / 380) * 0.5;
      let g = Math.min(1, dekatHutan * 0.85 + kanan * 0.5 + ((id * 7) % 5) / 22);
      out.push({ id: "P" + (++id), x, y, gi: +g.toFixed(2) });
    }
  }
  return out;
})();

// titik kamera
export const KAMERA = [
  { id: "CAM-T03", x: 250, y: 168, jenis: "Tajuk", status: "online", blok: "E" },
  { id: "CAM-T07", x: 520, y: 158, jenis: "Tajuk", status: "online", blok: "C" },
  { id: "CAM-T11", x: 636, y: 196, jenis: "Tajuk", status: "warning", blok: "C" },
  { id: "CAM-B02", x: 322, y: 240, jenis: "Batang", status: "online", blok: "E" },
  { id: "CAM-B05", x: 188, y: 300, jenis: "Batang", status: "online", blok: "B" },
  { id: "CAM-T09", x: 430, y: 360, jenis: "Tajuk", status: "online", blok: "D" },
  { id: "CAM-B07", x: 596, y: 386, jenis: "Batang", status: "offline", blok: "D" },
];

/* daftar pohon/blok prioritas (Getis-Ord Gi* signifikan) */
export const PRIORITAS = [
  { pohon: "P14", blok: "E", gi: 2.91, p: 0.002, status: "Hotspot kuat", intervensi: "Barrier + Perangkap" },
  { pohon: "P07", blok: "C", gi: 2.44, p: 0.007, status: "Hotspot kuat", intervensi: "Barrier + Pruning" },
  { pohon: "P21", blok: "E", gi: 2.18, p: 0.014, status: "Hotspot", intervensi: "Pruning" },
  { pohon: "P03", blok: "B", gi: 1.97, p: 0.024, status: "Hotspot", intervensi: "Barrier" },
  { pohon: "P32", blok: "C", gi: 1.71, p: 0.041, status: "Hotspot", intervensi: "Perangkap" },
];

/* ---------- 7. Evaluasi BACI ---------- */
// % buah tergerek: 2 plot (Impact/Control) x 2 periode (Before/After)
export const BACI = {
  buahTergerek: [
    { periode: "Before", Perlakuan: 14.8, Kontrol: 14.2 },
    { periode: "After", Perlakuan: 8.6, Kontrol: 13.1 },
  ],
  aktivitas: [
    { periode: "Before", Perlakuan: 5.0, Kontrol: 4.8 },
    { periode: "After", Perlakuan: 3.1, Kontrol: 4.5 },
  ],
  // efek = (After-Before) Perlakuan - (After-Before) Kontrol
  efek: {
    tergerek: { perlakuan: -6.2, kontrol: -1.1, efek: -5.1, p: 0.003 },
    aktivitas: { perlakuan: -1.9, kontrol: -0.3, efek: -1.6, p: 0.011 },
  },
};

/* ---------- 8. Intervensi non-kimiawi terarah ---------- */
export const INTERVENSI = [
  { jenis: "Penghalang batang (banding)", lokasi: "P14, P07, P03", unit: 12, status: "Terpasang", efek: "Aktivitas turun 41%" },
  { jenis: "Pemutusan tajuk (pruning)", lokasi: "P07, P21", unit: 8, status: "Terpasang", efek: "Perpindahan tajuk turun" },
  { jenis: "Perangkap hidup terarah", lokasi: "P14, P32", unit: 6, status: "Aktif", efek: "9 tangkapan / 2 mgg" },
  { jenis: "Pengelolaan habitat perimeter", lokasi: "Tepi hutan utara", unit: 1, status: "Direncanakan", efek: "Menunggu baseline" },
];

export const FASE = [
  { fase: "Fase 1", aktivitas: "Persiapan, baseline, pemasangan perangkat", status: "Selesai" },
  { fase: "Fase 2", aktivitas: "Akuisisi data & pembangunan dataset", status: "Selesai" },
  { fase: "Fase 3", aktivitas: "Pelatihan model + analisis spasial", status: "Selesai" },
  { fase: "Fase 4", aktivitas: "Intervensi terarah + monitoring After", status: "Berjalan" },
  { fase: "Fase 5", aktivitas: "Evaluasi BACI, pelaporan, publikasi", status: "Menunggu" },
];

/* ---------- palet status ---------- */
export const STAT = {
  online: "#499b57",
  warning: "#e0a32e",
  offline: "#d35a3c",
};

export function giColor(gi) {
  // skala laterit lembut: hijau (rendah) -> kuning -> merah (hotspot)
  if (gi >= 0.75) return "#d35a3c";
  if (gi >= 0.55) return "#e08a3c";
  if (gi >= 0.38) return "#e6b94e";
  if (gi >= 0.22) return "#a9c46b";
  return "#7fb583";
}
