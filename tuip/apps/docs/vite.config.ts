import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Components under packages/components import their internal
      // dependencies as if they were already copied into a consumer app's own
      // src — "@/lib/cn", "@/lib/categorical-color", "@/icons/paths". Point
      // those at the real sources so the docs site can render the components
      // unbuilt. The lib rule is a prefix rather than one entry per file, so a
      // new shared module resolves here without a config change; it has to
      // stay ahead of the bare "@" rule below, which would otherwise swallow
      // it and send it to the docs' own src.
      {
        find: /^@\/lib\//,
        replacement: fileURLToPath(
          new URL("../../packages/components/src/lib/", import.meta.url),
        ),
      },
      {
        find: "@/icons/paths",
        replacement: fileURLToPath(
          new URL("../../packages/components/src/icons/paths.ts", import.meta.url),
        ),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
});
