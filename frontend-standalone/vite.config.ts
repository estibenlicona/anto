import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

/**
 * Gestión de Capacidad como aplicación independiente, sin Module Federation.
 *
 * No tiene pantallas propias: importa las de `../frontend/src` (un solo
 * código para las dos versiones) y aporta lo que el host aportaría — sesión,
 * barra y ruta base — con un login simulado. Sirve para probar el módulo
 * completo sin levantar emulador + host + remote.
 */
const FRONT = resolve(import.meta.dirname, "../frontend/src");

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Un solo React, un solo router y un solo tuip: los archivos de
    // ../frontend/src resolverían los suyos desde ../frontend/node_modules y
    // habría dos copias (hooks y contextos rotos). `dedupe` fuerza a que todo
    // salga de este proyecto.
    dedupe: ["react", "react-dom", "react-router-dom", "@tuya-ui/components"],
    alias: [
      // La hoja del módulo la importa CapacityModule ("../styles/styles.css").
      // Acá ese import se desvía a src/styles.css, que la envuelve con el
      // @source del código compartido: así Tailwind compila UNA sola vez con
      // todas las fuentes. Sin el desvío habría dos compilaciones —la del
      // módulo, sin @source— y la segunda pisaría utilidades de la primera.
      {
        find: /^\.\.\/styles\/styles\.css$/,
        replacement: resolve(import.meta.dirname, "src/styles.css"),
      },
      { find: "@front", replacement: FRONT },
      { find: "@app", replacement: `${FRONT}/app` },
      { find: "@features", replacement: `${FRONT}/features` },
      { find: "@layouts", replacement: `${FRONT}/layouts` },
      { find: "@pages", replacement: `${FRONT}/pages` },
      { find: "@shared", replacement: `${FRONT}/shared` },
    ],
  },
  server: {
    port: 4500,
    strictPort: true,
    // El código vive un directorio arriba de este proyecto.
    fs: { allow: [resolve(import.meta.dirname, "..")] },
    host: true,
    allowedHosts: [
      "7559-186-80-30-220.ngrok-free.app"
    ]
  },
  preview: {
    port: 4500,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  define: {
    "import.meta.vitest": undefined,
  },
});
