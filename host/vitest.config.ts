import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { createRequire } from "module";
import tailwindcss from "@tailwindcss/vite";

const require = createRequire(import.meta.url);
const reactDir = path.dirname(require.resolve("react/package.json"));
const reactDomDir = path.dirname(require.resolve("react-dom/package.json"));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    test: {
      watch: false,
      globals: true,
      setupFiles: ["./vitest-setup.ts"],
      environment: "jsdom",
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      exclude: ["node_modules", "dist"],
      server: {
        // @tuya-ui/components y sus dependencias de Radix UI deben procesarse
        // como el resto del código para que el alias de react/react-dom de
        // abajo aplique y no se carguen dos copias de React (ver frontend/).
        deps: {
          inline: [/@tuya-ui\//, /@radix-ui\//],
        },
      },
      reporters: ["default", "junit"],
      outputFile: {
        junit: "./coverage/junit.xml",
      },
      coverage: {
        provider: "v8" as const,
        reporter: ["text", "json", "html", "lcov", "cobertura"],
        reportsDirectory: "./coverage",
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/main.tsx",
          "src/vite-env.d.ts",
          "**/*.test.{ts,tsx}",
          "**/index.ts",
          "**/types.ts",
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
          },
        },
        passWithNoTest: true,
        testTimeout: 30000,
        hookTimeout: 30000,
      },
    },
    resolve: {
      dedupe: ["react", "react-dom"],
      alias: [
        { find: "react-dom", replacement: reactDomDir },
        { find: "react", replacement: reactDir },
        { find: "@app", replacement: path.resolve(__dirname, "src/app") },
        {
          find: "@features",
          replacement: path.resolve(__dirname, "src/features"),
        },
        {
          find: "@layouts",
          replacement: path.resolve(__dirname, "src/layouts"),
        },
        {
          find: "@pages",
          replacement: path.resolve(__dirname, "src/pages"),
        },
        {
          find: "@shared",
          replacement: path.resolve(__dirname, "src/shared"),
        },
      ],
    },
  };
});
