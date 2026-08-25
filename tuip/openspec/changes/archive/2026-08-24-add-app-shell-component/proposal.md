## Why

Hoy cada aplicación compone `Navbar` y `Sidebar` a mano, y la composición que sale es la del navbar a lo ancho arriba y el sidebar debajo — con dos consecuencias que el usuario pidió corregir sobre un diseño ya aprobado (canvas "Tuya AppShell"): el sidebar no llega arriba, y su control de colapso vive escondido en una franja al pie del propio sidebar, lejos de donde el ojo lo busca.

El diseño aprobado fija la forma: **el sidebar va a toda altura con la marca en su cabecera, el navbar ocupa el resto del ancho a su lado, y la hamburguesa es el primer elemento del navbar — pegada al borde del sidebar — para contraerlo y expandirlo**. La franja de colapso del pie del sidebar desaparece en esta composición.

## What Changes

- **Se agrega `AppShell` al catálogo**: la fusión de Navbar y Sidebar como una sola pieza de estructura de aplicación. Renderiza la columna del sidebar a toda altura (cabecera de marca de 56px con el cuadro de marca y el nombre del producto, alineada con la barra para que el filete corra continuo; debajo, los grupos de navegación del `Sidebar` existente sin su franja de colapso), la barra superior a su lado (hamburguesa primero, luego la búsqueda si la app la pide, y las utilidades/notificaciones/cuenta de siempre a la derecha), y el área de contenido como `children`.
- **`AppShell` es composición pura**: se construye sobre `Sidebar` (modo controlado + `collapsible={false}`, que ya existen), `NavbarSearch` y `NavbarUtilities` (ya exportados). **Ni `Navbar` ni `Sidebar` cambian de código ni de contrato** — quien ya los usa sueltos no nota nada.
- **`AppShell` es el dueño del estado de colapso**: la hamburguesa lo alterna, persiste entre sesiones bajo la misma clave de almacenamiento que ya usa `Sidebar` (para heredar la preferencia existente de cada persona), y por debajo de 1120px colapsa solo — el mismo umbral y la misma técnica que `Sidebar` aplica en modo no controlado.
- **Colapsado**: 64px, sólo íconos con sus tooltips (lo que `Sidebar` ya hace); la cabecera de marca muestra sólo el cuadro.
- **Se documenta y registra** como todo componente: entrada del registry, página con sus cuatro pestañas, ejemplos ejecutables (incluido el shell completo con colapso funcionando), changeset.

### Fuera de alcance

- **Adoptarlo en la aplicación de gestión de capacidad**: es su propio change en el otro repo, después de publicar éste.
- **Mover el breadcrumb dentro de la barra**: quedó como pregunta abierta en el canvas, no como decisión. El breadcrumb sigue siendo composición de la app, dentro del `children`.
- **El selector de aplicaciones y las notificaciones en la cabecera del sidebar**: la cabecera de marca de la v1 es marca + nombre; si una app necesita el switcher de apps ahí, se propone aparte con el caso delante.
- Cambios a `Navbar` o `Sidebar`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `component-library`: se agrega `AppShell` con sus opciones y su distinción de uso frente a componer `Navbar` + `Sidebar` sueltos (ADDED), y el catálogo lo lista (MODIFIED sobre "Catálogo inicial de componentes").

## Impact

- **Paquete**: `packages/components/src/app-shell.tsx` (nuevo) + export en `index.ts`. Sin cambios en `navbar.tsx` ni `sidebar.tsx`.
- **Catálogo**: entrada `app-shell` en `registry/definitions.ts` (categoría `layout`, beta, depende de `sidebar` y `navbar`), registry regenerado.
- **Docs**: `content/app-shell.tsx`, ejemplos en `examples/app-shell/`, registros en `content/index.ts`; la guía de uso de Navbar y de Sidebar suma la remisión a `AppShell` para el caso "los dos juntos".
- **Distribución**: changeset `MINOR` de `@tuya-ui/components` (aditivo), `publish:local`.
- **Consumidor futuro**: el shell de Chapter Lead (`ChapterLeadLayout`) y el de Admin en la app — change aparte.
