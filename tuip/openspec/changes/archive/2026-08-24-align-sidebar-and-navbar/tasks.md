## 1. Alineación del Sidebar

- [x] 1.1 En `packages/components/src/sidebar.tsx`, llevar el contenido de los ítems a 24px ajustando el relleno del `ul` que los contiene, sin tocar el `border-l-2` ni el relleno del propio ítem.
- [x] 1.2 Llevar el rótulo de grupo a los mismos 24px con un único valor, y dejar dicho en el código por qué su número no coincide con el del `ul` que tiene al lado: el rótulo no es interactivo y no reserva indicador de activo.
- [x] 1.3 Confirmar que el ítem activo sigue sin correr su contenido — el borde ya estaba reservado en estado inactivo, así que esto no debería cambiar. Confirmado: los cuatro íconos miden 24px por igual, activo o no.
- [x] 1.4 Revisar `packages/components/src/navbar.tsx` y confirmar que no necesita cambios: es la referencia a la que se alinea el resto. Si algo cambia ahí, es una desviación y hay que dejarla anotada. Confirmado sin cambios: header `px-5` (20px) + botón de marca `pl-1` (4px) = 24px, que es el valor al que se alineó el Sidebar.

## 2. Control de colapso

- [x] 2.1 Hacer que el botón ocupe el ancho completo de la franja y que su contenedor deje de embutirlo: el botón pasa a ser la franja, de separador a borde inferior.
- [x] 2.2 CORREGIDO — no lleva ese borde. La idea suponía que el control seguía embutido en un contenedor con relleno; al pasar a ocupar la franja entera ese contenedor desaparece, y con borde más el relleno de los ítems el contenido caía en 14px en vez de 24. Va con un inset único de 24px, como el rótulo de grupo. Ver la decisión corregida en design.md.
- [x] 2.3 Quitarle el redondeo, porque ahora llega a los dos bordes.
- [x] 2.4 Conservar el alto actual de la franja mudando al botón el relleno vertical que hoy tiene su contenedor, de modo que nada de lo que está encima se corra.
- [x] 2.5 Confirmar que en estado colapsado la franja sigue respondiendo completa, y que el nombre accesible del control no cambia. Colapsado: sidebar 64px, franja 63px (la caja de contenido menos el borde de 1px), y el nombre pasa a "Expandir".

## 3. Documentación

- [x] 3.1 Revisar las medidas de anatomía en `apps/docs/src/content/sidebar.tsx` y actualizar las que citen insets que este cambio mueve.
- [x] 3.2 Agregar a la anatomía la parte que faltaba: el control de colapso, con su franja completa como zona activa.

## 4. Verificación

- [x] 4.1 Con Navbar y Sidebar en pantalla, confirmar que la marca y el primer ícono del menú caen en la misma vertical.
- [x] 4.2 Confirmar que el rótulo de cada grupo arranca en la misma vertical que los íconos que encabeza.
- [x] 4.3 Confirmar que el ícono del control de colapso también cae en esa vertical.
- [x] 4.4 Pasar el mouse por el extremo derecho de la franja de colapso y confirmar que se ilumina toda y que el clic funciona desde ahí.
- [x] 4.5 Colapsar el Sidebar y repetir la comprobación anterior sobre la franja angosta.
- [x] 4.6 Confirmar que activar un ítem no corre su contenido y que el alto de la franja no cambió.
- [x] 4.7 Correr `tsc --noEmit` en `packages/components` y `apps/docs`, y reconstruir el paquete.
