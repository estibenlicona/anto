// Por ruta y no por nombre de paquete: el cargador de configuración de
// Tailwind resuelve en CommonJS, y el subpath `./tailwind-preset` de
// @tuya-ui/tokens sólo declara la condición `import`. Pedirlo por nombre
// falla con ERR_PACKAGE_PATH_NOT_EXPORTED, y —esto es lo peligroso— la CLI
// se lo traga sin decir nada: compila igual, sin una sola utilidad del
// vocabulario. Este config no se publica, así que apuntar al workspace es
// una dependencia interna y no un contrato hacia afuera.
import { tuyaUiTailwindPreset } from "../tokens/dist/tailwind-preset.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [tuyaUiTailwindPreset],
  content: ["./src/**/*.{ts,tsx}"],
};
