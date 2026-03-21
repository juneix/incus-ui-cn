import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import * as dotenv from "dotenv";
import * as fs from "fs";
import https from "node:https";

// Load local/env if it exists to override default environment variables
dotenv.config({ path: ".env" });
if (fs.existsSync("local/env")) {
  dotenv.config({ path: "local/env" });
}

// Provide the SCSS settings from the _settings.scss file.
// SCSS in react-components can reference variables like customized $breakpoint-large and should use our settings.
const scssSettings = fs.readFileSync("src/sass/_settings.scss", "utf-8").trim();
const incusTarget = process.env.incus_dev ?? "https://127.0.0.1:8443";
const clientCertPath = process.env.incus_crt
  ? `local/${process.env.incus_crt}`
  : undefined;
const clientKeyPath = process.env.incus_key
  ? `local/${process.env.incus_key}`
  : undefined;

const createIncusProxyAgent = () => {
  if (!clientCertPath || !clientKeyPath) {
    return undefined;
  }

  if (!fs.existsSync(clientCertPath) || !fs.existsSync(clientKeyPath)) {
    return undefined;
  }

  return new https.Agent({
    cert: fs.readFileSync(clientCertPath),
    key: fs.readFileSync(clientKeyPath),
    rejectUnauthorized: false,
  });
};

const incusProxyAgent = createIncusProxyAgent();

const incusProxyOptions = {
  target: incusTarget,
  changeOrigin: true,
  secure: false,
  ws: true,
  agent: incusProxyAgent,
};

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/ui/" : "/",
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["mixed-decls", "global-builtin", "import"],
        additionalData: scssSettings,
      },
    },
  },
  plugins: [tsconfigPaths(), react()],
  server: {
    port: process.env.VITE_PORT ? Number(process.env.VITE_PORT) : 5566,
    strictPort: true,
    hmr: process.env.CI ? false : undefined,
    proxy: {
      "/1.0": incusProxyOptions,
      "/oidc": incusProxyOptions,
      "/documentation": {
        ...incusProxyOptions,
        ws: false,
      },
    },
  },
  build: {
    outDir: "./build/ui",
    minify: "esbuild",
  },
}));
