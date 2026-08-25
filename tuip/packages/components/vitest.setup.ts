import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { tuyaUiTailwindPreset } from "@tuya-ui/tokens/tailwind-preset";

afterEach(cleanup);

/**
 * jsdom no tiene motor de layout: no compone Tailwind ni mide nada, así que
 * `getBoundingClientRect()` devuelve ceros y una prueba de dimensión escrita
 * contra él estaría midiendo el vacío.
 *
 * Lo que jsdom sí hace es la cascada de CSS para propiedades declaradas
 * explícitamente, así que `getComputedStyle(el).width` devuelve lo que una
 * hoja de estilos le haya asignado. Eso alcanza para lo que las pruebas de
 * dimensión tienen que garantizar: que la card pida siempre la misma medida,
 * cualquiera sea el nivel o la longitud de la etiqueta.
 *
 * La hoja se genera desde el preset —el mismo objeto que consume Tailwind— y
 * no se escribe a mano. Es lo que evita que la prueba se vuelva circular: si
 * el token cambia de valor, o el componente pide otra utilidad, la aserción
 * cambia con él en vez de seguir comparando contra un número escrito acá.
 */
const { width, height } = tuyaUiTailwindPreset.theme.extend as {
  width: Record<string, string>;
  height: Record<string, string>;
};

const rules = [
  ...Object.entries(width).map(([name, value]) => `.w-${name}{width:${value};}`),
  ...Object.entries(height).map(([name, value]) => `.h-${name}{height:${value};}`),
  // `box-border` participa de la misma garantía: el alto del token incluye el
  // borde, así que la prueba tiene que poder ver que la card lo declara.
  ".box-border{box-sizing:border-box;}",
];

const sheet = document.createElement("style");
sheet.textContent = rules.join("\n");
document.head.appendChild(sheet);
