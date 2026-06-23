import {
  Card,
  Grid,
  Group,
  Text,
  Badge,
  Box,
  ThemeIcon,
  SimpleGrid,
  List,
} from "@mantine/core";
import {
  IconBarrierBlock,
  IconScissors,
  IconGridDots,
  IconPlant2,
  IconCircleCheck,
  IconClock,
  IconBolt,
} from "@tabler/icons-react";

import { SectionTitle } from "../components/ui.jsx";
import { INTERVENSI } from "../data.js";

const META = {
  "Penghalang batang (banding)": {
    icon: IconBarrierBlock,
    desc: "Pelat licin/seng pada batang mencegah tupai memanjat ke tajuk.",
  },
  "Pemutusan tajuk (pruning)": {
    icon: IconScissors,
    desc: "Memberi jarak antar tajuk agar tupai sulit berpindah dengan melompat.",
  },
  "Perangkap hidup terarah": {
    icon: IconGridDots,
    desc: "Dipasang pada pohon/blok hotspot, bukan merata di seluruh kebun.",
  },
  "Pengelolaan habitat perimeter": {
    icon: IconPlant2,
    desc: "Mengurangi koridor tupai dari vegetasi liar di tepi hutan.",
  },
};

const STATUS = {
  Terpasang: { color: "sawit", icon: IconCircleCheck },
  Aktif: { color: "blue", icon: IconBolt },
  Direncanakan: { color: "gray", icon: IconClock },
};

export default function Intervention() {
  const totalUnit = INTERVENSI.reduce((a, b) => a + b.unit, 0);

  return (
    <>
      <SectionTitle
        title="Intervensi Non-Kimiawi Terarah"
        subtitle="Penempatan presisi pada pohon/blok hotspot — pendekatan utama yang membedakan sistem ini dari pengendalian merata."
        right={
          <Badge size="lg" variant="light" color="sawit">
            {totalUnit} unit terpasang
          </Badge>
        }
      />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {INTERVENSI.map((it) => {
          const meta = META[it.jenis] ?? {};
          const st = STATUS[it.status] ?? STATUS.Direncanakan;
          const Icon = meta.icon ?? IconBarrierBlock;
          const StIcon = st.icon;
          return (
            <Card key={it.jenis} padding="lg">
              <Group justify="space-between" align="flex-start" wrap="nowrap" mb="sm">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon size={42} radius="md" variant="light" color="sawit">
                    <Icon size={22} stroke={1.7} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={620} c="#1f2a26" lh={1.2}>
                      {it.jenis}
                    </Text>
                    <Text fz="xs" c="dimmed" mt={2}>
                      {it.unit} unit · {it.lokasi}
                    </Text>
                  </Box>
                </Group>
                <Badge
                  variant="light"
                  color={st.color}
                  leftSection={<StIcon size={12} />}
                >
                  {it.status}
                </Badge>
              </Group>
              <Text fz="sm" c="#3d4d45" lh={1.5}>
                {meta.desc}
              </Text>
              <Box
                mt="md"
                p="xs"
                style={{ background: "#f7faf7", borderRadius: 8, border: "1px solid #eef2ef" }}
              >
                <Group gap={6} wrap="nowrap">
                  <Text fz="xs" c="dimmed" fw={600}>
                    Indikator antara:
                  </Text>
                  <Text fz="xs" fw={550} c="#2f773d">
                    {it.efek}
                  </Text>
                </Group>
              </Box>
            </Card>
          );
        })}
      </SimpleGrid>

      <Grid gutter="md" mt="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card padding="lg" style={{ background: "#fffaf3", borderColor: "#f0e2cc" }}>
            <Text fw={620} c="#1f2a26" mb={4}>
              Catatan metodologis
            </Text>
            <Text fz="sm" c="#5a4f3d" lh={1.5}>
              Efektivitas tiap metode non-kimiawi untuk tupai belum baku dalam literatur sawit.
              Pada sistem ini metode-metode diposisikan sebagai sesuatu yang <b>diuji</b>, bukan
              sudah terbukti. Karena itu indikator antara (aktivitas tupai) dipantau berdampingan
              dengan luaran akhir (% buah tergerek) melalui desain BACI.
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card padding="lg">
            <Text fw={620} c="#1f2a26" mb="sm">
              Prinsip penempatan
            </Text>
            <List
              spacing="sm"
              size="sm"
              center
              icon={
                <ThemeIcon size={20} radius="xl" variant="light" color="sawit">
                  <IconCircleCheck size={13} />
                </ThemeIcon>
              }
            >
              <List.Item>Hanya pada pohon Gi* signifikan (p &lt; 0.05)</List.Item>
              <List.Item>Diprioritaskan dekat tepi hutan</List.Item>
              <List.Item>Kombinasi metode per tingkat tekanan</List.Item>
              <List.Item>Dievaluasi ulang tiap siklus monitoring</List.Item>
            </List>
          </Card>
        </Grid.Col>
      </Grid>
    </>
  );
}
