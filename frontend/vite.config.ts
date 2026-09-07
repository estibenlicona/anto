import { defineConfig, loadEnv, type Plugin } from "vite";
import { join } from "path";
import { rm } from "fs/promises";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

/**
 * public/mockServiceWorker.js es inerte en producción (nada en el bundle lo
 * registra — ver add-browser-mock-mode, design.md Decisión 3), pero Vite
 * copia todo public/ a dist/ sin importar el modo. Se borra explícitamente
 * después del build de producción para que ni siquiera quede el archivo.
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
  const env = loadEnv(process.cwd(), "");
  const outDir = "./dist";

  return {
    plugins: [
      react(),
      // Gestión de Capacidad se publica como remote federado: el host carga
      // "capacidad/module" en runtime. React y el router viajan como
      // singletons — con dos copias, los hooks y el contexto del router se
      // rompen — y las versiones exigidas son exactamente las del host.
      federation({
        name: "capacidad",
        filename: "remoteEntry.js",
        manifest: true,
        exposes: {
          "./module": "./src/module/CapacityModule.tsx",
        },
        shared: {
          react: { singleton: true, requiredVersion: "19.2.8" },
          "react-dom": { singleton: true, requiredVersion: "19.2.8" },
          "react-router-dom": { singleton: true, requiredVersion: "7.18.2" },
        },
      }),
      removeMockWorkerInProduction(mode, outDir),
    ],
    // El host (otro origen en desarrollo) importa el remote por URL absoluta:
    // los assets del dev server deben anunciarse con su propio origen y
    // aceptar CORS.
    server: {
      port: 4300,
      strictPort: true,
      cors: true,
      origin: "http://localhost:4300",
    },
    // Un build servido con `vite preview` también entrega el remote a otro
    // origen (el host): mismo CORS que el dev server.
    preview: {
      port: 4300,
      strictPort: true,
      cors: true,
    },
    build: {
      outDir,
      emptyOutDir: true,
      // Module Federation emite top-level await en el remote entry.
      target: "esnext",
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
    resolve: {
      // @tuya-ui/components se instala desde su tarball empaquetado (`file:` a
      // un .tgz) y no como `link:` al árbol de tuip, así que pnpm resuelve sus
      // peers de React contra el de acá y ya no entran dos copias. El dedupe
      // queda como red de seguridad por si alguien vuelve a enlazar el paquete
      // para depurarlo: en esa vuelta reaparecen las dos copias y los hooks
      // rompen.
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
    base: env.VITE_BASE_PUBLIC_URL,
    define: {
      "import.meta.vitest": undefined,
    },
  };
});
