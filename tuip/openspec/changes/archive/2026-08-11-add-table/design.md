## Context

Ver `proposal.md` — Why para la motivación, y `specs/component-library/spec.md` para el contrato de comportamiento.

Estado actual relevante:

- `add-checkbox-radio-switch` fijó el criterio: construir a mano sobre el elemento HTML nativo cuando ya resuelve la semántica y el teclado, y adoptar una primitiva de Radix solo cuando no hay equivalente nativo (como en Switch). `<table>` tiene semántica y navegación de lector de pantalla completas de fábrica, así que este change aplica la misma rama que Checkbox y Radio, no la de Switch.
- `Card` fijó el patrón de compound components para contenedores con partes fijas (`Card`, `CardHeader`, `CardBody`, `CardFooter`), cada una envolviendo un `div` con su propio conjunto de clases de Tailwind. `Table` sigue el mismo patrón, pero cada parte envuelve el elemento de tabla nativo que le corresponde en vez de un `div` genérico.
- El archivo de definición de diseño (`design-system/Componentes Tuya.dc.html`, sección "Data table") describe un componente mucho más grande que lo que cubre este change: búsqueda, filtros, densidad, orden, selección, columnas fijas, paginación y virtualización. Ese documento es la referencia visual completa del sistema, no el alcance de un solo change — igual que la definición de dieciocho componentes no significa que cada change deba cerrar todos a la vez.

## Goals / Non-Goals

**Goals:**

- Que `Table` herede gratis la semántica y accesibilidad de `<table>` nativo, sin reimplementar roles ARIA que el navegador ya resuelve.
- Que la API compuesta refleje uno a uno los elementos HTML de tabla, para que quien conoce `<table>`/`<thead>`/`<tbody>`/`<tr>`/`<th>`/`<td>` reconozca la API sin aprender un vocabulario nuevo.
- Dejar un punto de partida estable sobre el que un change futuro pueda agregar orden, selección o paginación sin reescribir la estructura base.

**Non-Goals:**

- No se implementa orden por columna, selección de filas (con o sin Shift), paginación, búsqueda/filtros, densidad cómoda/compacta, cabecera o columnas fijas al scroll, ni virtualización de filas. Todo eso requiere estado, lo que cambia la naturaleza del componente de puramente estructural a interactivo, y no hay un caso real todavía que lo pida — se reconsidera con su propio change cuando aparezca.
- No se agrega ninguna librería de terceros (ni `@tanstack/react-table` ni una primitiva de Radix): una tabla estática sin interacción no necesita una capa headless.
- No cambia ningún componente existente. Button, Input, Card, Badge, Select y Combobox no se tocan.

## Decisions

### Table se construye sobre `<table>` nativo, sin librería headless

`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead` y `TableCell` envuelven directamente `table`, `thead`, `tbody`, `tfoot`, `tr`, `th` y `td`, cada uno extendiendo el tipo de atributos HTML del elemento que envuelve (mismo patrón que `Card`).

*Por qué:* es el mismo criterio de `add-checkbox-radio-switch` aplicado a un elemento con semántica nativa aún más completa que `<input>` — un lector de pantalla ya entiende cabeceras de columna, número de filas y celdas sin ningún atributo ARIA adicional. Envolverlo en una librería como `@tanstack/react-table` tendría sentido si este change incluyera orden o paginación, pero para una estructura estática solo agregaría peso y una API que aprender sin resolver nada que el HTML no resuelva ya.

*Alternativa considerada:* adoptar `@tanstack/react-table` desde el inicio, previendo las capacidades futuras. Se descarta para este change: acoplar la versión estática a una librería de estado que todavía no se usa sería diseñar para un requisito hipotético, y el criterio del repo (`Checkbox`/`Radio` mano, `Switch` Radix) es decidir por componente y por necesidad real, no por anticipación.

### Siete partes compuestas, una por elemento de tabla nativo

La API expone `Table` (`table`), `TableHeader` (`thead`), `TableBody` (`tbody`), `TableFooter` (`tfoot`, opcional), `TableRow` (`tr`), `TableHead` (`th`) y `TableCell` (`td`) — sin una prop de datos tipo `columns`/`rows` que genere las filas internamente.

*Por qué:* a diferencia de `Select`/`RadioGroup`, donde las opciones son intercambiables entre sí y por eso se reciben como `options: T[]`, una tabla es heterogénea fila a fila y columna a columna — cada celda puede necesitar su propio contenido, alineación o formato. Exponer las partes compuestas, igual que `Card`, deja que el consumidor arme la estructura con JSX normal, que es además lo que ya espera cualquiera familiarizado con `<table>` en HTML.

*Alternativa considerada:* una API de datos (`<Table columns={...} rows={...} />`) que genere el marcado internamente. Se descarta para esta primera versión: fuerza una forma de datos única antes de que haya un caso real que la valide, y es más difícil de extender hacia las capacidades futuras (selección, orden) sin romper la API — el patrón compuesto puede crecer agregando partes nuevas sin tocar las existentes.

### La convención de alineación y datos ausentes se documenta, no se fuerza con props

`TableCell` no recibe una prop `align` ni una prop `empty`; la alineación se logra pasando `className` (p. ej. `text-right tabular-nums`) y el "—" para datos ausentes es contenido que decide el consumidor.

*Por qué:* la definición ilustra la convención como una regla de uso ("números a la derecha con cifras tabulares", "un dato ausente es «—», nunca una celda vacía"), no como un estado que el componente deba calcular — el componente no sabe si un valor es "ausente" o simplemente un texto corto. Documentarla en `content/table.tsx` como guía de uso, con un ejemplo que la ilustra, es más honesto que una prop que solo aplica un puñado de clases que el consumidor puede pasar directamente.

## Risks / Trade-offs

- **Sin API de datos, armar una tabla grande implica escribir el JSX de cada fila a mano.** → Aceptado para esta primera versión: es el mismo costo que armar una tabla HTML hoy, y evita comprometerse a una forma de `columns`/`rows` antes de tener un caso real que la valide.
- **Las capacidades más pedidas de una tabla de datos (orden, selección, paginación) quedan fuera de este change.** → Es una decisión de alcance explícita, no un olvido — ver Non-Goals. El componente queda listo para extenderse en un change posterior sin romper la API actual.
- **La convención de alineación y "—" depende de que el consumidor la siga; el componente no la impone.** → Aceptado: forzarla requeriría que `TableCell` interprete el contenido de cada celda, lo que no es su responsabilidad en una versión puramente estructural.

## Migration Plan

1. Construir `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead` y `TableCell` sobre los elementos nativos de tabla, estilados con tokens.
2. Registrar `table` en `definitions.ts` como `stable`, categoría `layout`, y regenerar `registry.json`.
3. Escribir el contenido de documentación: anatomía de las siete partes, guía de uso con la convención de alineación y datos ausentes, y notas de accesibilidad.
4. Escribir los ejemplos en vivo: uno básico con cabecera y filas, y uno que ilustra una columna numérica alineada a la derecha con un dato ausente como "—".

Cada paso deja el monorepo compilando. Ningún paso toca un componente existente.

## Open Questions

Ninguna.
