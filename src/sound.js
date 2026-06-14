/* =========================================================================
   SAWIT-SAFE 01 — UI sound (Web Audio, tanpa file aset).
   Nada disintesis: pendek, lembut, "profesional" — bukan game-y.
   AudioContext dibuat & di-resume pada interaksi pertama (kebijakan browser).
   ========================================================================= */

let ctx = null;
let master = null;
const muted = false; // suara UI selalu aktif

function ensure() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.6;        // volume keseluruhan rendah → halus
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/* satu "voice": osilator + amplop gain + low-pass tipis biar hangat */
function voice({ type = "triangle", from = 440, to = null, dur = 0.06, gain = 0.05, attack = 0.004, cutoff = 4200 }) {
  if (muted) return;
  const c = ensure();
  if (!c) return;
  const t = c.currentTime;

  const osc = c.createOscillator();
  const g = c.createGain();
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = cutoff;

  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  osc.connect(lp); lp.connect(g); g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

const sfx = {
  /* klik tombol umum — tik lembut */
  tap() { voice({ type: "triangle", from: 420, dur: 0.045, gain: 0.04 }); },
  /* pindah tab — sedikit naik, terasa "maju" */
  nav() { voice({ type: "triangle", from: 480, to: 660, dur: 0.07, gain: 0.045 }); },
  /* segmented / toggle */
  toggle() { voice({ type: "sine", from: 620, dur: 0.05, gain: 0.04 }); },
  /* buka bottom-sheet — sapuan naik halus */
  open() { voice({ type: "sine", from: 320, to: 560, dur: 0.12, gain: 0.05 }); },
  /* tutup — sapuan turun */
  close() { voice({ type: "sine", from: 520, to: 300, dur: 0.12, gain: 0.045 }); },
  /* tick scroll — sangat pelan & singkat (dipanggil ter-throttle) */
  scroll() { voice({ type: "sine", from: 1500, dur: 0.014, gain: 0.012, attack: 0.001, cutoff: 6000 }); },
};

export default sfx;
export { sfx };
