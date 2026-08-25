## Context

Ver proposal.md - Why, en particular la nota de trazabilidad: la fuente visual de este change es una captura, no `design-system/Componentes Tuya.dc.html`. Eso cambia qué tipo de decisiones se pueden tomar por comparación directa (hex exacto, spacing en píxeles) y cuáles hay que tomar por coincidencia semántica con precedentes ya establecidos en el catálogo. Este documento se apoya en lo segundo cada vez que lo primero no es posible, y lo dice explícitamente en cada caso.

Dos precedentes ya resueltos en el catálogo cargan la mayor parte del diseño:
- `Badge` (`packages/components/src/badge.tsx`) ya resolvió el mapeo color↔rol de estado (`success`/`info`/`warning`/`danger`/`discovery`/`neutral`) contra los tokens semánticos, incluida la excepción de `neutral` (sin paso `bold` propio, se resuelve con `bg-current` + `text-neutral-subtle`).
- `EmptyState` ya resolvió la pregunta "¿este componente trae su propia superficie o se apoya en la de quien lo contiene?" a favor de lo segundo, para componentes pensados para vivir dentro de otro (una tarjeta, un panel).

## Goals / Non-Goals

**Goals:**
- Un componente cuya API haga cumplible el orden "actor, luego acción" como estructura, no como convención de uso — la misma lógica que llevó a que `ModalHeader` resuelva `Dialog.Title` por dentro en vez de pedirle al consumidor que arme el título a mano.
- Reusar el mapeo color↔rol de `Badge` sin declarar un token nuevo ni reabrir esa decisión.

**Non-Goals:**
- Extraer valores exactos (hex, spacing en píxeles) de la captura. Una imagen no es una fuente verificable con el mismo rigor que el `.dc.html` — lo que se fija acá es la estructura y el mapeo semántico de color, apoyado en tokens y precedentes ya existentes, no una medida leída de una captura.
- Ordenar o agrupar las entradas automáticamente. `ActivityTimeline` renderiza sus `children` en el orden que el consumidor los pasa, igual que `Table` no reordena sus filas y `Menu` no reordena sus ítems.
- Un `ActivityTimelineItem` que además muestre un ícono. La captura no lo pide (el punto de color es toda la marca visual), y agregarlo ahora sería una superficie sin motivo.
- Actualizar `design-system/Componentes Tuya.dc.html` con esta sección. Editar ese archivo durante el planning excede el alcance de un `/opsx:propose` (solo planning, sin tocar el repositorio) y no es necesario para construir el componente — si en algún momento se agrega la sección al mockup real, ese es un ajuste aparte, no parte de este change.

## Decisions

### Familia compuesta `ActivityTimeline` + `ActivityTimelineItem`

Mismo patrón que `Card`/`CardBody` o `Menu`/`MenuItem`: la lista es el contenedor semántico, cada entrada es una pieza independiente que el consumidor compone. Se descartó una prop `items: TimelineEntry[]` por la misma razón que se descartó para `Menu` — cada entrada puede necesitar contenido enriquecido (un detalle con un link, una acción propia) que un objeto de configuración no representa bien.

`ActivityTimeline` renderiza un `<ol>` y cada `ActivityTimelineItem` un `<li>`: es una secuencia cronológica, no una lista sin orden — la diferencia semántica que distingue `<ol>` de `<ul>` es exactamente la que aplica acá, y se la lleva un lector de pantalla gratis.

### `actor` y `action` como props separadas, no un nodo de texto libre

La definición de la captura es explícita: "cada entrada nombra al actor, la acción y el objeto, en ese orden". Si `ActivityTimelineItem` aceptara un solo `children` de texto libre, ese orden y ese énfasis tipográfico dependerían de que cada consumidor recuerde escribir `<strong>` antes del nombre — exactamente el tipo de disciplina que ya se decidió no exigir en `ModalHeader`. Separar `actor` (renderizado en negrita) de `action` (regular, en la misma línea) hace que el requisito del delta de spec sea cumplible por construcción, no por convención.

### El color del punto reusa exacto el mapeo de `Badge`

`success`/`info`/`warning`/`danger`/`discovery`/`neutral`, con la misma resolución que ya tiene `Badge` para cada uno (`bg-{role}-bold`, y `bg-current text-neutral-subtle` para `neutral` por no tener paso `bold` propio). No se declara un token nuevo ni se reinterpreta ninguno — es la misma decisión, aplicada a un punto de mayor tamaño porque acá el punto es el ancla visual de toda una fila y no un acento inline dentro de una etiqueta corta.

### Sin superficie propia, mismo criterio que `EmptyState`

La captura muestra el timeline dentro de una tarjeta blanca con borde — pero esa misma chrome (`background:#FFFFFF; border:1px solid #E3E3E6; border-radius:6px; padding:32px`) es el marco genérico que envuelve *cada* sección del mockup, no algo específico de este componente. `ActivityTimeline` no trae fondo ni borde propios: vive dentro de un `Card`, del `DrawerBody` de un detalle de fila, o de cualquier contenedor que el consumidor ya tenga — el caso de uso que motiva este change ("Es el respaldo de auditoría del flujo de aprobaciones") apunta justo a integrarlo en un Drawer de detalle, que ya provee su propia superficie.

### El color es refuerzo, la acción siempre se cuenta en texto

Ningún punto de color lleva información que no esté también en `action`: "aprobó", "detectó umbral superado", "creó", "actualizó" ya distinguen la naturaleza del evento sin necesidad del color. El delta de spec lo fija como requisito en vez de dejarlo como intención, siguiendo el mismo principio de accesibilidad que ya rige para los íconos del sistema (`iconography`: "Ningún icono SHALL ser el único portador de una información").

### Línea de conexión entre puntos, suprimida en la última entrada

El rasgo que distingue un "timeline" de una lista simple es la línea vertical que conecta los puntos. Se implementa como un elemento dentro de cada `<li>` (un punto seguido de un segmento de línea que ocupa el espacio hasta la siguiente entrada), suprimido en la última entrada vía el selector `:last-child` — sin lógica de React para calcular "es la última", que obligaría a `ActivityTimeline` a inspeccionar sus `children` en vez de dejar que cada `ActivityTimelineItem` sea independiente.

### Categoría de registro: `feedback`

Junto a `EmptyState`, `Skeleton` y `Toast` — componentes que informan un estado al usuario en vez de capturar una acción suya. No es `layout` (no estructura contenido genérico como `Table` o `Card`) ni `overlays` (no flota ni se superpone a nada).

## Risks / Trade-offs

- **La fuente es una captura, no un archivo verificable por grep** → Mitigación: cada decisión de color se apoya en un precedente ya validado (`Badge`) por coincidencia semántica, no en un valor leído de la imagen; ninguna medida en píxeles de la captura se traslada literalmente al componente. Si la sección aparece más adelante en `design-system/Componentes Tuya.dc.html`, ese es el momento de reconciliar cualquier diferencia — no bloquea este change.
- **`actor`/`action` como props separadas es más rígido que un `children` libre** → Mitigación: es la misma clase de trade-off que ya se aceptó para `ModalHeader` (un `title` prop en vez de children libres) — se cede flexibilidad de composición a cambio de que el requisito de orden y énfasis sea imposible de omitir por descuido.
