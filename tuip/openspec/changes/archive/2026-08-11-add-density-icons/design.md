## Context

Ver proposal.md - Why. La librería de iconos se dibuja en `design-system/Iconografia Tuya.dc.html` y se extrae con `pnpm --filter @tuya-ui/components extract:icons` (`packages/components/scripts/extract-icons.ts`) hacia `src/icons/paths.ts` — nunca se edita ese archivo a mano. El extractor valida, por familia, que la cantidad de celdas encontradas coincida con un `expected` declarado tanto en el propio script como en el encabezado de la sección del mockup (`"Datos y análisis · 10"`).

`SegmentedControl` (`packages/components/src/segmented-control.tsx`) hoy renderiza `option.label` como único contenido de cada `<label>`; no distingue entre una opción de texto y una de solo-icono.

## Goals / Non-Goals

**Goals:**
- Dar de alta dos iconos (`density-comfortable`, `density-compact`) que sigan exactamente las reglas de construcción vigentes (retícula, trazo 1.5, solo contorno, terminales y uniones redondas) y reusen el rectángulo guía que ya usan `table`/`layout`.
- Que `SegmentedControl` pueda mostrar una opción como icono, con nombre accesible, sin romper el uso existente por texto (que sigue siendo el modo por defecto).

**Non-Goals:**
- Migrar todo uso existente de `SegmentedControl` a iconos — solo la densidad los adopta en este change; el resto de sus usos (si los hubiera) sigue en texto.
- Dar el boceto de los iconos por definitivo. Ver Risks/Trade-offs.

## Decisions

### Geometría de los iconos: rectángulo guía + divisores horizontales, sin divisores de columna

Ambos iconos reusan el rectángulo de `table`/`layout` (`x=3.5 y=4 width=17 height=16 rx=2` — el mismo módulo de 17×16 sobre el que ya se apoyan dos iconos existentes) y se diferencian por la cantidad de divisores horizontales dentro de él:

- `density-comfortable`: 2 divisores → 3 filas altas.
  `<rect x="3.5" y="4" width="17" height="16" rx="2"></rect><path d="M3.5 9.5h17M3.5 14.5h17"></path>`
- `density-compact`: 4 divisores → 5 filas finas.
  `<rect x="3.5" y="4" width="17" height="16" rx="2"></rect><path d="M3.5 7.2h17M3.5 10.4h17M3.5 13.6h17M3.5 16.8h17"></path>`

Se descartó imitar `menu` (tres líneas sin caja): a esa distancia conceptual ("filas de una tabla", no "navegación") le corresponde partir del mismo lenguaje visual que ya usa `table`, no el de `menu`. La diferencia con `table` es justamente la ausencia de divisores verticales — `table` comunica grilla (filas y columnas), estos dos comunican solo la altura de fila, que es lo único que la densidad cambia.

### Familia: `data`, no una familia nueva

`table` ya vive en la familia `data` ("Datos y análisis") y estos dos iconos son variantes directas de ese mismo concepto (cómo se ve una tabla, no cómo se navega). Se agregan ahí en vez de crear una familia nueva; su conteo pasa de 10 a 12, y se actualiza tanto el `expected` en `extract-icons.ts` como el texto `"Datos y análisis · 10"` del mockup (a `12`), porque el extractor valida ambos.

### `SegmentedControlOption.icon`: prop opcional, reemplaza el texto en vez de acompañarlo

Se agrega `icon?: ReactNode` a `SegmentedControlOption`. Cuando está presente, el `<label>` renderiza el icono en lugar de `option.label`, y `option.label` pasa a usarse como `aria-label` del `<label>` (o del `<input>`, según lo que mejor anuncien los lectores de pantalla al recorrer el fieldset) en vez de como texto visible. No se agrega un modo "icono + texto": la definición pide reemplazar el texto, y una opción con las dos cosas a la vez no es lo que se pidió ni resuelve el motivo original (los botones ocupan menos espacio en la toolbar de la tabla).

Alternativa descartada: agregar el icono como decorativo (`aria-hidden`) junto al texto visible, dejando el texto en pantalla. Se descarta porque el pedido es explícito ("en lugar de texto"), no "además de".

## Risks / Trade-offs

- [El boceto de los dos iconos nuevos no pasó por una revisión visual humana — el propio método de la spec de iconografía exige comprobar que "no desentona junto a los existentes" y que se lee con claridad en el tamaño menor (16px)] → Mitigación: se deja como tarea explícita en tasks.md abrir el mockup renderizado y confirmar ambos puntos antes de correr la extracción; si `density-compact` (5 filas en 16px) no se lee con claridad, la alternativa es bajar a 4 filas en vez de 5, documentada aquí para no tener que volver a diseñar desde cero.
- [Cambiar el conteo esperado de la familia `data` en dos lugares (`extract-icons.ts` y el propio mockup) es fácil de desincronizar] → Mitigación: el script ya falla ruidosamente si los conteos no coinciden (comprobado leyendo `extract-icons.ts`), así que un desajuste se detecta al correr `extract:icons`, no en silencio.
- [Accesibilidad de la opción-icono depende de qué elemento reciba el `aria-label` dentro del `<label>` que ya envuelve un `<input type="radio">` visualmente oculto] → Mitigación: seguir el mismo patrón que ya usa Checkbox/RadioGroup (el `<input>` es el elemento realmente enfocable y anunciado); el `aria-label` se aplica ahí, no en el `<label>` contenedor.
