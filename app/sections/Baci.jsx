import {
  Card,
  Grid,
  Group,
  Text,
  Stack,
  Badge,
  Box,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import { BarChart } from "@mantine/charts";
import { IconArrowDownRight, IconEqual, IconMath } from "@tabler/icons-react";

import { SectionTitle } from "../components/ui.jsx";
import { BACI } from "../data.js";

export default function Baci() {
  return (
    <>
      <SectionTitle
        title="Evaluasi BACI"
        subtitle="Before–After–Control–Impact: efek sistem dihitung dari selisih perubahan plot perlakuan terhadap plot kontrol."
      />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card padding="lg">
            <Text fw={620} c="#1f2a26">
              Persentase buah tergerek
            </Text>
            <Text fz="xs" c="dimmed" mb="md">
              Perlakuan vs Kontrol — periode Before &amp; After
            </Text>
            <BarChart
              h={260}
              data={BACI.buahTergerek}
              dataKey="periode"
              series={[
                { name: "Perlakuan", color: "sawit.6" },
                { name: "Kontrol", color: "gray.4" },
              ]}
              gridAxis="y"
              yAxisProps={{ width: 32 }}
              barProps={{ radius: [4, 4, 0, 0] }}
              valueFormatter={(v) => `${v}%`}
            />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card padding="lg">
            <Text fw={620} c="#1f2a26">
              Indeks aktivitas tupai
            </Text>
            <Text fz="xs" c="dimmed" mb="md">
              Deteksi rata-rata per kamera per hari
            </Text>
            <BarChart
              h={260}
              data={BACI.aktivitas}
              dataKey="periode"
              series={[
                { name: "Perlakuan", color: "sawit.6" },
                { name: "Kontrol", color: "gray.4" },
              ]}
              gridAxis="y"
              yAxisProps={{ width: 32 }}
              barProps={{ radius: [4, 4, 0, 0] }}
            />
          </Card>
        </Grid.Col>
      </Grid>

      <Grid gutter="md" mt="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <EffectCard
            title="Efek pada buah tergerek"
            data={BACI.efek.tergerek}
            unit="poin %"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <EffectCard
            title="Efek pada aktivitas tupai"
            data={BACI.efek.aktivitas}
            unit="/kamera·hari"
          />
        </Grid.Col>
      </Grid>

      <Card padding="lg" mt="md" style={{ background: "#f1f6f2", borderColor: "#dcebde" }}>
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <ThemeIcon size={38} radius="md" variant="white" color="sawit">
            <IconMath size={20} stroke={1.7} />
          </ThemeIcon>
          <Box>
            <Text fw={620} c="#1f2a26">
              Interpretasi
            </Text>
            <Text fz="sm" c="#3d4d45" mt={4} lh={1.5}>
              Penurunan pada plot perlakuan jauh melampaui plot kontrol pada kedua indikator.
              Karena plot kontrol mengikuti fluktuasi musim &amp; siklus pembuahan yang sama,
              selisih perubahan ini menunjukkan efek intervensi terarah — bukan sekadar variasi alami.
              Hasil signifikan secara statistik (p &lt; 0.05) mendukung hipotesis H1.
            </Text>
          </Box>
        </Group>
      </Card>
    </>
  );
}

function EffectCard({ title, data, unit }) {
  return (
    <Card padding="lg">
      <Text fw={620} c="#1f2a26" mb="md">
        {title}
      </Text>
      <Group grow gap="md" align="stretch">
        <Term label="Δ Perlakuan" value={data.perlakuan} />
        <Op icon={IconEqual} sub="dikurangi" rotate />
        <Term label="Δ Kontrol" value={data.kontrol} />
      </Group>
      <Divider my="md" color="#eef2ef" />
      <Group justify="space-between" align="center">
        <Box>
          <Text fz="xs" c="dimmed" fw={600} tt="uppercase">
            Efek bersih sistem
          </Text>
          <Group gap={6} align="baseline" mt={2}>
            <IconArrowDownRight size={20} color="#3c8a4c" stroke={2.2} />
            <Text className="tabnums" fz={26} fw={680} c="#2f773d">
              {data.efek}
            </Text>
            <Text fz="sm" c="dimmed">
              {unit}
            </Text>
          </Group>
        </Box>
        <Badge size="lg" variant="light" color="sawit">
          p = {data.p}
        </Badge>
      </Group>
    </Card>
  );
}

function Term({ label, value }) {
  return (
    <Box ta="center" py="xs" style={{ background: "#fafbfa", borderRadius: 10, border: "1px solid #eef2ef" }}>
      <Text fz="xs" c="dimmed" fw={550}>
        {label}
      </Text>
      <Text className="tabnums" fz={22} fw={650} c="#1f2a26" mt={2}>
        {value}
      </Text>
    </Box>
  );
}

function Op() {
  return (
    <Box
      style={{ flex: "0 0 26px", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Text fz={24} c="dimmed" fw={400}>
        −
      </Text>
    </Box>
  );
}
