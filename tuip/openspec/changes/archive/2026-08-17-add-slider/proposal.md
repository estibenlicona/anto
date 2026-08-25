## Why

El catálogo puede mostrar un valor sobre un continuo pero no dejar que alguien lo fije: `SegmentedBar` y `Progress` son de solo lectura y `SegmentedControl` elige entre opciones discretas. Nada se arrastra.

Lo que destapa el hueco: Parámetros del modelo necesita editar las cinco bandas de esfuerzo que parten 0–100%. Esas bandas comparten límites — XS termina donde empieza S — así que mover uno mueve dos bandas a la vez. Como diez campos numéricos sueltos, esa invariante queda a cargo de quien edita, que puede dejar huecos, solapes o un total distinto de 100. Como pulgares sobre una misma pista hay un solo número por límite, y los estados inválidos dejan de ser representables.

Ningún elemento nativo resuelve varios pulgares: `<input type="range">` tiene uno solo. Es el mismo motivo por el que `Tabs` se apoya en Radix en vez de hacerlo a mano.

## What Changes

- Agregar `Slider`, construido sobre `@radix-ui/react-slider`, que fija uno o más valores sobre un rango numérico. Un pulgar por valor, sin que puedan cruzarse entre sí.
- Aceptar una separación mínima entre pulgares, para que un tramo no pueda colapsar a cero.
- Aceptar segmentos opcionales que describen los tramos entre pulgares: sin ellos el control se ve como un slider corriente; con ellos cada tramo se pinta con su color y su rótulo, que es lo que vuelve legible una partición de un vistazo.
- Los colores de segmento SHALL venir del mismo vocabulario categórico que ya usa `Tag`, extraído a un módulo compartido para que ninguno de los dos componentes dependa del otro. `TagColor` queda como alias, así que nada que hoy lo importe se rompe.
- Registrar `Slider` en el registry y documentarlo con su página y ejemplos.
- Sin cambios **BREAKING**: `Slider` es aditivo y la extracción del tipo de color no altera ninguna API pública.

## Capabilities

### New Capabilities

(none — extiende la capability `component-library` existente)

### Modified Capabilities

- `component-library`: agrega `Slider` al catálogo y define su comportamiento — varios pulgares que no se cruzan, separación mínima, y segmentos opcionales rotulados y coloreados.

## Impact

- `packages/components/src/slider.tsx` — componente nuevo, exportado desde el índice del paquete.
- `packages/components/src/lib/categorical-color.ts` — el vocabulario de color compartido; `packages/components/src/tag.tsx` pasa a importarlo y conserva `TagColor` como alias.
- `packages/components/registry/definitions.ts` — entradas nuevas para `slider` y para el módulo de color; `tag` suma esa dependencia.
- `packages/components/package.json` — nueva dependencia `@radix-ui/react-slider`.
- `apps/docs/src/content/slider.tsx`, `apps/docs/src/content/index.ts`, `apps/docs/src/examples/slider/` — página, registro y ejemplos.
- Habilita el cambio siguiente en `admin-shell`: el modal de edición de bandas de talla, con su guardado.
