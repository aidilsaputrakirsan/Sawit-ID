import React from "react";
import { createRoot } from "react-dom/client";

import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "./styles.css";

import { MantineProvider } from "@mantine/core";
import { theme } from "./theme.js";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <App />
    </MantineProvider>
  </React.StrictMode>
);
