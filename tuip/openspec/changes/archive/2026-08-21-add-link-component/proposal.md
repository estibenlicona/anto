## Why

El sistema de diseño no tiene enlace. Tiene `Button variant="link"` —un botón que se parece a un enlace, para acciones que no navegan—, tiene los `<a>` internos de `Breadcrumb` y de `Sidebar`, y nada más. Un consumidor que necesita un hipervínculo de texto en una tabla, en un párrafo o en una celda no encuentra pieza que copiar: escribe sus propias clases. Eso ya pasó — la aplicación de gestión de capacidad tiene en el listado de Personas un `text-brand-default hover:underline focus-visible:ring-brand-focus-ring` escrito a mano, que es exactamente el estilo que el sistema debería estar dando.

El disparador es que ese estilo escrito a mano no alcanza para todos los casos. Un enlace en rojo de marca funciona cuando es la acción destacada de un párrafo; dentro de una tabla, donde cada fila trae uno, la columna entera se tiñe y el rojo deja de significar "acá está lo importante" para significar "acá hay una columna roja". El sistema necesita ofrecer el enlace con más de un tono, y decidir el tono tiene que ser una propiedad de la pieza, no una reescritura de sus clases por parte de cada consumidor.

## What Changes

- **Se agrega `Link` al catálogo**: un hipervínculo de texto que renderiza un `<a>` real, con su subrayado en hover, su anillo de foco y su área de foco por teclado resueltos por el sistema.
- **El tono es una propiedad, no una reescritura.** `Link` acepta `tone` con dos valores: `brand` (por defecto, el rojo de marca que es hoy el único tratamiento posible) y `neutral` (texto en el color neutro de la superficie). El anillo de foco acompaña al tono elegido en vez de quedar fijo en marca.
- **`tone="neutral"` no lleva señal en reposo: se distingue por el subrayado que aparece en hover y en foco.** Es una elección deliberada del consumidor que la pida, con la contrapartida anotada en design.md — un enlace neutro en reposo se lee igual que el texto plano que lo rodea.
- **El componente no conoce ningún router.** Por defecto navega por `href`; con `asChild` cede su etiqueta al elemento que recibe como hijo, de modo que un consumidor pueda envolver el `Link` de su propio router sin perder el estilo ni la accesibilidad.
- **Se documenta en el sitio y se registra en el catálogo**, como cualquier componente: entrada en el registry, página con sus cuatro pestañas, ejemplos ejecutables y la tabla de props derivada de los tipos.
- **No hay cambio de comportamiento en ninguna pieza existente.** La adición es puramente aditiva: `Button variant="link"`, `Breadcrumb` y `Sidebar` quedan exactamente como están.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `component-library`: se agrega `Link` al catálogo de componentes (MODIFIED sobre "Catálogo inicial de componentes"), y se declara qué opciones ofrece —tono parametrizable, subrayado en hover, anillo de foco derivado del tono y cesión de etiqueta para integrarse con un router— junto con la distinción de uso frente a `Button variant="link"` (ADDED).

## Impact

- **Paquete de componentes**: `packages/components/src/link.tsx` (nuevo) y su export en `src/index.ts`.
- **Dependencias**: se suma `@radix-ui/react-slot` como dependencia directa de `@tuya-ui/components` para resolver `asChild`. Ya viaja en el lockfile como transitiva de los diez paquetes de Radix que el catálogo usa, así que no agrega nada nuevo al árbol instalado.
- **Catálogo**: `packages/components/registry/definitions.ts` y el `registry.json` regenerado.
- **Sitio de documentación**: `apps/docs/src/content/link.tsx`, `apps/docs/src/examples/link/`, y los registros en `content/index.ts` y `data/navigation.ts`.
- **Publicación**: changeset `MINOR` de `@tuya-ui/components`. Sin cambios en `@tuya-ui/tokens`: `Link` se arma con tokens semánticos que ya existen (`text-brand-default`, `text-neutral-default`, `ring-brand-focus-ring`, `ring-neutral-focus-ring`).
- **Sin impacto** en `Button`, `Breadcrumb`, `Sidebar`, `Navbar` ni en ninguna página del sitio que ya exista.
- **Consumidor a la espera**: el change `adopt-neutral-name-link-in-people` del repositorio de la aplicación de gestión de capacidad depende de que esta pieza esté publicada en el `.tgz` local.
