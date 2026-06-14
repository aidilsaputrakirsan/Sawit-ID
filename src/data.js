/* =========================================================================
   SAWIT-SAFE 01 — Sumber data (mock).
   Dipisah dari UI agar mudah disambung ke node LoRa/API sungguhan nanti:
   cukup ganti isi NODES / series ini dengan fetch ke backend.
   ========================================================================= */

/* ----- Geometri peta: batas kebun (viewBox 820 x 580) ----- */
export const BOUNDARY = [
  [78, 132], [742, 96], [766, 300], [702, 498],
  [360, 520], [92, 470], [58, 258],
];

function polyPoints(poly, n) {
  // jarak antar titik merata sepanjang keliling poligon (untuk node perimeter)
  const edges = [];
  let total = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    edges.push({ a, b, len }); total += len;
  }
  const step = total / n;
  const out = []; let target = step * 0.5; let acc = 0; let ei = 0;
  for (let k = 0; k < n; k++) {
    while (acc + edges[ei].len < target) { acc += edges[ei].len; ei = (ei + 1) % edges.length; }
    const t = (target - acc) / edges[ei].len;
    const { a, b } = edges[ei];
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    target += step;
  }
  return out;
}

const BLOKS = ["A", "B", "C", "D", "E", "F"];

/* deterministik: dibuat sekali saat modul dimuat, stabil antar render */
export const NODES = (() => {
  const perim = polyPoints(BOUNDARY, 16);
  const interior = [
    [250, 250], [430, 232], [566, 268],
    [330, 372], [520, 392], [438, 312],
  ];
  const raw = [...perim, ...interior];
  return raw.map((p, i) => {
    const id = "SS-" + String(i + 1).padStart(2, "0");
    const near = p[1] < 220; // dekat tepi hutan (atas) → tekanan tupai tinggi
    let status = "online";
    if (i === 9) status = "offline";
    else if (i === 4 || i === 14) status = "warning";
    const battery =
      status === "offline" ? 0 :
      status === "warning" ? [38, 44][i % 2] :
      [92, 78, 85, 96, 71, 88, 81, 90, 67, 94, 83, 76, 89, 72][i % 14];
    const rssi = status === "offline" ? -120 : -(62 + ((i * 7) % 44));
    const lastMin = status === "offline" ? 214 : (near ? (i * 3) % 9 + 1 : (i * 11) % 90 + 4);
    const acts = status === "offline" ? 0 : (near ? 4 + (i % 5) : (i * 3) % 4);
    return {
      id, x: p[0], y: p[1], status, battery, rssi, lastMin, acts,
      solar: status !== "offline" && battery < 100,
      blok: BLOKS[i % BLOKS.length],
      perimeter: i < 16,
    };
  });
})();

/* hotspot tupai (radial laterit) — terkonsentrasi di tepi hutan */
export const HOTSPOTS = [
  { x: 250, y: 150, r: 120, h: 0.9 },
  { x: 470, y: 130, r: 150, h: 1 },
  { x: 660, y: 175, r: 95, h: 0.6 },
  { x: 360, y: 300, r: 85, h: 0.35 },
];

/* deret aktivitas (mock) */
export const HOURLY = [2,1,0,0,1,3,9,14,11,6,4,3,2,2,3,5,8,13,10,5,3,2,1,1];
export const DAILY7 = [58,71,49,83,66,77,61];
export const DAILY14 = [44,52,39,61,57,48,70,58,71,49,83,66,77,61];

export const ACTIVATIONS = [
  { t: "07:42:11", node: "SS-04", freq: "31–44 kHz", dur: "12 dtk", blok: "E" },
  { t: "07:39:55", node: "SS-11", freq: "27–39 kHz", dur: "8 dtk", blok: "E" },
  { t: "07:31:08", node: "SS-02", freq: "33–48 kHz", dur: "15 dtk", blok: "B" },
  { t: "07:18:47", node: "SS-17", freq: "29–41 kHz", dur: "9 dtk", blok: "E" },
  { t: "06:55:23", node: "SS-04", freq: "26–38 kHz", dur: "11 dtk", blok: "E" },
  { t: "06:40:02", node: "SS-21", freq: "35–50 kHz", dur: "7 dtk", blok: "C" },
  { t: "06:22:39", node: "SS-15", freq: "30–43 kHz", dur: "13 dtk", blok: "C" },
  { t: "06:09:14", node: "SS-02", freq: "28–40 kHz", dur: "10 dtk", blok: "B" },
];

/* ----- palet status & util ----- */
export const C = { online: "#5fae71", warning: "#e8b04b", offline: "#e0623a" };

export function ago(min) {
  if (min < 1) return "baru saja";
  if (min < 60) return min + " mnt lalu";
  const h = Math.floor(min / 60);
  return h + " jam lalu";
}
export function bars(rssi) {
  if (rssi <= -118) return 0;
  if (rssi < -100) return 1;
  if (rssi < -85) return 2;
  if (rssi < -72) return 3;
  return 4;
}
export function statusLabel(s) {
  return s === "online" ? "Normal" : s === "warning" ? "Baterai rendah" : "Terputus";
}
