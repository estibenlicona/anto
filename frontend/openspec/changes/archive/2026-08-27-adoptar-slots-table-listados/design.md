## Context

Los cinco listados comparten la misma forma con pequeñas variaciones:

| Listado | Barra | Carga / error | Sin resultados |
|---|---|---|---|
| `SquadsList` | siempre (con resultados o filtro) | dentro del flujo, barra montada | `EmptyState` fuera de la card |
| `PeopleList`, `InitiativesList`, `AllocationsList` | idem | **return temprano**: la barra desaparece | `EmptyState` fuera de la card |
| `BillingList` | sólo si hay más de un proveedor | dentro del flujo | `EmptyState` fuera de la card |

Todos envuelven `<Table flush>` + `PaginationBar` en `<div className="overflow-hidden rounded-surface border border-neutral-default">` y le pasan a `PaginationBar` `className="border-t border-neutral-default bg-neutral-subtlest px-4 py-3"`. El estado vacío de primera vez (sin datos, sin filtro) es un `return` temprano con `EmptyState` a pantalla completa en todos.

La librería se consume como tarball local (`file:../tuip/.local-packages/...`); el change `table-slots-toolbar-footer` de tuip provee `Table` con `toolbar`/`footer`. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Los cinco listados usan los slots y dejan de dibujar la card a mano.
- Barra montada en carga/error/sin resultados en los cinco (hoy sólo Células).
- Una sola pieza compartida para la fila de estado.

**Non-Goals:**
- Tocar tablas sin barra de filtros ni los detalles de célula/persona.
- Cambiar textos, filtros, columnas o la lógica de datos de ningún listado.
- Cambiar el estado vacío de primera vez.

## Decisions

**1. Los estados de datos van en una fila de ancho completo, no en un slot.**
Con la barra dentro de la card, sacar el `EmptyState`/`Alert`/"Cargando…" fuera de ella haría saltar la barra o dejaría una card con sólo la barra. Renderizarlos como `<TableRow><TableCell colSpan={n}>…</TableCell></TableRow>` bajo las cabeceras mantiene la card estable, deja las cabeceras como contexto y es el patrón habitual de las tablas de datos. Alternativa: pedirle a tuip un slot `empty` — descartado porque Table no debería conocer estados de datos (misma razón por la que no tiene `loading`).

**2. `TableStatusRow` en `src/shared/components/`.**
Un componente de ~15 líneas (`colSpan`, celda centrada con padding vertical generoso, `children`) evita repetir el `colSpan` mágico en cinco archivos y da un único lugar donde ajustar el aire. Recibe `colSpan` explícito: contar `TableHead` desde el componente sería frágil. Se queda en el frontend; si otro consumidor de tuip lo pide, sube a la librería.

**3. La paginación no se muestra en los estados de carga, error ni sin resultados.**
`footer` se pasa sólo cuando hay filas (`footer={rows.length > 0 ? <PaginationBar …/> : undefined}`). Una paginación "Mostrando 0 de 0" bajo un "Sin resultados" es ruido, y durante la carga los totales todavía no existen. Table no dibuja pie si el slot es `undefined`.

**4. Los `return` tempranos de carga y error se eliminan en Personas, Iniciativas y Asignaciones.**
Es el defecto que `SquadsList` ya corrigió y documentó en un comentario: cada cambio de filtro desmontaba el panel del filtro y el campo de búsqueda perdía el foco. Se mueve la decisión de qué mostrar al cuerpo de la tabla, en el mismo orden que Células (carga → error → sin resultados → filas). El estado vacío de primera vez sigue siendo un `return` temprano: ahí no hay barra que preservar.

**5. `BillingList` conserva su condición de barra.**
`toolbar={providers.length > 1 ? <…/> : undefined}`: con un solo proveedor no hay nada que filtrar y Table no dibuja la zona. Es la única variación de barra entre los cinco y se mantiene.

**6. El `overflow-hidden` desaparece con la card manual.**
Ese wrapper era lo que la documentación de Table advierte que anula `stickyFirstColumn`. Ningún listado usa columna fija hoy, pero el día que una tabla ancha la necesite ya no habrá que descubrir por qué no funciona.

**7. Actualización de la librería por tarball.**
`pnpm publish:local` en tuip imprime la ruta del `.tgz` nuevo; se reemplaza en `package.json` (`file:../tuip/.local-packages/tuya-ui-components-<versión>.tgz`) y se corre `pnpm install`. Si el empaquetado también sube `@tuya-ui/tokens`, se actualiza igual.

## Risks / Trade-offs

- [Tests que afirman la barra ausente durante la carga en Personas/Iniciativas/Asignaciones] → Se invierten: ahora la barra debe estar. Los que buscan "Cargando…", la alerta o "Sin resultados" por texto siguen pasando dentro de la celda.
- [Tests que localizan la card por `closest("div")` o por la clase `rounded-surface`] → Se revisan al migrar cada listado; el marco lo pinta Table y la clase sigue existiendo, pero en otro nodo.
- [El `EmptyState` centrado dentro de una celda se ve distinto al de pantalla completa] → Intencional: es un "sin resultados" de tabla, más contenido, y `TableStatusRow` le da el aire vertical para que no se aplaste.
- [Frontend y tuip avanzan a la vez] → El frontend no compila con los slots hasta que el tarball nuevo esté instalado; el orden de tareas lo refleja (tarball primero).
