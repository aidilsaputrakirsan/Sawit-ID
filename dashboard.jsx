import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  NODES, HOTSPOTS, HOURLY, DAILY7, DAILY14, ACTIVATIONS, BOUNDARY,
  C, ago, bars, statusLabel,
} from "./src/data.js";
import sfx from "./src/sound.js";

/* =========================================================================
   SAWIT-SAFE 01 — Aplikasi mobile "Konsol Pagar Akustik".
   Desain mobile-first: shell HP, navigasi bawah ala app native, tema
   "konsol lapangan malam" (kanopi gelap + kaca + aksen kebun), bottom-sheet
   untuk detail node. Tidak ada layout desktop — di layar lebar tampil sebagai
   kolom HP di tengah. Data dari ./src/data.js (mock).
   ========================================================================= */

/* ====================== Atom kecil ====================== */
function Led({ s, size = 9 }) {
  return (
    <span className="led" style={{ width: size, height: size, background: C[s] }}>
      {s === "online" && <span className="led-pulse" style={{ background: C[s] }} />}
    </span>
  );
}

function SignalGlyph({ rssi }) {
  const n = bars(rssi);
  return (
    <span className="sig" aria-label={"sinyal " + n + " dari 4"}>
      {[1, 2, 3, 4].map((b) => (
        <i key={b} style={{ height: 3 + b * 2.4, background: b <= n ? C.online : "#d2d8cc" }} />
      ))}
    </span>
  );
}

function Battery({ pct, status }) {
  const col = status === "offline" ? C.offline : pct < 25 ? C.offline : pct < 45 ? C.warning : C.online;
  return (
    <div className="batt">
      <div className="batt-track"><div className="batt-fill" style={{ width: pct + "%", background: col }} /></div>
      <span className="mono batt-val">{status === "offline" ? "—" : pct + "%"}</span>
    </div>
  );
}

/* cincin progres (gauge) */
function Ring({ pct, size = 76, stroke = 7, color = "#3f9a57", track = "#d3e6d8", children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeLinecap="round" strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.3,1,.4,1)" }} />
      </svg>
      <div className="ring-cn">{children}</div>
    </div>
  );
}

function Clock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="mono">{t.toLocaleTimeString("id-ID", { hour12: false })}</span>;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

/* ====================== Aplikasi ====================== */
const TABS = [
  { k: "home", lab: "Beranda", d: "M3 10.5 12 3l9 7.5M5 9.5V20h4v-6h6v6h4V9.5" },
  { k: "map", lab: "Peta", d: "M9 4 3 6.2v14L9 18l6 2 6-2.2v-14L15 6 9 4zM9 4v14M15 6v14" },
  { k: "act", lab: "Aktivitas", d: "M3 12h4l3 8 4-16 3 8h4" },
  { k: "nodes", lab: "Node", d: "M4 5h16M4 12h16M4 19h11" },
];

export default function App() {
  const [tab, setTab] = useState("home");
  const [sel, setSel] = useState(null);
  const [range, setRange] = useState("today");
  const lastScroll = useRef(0);

  const onScroll = () => {
    const now = performance.now();
    if (now - lastScroll.current > 130) { lastScroll.current = now; sfx.scroll(); }
  };
  const switchTab = (k) => { if (k !== tab) sfx.nav(); setTab(k); };

  const kpis = useMemo(() => {
    const online = NODES.filter((n) => n.status === "online").length;
    const det = HOURLY.reduce((a, b) => a + b, 0);
    const acts = NODES.reduce((a, n) => a + n.acts, 0);
    const live = NODES.filter((n) => n.status !== "offline");
    const batt = Math.round(live.reduce((a, n) => a + n.battery, 0) / live.length);
    return { online, total: NODES.length, det, acts, batt };
  }, []);

  const selNode = NODES.find((n) => n.id === sel);
  const open = (id) => { sfx.open(); setSel(id); };
  const close = () => { sfx.close(); setSel(null); };

  return (
    <div className="stage">
      <style>{CSS}</style>
      <div className="phone">
        {/* ===== App bar ===== */}
        <header className="appbar">
          <div className="brand">SS</div>
          <div className="ab-mid">
            <div className="ab-title">SAWIT-SAFE 01</div>
            <div className="ab-sub"><span className="livedot" />Sungai Rambai · 60 ha</div>
          </div>
          <button className="ab-bell" aria-label="Notifikasi" onClick={sfx.tap}>
            <Ico d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
            <span className="bell-dot" />
          </button>
        </header>

        {/* ===== Konten (view berganti) ===== */}
        <main className="screen" onScroll={onScroll}>
          <div className="view" key={tab}>
            {tab === "home" && <Home kpis={kpis} open={open} />}
            {tab === "map" && <MapScreen sel={sel} open={open} />}
            {tab === "act" && <Activity range={range} setRange={setRange} open={open} />}
            {tab === "nodes" && <Nodes sel={sel} open={open} />}
          </div>
        </main>

        {/* ===== Navigasi bawah ===== */}
        <nav className="tabbar" aria-label="Navigasi utama">
          {TABS.map((t) => (
            <button key={t.k} className={"tab" + (tab === t.k ? " on" : "")}
                    onClick={() => switchTab(t.k)} aria-current={tab === t.k}>
              <span className="tab-ico"><Ico d={t.d} /></span>
              <span className="tab-lab">{t.lab}</span>
            </button>
          ))}
        </nav>

        {/* ===== Bottom sheet detail node ===== */}
        {selNode && <NodeSheet node={selNode} onClose={close} />}
      </div>
    </div>
  );
}

