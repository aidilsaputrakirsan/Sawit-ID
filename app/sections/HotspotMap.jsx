import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  Grid,
  Group,
  Text,
  Stack,
  Badge,
  Box,
  Divider,
  Switch,
  Tooltip as MTooltip,
} from "@mantine/core";
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Marker,
  Tooltip,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";

import { SectionTitle, MetaRow } from "../components/ui.jsx";
import {
  BOUNDARY,
  POHON,
  KAMERA,
  PRIORITAS,
  STAT,
  giColor,
  toLatLng,
  GEO_CENTER,
} from "../data.js";

/* ikon kamera berbentuk kotak (divIcon → tanpa aset gambar) */
const camIcon = (color) =>
  L.divIcon({
    className: "cam-marker",
    html: `<div style="width:14px;height:14px;border:2.5px solid ${color};background:#fff;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

/* layer panas (leaflet.heat) — dikelola manual via useMap */
function HeatLayer({ points, show }) {
  const map = useMap();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      map.removeLayer(ref.current);
      ref.current = null;
    }
    if (!show) return undefined;
    ref.current = L.heatLayer(points, {
      radius: 34,
      blur: 24,
      minOpacity: 0.25,
      max: 1.0,
      gradient: {
        0.2: "#7fb583",
        0.4: "#a9c46b",
        0.6: "#e6b94e",
        0.8: "#e08a3c",
        1.0: "#d35a3c",
      },
    }).addTo(map);
    return () => {
      if (ref.current) {
        map.removeLayer(ref.current);
        ref.current = null;
      }
    };
  }, [map, points, show]);
  return null;
}

export default function HotspotMap() {
  const [showHeat, setShowHeat] = useState(true);
  const [showPohon, setShowPohon] = useState(true);

  const boundaryLL = useMemo(() => BOUNDARY.map(toLatLng), []);
  const pohonLL = useMemo(
    () => POHON.map((p) => ({ ...p, ll: toLatLng([p.x, p.y]) })),
    []
  );
  const kameraLL = useMemo(
    () => KAMERA.map((k) => ({ ...k, ll: toLatLng([k.x, k.y]) })),
    []
  );
  // titik panas: pohon sebagai sumber, intensitas = skor Gi*
  const heatPoints = useMemo(
    () => pohonLL.map((p) => [p.ll[0], p.ll[1], Math.max(0.05, p.gi)]),
    [pohonLL]
  );

  return (
    <>
      <SectionTitle
        title="Peta Hotspot Spasial"
        subtitle="Peta interaktif (Leaflet/OpenStreetMap) dengan layer kepadatan aktivitas tupai untuk mengarahkan intervensi pada blok prioritas, bukan merata."
      />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card padding="lg">
            <Group justify="space-between" mb="sm" wrap="nowrap">
              <Box>
                <Text fw={620} c="#1f2a26">
                  Kebun Rakyat Mitra — Blok Tanjung
                </Text>
                <Text fz="xs" c="dimmed">
                  Kepadatan Getis-Ord Gi* dilapis di atas peta dasar
                </Text>
              </Box>
              <Group gap="md" wrap="nowrap">
                <Switch
                  size="xs"
                  checked={showHeat}
                  onChange={(e) => setShowHeat(e.currentTarget.checked)}
                  label="Heatmap"
                  color="sawit"
                />
                <Switch
                  size="xs"
                  checked={showPohon}
                  onChange={(e) => setShowPohon(e.currentTarget.checked)}
                  label="Pohon"
                  color="sawit"
                />
              </Group>
            </Group>

            <Box
              style={{
                height: 440,
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #eef2ef",
              }}
            >
              <MapContainer
                bounds={boundaryLL}
                boundsOptions={{ padding: [24, 24] }}
                center={GEO_CENTER}
                zoom={17}
                scrollWheelZoom
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />

                {/* batas kebun */}
                <Polygon
                  positions={boundaryLL}
                  pathOptions={{
                    color: "#499b57",
                    weight: 2,
                    fillColor: "#6cae77",
                    fillOpacity: 0.08,
                  }}
                />

                <HeatLayer points={heatPoints} show={showHeat} />

                {/* pohon contoh */}
                {showPohon &&
                  pohonLL.map((p) => (
                    <CircleMarker
                      key={p.id}
                      center={p.ll}
                      radius={4 + p.gi * 5}
                      pathOptions={{
                        color: "#ffffff",
                        weight: 1,
                        fillColor: giColor(p.gi),
                        fillOpacity: 0.9,
                      }}
                    >
                      <Tooltip direction="top" offset={[0, -4]}>
                        <b>{p.id}</b> · Gi* {p.gi.toFixed(2)}
                      </Tooltip>
                    </CircleMarker>
                  ))}

                {/* kamera */}
                {kameraLL.map((k) => (
                  <Marker key={k.id} position={k.ll} icon={camIcon(STAT[k.status])}>
                    <Popup>
                      <b>{k.id}</b>
                      <br />
                      Kamera {k.jenis} · Blok {k.blok}
                      <br />
                      Status: {k.status}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Box>

            <Group justify="space-between" mt="sm">
              <GiLegend />
              <Group gap="md">
                <LegendDot color={STAT.online} label="Kamera online" square />
                <LegendDot color={STAT.warning} label="Perhatian" square />
                <LegendDot color={STAT.offline} label="Terputus" square />
              </Group>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md">
            <Card padding="lg">
              <Text fw={620} c="#1f2a26">
                Analisis spasial
              </Text>
              <Text fz="xs" c="dimmed" mb="md">
                Ringkasan hotspot signifikan
              </Text>
              <Stack gap="sm">
                <MetaRow label="Metode" value="Getis-Ord Gi*" />
                <MetaRow label="Pendukung" value="Kernel Density" />
                <MetaRow label="Peta dasar" value="OpenStreetMap" />
                <MetaRow label="Pohon dianalisis" value={POHON.length} />
                <MetaRow
                  label="Hotspot signifikan"
                  value={<Badge color="red" variant="light">{PRIORITAS.length} pohon</Badge>}
                />
                <MetaRow label="Ambang" value="p < 0.05" />
              </Stack>
            </Card>

            <Card padding="lg">
              <Text fw={620} c="#1f2a26" mb={2}>
                Pohon prioritas
              </Text>
              <Text fz="xs" c="dimmed" mb="sm">
                Diurutkan menurut skor Gi*
              </Text>
              <Stack gap={0}>
                {PRIORITAS.map((p, i) => (
                  <Box key={p.pohon}>
                    {i > 0 && <Divider color="#f0f3f0" />}
                    <Group justify="space-between" py="xs" wrap="nowrap">
                      <Box>
                        <Group gap={6}>
                          <Text fz="sm" fw={600} c="#1f2a26">
                            {p.pohon}
                          </Text>
                          <Badge size="xs" variant="light" color="gray">
                            Blok {p.blok}
                          </Badge>
                        </Group>
                        <Text fz="xs" c="dimmed" mt={2}>
                          {p.intervensi}
                        </Text>
                      </Box>
                      <Box ta="right">
                        <Text className="tabnums" fz="sm" fw={600} c="#c44a2e">
                          {p.gi.toFixed(2)}
                        </Text>
                        <Text fz={11} c="dimmed">
                          p={p.p}
                        </Text>
                      </Box>
                    </Group>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}

function LegendDot({ color, label, square }) {
  return (
    <Group gap={6} wrap="nowrap">
      <Box
        w={10}
        h={10}
        style={{
          background: square ? "#fff" : color,
          border: square ? `2px solid ${color}` : "none",
          borderRadius: square ? 3 : "50%",
        }}
      />
      <Text fz="xs" c="dimmed">
        {label}
      </Text>
    </Group>
  );
}

function GiLegend() {
  const stops = [
    { c: "#7fb583", l: "Rendah" },
    { c: "#a9c46b", l: "" },
    { c: "#e6b94e", l: "Sedang" },
    { c: "#e08a3c", l: "" },
    { c: "#d35a3c", l: "Tinggi" },
  ];
  return (
    <Group gap={8} wrap="nowrap">
      <Text fz="xs" c="dimmed">
        Intensitas Gi*
      </Text>
      <Group gap={0}>
        {stops.map((s, i) => (
          <MTooltip key={i} label={s.l || "—"} disabled={!s.l} withArrow>
            <Box w={20} h={10} style={{ background: s.c }} />
          </MTooltip>
        ))}
      </Group>
    </Group>
  );
}
