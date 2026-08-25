import { defineConfig, loadEnv, type Plugin } from "vite";
import { join, dirname } from "path";
import { createRequire } from "module";
import { rm } from "fs/promises";
import react from "@vitejs/plugin-react";

const require = createRequire(import.meta.url);
const reactDir = dirname(require.resolve("react/package.json"));
const reactDomDir = dirname(require.resolve("react-dom/package.json"));

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
    plugins: [react(), removeMockWorkerInProduction(mode, outDir)],
    build: {
      outDir,
      emptyOutDir: true,
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
        { find: "react-dom", replacement: reactDomDir },
        { find: "react", replacement: reactDir },
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
      // El simulador de autenticación se apaga en duro en producción, no se
      // confía en que la variable venga vacía. Con el literal forzado, la
      // condición de `main.tsx` queda muerta y Rollup no emite el chunk de
      // `src/dev/`, así que el simulador no existe en el artefacto ni aunque
      // alguien construya con VITE_AUTH_SIMULATOR=true.
      //
      // Es más fuerte que borrar un archivo del output como se hace con el
      // worker de MSW: allá el archivo podía existir e igual quedaba inerte;
      // acá directamente no se genera.
      ...(mode === "production"
        ? { "import.meta.env.VITE_AUTH_SIMULATOR": '"false"' }
        : {}),
    },
  };
});
