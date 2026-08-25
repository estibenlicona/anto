## Context

Ver proposal.md — Why. Las medidas de las que se parte, leídas del código:

- Ítem del Sidebar: `ul` con `px-2.5` (10px), ítem con `border-l-2` (2px) y `px-2.5` (10px) → contenido a **22px**. El borde existe para el indicador de activo y ya está reservado en estado inactivo (`border-l-transparent`), así que activarse no corre el contenido.
- Rótulo de grupo: `px-3` → **12px**.
- Control de colapso: contenedor con `p-2.5` (10px), botón con `px-2.5` (10px) y sin borde → **20px**.
- Marca del Navbar: cabecera con `px-5` (20px), botón de marca con `pl-1` (4px) → **24px**.

Los 22, 20 y 24 no son arbitrarios por separado: cada uno es el relleno de un contenedor más el del elemento interactivo que lleva adentro. Lo que no existe es un acuerdo sobre dónde cae el contenido.

## Goals / Non-Goals

**Goals:**
- Que el borde izquierdo del shell se lea como una sola línea.
- Que esa alineación se sostenga sola: que no dependa de que alguien recuerde compensar 2px.

**Non-Goals:**
- No cambian los anchos del Sidebar (248px/64px), que son anatomía fija del mockup.
- No cambia el alto de la franja de colapso ni el de los ítems.
- No se tocan props ni comportamiento de colapso, persistencia ni colapso automático por ancho.
- No se revisa el resto del Navbar: sus tres zonas quedan como están.

## Decisions

- **El contenido se alinea a 24px, que es donde ya está la marca del Navbar.** El Navbar cruza toda la pantalla y su marca es lo más prominente que hay; moverla es el cambio más visible y el más riesgoso, mientras que correr el Sidebar 2px pasa desapercibido salvo por el efecto buscado. Descartado: alinear a los 22px del ítem, que arrastraría la marca del producto por una diferencia de 2px; y llevar todo a 20px, que además de mover la marca obligaría a quitarle al botón de marca el `pl-1` que le da aire a su propio rectángulo de hover.
- **Hay dos formas de llegar a los 24px, y cuál usa cada elemento lo decide si va embutido o a sangre.** Los ítems van embutidos dentro del `ul` y reservan el borde del indicador de activo, así que sus 24px salen por composición: el relleno del `ul`, el borde de 2px y el relleno propio del ítem. El rótulo de grupo y el control de colapso ocupan el ancho completo y no tienen contenedor que aporte parte del inset, así que su distancia al borde es un único valor. Que los números no coincidan entre sí es la consecuencia de esa diferencia de anatomía, no un descuido, y por eso va dicho en el código.
- **Descartado: darle al control de colapso el mismo `border-l-2` transparente de los ítems.** Era el plan inicial —alinearlo por anatomía compartida en vez de por número— y la implementación lo desmintió: esa idea suponía que el control seguía embutido en un contenedor con relleno, y al pasar a ocupar la franja entera ese contenedor desaparece. Con borde y el relleno de los ítems, el contenido caía en 14px en vez de 24. Las dos premisas eran incompatibles y gana la franja completa, que es el defecto que se estaba arreglando.
- **La franja de colapso pierde el redondeo y el relleno de su contenedor.** El botón pasa a ser la franja: ocupa el ancho completo y llega al separador. Los ítems se redondean porque están embutidos y su rectángulo de hover flota dentro de la columna; una franja que llega a los dos bordes con esquinas redondeadas se lee como un rectángulo mal encajado. Es una diferencia deliberada respecto de los ítems, no un olvido.
- **La franja conserva su alto actual.** Hoy mide el alto de un ítem más el relleno de su contenedor. Al mudar ese relleno al propio botón, el alto no cambia y nada de lo que está encima se corre — lo que cambia es qué parte de esa altura responde.

## Risks / Trade-offs

- [Correr el Sidebar 2px cambia una medida que la documentación de anatomía cita textualmente] → Es parte del cambio y hay una tarea para actualizarla; el riesgo real sería dejar la documentación diciendo 22px mientras el componente hace 24.
- [El control de colapso queda con un borde izquierdo que nunca se pinta, lo que puede parecer código muerto] → Es lo que sostiene la alineación, y va con su comentario. La alternativa —un relleno distinto que dé el mismo total— es la que se rompe sin aviso, porque nada la ata a los ítems.
- [Que el hover llene la franja completa la vuelve más presente de lo que era] → Es el punto: hoy la zona se ve como una sola y responde como dos. Si el peso visual molesta, lo que hay que ajustar es el tono del hover, no volver a achicar el área activa.
