## Context

Ver `proposal.md` - Why. `Accordion` es una familia compuesta nueva; no existe ningún `Collapsible` previo en `packages/components/src` sobre el que apoyarse. Los componentes compuestos ya existentes (`Tabs`, `Table`, `Menu`) fijan el patrón a seguir: exportar cada parte por separado, tipar sus props reexportando `ComponentPropsWithoutRef` de la primitiva de Radix subyacente, y aplicar clases con `cn`.

## Goals / Non-Goals

**Goals:**
- Definir la anatomía exacta de `Accordion`, `AccordionItem`, `AccordionTrigger` y `AccordionContent`, y cómo se apoyan en `@radix-ui/react-accordion`.
- Fijar qué props expone cada parte más allá de las que ya trae la primitiva (p. ej. si `AccordionTrigger` necesita alguna prop propia como `count` en `TabsTrigger`).

**Non-Goals:**
- No se define contenido anidado (acordeón dentro de acordeón): la definición de `Sidebar` ya prohíbe "acordeones anidados" como patrón de navegación, y este componente no introduce una excepción para contenido de página.
- No se agrega una variante "borderless" ni de tarjeta separada por ítem; una sola presentación visual (lista con divisores) alcanza para el caso de uso actual (FAQ, detalle de fila, filtros).

## Decisions

**Primitiva: `@radix-ui/react-accordion`, no una implementación propia con `<details>`.**
`<details>`/`<summary>` nativos no soportan el modo `multiple` con salida controlada por prop, no exponen fácilmente animación de altura, y no coordinan el cierre mutuo del modo `single` sin JavaScript adicional. Radix ya resuelve la navegación por teclado y la semántica ARIA (`aria-expanded`, `aria-controls`) igual que lo hace para `Tabs` y `Menu`, manteniendo la misma decisión arquitectónica del resto del catálogo: primitivas headless de Radix para cualquier patrón que el HTML nativo no cubra completo.

**Anatomía en cuatro partes, igual que `Tabs`.**
`Accordion` (envoltorio de `Root`, recibe `type="single" | "multiple"`), `AccordionItem` (envoltorio de `Item`, recibe `value` y `disabled`), `AccordionTrigger` (envoltorio de `Trigger` dentro de un `Header`, con el ícono `chevron-down`), `AccordionContent` (envoltorio de `Content`). No se colapsa `Header` y `Trigger` en una sola parte expuesta porque Radix los requiere como elementos separados para la semántica de encabezado; `AccordionTrigger` monta ambos internamente para que el consumidor no tenga que conocer ese detalle, igual que `TabsTrigger` no expone el `Header` que Radix Tabs no requiere pero Accordion sí.

**Rotación del ícono por atributo de datos, no por prop de estado.**
`AccordionTrigger` rota su `chevron-down` con una clase condicionada a `data-[state=open]`, el mismo mecanismo por el que `TabsTrigger` ya condiciona su estilo activo a `data-[state=active]` — sin estado de React local ni prop adicional que el consumidor deba sincronizar.

**Sin animación de expandir/colapsar, igual que el resto del catálogo.**
Ningún componente existente (`Select`, `Combobox`, `Modal`, `Drawer`, `Menu`, `Tooltip`) anima su apertura o cierre — todos aparecen y desaparecen de inmediato según el `data-state` de Radix. `AccordionContent` sigue esa misma convención: se corrige así una suposición incorrecta de un borrador anterior de este documento, que afirmaba que `Select`/`Combobox` ya animaban su contenido desplegable con variables de Radix Popper. Introducir la primera animación del catálogo justamente acá, sin que ningún requisito lo pida, sería una abstracción prematura fuera del alcance de este cambio.

## Risks / Trade-offs

- [Sin animación, el cambio de estado puede sentirse abrupto comparado con acordeones de otras librerías] → Riesgo aceptado: es consistente con el resto del catálogo (ningún componente anima hoy), y agregar motion es un cambio incremental futuro y aislado si se decide para todo el catálogo a la vez, no solo para Accordion.
- [Confusión de nombre con "acordeón de navegación anidado", patrón explícitamente prohibido en `Sidebar`] → Se documenta en el contenido de uso de `apps/docs` que `Accordion` es para contenido de página, no para navegación, remitiendo a la guía existente de `Sidebar`.
