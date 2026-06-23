import {
  SimpleGrid,
  Card,
  Group,
  Text,
  Stack,
  Badge,
  Box,
  Divider,
  Progress,
} from "@mantine/core";
import { AreaChart, BarChart } from "@mantine/charts";
import {
  IconBug,
  IconActivity,
  IconScan,
  IconMapPin,
} from "@tabler/icons-react";

import { SectionTitle, StatCard, MetaRow } from "../components/ui.jsx";
import { KPI, HARIAN, PER_JAM, SITE, FASE } from "../data.js";

const faseColor = {
  Selesai: "sawit",
  Berjalan: "blue",
  Menunggu: "gray",
};

export default function Overview() {
  return (
    <>
      <SectionTitle
        title="Ringkasan Sistem"
        subtitle="Pemantauan deteksi tupai, kerusakan buah, dan efektivitas intervensi terarah sepanjang siklus pembuahan."
      />

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
        <StatCard
          icon={IconBug}
          label="Buah tergerek"
          value={KPI.buahTergerek.nilai}
          unit="%"
          delta={KPI.buahTergerek.deltaPct}
          deltaGood={true}
        />
        <StatCard
          icon={IconActivity}
          label="Indeks aktivitas tupai"
          value={KPI.aktivitasTupai.nilai}
          unit={KPI.aktivitasTupai.satuan}
          delta={KPI.aktivitasTupai.deltaPct}
          deltaGood={true}
        />
        <StatCard
          icon={IconScan}
          label="Akurasi model deteksi"
          value={KPI.akurasiModel.nilai}
          unit={KPI.akurasiModel.satuan}
          delta={KPI.akurasiModel.deltaPct}
          deltaGood={true}
        />
        <StatCard
          icon={IconMapPin}
          label="Pohon prioritas (hotspot)"
          value={KPI.hotspotAktif.nilai}
          unit="pohon"
          delta={KPI.hotspotAktif.deltaPct}
          deltaGood={true}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mt="md">
        <Card padding="lg" style={{ gridColumn: "span 2" }}>
          <Group justify="space-between" mb="md">
            <Box>
              <Text fw={620} c="#1f2a26">
                Tren 14 hari
              </Text>
              <Text fz="xs" c="dimmed">
                Deteksi tupai harian vs. persentase buah tergerek
              </Text>
            </Box>
            <Group gap="lg">
              <LegendDot color="#499b57" label="Deteksi/hari" />
              <LegendDot color="#d35a3c" label="% tergerek" />
            </Group>
          </Group>
          <AreaChart
            h={240}
            data={HARIAN}
            dataKey="hari"
            withDots={false}
            curveType="monotone"
            gridAxis="y"
            withRightYAxis
            rightYAxisProps={{ width: 30 }}
            yAxisProps={{ width: 28 }}
            series={[
              { name: "deteksi", label: "Deteksi/hari", color: "#499b57" },
              {
                name: "tergerek",
                label: "% tergerek",
                color: "#d35a3c",
                yAxisId: "right",
              },
            ]}
            withLegend={false}
          />
        </Card>

        <Card padding="lg">
          <Text fw={620} c="#1f2a26">
            Lokasi studi
          </Text>
          <Text fz="xs" c="dimmed" mb="md">
            Konfigurasi pemantauan saat ini
          </Text>
          <Stack gap="sm">
            <MetaRow label="Kebun" value={SITE.nama.split("—")[1]?.trim() || SITE.nama} />
            <MetaRow label="Luas blok" value={`${SITE.luasHa} ha`} />
            <MetaRow label="Pohon contoh" value={SITE.pohonContoh} />
            <MetaRow label="Kamera tajuk" value={SITE.kameraTajuk} />
            <MetaRow label="Kamera batang" value={SITE.kameraBatang} />
            <Divider color="#eef2ef" />
            <MetaRow label="Desain" value="BACI (Impact vs Control)" />
            <MetaRow label="Status" value={<Badge variant="light" color="blue">{SITE.periode}</Badge>} />
          </Stack>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" mt="md">
        <Card padding="lg" style={{ gridColumn: "span 2" }}>
          <Text fw={620} c="#1f2a26">
            Aktivitas per jam
          </Text>
          <Text fz="xs" c="dimmed" mb="md">
            Tupai aktif siang hari — puncak pagi (07–09) dan sore (16–17)
          </Text>
          <BarChart
            h={220}
            data={PER_JAM}
            dataKey="jam"
            series={[{ name: "deteksi", label: "Deteksi", color: "sawit.5" }]}
            gridAxis="y"
            yAxisProps={{ width: 28 }}
            barProps={{ radius: [4, 4, 0, 0] }}
            withLegend={false}
          />
        </Card>

        <Card padding="lg">
          <Text fw={620} c="#1f2a26" mb="xs">
            Progres tahapan
          </Text>
          <Stack gap="md" mt="xs">
            {FASE.map((f) => (
              <Box key={f.fase}>
                <Group justify="space-between" mb={4} wrap="nowrap">
                  <Text fz="sm" fw={550} c="#1f2a26">
                    {f.fase}
                  </Text>
                  <Badge size="xs" variant="light" color={faseColor[f.status]}>
                    {f.status}
                  </Badge>
                </Group>
                <Text fz="xs" c="dimmed" lh={1.3}>
                  {f.aktivitas}
                </Text>
              </Box>
            ))}
            <Divider color="#eef2ef" />
            <Box>
              <Group justify="space-between" mb={6}>
                <Text fz="xs" c="dimmed">
                  Penyelesaian program
                </Text>
                <Text fz="xs" fw={600} c="#2f773d">
                  70%
                </Text>
              </Group>
              <Progress value={70} color="sawit" size="sm" radius="xl" />
            </Box>
          </Stack>
        </Card>
      </SimpleGrid>
    </>
  );
}

function LegendDot({ color, label }) {
  return (
    <Group gap={6} wrap="nowrap">
      <Box w={9} h={9} style={{ background: color, borderRadius: 3 }} />
      <Text fz="xs" c="dimmed">
        {label}
      </Text>
    </Group>
  );
}
