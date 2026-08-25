## Why

Cuatro elementos del shell arrancan en cuatro insets distintos: los ítems del Sidebar a 22px (el `px-2.5` del `ul`, más el borde de 2px del indicador activo y el `px-2.5` del ítem), el rótulo de grupo a 12px, el control de colapso a 20px y la marca del Navbar a 24px. El rótulo de grupo es el más visible de los cuatro: queda 10px a la izquierda de los íconos que encabeza.

Y el control de colapso no responde donde parece que debería. Su `<button>` es `flex` sin ancho propio, así que se encoge a su contenido: el divider delimita una franja de ancho completo, pero sólo el rectángulo del texto recibe el clic y el hover. Apuntar a la mitad derecha de esa franja no hace nada, aunque se vea como una zona sola.

## What Changes

- Alinear sobre una misma vertical el contenido de la navegación del shell: los ítems del Sidebar, los rótulos de grupo, el control de colapso y la marca del Navbar. El Navbar se queda donde está y el Sidebar se ajusta a él.
- Conseguir esa alineación por construcción y no con números sueltos: el control de colapso pasa a llevar el mismo borde izquierdo transparente que ya llevan los ítems para su indicador de activo, de modo que su contenido caiga en la misma vertical sin compensar 2px a mano.
- Hacer que el control de colapso ocupe toda la franja que su divider delimita, de borde a borde, para que el clic y el hover cubran la zona que se ve como una sola.
- Quitarle el redondeo al control de colapso: los ítems se redondean porque están embutidos, pero una franja que llega a los bordes con esquinas redondeadas se lee como un rectángulo mal encajado.
- Sin cambios **BREAKING**: no cambian props, ni el ancho del Sidebar, ni el alto de la franja de colapso.

## Capabilities

### New Capabilities

(none — extiende la capability `component-library` existente)

### Modified Capabilities

- `component-library`: Sidebar y Navbar alinean el contenido de su navegación sobre una misma vertical, y el control de colapso responde en toda la franja que su divider delimita.

## Impact

- `packages/components/src/sidebar.tsx` — los insets del `ul`, del rótulo de grupo y del control de colapso, y el ancho, el borde y el redondeo de ese control.
- `packages/components/src/navbar.tsx` — se revisa y se espera que quede sin cambios: es la referencia a la que se alinea el resto.
- `apps/docs/src/content/sidebar.tsx` — las medidas de anatomía que citan los insets actuales.
