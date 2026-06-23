import { Card, Group, Text, ThemeIcon, Stack, Box } from "@mantine/core";
import { IconArrowUpRight, IconArrowDownRight } from "@tabler/icons-react";

/* Judul bagian yang konsisten di tiap section */
export function SectionTitle({ title, subtitle, right }) {
  return (
    <Group justify="space-between" align="flex-end" mb="md" wrap="nowrap">
      <Box>
        <Text fz={22} fw={650} c="#1f2a26" lh={1.2}>
          {title}
        </Text>
        {subtitle && (
          <Text fz="sm" c="dimmed" mt={4}>
            {subtitle}
          </Text>
        )}
      </Box>
      {right}
    </Group>
  );
}

/* Kartu KPI: angka besar, delta, ikon lembut */
export function StatCard({ icon: Icon, label, value, unit, delta, deltaGood }) {
  // deltaGood = arah yang "baik" (mis. turunnya buah tergerek = baik)
  const positiveDelta = delta >= 0;
  const good = deltaGood === undefined ? positiveDelta : deltaGood;
  const DeltaIcon = positiveDelta ? IconArrowUpRight : IconArrowDownRight;
  return (
    <Card padding="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={6}>
          <Text fz="sm" c="dimmed" fw={500}>
            {label}
          </Text>
          <Group gap={6} align="baseline">
            <Text className="tabnums" fz={30} fw={680} lh={1} c="#1f2a26">
              {value}
            </Text>
            {unit && (
              <Text fz="sm" c="dimmed" fw={500}>
                {unit}
              </Text>
            )}
          </Group>
          {delta !== undefined && (
            <Group gap={4} align="center" mt={2}>
              <DeltaIcon
                size={15}
                color={good ? "#499b57" : "#d35a3c"}
                stroke={2.2}
              />
              <Text fz="xs" fw={600} c={good ? "#3c8a4c" : "#c44a2e"}>
                {positiveDelta ? "+" : ""}
                {delta}%
              </Text>
              <Text fz="xs" c="dimmed">
                vs baseline
              </Text>
            </Group>
          )}
        </Stack>
        {Icon && (
          <ThemeIcon
            size={42}
            radius="md"
            variant="light"
            color="sawit"
          >
            <Icon size={22} stroke={1.7} />
          </ThemeIcon>
        )}
      </Group>
    </Card>
  );
}

/* Baris label–nilai kecil untuk panel info */
export function MetaRow({ label, value }) {
  return (
    <Group justify="space-between" gap="xs" wrap="nowrap">
      <Text fz="sm" c="dimmed">
        {label}
      </Text>
      <Text fz="sm" fw={550} c="#1f2a26" ta="right">
        {value}
      </Text>
    </Group>
  );
}
