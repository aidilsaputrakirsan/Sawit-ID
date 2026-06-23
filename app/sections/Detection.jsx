import {
  Card,
  Grid,
  Group,
  Text,
  Stack,
  Badge,
  Box,
  Table,
  Progress,
  RingProgress,
  SimpleGrid,
} from "@mantine/core";

import { SectionTitle, MetaRow } from "../components/ui.jsx";
import { MODEL, SPESIES, DETEKSI } from "../data.js";

const objColor = (objek) =>
  objek.startsWith("Tupai") ? "sawit" : "orange";

export default function Detection() {
  return (
    <>
      <SectionTitle
        title="Deteksi AI — Computer Vision"
        subtitle="Model deteksi & klasifikasi tupai serta gejala gerekan buah dari citra kamera siang hari (tajuk & batang)."
        right={
          <Badge size="lg" variant="light" color="sawit">
            {MODEL.versi}
          </Badge>
        }
      />

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        {MODEL.metrik.map((m) => (
          <Card key={m.label} padding="lg">
            <Group justify="space-between" align="center" wrap="nowrap">
              <Box>
                <Text fz="sm" c="dimmed" fw={500}>
                  {m.label}
                </Text>
                <Text className="tabnums" fz={28} fw={680} c="#1f2a26" mt={4}>
                  {m.nilai.toFixed(2)}
                </Text>
              </Box>
              <RingProgress
                size={56}
                thickness={6}
                roundCaps
                sections={[{ value: m.nilai * 100, color: "sawit" }]}
              />
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      <Grid gutter="md" mt="md">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card padding="lg">
            <Text fw={620} c="#1f2a26">
              Performa per kelas
            </Text>
            <Text fz="xs" c="dimmed" mb="md">
              Precision &amp; Recall pada data uji (bebas kebocoran lokasi)
            </Text>
            <Stack gap="lg">
              {MODEL.kelas.map((k) => (
                <Box key={k.kelas}>
                  <Group justify="space-between" mb={6} wrap="nowrap">
                    <Text fz="sm" fw={550} c="#1f2a26">
                      {k.kelas}
                    </Text>
                    <Text fz="xs" c="dimmed">
                      {k.dukungan} sampel
                    </Text>
                  </Group>
                  <Group gap="md" grow>
                    <BarLine label="P" value={k.presisi} color="sawit" />
                    <BarLine label="R" value={k.recall} color="teal" />
                  </Group>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Stack gap="md">
            <Card padding="lg">
              <Text fw={620} c="#1f2a26" mb="xs">
                Detail model
              </Text>
              <Stack gap="sm">
                <MetaRow label="Arsitektur" value={MODEL.versi} />
                <MetaRow label="Dataset" value={MODEL.dataset} />
                <MetaRow label="Pembagian" value={MODEL.pembagian} />
              </Stack>
            </Card>

            <Card padding="lg">
              <Text fw={620} c="#1f2a26" mb={2}>
                Spesies tupai dominan
              </Text>
              <Text fz="xs" c="dimmed" mb="sm">
                Hasil klasifikasi di lokasi studi
              </Text>
              <Stack gap="sm">
                {SPESIES.map((s) => (
                  <Box key={s.nama}>
                    <Group justify="space-between" mb={4} wrap="nowrap">
                      <Box>
                        <Text fz="sm" fw={550} fs="italic" c="#1f2a26">
                          {s.nama}
                        </Text>
                        <Text fz={11} c="dimmed">
                          {s.umum}
                        </Text>
                      </Box>
                      <Text className="tabnums" fz="sm" fw={600} c="#2f773d">
                        {s.porsi}%
                      </Text>
                    </Group>
                    <Progress value={s.porsi} color="sawit" size="sm" radius="xl" />
                  </Box>
                ))}
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>

      <Card padding="lg" mt="md">
        <Group justify="space-between" mb="md">
          <Box>
            <Text fw={620} c="#1f2a26">
              Umpan deteksi terbaru
            </Text>
            <Text fz="xs" c="dimmed">
              Stream langsung dari kamera tajuk &amp; batang
            </Text>
          </Box>
          <Group gap={6}>
            <Box w={8} h={8} style={{ background: "#499b57", borderRadius: "50%" }} />
            <Text fz="xs" c="dimmed">
              Langsung
            </Text>
          </Group>
        </Group>
        <Table.ScrollContainer minWidth={680}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Waktu</Table.Th>
                <Table.Th>Kamera</Table.Th>
                <Table.Th>Blok</Table.Th>
                <Table.Th>Objek terdeteksi</Table.Th>
                <Table.Th>Spesies</Table.Th>
                <Table.Th>Posisi</Table.Th>
                <Table.Th ta="right">Keyakinan</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {DETEKSI.map((d, i) => (
                <Table.Tr key={i}>
                  <Table.Td className="tabnums">
                    <Text fz="sm" c="dimmed">
                      {d.t}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fz="sm" fw={550}>
                      {d.kamera}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color="gray">
                      {d.blok}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light" color={objColor(d.objek)}>
                      {d.objek}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text fz="sm" fs={d.spesies === "—" ? "normal" : "italic"} c={d.spesies === "—" ? "dimmed" : "#1f2a26"}>
                      {d.spesies}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text fz="sm">{d.posisi}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group justify="flex-end" gap="xs" wrap="nowrap">
                      <Text className="tabnums" fz="sm" fw={600} c="#2f773d">
                        {(d.conf * 100).toFixed(0)}%
                      </Text>
                      <Box w={40}>
                        <Progress value={d.conf * 100} color="sawit" size="sm" radius="xl" />
                      </Box>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Card>
    </>
  );
}

function BarLine({ label, value, color }) {
  return (
    <Box>
      <Group justify="space-between" mb={3}>
        <Text fz={11} c="dimmed" fw={600}>
          {label === "P" ? "Precision" : "Recall"}
        </Text>
        <Text className="tabnums" fz={11} fw={600} c="#1f2a26">
          {value.toFixed(2)}
        </Text>
      </Group>
      <Progress value={value * 100} color={color} size="md" radius="xl" />
    </Box>
  );
}
