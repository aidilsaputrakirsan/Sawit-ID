import { useEffect, useRef, useState, useCallback } from "react";
import {
  Card,
  Grid,
  Group,
  Text,
  Stack,
  Badge,
  Box,
  Button,
  Slider,
  Switch,
  Divider,
  Alert,
  Loader,
  ThemeIcon,
  ScrollArea,
} from "@mantine/core";
import {
  IconCamera,
  IconCameraOff,
  IconPlayerPlay,
  IconAlertTriangle,
  IconShieldLock,
  IconActivity,
} from "@tabler/icons-react";

import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

import { SectionTitle, MetaRow } from "../components/ui.jsx";

/* Kata kunci famili tupai (Sciuridae) pada label ImageNet/MobileNet.
   ImageNet memuat antara lain "fox squirrel" dan "marmot" (sama-sama Sciuridae). */
const SCIURIDAE = ["squirrel", "marmot", "chipmunk", "prairie", "bajing", "tupai"];

const WARNA_TUPAI = "#499b57"; // famili tupai
const WARNA_OBJEK = "#3b82c4"; // objek/spesies lain
const MAKS_KLASIFIKASI = 3; // jumlah kotak terbesar yang diberi label spesies / frame

function isSciuridae(name) {
  const n = name.toLowerCase();
  return SCIURIDAE.some((k) => n.includes(k));
}
function rapiNama(name) {
  // ImageNet sering "fox squirrel, eastern fox squirrel, ..." → ambil bagian pertama
  return name.split(",")[0];
}

