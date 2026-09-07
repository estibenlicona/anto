import { defineConfig, loadEnv } from "vite";
import { join } from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";
import { rm } from "fs/promises";
import type { Plugin } from "vite";

/**
 * El worker de mocks del módulo de Capacidad (copiado de frontend/public) es
 * cosa de desarrollo: en el build de producción del host no debe quedar ni
 * el archivo.
 */
function removeMockWorkerInProduction(mode: string, outDir: string): Plugin {
  return {
    name: "remove-mock-worker-in-production",
    apply: "build",
    closeBundle: async () => {
      if (mode !== "production") return;
      await rm(join(outDir, "mockServiceWorker.js"), { force: true });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      // El host consume módulos federados; los remotes concretos se registran
      // en runtime (registerRemotes) desde el registro de módulos, así un
      // remote ausente no rompe el build. React y el router viajan como
      // singletons con las mismas versiones que exige el remote.
      federation({
        name: "host",
        remotes: {},
        shared: {
          react: { singleton: true, requiredVersion: "19.2.8" },
          "react-dom": { singleton: true, requiredVersion: "19.2.8" },
          "react-router-dom": { singleton: true, requiredVersion: "7.18.2" },
        },
      }),
      removeMockWorkerInProduction(mode, "./dist"),
    ],
    build: {
      outDir: "./dist",
      emptyOutDir: true,
      // Module Federation emite top-level await.
      target: "esnext",
      reportCompressedSize: true,
    },
    resolve: {
      // Misma nota que en frontend/vite.config.ts: tuip se instala desde su
      // tarball, así que React es uno solo; el dedupe queda de resguardo.
      dedupe: ["react", "react-dom"],
      alias: [
        { find: "@app", replacement: join(import.meta.dirname, "src/app") },
        {
          find: "@features",
          replacement: join(import.meta.dirname, "src/features"),
        },
        {
          find: "@layouts",
          replacement: join(import.meta.dirname, "src/layouts"),
        },
        {
          find: "@pages",
          replacement: join(import.meta.dirname, "src/pages"),
        },
        {
          find: "@shared",
          replacement: join(import.meta.dirname, "src/shared"),
        },
      ],
    },
    base: env.VITE_BASE_PUBLIC_URL || "/",
    define: {
      "import.meta.vitest": undefined,
    },
  };
});