function Ico({ d, ...p }) {
  return <svg viewBox="0 0 24 24" className="ico" {...p}><path d={d} /></svg>;
}

/* ====================== VIEW: Beranda ====================== */
function Home({ kpis, open }) {
  const attention = useMemo(
    () => NODES.filter((n) => n.status !== "online").sort((a, b) => a.battery - b.battery),
    []
  );
  const coverage = Math.round((kpis.online / kpis.total) * 100);

  const KPI = [
    { lab: "Deteksi hari ini", val: kpis.det, foot: "puncak 06–08", c: C.offline, d: "M3 17l5-6 4 3 6-8" },
    { lab: "Aktivasi usir", val: kpis.acts, foot: "hopping 25–50 kHz", c: C.online, d: "M13 2 4 14h7l-1 8 9-12h-7z" },
    { lab: "Baterai rata", val: kpis.batt + "%", foot: "18 node mengisi", c: C.amber, d: "M7 4h10M9 4v3m6-3v3M6 7h12v13H6z" },
    { lab: "Hemat energi", val: "71%", foot: "vs nyala terus", c: "#7ed492", d: "M13 2 4 14h7l-1 8 9-12h-7z" },
  ];

  return (
    <>
      <div className="greet">
        <div>
          <div className="greet-hi">{greeting()},</div>
          <div className="greet-name">Pengawas Estate</div>
        </div>
        <div className="greet-clock"><Clock /><small>WIB</small></div>
      </div>

      {/* Hero status */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-l">
          <div className="hero-badge"><span className="livedot" />Pagar akustik aktif</div>
          <div className="hero-big"><b>{kpis.online}</b><span>/ {kpis.total} node daring</span></div>
          <div className="hero-meta">0,84 km perimeter · LoRa mesh · uptime 99,2%</div>
          <div className="hero-pills">
            <span className="hpill"><svg viewBox="0 0 24 24" className="ico mini" style={{ stroke: C.amber }}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" /></svg>742 W/m²</span>
            <span className="hpill"><svg viewBox="0 0 24 24" className="ico mini"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.3" /></svg>Riau</span>
          </div>
        </div>
        <Ring pct={coverage} size={92} stroke={8}>
          <div className="ring-val">{coverage}<small>%</small></div>
          <div className="ring-lab">cakupan</div>
        </Ring>
      </section>

      {/* KPI strip horizontal */}
      <div className="kpi-strip">
        {KPI.map((k) => (
          <div className="kpi" key={k.lab}>
            <span className="kpi-ic" style={{ color: k.c, background: k.c + "22" }}>
              <Ico d={k.d} />
            </span>
            <div className="kpi-val mono">{k.val}</div>
            <div className="kpi-lab">{k.lab}</div>
            <div className="kpi-foot">{k.foot}</div>
          </div>
        ))}
      </div>

      {/* Perlu perhatian */}
      <Section title="Perlu perhatian" hint={attention.length + " node"}>
        <div className="att-list">
          {attention.map((n) => (
            <button className="att" key={n.id} onClick={() => open(n.id)}>
              <span className="att-led" style={{ background: C[n.status] + "1f", color: C[n.status] }}>
                <Led s={n.status} size={9} />
              </span>
              <div className="att-mid">
                <div className="att-id mono">{n.id} <span className="att-blok">Blok {n.blok}</span></div>
                <div className="att-st" style={{ color: C[n.status] }}>{statusLabel(n.status)}</div>
              </div>
              <div className="att-r">
                <Battery pct={n.battery} status={n.status} />
                <Ico d="M9 6l6 6-6 6" style={{ stroke: "var(--soft)", width: 16, height: 16 }} />
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Status jaringan */}
      <Section title="Kesehatan jaringan">
        <div className="meters">
          <Meter lab="Cakupan pagar akustik" val={94} note="perimeter aktif" col={C.online} />
          <Meter lab="Uptime 24 jam" val={99} note="LoRa mesh" col="#7ed492" />
          <Meter lab="Hemat energi" val={71} note="aktivasi by-deteksi" col={C.amber} />
        </div>
      </Section>
      <div className="bottom-pad" />
    </>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="sec">
      <div className="sec-h">
        <h2>{title}</h2>
        {hint && <span className="sec-hint">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function Meter({ lab, val, note, col }) {
  return (
    <div className="meter">
      <div className="meter-top">
        <div>
          <div className="meter-lab">{lab}</div>
          <div className="meter-note">{note}</div>
        </div>
        <div className="meter-val mono" style={{ color: col }}>{val}%</div>
      </div>
      <div className="meter-track"><div className="meter-fill" style={{ width: val + "%", background: col }} /></div>
    </div>
  );
}

/* ====================== VIEW: Peta ====================== */
function MapScreen({ sel, open }) {
  return (
    <div className="mapscreen">
      <div className="map-head">
        <h2>Peta sebaran</h2>
        <div className="map-sub">node membentuk pagar · panas = tekanan tupai · tepi hutan di utara</div>
      </div>
      <div className="map-card">
        <svg className="map-svg" viewBox="0 0 820 580" role="img" aria-label="Peta kebun dan jaringan node">
          <defs>
            {HOTSPOTS.map((h, i) => (
              <radialGradient key={i} id={"hot" + i}>
                <stop offset="0%" stopColor="#ff7a4d" stopOpacity={0.6 * h.h} />
                <stop offset="60%" stopColor="#e0623a" stopOpacity={0.2 * h.h} />
                <stop offset="100%" stopColor="#e0623a" stopOpacity="0" />
              </radialGradient>
            ))}
            <pattern id="palms" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
              <circle cx="6" cy="6" r="1.5" fill="#2f5a3e" opacity="0.5" />
            </pattern>
            <clipPath id="estate"><polygon points={BOUNDARY.map((p) => p.join(",")).join(" ")} /></clipPath>
          </defs>

          <rect x="0" y="0" width="820" height="118" fill="#0a1a11" />
          {Array.from({ length: 46 }).map((_, i) => (
            <circle key={i} cx={(i * 18 + (i % 2) * 9) % 820} cy={22 + (i % 4) * 22} r={7 + (i % 3) * 2}
                    fill="#143019" opacity="0.85" />
          ))}
          <text x="20" y="105" fill="#5e8568" fontSize="11" fontFamily="monospace" letterSpacing="2">TEPI HUTAN — SUMBER TUPAI</text>

          <polygon points={BOUNDARY.map((p) => p.join(",")).join(" ")} fill="#12281c" stroke="#2c5740" strokeWidth="2" />
          <rect x="0" y="0" width="820" height="580" fill="url(#palms)" clipPath="url(#estate)" />

          <g clipPath="url(#estate)">
            {HOTSPOTS.map((h, i) => (
              <circle key={i} cx={h.x} cy={h.y} r={h.r} fill={"url(#hot" + i + ")"} />
            ))}
          </g>

          <polygon points={NODES.filter((n) => n.perimeter).map((n) => n.x + "," + n.y).join(" ")}
                   fill="none" stroke="#5fae71" strokeWidth="1.6" strokeDasharray="2 6" opacity="0.65" />

          {NODES.filter((n) => n.status === "online").map((n) => (
            <circle key={"r" + n.id} cx={n.x} cy={n.y} r="34" fill="#7ec98c" opacity="0.07" />
          ))}

          {NODES.map((n) => {
            const isSel = sel === n.id;
            return (
              <g key={n.id} className="node-hit" tabIndex={0}
                 onClick={() => open(n.id)}
                 onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && open(n.id)}>
                {isSel && <circle cx={n.x} cy={n.y} r="16" fill="none" stroke="#fff" strokeWidth="2" opacity="0.9" />}
                <circle className="node-dot" cx={n.x} cy={n.y} r={isSel ? 9 : 7}
                        fill={C[n.status]} stroke="#0a1a11" strokeWidth="1.6" />
                {n.status === "online" && n.acts > 3 && (
                  <circle cx={n.x} cy={n.y} r="7" fill="none" stroke={C.offline} strokeWidth="1.6" opacity="0.85" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="map-legend">
        <span className="it"><Led s="online" size={9} />Normal</span>
        <span className="it"><Led s="warning" size={9} />Baterai rendah</span>
        <span className="it"><Led s="offline" size={9} />Terputus</span>
        <span className="it"><span className="hot-chip" />Hotspot tupai</span>
      </div>
      <div className="map-foot mono">UTM 47N · 24 node · jarak ±55 m · tap node untuk telemetri</div>
      <div className="bottom-pad" />
    </div>
  );
}

/* ====================== VIEW: Aktivitas ====================== */
function Activity({ range, setRange, open }) {
  const chart = range === "today" ? HOURLY : range === "7d" ? DAILY7 : DAILY14;
  const max = Math.max(...chart);
  const total = chart.reduce((a, b) => a + b, 0);
  const labels =
    range === "today" ? chart.map((_, i) => (i % 6 === 0 ? String(i).padStart(2, "0") : "")) :
    range === "7d" ? ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] :
    chart.map((_, i) => (i % 2 === 0 ? "−" + (chart.length - 1 - i) : ""));

  return (
    <>
      <div className="map-head">
        <h2>Aktivitas tupai</h2>
        <div className="map-sub">deteksi tervalidasi sensor + kamera</div>
      </div>

      <div className="seg">
        {[["today", "Hari ini"], ["7d", "7 hari"], ["14d", "14 hari"]].map(([k, l]) => (
          <button key={k} className={range === k ? "on" : ""} onClick={() => { if (k !== range) sfx.toggle(); setRange(k); }}>{l}</button>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-total">
          <span className="mono big">{total}</span>
          <span className="unit">deteksi · {range === "today" ? "hari ini" : range === "7d" ? "7 hari" : "14 hari"}</span>
        </div>
        <Chart data={chart} labels={labels} max={max} />
      </div>

      <Section title="Riwayat aktivasi" hint="8 terakhir">
        <div className="time">
          {ACTIVATIONS.map((a, i) => (
            <button className="tl" key={i} onClick={() => open(a.node)}>
              <div className="tl-rail"><span className="tl-dot" />{i < ACTIVATIONS.length - 1 && <span className="tl-line" />}</div>
              <div className="tl-body">
                <div className="tl-top">
                  <b className="mono">{a.node}</b>
                  <span className="tl-t mono">{a.t}</span>
                </div>
                <div className="tl-mid">Blok {a.blok} — pengusiran <span className="tl-freq mono">{a.freq}</span></div>
                <div className="tl-sub">durasi {a.dur} · pola hopping pseudo-acak</div>
              </div>
            </button>
          ))}
        </div>
      </Section>
      <div className="bottom-pad" />
    </>
  );
}

function Chart({ data, labels, max }) {
  const W = 340, H = 150, pad = 6;
  const n = data.length;
  const bw = (W - pad * 2) / n;
  return (
    <svg className="chart-svg" viewBox={`0 0 ${W} ${H + 20}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ed492" /><stop offset="100%" stopColor="#3d8a55" />
        </linearGradient>
        <linearGradient id="barP" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff7a4d" /><stop offset="100%" stopColor="#c4421f" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1="0" x2={W} y1={H - H * g} y2={H - H * g} stroke="#e7ebe0" strokeWidth="1" />
      ))}
      {data.map((v, i) => {
        const h = max ? (v / max) * (H - 10) : 0;
        const peak = v >= max * 0.78;
        return (
          <rect key={i} className="bar" x={pad + i * bw + bw * 0.18} y={H - h}
                width={bw * 0.64} height={Math.max(h, 2)} rx="3"
                fill={peak ? "url(#barP)" : "url(#barG)"}>
            <title>{v} deteksi</title>
          </rect>
        );
      })}
      {labels.map((l, i) => l ? (
        <text key={i} className="c-xlab" x={pad + i * bw + bw / 2} y={H + 14} textAnchor="middle">{l}</text>
      ) : null)}
    </svg>
  );
}

/* ====================== VIEW: Node ====================== */
function Nodes({ sel, open }) {
  return (
    <>
      <div className="map-head">
        <h2>Seluruh node</h2>
        <div className="map-sub">{NODES.length} unit · tap untuk telemetri</div>
      </div>
      <div className="node-list">
        {NODES.map((n) => (
          <button className={"nrow" + (sel === n.id ? " sel" : "")} key={n.id} onClick={() => open(n.id)}>
            <span className="nrow-led"><Led s={n.status} size={10} /></span>
            <div className="nrow-main">
              <div className="nrow-id mono">{n.id} <span className="nrow-blok">· Blok {n.blok}</span></div>
              <div className="nrow-meta">
                {n.status === "offline" ? "terputus" : ago(n.lastMin)} · {n.perimeter ? "perimeter" : "interior"}
              </div>
            </div>
            <div className="nrow-r">
              <Battery pct={n.battery} status={n.status} />
              <div className="nrow-sig"><SignalGlyph rssi={n.rssi} /><span className="nrow-acts mono">{n.acts} usir</span></div>
            </div>
          </button>
        ))}
      </div>
      <div className="bottom-pad" />
    </>
  );
}

/* ====================== Bottom sheet detail node ====================== */
function NodeSheet({ node, onClose }) {
  const tone = node.status === "online" ? "rgba(95,174,113,.16)" : node.status === "warning" ? "rgba(232,176,75,.16)" : "rgba(224,98,42,.16)";
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={"Detail " + node.id}>
        <span className="grip" />
        <div className="sheet-head">
          <div>
            <div className="sheet-id mono">{node.id}</div>
            <div className="sheet-sub">Blok {node.blok} · {node.perimeter ? "perimeter pagar" : "node interior"}</div>
          </div>
          <span className="sheet-stat" style={{ background: tone, color: C[node.status] }}>
            <Led s={node.status} size={9} />{statusLabel(node.status)}
          </span>
        </div>

        <div className="sheet-grid">
          <Cell l="Baterai"><Battery pct={node.battery} status={node.status} /></Cell>
          <Cell l="Daya surya">{node.solar ? "Mengisi" : node.status === "offline" ? "—" : "Penuh"}</Cell>
          <Cell l="Sinyal LoRa"><SignalGlyph rssi={node.rssi} /> <span className="mono sm">{node.status === "offline" ? "—" : node.rssi + " dBm"}</span></Cell>
          <Cell l="Aktivasi hari ini">{node.acts}</Cell>
          <Cell l="Deteksi terakhir" sm>{node.status === "offline" ? "—" : ago(node.lastMin)}</Cell>
          <Cell l="Rentang frekuensi" sm>{node.status === "offline" ? "—" : "25–50 kHz"}</Cell>
        </div>

        <button className="sheet-btn" onClick={onClose}>Tutup</button>
      </div>
    </div>
  );
}

function Cell({ l, sm, children }) {
  return (
    <div className="cell">
      <div className="cell-l">{l}</div>
      <div className={"cell-v" + (sm ? " sm" : "")}>{children}</div>
    </div>
  );
}

/* ====================== Gaya ====================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
.stage{
  --bg0:#e7ece1; --bg1:#f1f5ec; --paper:#ffffff;
  --surf:#ffffff; --surf2:#f4f6ef;
  --line:#e6e9df; --line2:#dde2d4;
  --ink:#1d2c22; --soft:#6f7e70; --canopy:#3f9a57; --bright:#2f8c4b;
  --amber:#cf911f; --laterite:#cf5a36;
  --sh:0 2px 12px rgba(31,55,38,.06);
  font-family:'Plus Jakarta Sans',system-ui,sans-serif;
  min-height:100dvh; display:grid; place-items:center;
  background:radial-gradient(120% 80% at 50% -10%,#f4f8ef 0%,#e2e8d9 62%);
  color:var(--ink); -webkit-font-smoothing:antialiased; letter-spacing:-.004em;
}
.mono{font-family:'IBM Plex Mono',monospace}
h2{font-family:'Sora',sans-serif}

.phone{
  width:min(100vw,440px); height:100dvh; position:relative; overflow:hidden;
  display:flex; flex-direction:column;
  background:linear-gradient(180deg,#fafcf7,#eef2e8);
  box-shadow:0 0 0 1px rgba(31,55,38,.05),0 30px 80px rgba(31,55,38,.14);
}
@media(min-width:480px){
  .stage{padding:18px}
  .phone{height:min(900px,calc(100dvh - 36px)); border-radius:34px;
    box-shadow:0 0 0 1px rgba(31,55,38,.06),0 40px 110px rgba(31,55,38,.2)}
}

/* ---- app bar ---- */
.appbar{
  display:flex; align-items:center; gap:12px; padding:18px 18px 12px;
  background:linear-gradient(180deg,rgba(250,252,247,.96),rgba(250,252,247,0));
  position:relative; z-index:4;
}
.brand{
  width:40px;height:40px;border-radius:13px;flex:none;display:grid;place-items:center;
  background:linear-gradient(140deg,#5fbf78,#2f8c4b); color:#fff;
  font-family:'Sora';font-weight:800;font-size:16px;letter-spacing:-.04em;
  box-shadow:0 6px 16px rgba(63,154,87,.3),inset 0 0 0 1px rgba(255,255,255,.25);
}
.ab-mid{flex:1;min-width:0}
.ab-title{font-family:'Sora';font-weight:700;font-size:15px;letter-spacing:-.01em}
.ab-sub{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--soft);margin-top:2px}
.livedot{width:7px;height:7px;border-radius:50%;background:var(--canopy);position:relative;flex:none}
.livedot::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:1.5px solid var(--canopy);animation:ring 1.9s ease-out infinite}
@keyframes ring{0%{transform:scale(.5);opacity:.8}100%{transform:scale(1.9);opacity:0}}
.ab-bell{position:relative;width:40px;height:40px;border-radius:13px;border:1px solid var(--line);background:var(--surf);display:grid;place-items:center;cursor:pointer;color:var(--ink);box-shadow:var(--sh)}
.ab-bell:active{transform:scale(.94)}
.bell-dot{position:absolute;top:9px;right:10px;width:7px;height:7px;border-radius:50%;background:var(--laterite);box-shadow:0 0 0 2px var(--paper)}

/* ---- screen ---- */
.screen{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
.screen::-webkit-scrollbar{width:0}
.view{padding:6px 18px 0;animation:vin .42s cubic-bezier(.22,1,.36,1)}
@keyframes vin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.bottom-pad{height:96px}

/* ---- greet ---- */
.greet{display:flex;align-items:flex-end;justify-content:space-between;margin:6px 2px 16px}
.greet-hi{font-size:13px;color:var(--soft)}
.greet-name{font-family:'Sora';font-weight:700;font-size:18px;margin-top:2px}
.greet-clock{text-align:right}
.greet-clock .mono{font-size:18px;font-weight:500}
.greet-clock small{display:block;font-size:10px;color:var(--soft);letter-spacing:.1em}

/* ---- hero ---- */
.hero{
  position:relative;overflow:hidden;border-radius:24px;padding:20px;display:flex;
  align-items:center;justify-content:space-between;gap:14px;
  background:linear-gradient(145deg,#e4f3e8,#f4faf1);
  border:1px solid #d3e8d8;
  box-shadow:0 14px 32px rgba(31,55,38,.09),inset 0 1px 0 #fff;
}
.hero-glow{position:absolute;width:220px;height:220px;border-radius:50%;right:-60px;top:-70px;
  background:radial-gradient(circle,rgba(95,191,120,.3),transparent 65%);filter:blur(8px)}
.hero-l{position:relative;z-index:1;min-width:0}
.hero-badge{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:600;
  color:var(--bright);background:rgba(63,154,87,.13);padding:5px 10px;border-radius:20px}
.hero-big{margin-top:12px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.hero-big b{font-family:'Sora';font-weight:800;font-size:40px;line-height:.9;letter-spacing:-.03em}
.hero-big span{font-size:13px;color:var(--soft)}
.hero-meta{font-size:11.5px;color:var(--soft);margin-top:8px}
.hero-pills{display:flex;gap:8px;margin-top:12px}
.hpill{display:inline-flex;align-items:center;gap:6px;font-size:11.5px;font-weight:600;
  background:#fff;border:1px solid var(--line);padding:5px 10px;border-radius:11px;box-shadow:var(--sh)}
.ico.mini{width:13px;height:13px;stroke:var(--bright)}

/* ring */
.ring-wrap{position:relative;flex:none;display:grid;place-items:center}
.ring-cn{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ring-val{font-family:'IBM Plex Mono';font-weight:600;font-size:21px;line-height:1}
.ring-val small{font-size:11px;color:var(--soft)}
.ring-lab{font-size:9.5px;color:var(--soft);letter-spacing:.06em;text-transform:uppercase;margin-top:2px}

/* ---- kpi strip ---- */
.kpi-strip{display:flex;gap:11px;overflow-x:auto;margin:16px -18px 0;padding:2px 18px 4px;scroll-snap-type:x mandatory}
.kpi-strip::-webkit-scrollbar{height:0}
.kpi{flex:0 0 138px;scroll-snap-align:start;background:var(--surf);border:1px solid var(--line);
  border-radius:18px;padding:14px;position:relative;box-shadow:var(--sh)}
.kpi-ic{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;margin-bottom:11px}
.kpi-ic .ico{width:17px;height:17px;stroke:currentColor}
.kpi-val{font-size:25px;font-weight:600;letter-spacing:-.02em;line-height:1}
.kpi-lab{font-size:11.5px;font-weight:600;margin-top:7px}
.kpi-foot{font-size:10.5px;color:var(--soft);margin-top:3px}

/* ---- section ---- */
.sec{margin-top:24px}
.sec-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px;padding:0 2px}
.sec-h h2{font-weight:700;font-size:15.5px}
.sec-hint{font-size:11.5px;color:var(--soft);font-weight:500}

/* attention */
.att-list{display:flex;flex-direction:column;gap:9px}
.att{display:flex;align-items:center;gap:12px;width:100%;text-align:left;cursor:pointer;
  background:var(--surf);border:1px solid var(--line);border-radius:16px;padding:12px 13px;box-shadow:var(--sh);
  font-family:inherit;color:var(--ink);transition:transform .12s,background .15s}
.att:active{transform:scale(.985);background:var(--surf2)}
.att-led{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;flex:none}
.att-mid{flex:1;min-width:0}
.att-id{font-size:13.5px;font-weight:600}
.att-blok{color:var(--soft);font-family:'Plus Jakarta Sans';font-size:11px;font-weight:500}
.att-st{font-size:11.5px;font-weight:600;margin-top:2px}
.att-r{display:flex;align-items:center;gap:8px}

/* meters */
.meters{display:flex;flex-direction:column;gap:14px;background:var(--surf);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--sh)}
.meter-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:9px}
.meter-lab{font-size:12.5px;font-weight:600}
.meter-note{font-size:11px;color:var(--soft);margin-top:2px}
.meter-val{font-size:18px;font-weight:600}
.meter-track{height:7px;border-radius:4px;background:#e8ebe0;overflow:hidden}
.meter-fill{height:100%;border-radius:4px;transition:width .8s cubic-bezier(.3,1,.4,1)}

/* battery / signal atoms */
.batt{display:flex;align-items:center;gap:8px}
.batt-track{width:42px;height:7px;border-radius:4px;background:#e6e9dd;overflow:hidden}
.batt-fill{height:100%;border-radius:4px}
.batt-val{font-size:11.5px;color:var(--soft);min-width:32px}
.sig{display:inline-flex;align-items:flex-end;gap:2px;height:12px}
.sig i{width:3px;border-radius:1px;display:block}
.led{display:inline-block;border-radius:50%;position:relative;flex:none}
.led-pulse{position:absolute;inset:0;border-radius:50%;opacity:.55;animation:lp 1.9s ease-out infinite}
@keyframes lp{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.6);opacity:0}}

/* ---- peta ---- */
.mapscreen{padding-top:4px}
.map-head{padding:6px 2px 14px}
.map-head h2{font-weight:700;font-size:18px}
.map-sub{font-size:11.5px;color:var(--soft);margin-top:3px}
.map-card{border-radius:20px;overflow:hidden;border:1px solid var(--line2);box-shadow:0 14px 34px rgba(31,55,38,.16)}
.map-svg{display:block;width:100%;height:auto;background:linear-gradient(160deg,#0d2417,#10301f)}
.node-hit{cursor:pointer}
.node-dot{transition:r .15s}
.map-legend{display:flex;flex-wrap:wrap;gap:12px 16px;margin-top:14px;padding:13px 15px;border-radius:15px;
  background:var(--surf);border:1px solid var(--line);box-shadow:var(--sh);font-size:11.5px;font-weight:500}
.map-legend .it{display:flex;align-items:center;gap:7px}
.hot-chip{width:13px;height:13px;border-radius:4px;background:linear-gradient(90deg,#ff7a4d,transparent)}
.map-foot{font-size:10.5px;color:var(--soft);margin-top:11px;text-align:center;letter-spacing:.02em}

/* ---- segmented ---- */
.seg{display:flex;background:var(--surf);border:1px solid var(--line);border-radius:13px;padding:4px;gap:3px;margin-bottom:16px}
.seg button{flex:1;border:none;background:transparent;font-family:inherit;font-size:12.5px;font-weight:600;
  color:var(--soft);padding:9px;border-radius:9px;cursor:pointer;transition:.15s}
.seg button.on{background:linear-gradient(140deg,#4aab64,#2f8c4b);color:#fff;box-shadow:0 4px 12px rgba(63,154,87,.32)}

/* ---- chart ---- */
.chart-card{background:var(--surf);border:1px solid var(--line);border-radius:20px;padding:18px 16px 12px;box-shadow:var(--sh)}
.chart-total{display:flex;align-items:baseline;gap:8px;margin-bottom:14px;padding:0 2px}
.chart-total .big{font-size:32px;font-weight:600;letter-spacing:-.02em}
.chart-total .unit{font-size:12px;color:var(--soft)}
.chart-svg{width:100%;height:172px;display:block;overflow:visible}
.bar{transition:opacity .15s}
.c-xlab{font-family:'IBM Plex Mono';font-size:9.5px;fill:var(--soft)}

/* ---- timeline ---- */
.time{display:flex;flex-direction:column}
.tl{display:flex;gap:13px;width:100%;text-align:left;background:none;border:none;cursor:pointer;
  font-family:inherit;color:var(--ink);padding:0;transition:opacity .12s}
.tl:active{opacity:.65}
.tl-rail{display:flex;flex-direction:column;align-items:center;padding-top:5px;flex:none}
.tl-dot{width:11px;height:11px;border-radius:50%;background:var(--canopy);box-shadow:0 0 0 4px rgba(95,174,113,.16)}
.tl-line{width:2px;flex:1;background:var(--line2);margin:3px 0}
.tl-body{flex:1;min-width:0;padding-bottom:16px}
.tl-top{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.tl-top b{font-size:13.5px;font-weight:600}
.tl-t{font-size:11px;color:var(--soft)}
.tl-mid{font-size:12.5px;margin-top:3px}
.tl-freq{color:var(--bright);font-weight:500}
.tl-sub{font-size:11px;color:var(--soft);margin-top:3px}

/* ---- node list ---- */
.node-list{display:flex;flex-direction:column;gap:8px}
.nrow{display:flex;align-items:center;gap:12px;width:100%;text-align:left;cursor:pointer;font-family:inherit;color:var(--ink);
  background:var(--surf);border:1px solid var(--line);border-radius:15px;padding:12px 13px;box-shadow:var(--sh);transition:transform .12s,background .15s}
.nrow:active{transform:scale(.985)}
.nrow.sel{border-color:rgba(63,154,87,.45);background:rgba(63,154,87,.07)}
.nrow-led{width:30px;height:30px;border-radius:10px;display:grid;place-items:center;background:#f0f3ea;flex:none}
.nrow-main{flex:1;min-width:0}
.nrow-id{font-size:13.5px;font-weight:600}
.nrow-blok{color:var(--soft);font-family:'Plus Jakarta Sans';font-size:11px;font-weight:500}
.nrow-meta{font-size:11px;color:var(--soft);margin-top:2px}
.nrow-r{display:flex;flex-direction:column;align-items:flex-end;gap:5px}
.nrow-sig{display:flex;align-items:center;gap:7px}
.nrow-acts{font-size:11px;color:var(--soft)}

/* ---- tabbar ---- */
.tabbar{
  position:absolute;left:0;right:0;bottom:0;z-index:6;display:flex;
  padding:9px 12px calc(14px + env(safe-area-inset-bottom));
  background:linear-gradient(180deg,rgba(250,252,247,0),rgba(250,252,247,.96) 36%);
  border-top:1px solid rgba(230,233,223,.6);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
}
.tab{flex:1;border:none;background:none;cursor:pointer;display:flex;flex-direction:column;
  align-items:center;gap:5px;padding:8px 4px;color:var(--soft);font-family:inherit;border-radius:14px;transition:color .15s}
.tab-ico{display:grid;place-items:center;width:48px;height:30px;border-radius:13px;transition:background .2s}
.tab-ico .ico{width:21px;height:21px;stroke:currentColor}
.tab-lab{font-size:10.5px;font-weight:600;letter-spacing:.01em}
.tab.on{color:var(--bright)}
.tab.on .tab-ico{background:rgba(63,154,87,.14)}
.tab:active .tab-ico{transform:scale(.9)}

/* ---- bottom sheet ---- */
.scrim{position:absolute;inset:0;z-index:20;background:rgba(28,44,34,.42);
  backdrop-filter:blur(3px);display:flex;align-items:flex-end;animation:sf .25s ease}
@keyframes sf{from{opacity:0}to{opacity:1}}
.sheet{width:100%;background:linear-gradient(180deg,#ffffff,#f5f8f1);
  border-top-left-radius:28px;border-top-right-radius:28px;padding:10px 20px calc(24px + env(safe-area-inset-bottom));
  border-top:1px solid var(--line2);box-shadow:0 -16px 44px rgba(31,55,38,.2);animation:su .34s cubic-bezier(.22,1,.36,1)}
@keyframes su{from{transform:translateY(100%)}to{transform:none}}
.grip{display:block;width:42px;height:5px;border-radius:3px;background:#d3d9ca;margin:0 auto 16px}
.sheet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px}
.sheet-id{font-family:'Sora';font-weight:700;font-size:24px;letter-spacing:-.02em}
.sheet-sub{font-size:12px;color:var(--soft);margin-top:3px}
.sheet-stat{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;padding:7px 12px;border-radius:11px;white-space:nowrap}
.sheet-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cell{background:var(--surf2);border:1px solid var(--line);border-radius:14px;padding:12px 13px}
.cell-l{font-size:11px;font-weight:600;color:var(--soft)}
.cell-v{font-family:'IBM Plex Mono';font-weight:600;font-size:17px;margin-top:7px;display:flex;align-items:center;gap:7px}
.cell-v.sm{font-size:13.5px}
.cell-v .sm{font-size:12px}
.sheet-btn{width:100%;margin-top:16px;border:none;cursor:pointer;font-family:inherit;font-weight:700;font-size:14px;
  color:#fff;background:linear-gradient(140deg,#4aab64,#2f8c4b);padding:14px;border-radius:15px;box-shadow:0 8px 20px rgba(63,154,87,.3);transition:transform .12s}
.sheet-btn:active{transform:scale(.98)}

.ico{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}

*:focus-visible{outline:2.5px solid var(--canopy);outline-offset:2px;border-radius:10px}
@media(prefers-reduced-motion:reduce){
  .led-pulse,.livedot::after,.view,.sheet,.scrim{animation:none}
}
`;