export default function LiveDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cropRef = useRef(null); // kanvas potong untuk klasifikasi
  const cocoRef = useRef(null);
  const netRef = useRef(null);
  const rafRef = useRef(0);
  const streamRef = useRef(null);
  const confRef = useRef(0.55);
  const mirrorRef = useRef(true);
  const fpsRef = useRef({ last: performance.now(), frames: 0 });

  const [phase, setPhase] = useState("idle"); // idle | loadingModel | ready | running | error
  const [error, setError] = useState(null);
  const [conf, setConf] = useState(55);
  const [mirror, setMirror] = useState(true);
  const [fps, setFps] = useState(0);
  const [count, setCount] = useState({ tupai: 0, objek: 0 });
  const [log, setLog] = useState([]);

  useEffect(() => void (confRef.current = conf / 100), [conf]);
  useEffect(() => void (mirrorRef.current = mirror), [mirror]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const cv = canvasRef.current;
    if (cv) cv.getContext("2d").clearRect(0, 0, cv.width, cv.height);
    setPhase(cocoRef.current ? "ready" : "idle");
    setFps(0);
    setCount({ tupai: 0, objek: 0 });
  }, []);

  useEffect(() => () => stop(), [stop]);

  const detectLoop = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const coco = cocoRef.current;
    const net = netRef.current;
    if (!video || !canvas || !coco || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext("2d");

    // 1. deteksi objek (kotak) dengan COCO-SSD
    let preds = [];
    try {
      preds = await coco.detect(video);
    } catch {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }
    const kept = preds.filter((p) => p.score >= confRef.current);

    // 2. klasifikasi spesies (MobileNet) pada kotak terbesar
    const ranked = [...kept].sort(
      (a, b) => b.bbox[2] * b.bbox[3] - a.bbox[2] * a.bbox[3]
    );
    const labelByPred = new Map();
    if (net) {
      const crop = cropRef.current;
      const cctx = crop.getContext("2d");
      for (const p of ranked.slice(0, MAKS_KLASIFIKASI)) {
        const [x, y, bw, bh] = p.bbox;
        if (bw < 24 || bh < 24) continue;
        cctx.clearRect(0, 0, 224, 224);
        cctx.drawImage(video, x, y, bw, bh, 0, 0, 224, 224);
        try {
          const res = await net.classify(crop, 1);
          if (res && res[0]) labelByPred.set(p, res[0]);
        } catch {
          /* abaikan satu frame */
        }
      }
    }

    // 3. gambar kotak + label
    ctx.clearRect(0, 0, w, h);
    let nT = 0;
    let nO = 0;
    const tupaiHits = [];

    kept.forEach((p) => {
      const sp = labelByPred.get(p); // {className, probability} | undefined
      const spName = sp ? rapiNama(sp.className) : null;
      const tupai = sp ? isSciuridae(sp.className) : false;
      const color = tupai ? WARNA_TUPAI : WARNA_OBJEK;

      if (tupai) {
        nT++;
        tupaiHits.push({ name: spName, score: sp.probability });
      } else nO++;

      // teks label: pakai nama spesies bila ada, jika tidak pakai kelas COCO
      const namaTampil = spName || p.class;
      const skor = sp ? sp.probability : p.score;
      const txt = `${namaTampil} ${(skor * 100).toFixed(0)}%`;

      const [x, y, bw, bh] = p.bbox;
      // koordinat layar (perhitungkan cermin)
      const dx = mirrorRef.current ? w - x - bw : x;

      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.strokeRect(dx, y, bw, bh);

      ctx.font = "600 15px Inter, sans-serif";
      const tw = ctx.measureText(txt).width + 14;
      ctx.fillStyle = color;
      ctx.fillRect(dx, Math.max(0, y - 22), tw, 22);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(txt, dx + 7, Math.max(13, y - 6));
    });

    setCount({ tupai: nT, objek: nO });

    if (tupaiHits.length) {
      const top = tupaiHits.sort((a, b) => b.score - a.score)[0];
      const stamp = new Date().toLocaleTimeString("id-ID", { hour12: false });
      setLog((prev) => {
        if (prev[0] && prev[0].name === top.name && prev[0].t === stamp)
          return prev;
        return [{ t: stamp, name: top.name, score: top.score }, ...prev].slice(0, 12);
      });
    }

    const f = fpsRef.current;
    f.frames++;
    const now = performance.now();
    if (now - f.last >= 1000) {
      setFps(f.frames);
      f.frames = 0;
      f.last = now;
    }

    rafRef.current = requestAnimationFrame(detectLoop);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      if (!cocoRef.current || !netRef.current) {
        setPhase("loadingModel");
        const [c, n] = await Promise.all([
          cocoRef.current ?? cocoSsd.load({ base: "lite_mobilenet_v2" }),
          netRef.current ?? mobilenet.load({ version: 2, alpha: 1.0 }),
        ]);
        cocoRef.current = c;
        netRef.current = n;
        // siapkan kanvas potong sekali
        if (!cropRef.current) {
          const cv = document.createElement("canvas");
          cv.width = 224;
          cv.height = 224;
          cropRef.current = cv;
        }
      }
      setPhase("ready");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      setPhase("running");
      fpsRef.current = { last: performance.now(), frames: 0 };
      rafRef.current = requestAnimationFrame(detectLoop);
    } catch (e) {
      let msg = "Tidak dapat memulai kamera.";
      if (e?.name === "NotAllowedError")
        msg = "Akses kamera ditolak. Izinkan kamera di browser lalu coba lagi.";
      else if (e?.name === "NotFoundError")
        msg = "Tidak ada kamera yang terdeteksi pada perangkat ini.";
      else if (e?.message) msg = e.message;
      setError(msg);
      setPhase(cocoRef.current ? "ready" : "error");
    }
  }, [detectLoop]);

  const running = phase === "running";
  const busy = phase === "loadingModel";

  return (
    <>
      <SectionTitle
        title="Uji Deteksi (Live)"
        subtitle="Deteksi objek (COCO-SSD) digabung klasifikasi spesies (MobileNet/ImageNet). Famili tupai (Sciuridae) ditandai khusus. Inferensi berjalan di perangkat."
        right={
          <Badge size="lg" variant="light" color={running ? "sawit" : "gray"}>
            {running ? "Kamera aktif" : "Kamera mati"}
          </Badge>
        }
      />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card padding="lg">
            <Box
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                background: "#0e1512",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: mirror ? "scaleX(-1)" : "none",
                }}
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              {!running && (
                <Box
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    color: "#cdd8d0",
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  {busy ? (
                    <>
                      <Loader color="sawit" />
                      <Text fz="sm" c="#cdd8d0">
                        Memuat model (COCO-SSD + MobileNet)…
                      </Text>
                    </>
                  ) : (
                    <>
                      <ThemeIcon size={54} radius="xl" variant="light" color="sawit">
                        <IconCamera size={28} stroke={1.6} />
                      </ThemeIcon>
                      <Text fz="sm" c="#cdd8d0" maw={340}>
                        Aktifkan kamera untuk memulai deteksi. Model dimuat sekali,
                        lalu berjalan langsung di browser.
                      </Text>
                    </>
                  )}
                </Box>
              )}

              {running && (
                <Group gap="xs" style={{ position: "absolute", top: 12, left: 12 }}>
                  <Badge color="dark" variant="filled" leftSection={<IconActivity size={12} />}>
                    {fps} FPS
                  </Badge>
                  <Badge color="sawit" variant="filled">
                    Tupai: {count.tupai}
                  </Badge>
                  <Badge color="blue" variant="filled">
                    Lainnya: {count.objek}
                  </Badge>
                </Group>
              )}
            </Box>

            {error && (
              <Alert
                mt="md"
                color="red"
                variant="light"
                icon={<IconAlertTriangle size={18} />}
                title="Kamera bermasalah"
              >
                {error}
              </Alert>
            )}

            <Group mt="md" gap="sm">
              {!running ? (
                <Button
                  leftSection={busy ? <Loader size={16} color="white" /> : <IconPlayerPlay size={18} />}
                  color="sawit"
                  onClick={start}
                  disabled={busy}
                >
                  {busy ? "Memuat model…" : "Aktifkan kamera"}
                </Button>
              ) : (
                <Button
                  leftSection={<IconCameraOff size={18} />}
                  variant="light"
                  color="red"
                  onClick={stop}
                >
                  Matikan kamera
                </Button>
              )}
              <Switch
                checked={mirror}
                onChange={(e) => setMirror(e.currentTarget.checked)}
                label="Cermin"
                color="sawit"
              />
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md">
            <Card padding="lg">
              <Text fw={620} c="#1f2a26" mb="xs">
                Pengaturan deteksi
              </Text>
              <Text fz="xs" c="dimmed" mb="sm">
                Ambang keyakinan minimum: <b>{conf}%</b>
              </Text>
              <Slider
                value={conf}
                onChange={setConf}
                min={20}
                max={90}
                step={5}
                color="sawit"
                marks={[
                  { value: 20, label: "20" },
                  { value: 55, label: "55" },
                  { value: 90, label: "90" },
                ]}
              />
              <Divider my="md" color="#eef2ef" />
              <Stack gap="sm">
                <MetaRow label="Deteksi (kotak)" value="COCO-SSD" />
                <MetaRow label="Spesies (label)" value="MobileNet · ImageNet" />
                <MetaRow label="Runtime" value="TensorFlow.js (WebGL)" />
                <MetaRow label="Pemrosesan" value="Di perangkat (edge)" />
                <MetaRow
                  label="Status"
                  value={
                    <Badge variant="light" color={running ? "sawit" : "gray"}>
                      {running ? "Berjalan" : busy ? "Memuat" : "Siaga"}
                    </Badge>
                  }
                />
              </Stack>
            </Card>

            <Card padding="lg">
              <Group justify="space-between" mb={2}>
                <Text fw={620} c="#1f2a26">
                  Log famili tupai
                </Text>
                {running && (
                  <Box w={8} h={8} style={{ background: "#499b57", borderRadius: "50%" }} />
                )}
              </Group>
              <Text fz="xs" c="dimmed" mb="sm">
                Deteksi Sciuridae terbaru (maks. 12)
              </Text>
              <ScrollArea h={196}>
                {log.length === 0 ? (
                  <Text fz="sm" c="dimmed" ta="center" py="xl">
                    Belum ada deteksi famili tupai.
                  </Text>
                ) : (
                  <Stack gap={0}>
                    {log.map((l, i) => (
                      <Box key={i}>
                        {i > 0 && <Divider color="#f0f3f0" />}
                        <Group justify="space-between" py={8} wrap="nowrap">
                          <Group gap="xs" wrap="nowrap">
                            <Text className="tabnums" fz="xs" c="dimmed">
                              {l.t}
                            </Text>
                            <Text fz="sm" fw={550} c="#1f2a26" tt="capitalize">
                              {l.name}
                            </Text>
                          </Group>
                          <Text className="tabnums" fz="sm" fw={600} c="#2f773d">
                            {(l.score * 100).toFixed(0)}%
                          </Text>
                        </Group>
                      </Box>
                    ))}
                  </Stack>
                )}
              </ScrollArea>
            </Card>

            <Alert color="sawit" variant="light" icon={<IconShieldLock size={18} />}>
              <Text fz="xs" c="#3d4d45">
                Citra kamera diproses sepenuhnya di perangkatmu dan tidak pernah
                dikirim ke server — selaras dengan pendekatan <i>edge processing</i>{" "}
                pada proposal.
              </Text>
            </Alert>
          </Stack>
        </Grid.Col>
      </Grid>

      <Card padding="md" mt="md" style={{ background: "#fffaf3", borderColor: "#f0e2cc" }}>
        <Text fz="xs" c="#5a4f3d" lh={1.5}>
          <b>Cara membaca:</b> kotak digambar oleh COCO-SSD (lokasi objek), sedangkan
          label spesies diisi oleh MobileNet yang dilatih pada ImageNet (1000 kelas,
          termasuk <i>fox squirrel</i> &amp; <i>marmot</i> dari famili Sciuridae).
          Objek yang dikenali sebagai famili tupai ditandai hijau; spesies lain biru.
          Untuk deteksi tupai lokal yang lebih presisi, model dilatih khusus pada
          dataset lapangan seperti dijelaskan di proposal.
        </Text>
      </Card>
    </>
  );
}
