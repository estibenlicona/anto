import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

// Runtime dependencies (Radix, cmdk, date-fns, react-day-picker, @tuya-ui/tokens)
// stay external: npm installs them for the consumer as ordinary dependencies,
// so bundling them here would duplicate them instead of sharing one copy.
const external = ["react", "react-dom", ...Object.keys(pkg.dependencies ?? {})];

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    target: "es2020",
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    external,
  },
  {
    // Separate config: the install-skill CLI is Node-only ESM with a shebang,
    // none of which applies to the library entry above.
    entry: ["scripts/install-skill.ts"],
    format: ["esm"],
    target: "node18",
    dts: false,
    sourcemap: false,
    clean: false,
    platform: "node",
  },
]);
