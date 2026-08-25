## Context

`SegmentedBar` y `Progress` viven en `packages/components/src/progress.tsx`; los tokens semánticos en `packages/tokens/src/semantic-colors.ts` (`BrandBackground` sin `strong`; `NeutralBackground` sí lo tiene, con la nota de por qué existe). La app de Gestión de Capacidad replicó tres barras localmente por las carencias descritas en proposal.md - Why; este change las cubre desde el sistema para que la app las reemplace en un change propio.

Hechos que condicionan:

- Los vocabularios de color de `SegmentedBar` son una unión discriminada (`role` | `color` | `tone`, los otros dos `never`): agregar `heat` es una cuarta rama del mismo patrón.
- `SegmentedBar` calcula `width: value / total * 100 %` con `total = Σ values`; `separated` usa `gap-hug` (4 px) y `rounded-pill` por segmento.
- `Progress` mide `h-1.5` (6 px); `SegmentedBar` `h-2` (8 px).
- La escala primitiva `brand` tiene pasos 50–900; `bold` es 600 (light) / 400 (dark). El paso "atenuado" natural es 300 en light (el que la app aproximó con `opacity-45` sobre 600) y, por simetría de contraste, 700 en dark.
- `verify-tokens.ts` comprueba contrastes de pares texto/fondo; `brand.strong` no lleva texto encima en ningún consumidor previsto, así que no entra en los pares AA, pero sí debe superar 3:1 contra `bg-neutral-default` como relleno no textual (igual que el `strong` neutro).

## Goals / Non-Goals

**Goals:**
- Tres opciones aditivas y retrocompatibles: nada cambia para los consumidores actuales.
- Un único lugar donde se decide qué color es "marca atenuada".
- Que las tres barras de la app sean componentes de `tuip` (`CapacityBar`, `DistributionCard`, `Meter`) construidos sobre esos primitivos, sin medidas ni colores propios.

**Non-Goals:**
- Cambiar la altura por defecto de `SegmentedBar`, el `gap` de `separated`, o el color por defecto de `Progress`.
- Un `total` para `Progress` (su contrato ya es 0–100).
- Tokens genéricos de "alto de barra": con `size` en `SegmentedBar` y la altura fija de `Progress`, los componentes nuevos no necesitan medidas sueltas.
- Lógica de dominio en los componentes: `CapacityBar` no sabe qué es FTE ni BAU; recibe partes con etiqueta/valor/tono y una unidad. `DistributionCard` no sabe qué es criticidad. Las lecturas de pie las escribe el consumidor.

## Decisions

### D1. Token `background.brand.strong`

