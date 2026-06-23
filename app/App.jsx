import { useState } from "react";
import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  ThemeIcon,
  Box,
  Badge,
  Stack,
  ScrollArea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLayoutDashboard,
  IconMapPin,
  IconScan,
  IconChartHistogram,
  IconShieldCheck,
  IconLeaf,
  IconCircleDot,
} from "@tabler/icons-react";

import { SITE } from "./data.js";
import Overview from "./sections/Overview.jsx";
import HotspotMap from "./sections/HotspotMap.jsx";
import Detection from "./sections/Detection.jsx";
import Baci from "./sections/Baci.jsx";
import Intervention from "./sections/Intervention.jsx";

const NAV = [
  { key: "ringkasan", label: "Ringkasan", icon: IconLayoutDashboard, Comp: Overview },
  { key: "hotspot", label: "Peta Hotspot", icon: IconMapPin, Comp: HotspotMap },
  { key: "deteksi", label: "Deteksi AI", icon: IconScan, Comp: Detection },
  { key: "baci", label: "Evaluasi BACI", icon: IconChartHistogram, Comp: Baci },
  { key: "intervensi", label: "Intervensi", icon: IconShieldCheck, Comp: Intervention },
];

export default function App() {
  const [active, setActive] = useState("ringkasan");
  const [opened, { toggle, close }] = useDisclosure();
  const Current = NAV.find((n) => n.key === active)?.Comp ?? Overview;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 248,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
      bg="#f6f8f6"
    >
      <AppShell.Header
        withBorder
        style={{ borderColor: "#e9eeea", background: "#ffffff" }}
      >
        <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <ThemeIcon size={36} radius="md" variant="filled" color="sawit">
              <IconLeaf size={20} stroke={1.8} />
            </ThemeIcon>
            <Box>
              <Text fz="md" fw={680} lh={1.1} c="#1f2a26">
                SAWIT-AI
              </Text>
              <Text fz={11} c="dimmed" lh={1.1}>
                Deteksi &amp; Pengendalian Tupai Non-Kimiawi
              </Text>
            </Box>
          </Group>
          <Group gap="lg" wrap="nowrap" visibleFrom="sm">
            <Group gap={6} wrap="nowrap">
              <IconCircleDot size={14} color="#499b57" />
              <Text fz="xs" c="dimmed">
                Sistem aktif · diperbarui {SITE.pembaruan}
              </Text>
            </Group>
            <Badge variant="light" color="sawit" size="lg">
              {SITE.periode}
            </Badge>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{ borderColor: "#e9eeea", background: "#ffffff" }}
      >
        <AppShell.Section grow component={ScrollArea}>
          <Text fz={11} fw={600} c="dimmed" tt="uppercase" mb="xs" px="xs">
            Navigasi
          </Text>
          <Stack gap={4}>
            {NAV.map((n) => (
              <NavLink
                key={n.key}
                active={active === n.key}
                label={n.label}
                onClick={() => {
                  setActive(n.key);
                  close();
                }}
                leftSection={<n.icon size={19} stroke={1.7} />}
                variant="light"
                color="sawit"
                styles={{ root: { borderRadius: 8 }, label: { fontWeight: 550 } }}
              />
            ))}
          </Stack>
        </AppShell.Section>
        <AppShell.Section>
          <Box
            p="sm"
            style={{
              background: "#f1f6f2",
              border: "1px solid #e1ebe3",
              borderRadius: 10,
            }}
          >
            <Text fz="xs" fw={600} c="#2f773d">
              {SITE.nama}
            </Text>
            <Text fz={11} c="dimmed" mt={4}>
              {SITE.luasHa} ha · {SITE.pohonContoh} pohon contoh
            </Text>
            <Text fz={11} c="dimmed">
              {SITE.kameraTajuk + SITE.kameraBatang} kamera · {SITE.siklusBuah}
            </Text>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Current />
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
