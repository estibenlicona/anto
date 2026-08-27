/**
 * Cómo se reparte la salida de Tailwind entre la subcapa `tuya-ui` y la capa
 * `utilities` a secas. Lo comparten `build-css.ts` (que escribe la hoja) y
 * `verify-stylesheet.ts` (que la comprueba), para que los dos apliquen la
 * misma regla y no una parecida.
 *
 * La regla: las utilidades **base** (`w-full`, `p-4`, `opacity-0`) van a la
 * subcapa, donde pierden contra cualquier utilidad que el consumidor compile;
 * las utilidades **con variante** (`peer-checked:opacity-100`, `md:flex-row`,
 * `hover:bg-neutral-hover`) quedan fuera, detrás de la subcapa, donde ganan a
 * cualquier utilidad base —la publique el paquete o la genere el consumidor—.
 * Es el orden que Tailwind garantiza dentro de una sola hoja, repuesto entre
 * dos hojas. En `build-css.ts` está el porqué con detalle.
 */

/** Nombre de la subcapa donde viajan las utilidades base publicadas. */
export const SUBCAPA_UTILIDADES = "tuya-ui";

/**
 * Las reglas de primer nivel de un cuerpo CSS, cada una con su texto completo
 * (`selector{…}` o `@media …{…}`), en el orden en que aparecen.
 *
 * Recorre llaves en vez de usar una expresión regular porque una regla puede
 * anidar otras —`@media` envuelve selectores, y la v4 escribe `@media` dentro
 * de un selector para `group-hover`— y un `}` cualquiera no es un separador.
 */
export function reglasDeNivelSuperior(cuerpo: string): string[] {
  const reglas: string[] = [];
  let inicio = 0;
  let profundidad = 0;
  for (let i = 0; i < cuerpo.length; i++) {
    const ch = cuerpo[i];
    if (ch === "{") {
      profundidad++;
    } else if (ch === "}") {
      profundidad--;
      if (profundidad < 0) {
        throw new Error("El cuerpo CSS cierra una llave que no abrió.");
      }
      if (profundidad === 0) {
        reglas.push(cuerpo.slice(inicio, i + 1));
        inicio = i + 1;
      }
    }
  }
  if (profundidad !== 0) {
    throw new Error("El cuerpo CSS deja una llave sin cerrar.");
  }
  const resto = cuerpo.slice(inicio).trim();
  if (resto.length > 0) {
    throw new Error(`Quedó texto suelto fuera de toda regla: "${resto.slice(0, 40)}…"`);
  }
  return reglas;
}

/**
 * ¿La regla lleva variante?
 *
 * Tailwind escribe el prefijo de variante con el separador escapado —
 * `.peer-checked\:opacity-100`, `.md\:flex-row`,
 * `.data-\[state\=open\]\:animate-float-in`— así que un `\:` en el selector
 * lo delata. Con una salvedad: un valor arbitrario también puede llevar dos
 * puntos, `.\[transform-origin\:var\(--x\)\]`, y esa es una utilidad base.
 * Por eso se miran los `\:` que quedan **fuera** de los corchetes escapados.
 *
 * Un bloque `@media`/`@supports`/`@container` de primer nivel cuenta como
 * variante: es lo que envuelve a `md:`, `dark:`, `motion-safe:` y compañía.
 */
export function esVariante(regla: string): boolean {
  const selector = regla.slice(0, regla.indexOf("{")).trim();
  if (selector.startsWith("@")) return true;
  const sinArbitrarios = selector.replace(/\\\[[\s\S]*?\\\]/g, "");
  return sinArbitrarios.includes("\\:");
}

/** El cuerpo de `@layer utilities` repartido en las dos mitades. */
export function partirUtilidades(cuerpo: string): { base: string[]; variantes: string[] } {
  const base: string[] = [];
  const variantes: string[] = [];
  for (const regla of reglasDeNivelSuperior(cuerpo)) {
    (esVariante(regla) ? variantes : base).push(regla);
  }
  return { base, variantes };
}

/** El tramo `[inicio, fin)` del cuerpo de `@layer <nombre>` en `css`; null si no está o no cierra. */
export function cuerpoDeCapa(css: string, nombre: string): { inicio: number; fin: number } | null {
  const apertura = new RegExp(`@layer\\s+${nombre}\\s*\\{`).exec(css);
  if (apertura === null) return null;
  const inicio = apertura.index + apertura[0].length;
  let profundidad = 1;
  let i = inicio;
  for (; i < css.length && profundidad > 0; i++) {
    if (css[i] === "{") profundidad++;
    else if (css[i] === "}") profundidad--;
  }
  return profundidad === 0 ? { inicio, fin: i - 1 } : null;
}

/**
 * ¿El cuerpo de `@layer utilities` tiene la forma publicada?
 *
 * Empieza con la subcapa; dentro de ella no hay ninguna regla con variante;
 * después de ella no hay ninguna sin variante; y hay al menos una de cada
 * lado —una hoja con una mitad vacía es una hoja que dejó de tener
 * componentes, no una bien repartida—.
 */
export function formaPublicada(cuerpoUtilities: string): { ok: boolean; motivo: string } {
  const subcapa = cuerpoDeCapa(cuerpoUtilities, SUBCAPA_UTILIDADES);
  if (subcapa === null) {
    return { ok: false, motivo: `no hay subcapa \`${SUBCAPA_UTILIDADES}\`` };
  }
  const prefijo = `@layer ${SUBCAPA_UTILIDADES}{`;
  if (subcapa.inicio !== prefijo.length) {
    return { ok: false, motivo: `hay reglas antes de la subcapa \`${SUBCAPA_UTILIDADES}\`` };
  }
  const dentro = reglasDeNivelSuperior(cuerpoUtilities.slice(subcapa.inicio, subcapa.fin));
  const fuera = reglasDeNivelSuperior(cuerpoUtilities.slice(subcapa.fin + 1));
  const varianteDentro = dentro.find(esVariante);
  if (varianteDentro !== undefined) {
    return {
      ok: false,
      motivo: `una regla con variante quedó dentro de la subcapa: \`${varianteDentro.slice(0, 60)}\``,
    };
  }
  const baseFuera = fuera.find((r) => !esVariante(r));
  if (baseFuera !== undefined) {
    return {
      ok: false,
      motivo: `una utilidad base quedó fuera de la subcapa: \`${baseFuera.slice(0, 60)}\``,
    };
  }
  if (dentro.length === 0) return { ok: false, motivo: "la subcapa está vacía" };
  if (fuera.length === 0) return { ok: false, motivo: "no quedó ninguna variante fuera de la subcapa" };
  return { ok: true, motivo: "" };
}
