import { useState } from "react";
import {
  Card,
  Grid,
  Group,
  Text,
  Stack,
  Badge,
  Box,
  Divider,
  Tooltip,
} from "@mantine/core";

import { SectionTitle, MetaRow } from "../components/ui.jsx";
import {
  BOUNDARY,
  HUTAN,
  POHON,
  KAMERA,
  PRIORITAS,
  STAT,
  giColor,
} from "../data.js";

const poly = (pts) => pts.map((p) => p.join(",")).join(" ");

export default function HotspotMap() {
  const [hover, setHover] = useState(null);

  return (
    <>
      <SectionTitle
        title="Peta Hotspot Spasial"
        subtitle="Kepadatan aktivitas tupai per pohon (Getis-Ord Gi*) untuk mengarahkan intervensi pada blok prioritas, bukan merata."
      />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card padding="lg">
            <Group justify="space-between" mb="sm">
              <Box>
                <Text fw={620} c="#1f2a26">
                  Sebaran kebun — Blok Tanjung
                </Text>
                <Text fz="xs" c="dimmed">
                  Tepi hutan di sisi utara menjadi sumber tekanan tupai tertinggi
                </Text>
              </Box>
              <Group gap="md">
                <LegendDot color={STAT.online} label="Kamera online" />
                <LegendDot color={STAT.warning} label="Perlu perhatian" />
                <LegendDot color={STAT.offline} label="Terputus" />
              </Group>
            </Group>

            <Box
              style={{
                background: "#fbfcfb",
                border: "1px solid #eef2ef",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <svg viewBox="0 0 820 560" style={{ width: "100%", display: "block" }}>
                {/* zona hutan */}
                <polygon points={poly(HUTAN)} fill="#e8f0e4" />
                <text x={400} y={28} textAnchor="middle" fontSize="13" fill="#6f8a72" fontWeight="600">
                  TEPI HUTAN — SUMBER TUPAI
                </text>

                {/* batas kebun */}
                <polygon
                  points={poly(BOUNDARY)}
                  fill="#f3f8f2"
                  stroke="#cfe0d0"
                  strokeWidth="2"
                />

                {/* pohon contoh: warna = intensitas hotspot Gi* */}
                {POHON.map((p) => {
                  const r = 8 + p.gi * 7;
                  return (
                    <g key={p.id}>
                      {p.gi >= 0.55 && (
                        <circle cx={p.x} cy={p.y} r={r + 12} fill={giColor(p.gi)} opacity={0.16} />
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r}
                        fill={giColor(p.gi)}
                        opacity={0.85}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        onMouseEnter={() => setHover({ ...p, kind: "pohon" })}
                        onMouseLeave={() => setHover(null)}
                        style={{ cursor: "pointer" }}
                      />
                    </g>
                  );
                })}

                {/* kamera */}
                {KAMERA.map((k) => (
                  <g
                    key={k.id}
                    onMouseEnter={() => setHover({ ...k, kind: "kamera" })}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={k.x - 8}
                      y={k.y - 8}
                      width={16}
                      height={16}
                      rx={4}
                      fill="#ffffff"
                      stroke={STAT[k.status]}
                      strokeWidth="2.5"
                    />
                    <circle cx={k.x} cy={k.y} r={3} fill={STAT[k.status]} />
                  </g>
                ))}
              </svg>
            </Box>

            <Group justify="space-between" mt="sm">
              <Group gap="lg">
                <GiLegend />
              </Group>
              {hover && (
                <Badge variant="light" color="gray" size="lg">
                  {hover.kind === "pohon"
                    ? `${hover.id} · Gi* ${hover.gi}`
                    : `${hover.id} · ${hover.jenis} · ${hover.status}`}
                </Badge>
              )}
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

function LegendDot({ color, label }) {
  return (
    <Group gap={6} wrap="nowrap">
      <Box w={10} h={10} style={{ background: color, borderRadius: 3 }} />
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
          <Tooltip key={i} label={s.l || "—"} disabled={!s.l} withArrow>
            <Box w={20} h={10} style={{ background: s.c }} />
          </Tooltip>
        ))}
      </Group>
    </Group>
  );
}
