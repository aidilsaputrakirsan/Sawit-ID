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
import "@tensorflow/tfjs";

import { SectionTitle, MetaRow } from "../components/ui.jsx";

/* Kelas COCO yang di-remap menjadi "tupai" (simulasi).
   Objek hewan/berbulu paling masuk akal untuk demo deteksi tupai. */
const KELAS_TUPAI = new Set([
  "cat",
  "dog",
  "bird",
  "bear",
  "teddy bear",
  "sheep",
  "horse",
  "cow",
]);

const WARNA_TUPAI = "#499b57";
const WARNA_OBJEK = "#3b82c4";

export default function LiveDetection() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
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

  // jaga ref selaras dengan state agar loop deteksi membaca nilai terbaru
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
    setPhase(modelRef.current ? "ready" : "idle");
    setFps(0);
    setCount({ tupai: 0, objek: 0 });
  }, []);

  // bersihkan saat komponen dilepas
  useEffect(() => () => stop(), [stop]);

  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const model = modelRef.current;
    if (!video || !canvas || !model || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext("2d");

    model.detect(video).then((preds) => {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      if (mirrorRef.current) {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }

      let nT = 0;
      let nO = 0;
      const hits = [];

      preds.forEach((p) => {
        if (p.score < confRef.current) return;
        const isTupai = KELAS_TUPAI.has(p.class);
        const color = isTupai ? WARNA_TUPAI : WARNA_OBJEK;
        const label = isTupai
          ? "Tupai (simulasi)"
          : p.class;
        if (isTupai) nT++;
        else nO++;
        hits.push({ label, score: p.score, isTupai, klas: p.class });

        const [x, y, bw, bh] = p.bbox;
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, bw, bh);

        // label chip (gambar tanpa cermin agar teks terbaca)
        ctx.save();
        if (mirrorRef.current) {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        const tx = mirrorRef.current ? w - x - bw : x;
        const txt = `${label} ${(p.score * 100).toFixed(0)}%`;
        ctx.font = "600 15px Inter, sans-serif";
        const tw = ctx.measureText(txt).width + 14;
        ctx.fillStyle = color;
        ctx.fillRect(tx, Math.max(0, y - 22), tw, 22);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(txt, tx + 7, Math.max(13, y - 6));
        ctx.restore();
      });
      ctx.restore();

      setCount({ tupai: nT, objek: nO });

      // log: catat deteksi tupai (throttle ringan via state append unik)
      if (hits.some((x) => x.isTupai)) {
        const top = hits
          .filter((x) => x.isTupai)
          .sort((a, b) => b.score - a.score)[0];
        const stamp = new Date().toLocaleTimeString("id-ID", { hour12: false });
        setLog((prev) => {
          if (prev[0] && prev[0].score === top.score && prev[0].t === stamp)
            return prev;
          return [
            { t: stamp, klas: top.klas, score: top.score },
            ...prev,
          ].slice(0, 12);
        });
      }

      // FPS
      const f = fpsRef.current;
      f.frames++;
      const now = performance.now();
      if (now - f.last >= 1000) {
        setFps(f.frames);
        f.frames = 0;
        f.last = now;
      }

      rafRef.current = requestAnimationFrame(detectLoop);
    });
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      // 1. muat model bila belum
      if (!modelRef.current) {
        setPhase("loadingModel");
        modelRef.current = await cocoSsd.load({ base: "lite_mobilenet_v2" });
      }
      // 2. minta kamera
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
      setPhase(modelRef.current ? "ready" : "error");
    }
  }, [detectLoop]);

  const running = phase === "running";
  const busy = phase === "loadingModel";

  return (
    <>
      <SectionTitle
        title="Uji Deteksi (Live)"
        subtitle="Simulasi deteksi tupai real-time dari kamera. Inferensi berjalan di perangkat (edge) — citra tidak dikirim ke server."
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

              {/* overlay status saat belum berjalan */}
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
                        Memuat model deteksi (COCO-SSD)…
                      </Text>
                    </>
                  ) : (
                    <>
                      <ThemeIcon size={54} radius="xl" variant="light" color="sawit">
                        <IconCamera size={28} stroke={1.6} />
                      </ThemeIcon>
                      <Text fz="sm" c="#cdd8d0" maw={320}>
                        Aktifkan kamera untuk memulai simulasi deteksi.
                        Model dimuat sekali, lalu berjalan langsung di browser.
                      </Text>
                    </>
                  )}
                </Box>
              )}

              {/* HUD kecil saat berjalan */}
              {running && (
                <Group
                  gap="xs"
                  style={{ position: "absolute", top: 12, left: 12 }}
                >
                  <Badge color="dark" variant="filled" leftSection={<IconActivity size={12} />}>
                    {fps} FPS
                  </Badge>
                  <Badge color="sawit" variant="filled">
                    Tupai: {count.tupai}
                  </Badge>
                  <Badge color="blue" variant="filled">
                    Objek: {count.objek}
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
                <MetaRow label="Model" value="COCO-SSD · lite MobileNet v2" />
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
                  Log deteksi tupai
                </Text>
                {running && (
                  <Box w={8} h={8} style={{ background: "#499b57", borderRadius: "50%" }} />
                )}
              </Group>
              <Text fz="xs" c="dimmed" mb="sm">
                Deteksi terbaru (maks. 12)
              </Text>
              <ScrollArea h={196}>
                {log.length === 0 ? (
                  <Text fz="sm" c="dimmed" ta="center" py="xl">
                    Belum ada deteksi.
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
                            <Badge size="sm" variant="light" color="sawit">
                              Tupai (simulasi)
                            </Badge>
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

            <Alert
              color="sawit"
              variant="light"
              icon={<IconShieldLock size={18} />}
            >
              <Text fz="xs" c="#3d4d45">
                Citra kamera diproses sepenuhnya di perangkatmu dan tidak
                pernah dikirim ke server — selaras dengan pendekatan
                <i> edge processing</i> pada proposal.
              </Text>
            </Alert>
          </Stack>
        </Grid.Col>
      </Grid>

      <Card
        padding="md"
        mt="md"
        style={{ background: "#fffaf3", borderColor: "#f0e2cc" }}
      >
        <Text fz="xs" c="#5a4f3d" lh={1.5}>
          <b>Catatan simulasi:</b> demo ini memakai model objek umum (COCO-SSD).
          Kelas hewan/berbulu yang terdeteksi ditandai sebagai
          "Tupai (simulasi)" untuk meniru perilaku pipeline RT-DETR/YOLO pada
          sistem sebenarnya. Untuk deteksi tupai asli, model dilatih khusus pada
          dataset gerekan buah &amp; tupai lapangan seperti dijelaskan di proposal.
        </Text>
      </Card>
    </>
  );
}