- `BrandBackground` gana `strong: string` con docstring paralelo al de `NeutralBackground.strong`: el paso intermedio entre la tinta (`subtle`) y la acción (`bold`), para rellenos no textuales que deben leerse como marca en menor intensidad.
- Light: `p.brand[300]` (#FF9AA1). Dark: `p.brand[700]` (#A21018) — en oscuro `bold` es el 400, así que "menos intenso" va hacia el fondo oscuro, no hacia el blanco.
- Sale como `--color-bg-brand-strong` y `bg-brand-strong` por el mismo camino que el resto (el preset deriva las clases del objeto).
- `verify-tokens.ts`: agregar el par no textual `brand.strong` sobre `background.neutral.default` con piso 3:1 en ambos temas (300 sobre blanco ≈ 2.3:1 — **no lo cumple**; ver Risks). Decisión: el piso 3:1 aplica a elementos que deben reconocerse solos; un segmento de barra se lee por posición dentro de una secuencia y junto a su leyenda, igual que los pasos claros de `SegmentedBar` categórico hoy. Se registra el par como informativo (sin fallar) con ese comentario, no como assertion.
  - **Alternativa descartada**: `p.brand[400]` (#F8626C, ≈ 3.1:1) cumpliría 3:1 pero queda demasiado cerca de `bold` (600) para leerse como un paso distinto en una barra de 8 px. Se prefiere legibilidad de la escala a un piso que no aplica a este uso.

### D2. `SegmentedBar` — `heat`

```ts
type SegmentedBarHeat = "max" | "high" | "mid" | "low";
// rama nueva de SegmentedBarSegment: { heat: SegmentedBarHeat; role?: never; color?: never; tone?: never }
const heatClasses: Record<SegmentedBarHeat, string> = {
  max: "bg-danger-bold",
  high: "bg-brand-bold",
  mid: "bg-brand-strong",
  low: "bg-neutral-subtle-pressed",
};
```

- `low` usa `subtle-pressed` (el gris de borde) y no `neutral-strong`: el último paso debe leerse como "casi nada", no como un segmento más. Sobre una card blanca sigue visible por el contraste con el track `bg-neutral-subtle` (F4F4F5 vs E3E3E6 es poco; por eso en `separated` cada pieza es `rounded-pill` y se distingue por forma). Se documenta que para una leyenda al lado, el consumidor dibuje el punto `low` con borde.
- Docs: cuándo `heat` y cuándo `role`: `role` afirma el estado de *ese* segmento (esto está mal); `heat` ordena una distribución por gravedad (cuánto de lo que hay es grave). Ejemplo canónico: distribución de células por criticidad.

### D3. `SegmentedBar` — `total`

- `const denominator = total !== undefined ? Math.max(total, sum) : sum;` y `width = value / denominator`. Con `total > sum` queda track vacío al final (el contenedor ya tiene `bg-neutral-subtle`… **hoy no**: el contenedor de `SegmentedBar` no pinta track; se agrega `bg-neutral-subtle` al contenedor cuando `total` está definido, para que el vacío sea visible). En modo `separated` el track no tiene sentido visual (piezas sueltas); `total` + `separated` se acepta pero el vacío simplemente es espacio.
- `aria`: el `sr-only` de cada segmento no cambia; se agrega, cuando hay `total`, un `sr-only` final "N libre" no — eso es semántica del consumidor. Se deja fuera; el consumidor pone la lectura en texto.

### D4. `SegmentedBar` — `size`

`size?: "sm" | "md"` (default `md`): `sm` → `h-1.5`, `md` → `h-2`. Sólo altura; `gap`/radio no cambian.

### D5. `Progress` — `warningFrom`

```ts
const fill = brandFill ? "bg-gradient-brand"
  : isOver ? "bg-danger-bold"
  : warningFrom !== undefined && clamped >= warningFrom ? "bg-warning-bold"
  : "bg-success-bold";
```

`brandFill` sigue ganando (es relleno sin severidad). Valor fuera de 0–100 en `warningFrom` se clampa. Test nuevo `progress.test.tsx`: sin umbral (99/100/101), con 100 (99/100/101), con 85 (84/85/99/100).

### D6. `CapacityBar` (`capacity-bar.tsx`)

```ts
interface CapacityPart { label: string; value: number; tone: AccentTone }
interface CapacityBarProps extends HTMLAttributes<HTMLDivElement> {
  allocated: number; available: number; parts: CapacityPart[];
  unit?: string;                 // "FTE"
  warningFrom?: number;          // default 85
  freeLabel?: string;            // default "libre"  → "1.1 libre"
  atCapacityLabel?: string;      // default "Al tope"
  emptyLabel?: string;           // default "Sin capacidad asignada"
  decimals?: number;             // default 1
}
```

- Cabecera: cifra asignada en `tabular-nums font-semibold`, `/ disponible unidad` en `font-normal text-neutral-subtle`, y el % en `text-label tracking-normal` con la clase de severidad (`text-success/warning/danger-default`), `aria-label` "N % de ocupación".
- Barra: `<SegmentedBar size="sm" total={available} segments={parts} />` sin `separated`; el track vacío de `total` es lo libre.
- Leyenda: fila flex `gap-3` en `text-label font-normal tracking-normal text-neutral-subtle`, punto `h-1.5 w-1.5 rounded-pill` con la clase de acento (mapa literal para Tailwind), cifra en `font-semibold text-neutral-default`; al final `ml-auto`: libre o tope.
- Umbral: `pct = available > 0 ? round(allocated/available*100) : 0`; `atCapacity = pct >= 100`; warning desde `warningFrom`. Misma función que usa `Progress` (se extrae `severityFor(value, warningFrom)` a `lib/severity.ts` para que ambos coincidan).
- Vacía: `allocated === 0 && parts.length === 0`.
- Sin ancho propio: el consumidor lo limita (`max-w`); el mínimo lo da la cabecera.

### D7. `DistributionCard` (`distribution-card.tsx`)

```ts
type DistributionItem = { label: string; value: number } & SegmentedBarColor; // role | color | tone | heat, uno solo
interface DistributionCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string; total: number; totalNoun: string;   // "células" / "personas"
  items: DistributionItem[]; separated?: boolean;    // default true
  footer?: ReactNode;
}
```

- Compuesta con `Card`/`CardBody` (`flex flex-col gap-2`), cabecera `items-baseline justify-between` (rótulo `text-label text-neutral-subtle`, total `font-bold tabular-nums` + sustantivo), `SegmentedBar` con `items.filter(v > 0)`, leyenda `grid grid-cols-2 gap-x-4 gap-y-2`, pie `mt-auto border-t-default border-neutral-default pt-2 text-body-sm text-neutral-subtle`.
- El punto de leyenda reutiliza los mismos mapas de clase que `SegmentedBar` (se exporta `segmentFillClass(segment)` desde `progress.tsx` para no duplicar los cuatro mapas); `heat: "low"` suma `border-default border-neutral-bold`.
- Es exactamente la card que la app tiene en `PeopleStatsCards` (seniority), `SquadsStatsCards` (criticidad) y `SquadTeamStatsCards` (mix): las tres pasan a `DistributionCard` en el change de adopción.

### D8. `Meter` (`meter.tsx`)

```ts
interface MeterProps extends HTMLAttributes<HTMLDivElement> {
  value: number; warningFrom?: number; label?: string; minWidth?: string; // default "7rem"
}
```

Fila `flex items-center gap-2` con `<Progress className="flex-1" />` y la cifra en `text-body-sm font-semibold tabular-nums`. `Progress` ya deja la barra vacía en 0 y satura a `danger` sobre 100.

### D9. Docs y skill

`apps/docs/src/content/progress.tsx`: ejemplos "Sobre un total", "Escala de intensidad" (con la regla `heat` vs `role`/`tone`), "Compacta en fila" y "Umbral de advertencia". Páginas nuevas `capacity-bar.tsx`, `distribution-card.tsx`, `meter.tsx` con el ejemplo de capacidad por célula, el de distribución por criticidad y el de utilización. El build regenera registry y skill; los tres componentes se suman a la lista instalable.

## Risks / Trade-offs

- [`brand.strong` light (300) no alcanza 3:1 sobre blanco] → Aceptado y documentado: es un relleno de secuencia con leyenda, no un elemento que deba reconocerse solo; `verify-tokens` lo registra como informativo. Si un consumidor lo usa como superficie independiente, ese uso está fuera de contrato.
- [`total` agrega track al contenedor y cambia la apariencia cuando se usa] → Sólo cuando `total` está definido; los usos actuales no cambian.
- [Cuatro vocabularios en un mismo componente] → La unión discriminada los mantiene excluyentes; la documentación del "cuándo" es la que evita el mal uso, como ya pasa con `tone`.
- [Tres componentes nuevos con API de producto] → Se mantienen agnósticos de dominio (partes, total, unidad, textos configurables con defaults en español como el resto del sistema); la lectura de negocio va en el pie o en el consumidor.
- [La app sigue con sus barras locales hasta adoptar esto] → Change de adopción en el root de la app tras `pnpm run publish:local`: sus tres barras y las tres cards de distribución pasan a los componentes nuevos; hasta entonces no hay regresión, sólo duplicación.
