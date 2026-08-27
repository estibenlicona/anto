## Why

Cinco listados de Gestión de Capacidad (Células, Personas, Iniciativas, Asignaciones, Facturación) arman a mano la misma pieza: un `div` con borde y esquinas que envuelve `<Table flush>` y una `PaginationBar` con clases de borde y fondo, y una fila de búsqueda y filtros suelta encima. Cada consumidor repite la card, cada uno la resuelve un poco distinto (tres de ellos desmontan la fila de filtros mientras cargan), y el `overflow-hidden` con el que redondean las esquinas es exactamente lo que la documentación de Table advierte que anula la columna fija. Table debería poder recibir esas piezas como slots —a la manera de las plantillas de Angular proyectadas dentro de otro componente— y dibujar una sola card que las envuelva cuando existen, sin cambiar nada cuando no.

## What Changes

- `Table` acepta dos slots opcionales de contenido arbitrario: `toolbar` (encima de la cabecera: búsqueda, filtros, acciones, lo que el consumidor quiera) y `footer` (debajo del cuerpo: típicamente `PaginationBar`).
- Cuando hay al menos un slot, Table dibuja un único marco con borde y esquinas redondeadas que envuelve barra, tabla y pie; los slots quedan fuera de la zona de desplazamiento horizontal, así que no se van con el scroll ni recortan sus popovers.
- Sin slots, el markup y el estilo de Table son exactamente los de hoy: el marco arranca en la cabecera.
- `flush` sigue aplicando al marco completo: dentro de una Card, barra + tabla + pie se integran a ras sin segundo borde.
- Documentación del catálogo: partes de anatomía nuevas, el ejemplo "Integración completa" pasa a usar los slots, y la nota de uso que hoy dice que búsqueda y filtros van "sueltos sobre la página" se actualiza.
- Changeset `minor` de `@tuya-ui/components` (prop nueva, nada roto) y reempaquetado local para el frontend.

Esto revierte deliberadamente la decisión de `modernize-table-suite` (2026-08-24) de mostrar los controles sueltos sin caja: en la práctica los consumidores construyeron la caja igual, a mano, en cinco lugares. Ver design.md.

## Capabilities

### New Capabilities
<!-- Ninguna: la capacidad es una extensión de Table. -->

### Modified Capabilities
- `component-library`: el requisito "Estructura del componente Table" incorpora los slots `toolbar` y `footer` y el marco único que los envuelve, con la garantía de que sin slots nada cambia.

## Impact

- `packages/components/src/table.tsx`: props `toolbar`/`footer`, marco condicional, rounding por zona.
- `packages/components/src/table.test.tsx`: casos nuevos para slots, marco, `flush` y compatibilidad con `stickyFirstColumn`.
- `apps/docs/src/content/table.tsx` y `apps/docs/src/examples/table/03-integracion-completa.tsx`: anatomía, uso y ejemplo.
- Registro y skill generados en el build (`generate:registry`, `generate:skill`) recogen las props nuevas desde el JSDoc; sin trabajo manual.
- `.changeset/`: entrada `minor`. `pnpm publish:local` genera el tarball que consume `frontend` (change `adoptar-slots-table-listados` en ese repo).
- Sin cambios en `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` ni en `PaginationBar`.
