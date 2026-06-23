import { createTheme } from "@mantine/core";

/* =========================================================================
   SAWIT-AI — tema visual.
   Light theme, satu warna utama hijau sawit yang tenang, sudut membulat,
   bayangan halus. Tujuannya: bersih, profesional, tidak ramai.
   ========================================================================= */

// Skala hijau "sawit" (gelap → terang dibalik sesuai konvensi Mantine 0..9 terang→gelap)
const sawit = [
  "#eef6ef",
  "#dcebde",
  "#b6d6bb",
  "#8dc096",
  "#6cae77",
  "#56a263",
  "#499b57",
  "#398747",
  "#2f773d",
  "#206630",
];

export const theme = createTheme({
  primaryColor: "sawit",
  primaryShade: { light: 6 },
  colors: { sawit },
  fontFamily:
    'Inter, "Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily:
      'Inter, "Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
    fontWeight: "650",
  },
  defaultRadius: "md",
  white: "#ffffff",
  black: "#1f2a26",
  components: {
    Card: {
      defaultProps: { withBorder: true, radius: "lg", shadow: "none" },
      styles: { root: { borderColor: "#e9eeea" } },
    },
    Paper: {
      styles: { root: { borderColor: "#e9eeea" } },
    },
    Badge: {
      defaultProps: { radius: "sm", variant: "light" },
    },
  },
});
