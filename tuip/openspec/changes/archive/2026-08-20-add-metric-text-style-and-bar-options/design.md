## Context

`textStyle` (en `packages/tokens/src/typography.ts`) define hoy seis estilos: `display` (34px/40/600, documentado como "título de pantalla, uno por vista, arriba a la izquierda"), `headingLg`, `headingMd`, `body`, `bodySm` y `label`. `fontWeight` expone tres pesos: 400, 500 y 600. Aparte, `numeric` aporta solo `fontVariantNumeric: "tabular-nums"`, sin tamaño ni peso. `Progress` y `SegmentedBar` viven ambos en `packages/components/src/progress.tsx`. La paleta primitiva de marca va de `brand.50` a `brand.900`, con `500` como acción principal. No existe ningún degradado en el sistema: ni en componentes, ni en tokens, ni en specs. Ver proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Cerrar el hueco entre lo que el requisito de la escala tipográfica ya declara cubrir ("y las cifras") y lo que la escala define.
- Dar a `SegmentedBar` y `Progress` las dos opciones de presentación que les faltan, sin cambiar el comportamiento de ningún consumidor actual.

**Non-Goals:**
- No se abre la escala tipográfica a tamaños arbitrarios ni se agregan escalones intermedios: se agrega un rol con nombre y la escala sigue cerrada.
- No se agrega más de un peso: el conjunto pasa de tres a cuatro y ahí se queda (ver Decisions).
- No se generaliza el degradado a otros componentes: el único consumidor en este cambio es `Progress`, vía una opción explícita.
- No se toca el repo de la app; consumir esto allá es trabajo del change `add-people-dashboard-cards`, en su propio root.

## Decisions

**El estilo de cifra es un rol nuevo, no un octavo tamaño**: el requisito "Escala tipográfica del sistema" ya afirma que la escala cubre "el título de pantalla, los títulos de sección y de tarjeta, el cuerpo, el cuerpo pequeño, la etiqueta **y las cifras**", pero ningún estilo cumplía ese último rol — `numeric` solo aporta el ancho tabular. Quien necesitaba una cifra dominante terminaba usando `display`, que tiene otro rol documentado. Por eso esto se modela como completar un rol declarado y no como abrir la escala; el escenario "La escala es cerrada" se conserva intacto.

*Alternativa descartada*: usar `display` para la cifra. Es lo que se venía haciendo, y es justamente el problema — obliga a un título de pantalla y a una cifra de tarjeta a compartir estilo, y deja la pantalla sin poder distinguirlos jerárquicamente.

*Alternativa descartada*: un valor suelto en el consumidor (`text-[40px]`). Contradice el propósito de la escala y deja el tamaño fuera del sistema, invisible para el resto de los consumidores.

**El estilo de cifra usa un peso `bold` nuevo (700)**: `fontWeight` expone hoy tres pesos (400 regular, 500 medium, 600 semibold) y el estilo de cifra suma un cuarto, 700. El requisito de la escala pide "un conjunto acotado de pesos" sin enumerarlos, y cuatro sigue siendo un conjunto acotado — por eso el delta de specs no necesita tocarse. La cifra dominante de un indicador es el elemento que más peso visual carga en su tarjeta, y el 600 la deja compitiendo de igual a igual con los títulos que la rodean, que ya usan ese mismo peso; el 700 es lo que la separa de ellos.

*Alternativa descartada*: dejar la cifra en 600 y confiar solo en el salto de tamaño. Funciona, pero deja la cifra con el mismo peso que `display`, `headingLg` y `headingMd` — el tamaño distingue, el peso no aporta nada, y la jerarquía queda apoyada en un solo eje.

**El degradado es un token, no un valor en el componente**: el requisito de color del sistema exige que los tokens deriven de la paleta primitiva y "nunca de valores hexadecimales sueltos". El degradado se define como token con sus extremos tomados de pasos de `brand`, y `Progress` lo consume por nombre. Con esto el degradado queda disponible y auditable en un solo lugar, en vez de incrustado en un componente.

**Ambas opciones de componente son opt-in**: tanto la separación de segmentos de `SegmentedBar` como el relleno de marca de `Progress` se agregan como opciones explícitas con el comportamiento actual por defecto. En `Progress` esto es especialmente importante: su color codifica severidad (dentro de rango / excedido), y volver el degradado el default reasignaría ese significado para todos los consumidores actuales de golpe. El spec recoge esa condición como escenario propio en ambos componentes, para que el default no se pueda cambiar sin darse cuenta.

**La separación de segmentos afecta el contenedor, no solo los hijos**: hoy `SegmentedBar` recorta las esquinas en el contenedor (`overflow-hidden` + radio) y los segmentos son rectángulos planos que se recortan contra él. Con separación, el redondeo pasa a cada segmento y el contenedor deja de recortar — si no, las esquinas internas de cada pieza quedarían comidas por el recorte del padre.

## Risks / Trade-offs

- [El estilo de cifra se usa como "un display más grande" y reaparece el problema que venía a resolver] → Mitigado documentando su rol en el token y en la página de fundamentos de tipografía, igual que ya se hace con `display` ("uno por vista, arriba a la izquierda").
- [El degradado abre la puerta a que el sistema se llene de degradados decorativos] → Mitigado acotándolo en el spec a rellenos decorativos, con un escenario explícito que prohíbe usarlo donde el color comunique severidad.
- [El peso 700 queda disponible para cualquier componente y erosiona el "conjunto acotado"] → Mitigado dejándolo documentado como el peso del estilo de cifra, igual que los otros tres están documentados por rol ("body, interface emphasis, and titles"); un peso sin rol asignado es lo que abriría la puerta, no su existencia.
