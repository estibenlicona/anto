## Context

Ver `proposal.md` — Why para la motivación, y `specs/component-library/spec.md` para el contrato de comportamiento.

Estado actual relevante:

- `add-table` fijó que `Table` no tiene estado propio ni prop de datos: cada parte compuesta (`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`) envuelve directamente su elemento HTML nativo, extendiendo sus atributos, sin lógica interna. Ese compromiso ya está publicado como `stable` y no se reabre en este change salvo en los dos puntos aditivos que se detallan abajo.
- El mockup de referencia (`design-system/Componentes Tuya.dc.html`, sección "Data table") muestra un único bloque visual continuo: toolbar, cabecera, filas y pie de paginación comparten un solo borde y radio. Ese detalle visual se decide explícitamente en la sección de Decisiones: no se persigue el borde compartido pixel a pixel, para no acoplar el marcado interno de `Table` al de sus componentes vecinos.
- El catálogo ya tiene primitivas reusables para partes del mockup que este change no necesita reconstruir: `Checkbox` (para selección de fila), `Select` (para un filtro de opción única como "Célula: todas"), `Icon` con `search`, `sort`, `close`, `chevron-down`, `chevron-right` ya disponibles en `icons/paths.ts`.

## Goals / Non-Goals

**Goals:**

- Que cada componente nuevo (`Pagination`, `Chip`, `SegmentedControl`, `TableToolbar`) sea útil y componible por sí solo, no solo "una pieza de Table" — ninguno importa ni depende de `table.tsx`.
- Que las dos extensiones a `Table` (densidad, cabeceras ordenables) sean estrictamente aditivas: código existente que usa `Table` sin estas props sigue compilando y viéndose exactamente igual.
- Que ningún componente nuevo posea estado de datos (páginas totales, filtros activos, orden actual, filas seleccionadas): todos son controlados por el consumidor, igual que `Select`/`Combobox`/`RadioGroup` ya lo son.

**Non-Goals:**

- No se construye un menú/dropdown para las acciones "···" por fila del mockup. Es una primitiva de overlay posicionado con su propio manejo de foco y teclado — comparable en complejidad a lo que fue adoptar Radix para Select/Combobox — y merece su propio change en vez de agregarse de paso aquí.
- No se agrega un slot de ícono a `Input`. El campo de búsqueda del mockup se resuelve componiendo el ícono `search` a mano dentro de `TableToolbar`, sin tocar la API ya estable de `Input`.
- No se implementa la lógica de búsqueda, filtrado, orden ni paginación de datos (fetch, comparadores, debounce). Este change entrega los controles de UI; la lógica de datos siempre vivió y sigue viviendo en el consumidor, igual que ya es cierto para `Select` con opciones asíncronas.
- No se agrega una prop de selección a `Table`. La columna de checkboxes se arma componiendo `Checkbox` dentro de `TableHead`/`TableCell`, documentado como patrón de uso — no como una capacidad nueva de `Table`.
- No se replica el borde único que funde toolbar + tabla + paginación en el mockup (ver Decisión más abajo).

## Decisions

### TableToolbar y el pie de paginación son tarjetas separadas, no un borde fundido con Table

`TableToolbar` se renderiza como su propio contenedor con borde y radio (`rounded-surface border border-neutral-default`), separado de `Table` por espaciado normal (`mb-3`/`mt-3`), en vez de compartir el borde de `Table` en un solo bloque visual continuo como en el mockup.

*Por qué:* fundir el borde requiere que `Table` sepa si tiene un `TableToolbar` arriba o una paginación abajo, para saber qué esquinas redondear y de qué lado omitir el borde — un acoplamiento estructural entre componentes que hoy son independientes. `add-table` ya decidió que `Table` no depende de nada a su alrededor; mantenerlo evita que agregar `TableToolbar` en el futuro rompa a alguien que usa `Table` solo. El costo es una diferencia visual menor (dos tarjetas separadas por un espacio en vez de una continua), que no cambia ninguna funcionalidad.

*Alternativa considerada:* un componente contenedor (`TableCard` o similar) que reciba `Table`, `TableToolbar` y `Pagination` como hijos y les quite el borde individual vía contexto. Se descarta para este change: es una capa de coordinación nueva sobre tres componentes que ya deben funcionar solos, y el mockup no es el requisito — es la referencia visual completa del sistema, igual que ya se aclaró en `add-table`.

### Table recibe `density` vía contexto de React, no una prop en cada parte

`Table` acepta `density?: "comfortable" | "compact"` y la expone a través de un contexto de React que `TableHead` y `TableCell` consultan para ajustar su padding vertical — el alto de fila cambia como efecto de ese padding, sin que `TableRow` necesite leer el contexto por sí misma. El consumidor sigue sin pasar `density` a cada fila o celda.

*Por qué:* las filas y celdas de una tabla las arma el consumidor con JSX plano (`add-table`, Decisión "Siete partes compuestas") — pedirle que repita `density` en cada `TableRow`/`TableHead`/`TableCell` de una tabla de cien filas sería un error de omisión esperando pasar. El contexto es el mecanismo estándar de React para una configuración que se fija una vez arriba y se lee muchas veces abajo, y no cambia la firma pública de `TableRow`/`TableHead`/`TableCell` — siguen aceptando los mismos atributos HTML nativos que ya aceptaban.

