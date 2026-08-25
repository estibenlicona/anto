## Why

La app de Gestión de Capacidad terminó componiendo tres barras a mano —la de Capacidad por célula, la de distribución por criticidad y la de dedicación/utilización— porque ninguna pieza de `tuip` cubre lo que necesitan: `SegmentedBar` reparte siempre el 100 % entre sus segmentos (no puede dejar un tramo vacío que signifique "libre"), sólo admite tres vocabularios de color (ninguno expresa una escala de intensidad sobre la marca), y `Progress` sólo advierte al superar 100. Además no existe un paso intermedio de la escala de marca, así que "marca atenuada" se resolvió con `opacity-45`. Cada una usa tokens, pero son `div`s propios con alturas y separaciones sueltas. Cerrar esas brechas en el sistema tiene dos partes: extender los primitivos (`SegmentedBar`, `Progress`, un token) y, sobre ellos, **publicar las tres barras como componentes de `tuip`**, para que la app las consuma tal cual y cualquier otra pantalla (Personas, el detalle de célula, futuras torres de control) repita el mismo patrón sin volver a componerlo.

## What Changes

- **Token `bg-brand-strong`** (`background.brand.strong`): el paso intermedio de la escala de marca (primitivo `brand[300]`), el equivalente al `strong` que ya tiene `neutral`. Para rellenos que deben leerse como "marca, pero menos" sin recurrir a opacidad. Con su CSS variable y su clase Tailwind, en ambos temas.
- **`SegmentedBar` gana `total`**: cuando se indica, cada segmento se dimensiona respecto a ese total y no a la suma de los segmentos; el resto queda como track vacío. Sin `total` se comporta como hoy.
- **`SegmentedBar` gana un cuarto vocabulario de color, `heat`** (`max` / `high` / `mid` / `low`), una escala ordinal de intensidad sobre la marca: peligro intenso → marca → marca atenuada (`brand-strong`) → neutro pressed. Excluyente con `role`, `color` y `tone`, como los otros tres. Para distribuciones ordenadas por gravedad (criticidad) donde el color dice "cuánto de esto es grave", no el estado de un elemento.
- **`SegmentedBar` gana `size`** (`"sm"` 6 px | `"md"` 8 px, por defecto `md`), para usarla en filas de tabla con la misma altura que `Progress`.
- **`Progress` gana `warningFrom`**: un umbral (0–100) a partir del cual el relleno por severidad pasa a `warning`, antes del `danger` por encima de 100. Sin él, conserva el comportamiento actual (éxito hasta 100, peligro por encima). Cubre tanto "advertir exactamente al 100" (`warningFrom={100}`) como "advertir desde 85".
- **Tres componentes nuevos**, compuestos sobre esos primitivos:
  - **`CapacityBar`**: capacidad asignada frente a una disponible — cabecera `asignado / disponible <unidad>` con el porcentaje de ocupación coloreado por umbral (éxito / advertencia / peligro), barra apilada de las partes sobre el total (`SegmentedBar` con `total`, tonos de acento), leyenda con las cifras de cada parte y la lectura de lo libre ("N libre") o "Al tope"; variante vacía ("Sin capacidad asignada"). Es la columna Capacidad del listado de células.
  - **`DistributionCard`**: la card de distribución que la app ya repite tres veces (seniority, criticidad, mix BAU/Transformación) — título, total en el slot derecho, `SegmentedBar` (cualquier vocabulario, incluido `heat`), leyenda en dos columnas con punto/etiqueta/valor y un pie opcional con una lectura derivada.
  - **`Meter`** (barra con cifra): un `Progress` con el porcentaje al lado, con umbral de advertencia — la dedicación de una persona en una célula, la utilización en Personas.
- Documentación de cada componente y opción en el docs site y en el skill, con la regla de cuándo usar `heat` frente a `role`/`tone`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `design-tokens`: "Tokens semánticos de color por rol y variante" incorpora el énfasis `strong` para el rol `brand` en `bg`.
- `component-library`: "Catálogo inicial de componentes" suma CapacityBar, DistributionCard y Meter; "Opciones del componente SegmentedBar" (total, heat, size) y "Opciones del componente Progress" (warningFrom); tres requisitos nuevos con las opciones de cada componente.

## Impact

- `packages/tokens`: `semantic-colors.ts` (`BrandBackground.strong` en light y dark), verificación de tokens, CSS generado, preset Tailwind (clase `bg-brand-strong` sale sola del preset por nombre).
- `packages/components`: `progress.tsx` (`SegmentedBar`: `total`, `heat`, `size`; `Progress`: `warningFrom`), `segmented-bar.test.tsx`, test nuevo de `Progress`, registry/skill regenerados por el build.
- `apps/docs`: `progress.tsx` (ejemplos de `total`, `heat`, `size`, `warningFrom`).
- `packages/components`: nuevos `capacity-bar.tsx`, `distribution-card.tsx`, `meter.tsx` con sus tests, exportados desde `index.ts`.
- Consumidores: la app adopta los componentes en un change propio de su root (sus tres barras locales pasan a ser `CapacityBar`, `DistributionCard` y `Meter`, y desaparece `opacity-45`); nada cambia para quien no los use.
- Publicación: `pnpm run publish:local` al terminar, como en los changes anteriores de `tuip` consumidos por la app.