*Alternativa considerada:* que cada parte reciba su propia prop `density`. Se descarta por el motivo de arriba: viola el mismo principio que ya evitó una prop `columns`/`rows` en `add-table` — no imponerle al consumidor repetir información que es propiedad de la tabla completa, no de cada celda.

### TableHead ordenable es afordance + accesibilidad, sin lógica de orden

`TableHead` acepta `sortDirection?: "asc" | "desc"` y `onSort?: () => void`. Cuando `onSort` está presente, `TableHead` se renderiza como un botón accesible con el ícono `sort`, `aria-sort` reflejando `sortDirection`, y `onSort` conectado a click y Enter/Espacio. `TableHead` no ordena nada — solo avisa.

*Por qué:* es el mismo criterio que ya aplica `Select` para datos asíncronos (`add-table` — Table no conoce la forma de los datos): el ordenamiento real (comparador, estabilidad, multi-columna) es una decisión de cada consumidor que ninguna heurística genérica adivina bien. Lo que sí es responsabilidad del componente es la accesibilidad del afordance — que un lector de pantalla anuncie que la columna es ordenable y en qué dirección está ordenada ahora mismo, que es exactamente lo que un `<th>` con `aria-sort` ya estandariza en HTML.

*Alternativa considerada:* que `TableHead` reciba un arreglo de filas y una función comparadora y ordene internamente. Se descarta: obligaría a `Table` a conocer la forma de los datos que hoy ignora por completo, reabriendo la decisión central de `add-table` sin necesidad — el afordance de UI no requiere eso.

### Pagination no incluye el texto de resumen ("N de M")

`Pagination` solo renderiza los controles de navegación (anterior, números, siguiente). El texto "1 seleccionada de 24" del mockup no es parte del componente.

*Por qué:* ese texto mezcla dos conceptos independientes — cuántos ítems hay en total y cuántos están seleccionados, algo que ni siquiera aplica si la tabla no tiene selección — y su redacción exacta (singular/plural, con o sin selección) es contenido de producto, no de un componente de navegación reusable. El consumidor lo compone como texto libre en el mismo contenedor flex donde coloca `Pagination`.

*Alternativa considerada:* una prop `summary` o `totalItems`/`selectedCount` en `Pagination`. Se descarta: acoplaría un componente de navegación genérico a un caso de uso específico (tablas con selección), cuando `Pagination` debe servir igual para una lista sin selección alguna.

### Selección de filas se documenta, no se implementa como prop de Table

La columna de checkboxes de selección (incluida "seleccionar todas") se arma componiendo el `Checkbox` ya existente dentro de `TableHead`/`TableCell`, con el estado de selección y el indeterminado del "seleccionar todas" administrados por el consumidor — igual que ya hace cualquier formulario con varios `Checkbox` relacionados.

*Por qué:* `Checkbox` ya resuelve marcado/desmarcado/indeterminado (`add-checkbox-radio-switch`); no hay nada que una prop de selección en `Table` agregue que componer `Checkbox` a mano no cubra ya, y agregarla reabriría la decisión de que `Table` no conoce la forma de los datos.

## Risks / Trade-offs

- **La tarjeta de toolbar/tabla/paginación no queda visualmente fundida en un solo borde como en el mockup.** → Aceptado: ver Decisión de arriba. Es una diferencia puramente visual, documentada, no una limitación funcional.
- **`density` vía contexto es invisible en la firma de tipos de `TableRow`/`TableHead`/`TableCell`** — quien lea solo esos componentes no ve de dónde sale el padding que aplican. → Aceptado: es el mismo trade-off que cualquier contexto de React; se documenta explícitamente en `content/table.tsx` y en el código con un comentario en el contexto mismo.
- **`onSort` sin lógica de orden real puede dejar una cabecera que parece ordenar pero no hace nada si el consumidor no la conecta a datos.** → Es responsabilidad del consumidor, documentada con un ejemplo completo (estado de orden + comparador) en `examples/table/*.tsx`, igual que ya es cierto para las opciones asíncronas de `Select`.
- **Cuatro componentes nuevos en un solo change es más que el patrón incremental habitual del catálogo** (`add-select-and-combobox`, `add-checkbox-radio-switch` agregaron de a dos o tres). → Decisión explícita del equipo para este change, ya conversada; cada componente es independiente y no depende de los otros tres, así que el riesgo de acoplamiento entre ellos es bajo aunque el conteo sea alto.

## Migration Plan

1. Construir `Pagination`, `Chip` y `SegmentedControl` como componentes independientes, sin importar `table.tsx`.
2. Construir `TableToolbar` como contenedor de layout puro.
3. Extender `table.tsx`: agregar el contexto de densidad (`Table` lo provee, `TableRow`/`TableHead`/`TableCell` lo consumen) y las props `sortDirection`/`onSort` de `TableHead`.
4. Registrar los cuatro componentes nuevos en `definitions.ts` como `stable`, y regenerar `registry.json`.
5. Escribir el contenido de documentación de los cuatro componentes nuevos, y actualizar `content/table.tsx` con las secciones de densidad, orden y el patrón de selección de filas.
6. Escribir los ejemplos en vivo, incluido un ejemplo de Table que combina `TableToolbar` + densidad + orden + selección + `Pagination` para mostrar la integración completa que pide el mockup.

Cada paso deja el monorepo compilando. Los pasos 1-2 no tocan ningún archivo existente; el paso 3 es aditivo sobre `table.tsx`.

## Open Questions

Ninguna.
