## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **Los modificadores de opacidad de Tailwind no sirven acá.** Cada token es un `var(--color-…)` con un hex plano, y `bg-x/10` o `ring-x/30` no generan ninguna regla sobre esa forma: Tailwind necesita el color en componentes separados. Ya está documentado en `navbar.tsx`, que tuvo que resolver lo mismo sustituyendo el color en vez de bajarle la opacidad. Por eso todo tono translúcido de este cambio entra como **token propio**, no como modificador.
- **Las clases `ring-border-<rol>-focus` no generan regla.** El preset expone los colores de borde bajo claves `<rol>-focus`, sin el prefijo `border-`. Son 34 usos en el catálogo que caen al anillo azul por defecto de Tailwind. Sin corregirlo, ningún anillo puede tomar color del sistema.
- El anillo se dibuja con `box-shadow` (es lo que hace `ring-*` de Tailwind), y su offset se pinta con un color propio —blanco por defecto— entre el control y el anillo.
- El intento anterior está implementado y verificado. Este cambio lo revierte en parte, así que hay trabajo que deshacer, no sólo que hacer.

## Goals / Non-Goals

**Goals:**

- Que el límite de un control y el de una Card se insinúen con el mismo lenguaje, sin el peso de un trazo opaco.
- Que el foco se lea como el propio control encendido, no como un elemento ajeno pegado encima.
- Que el sistema no quede con tokens que nadie usa.

**Non-Goals:**

- Alcanzar el mínimo de 3:1 para límites de componente. Este cambio lo deja explícitamente de lado; ver el trade-off.
- Cambiar el lienzo de la página o la superficie de las cards.
- Rediseñar las variantes sólidas.

## Decisions

- **El trazo se registra como token translúcido, no como hex opaco.** Un gris al 18% se compone sobre lo que tenga debajo, así que un solo valor sirve en claro (1.23:1) y en oscuro (1.25:1). Un opaco pensado para fondo claro se pierde sobre fondo oscuro y obliga a definir dos valores que hay que mantener sincronizados. Es el argumento que hace que este color sea mejor que su equivalente sólido, y no sólo distinto.

- **Card y `secondary` comparten el mismo trazo.** Un contenedor y un control no necesitan lenguajes distintos para insinuar su borde; que difieran obligaba a explicar por qué, y la explicación anterior —contenedor pesa más que control— es justamente la que se vio mal.

- **La sombra de Card se corrige en el token, no se quita ni se pone a mano en el componente.** El diagnóstico es geométrico: en `0 1px 2px 0`, el difuminado de 2px se derrama alrededor de 1px hacia cada lado mientras el desplazamiento vertical es de 1px, así que la sombra sobresale ~1px por los costados y ~2px por abajo. Una relación 1:2 no se lee como luz desde arriba; se lee como una mancha bordeando el contorno. `md` (`0 4px 8px -2px`) llega a 1:3 y además su spread negativo evita que asome por arriba. `sm` pasa a esa misma familia, con más desplazamiento que difuminado y spread negativo.

  Se corrige en el token y no con una clase en `Card` porque `shadow-sm` **lo usa únicamente `Card`**: el token está describiendo, de hecho, la elevación de una tarjeta. Arreglarlo en el componente dejaría el escalón roto esperando al próximo que lo use.

- **Trazo y sombra hacen cosas distintas y por eso conviven.** El trazo delimita; la sombra eleva. Confundirlos fue lo que llevó a evaluar la sombra como sustituto del borde, y ahí el argumento en contra es correcto: una sombra proyectada nunca define el borde superior, así que no puede delimitar. Pero eso no la descalifica para lo suyo. La regla del modo oscuro —las superficies se separan por claridad y no por sombra— habla justamente de separar, o sea de delimitar, no de elevar.

- **El anillo va sin offset y en el tono de su variante.** El offset no sólo separaba: se pinta de un color propio, blanco por defecto, así que sobre una superficie que no es blanca metía una franja que no pertenece a nada. Con offset cero desaparece el problema y el anillo queda apoyado en el borde. El tono sale del color base de cada variante —marca para `primary` y `link`, destructivo para `danger`, neutro para `secondary` y `subtle`— de modo que el foco se lea como una intensificación del control y no como una decoración encima.

- **Los controles de formulario llevan el anillo neutro; el resto conserva el de marca.** No es una excepción a la regla del anillo, es la regla aplicada bien: el color base de un campo de texto es neutro —relleno claro, borde neutro—, así que su anillo sale de ahí. Lo que lo vuelve urgente es que en este sistema la marca es roja y el error también: `#ED1C294D` contra `#8E0F184D`, dos rojos al 30% que sobre blanco dan ambos rosa. Un campo enfocado y un campo con error enfocado quedaban prácticamente iguales, y son estados de significado opuesto.

  Se acota a los controles que capturan un valor y no se lleva a todo el catálogo. Tabs, paginación, acordeón o sidebar tampoco tienen color base de marca, pero tampoco tienen estado de error, así que su anillo rojo no se confunde con nada. Queda como asimetría conocida: el criterio se aplica donde el color colisiona, no donde sería sólo más prolijo.

- **Se corrige `ring-border-*` en el mismo cambio, no aparte.** Es un defecto preexistente y ajeno al alcance original, pero el anillo por variante no puede implementarse sin él: mientras esas clases no generen regla, cualquier tono que se elija queda tapado por el azul de Tailwind. Separarlo dejaría este cambio sin poder verificarse.

- **Se revierte el escalón `450` y el token `strong`.** Ningún componente los usa una vez que `secondary` pasa al trazo translúcido. Un token sin uso hay que definirlo en dos modos, documentarlo y verificarlo en cada corrida; y el primero que lo encuentre va a asumir que existe por una razón vigente.

- **Los tokens nuevos no entran a la verificación de contraste.** Auditarlos a 3:1 los haría fallar por diseño; auditarlos con un mínimo más bajo sería inventar un umbral que ninguna definición respalda. Lo que sí corresponde es que la documentación diga que no son aptos para delimitar un componente de forma accesible, y eso queda como requisito.

## Risks / Trade-offs

- [El cambio abandona el mínimo de 3:1 que lo motivaba] → **Asumido y explícito.** El trazo queda en ~1.23:1, apenas por encima del que originó la queja. Se toma como decisión visual informada, con los números medidos, y no por omisión. Lo que evita que se olvide es que el requisito lo dice: estos tokens no se ofrecen como límite accesible.
- [Card sin sombra y con trazo translúcido queda muy poco separada del lienzo] → Su superficie difiere del lienzo en 1.04:1, así que el contorno hace casi todo el trabajo y lo hace suavemente. Si vuelve a molestar, el lugar a mirar es el lienzo —hoy el sidebar y el contenido comparten el mismo token, 1.00:1— y no el borde. Queda anotado para no repetir el recorrido.
- [Tocar los 34 usos de `ring-border-*` toca casi todo el catálogo] → El cambio es mecánico (quitar un prefijo) pero amplio, y su efecto es visible en cada componente enfocable. A favor: hoy todos muestran un anillo que nadie eligió, así que el riesgo real es menor que el de dejarlo.
- [Revertir trabajo ya verificado] → El escalón `450` se midió, se verificó en ambos modos y se probó su red de seguridad. Retirarlo tira eso, pero conservarlo por el esfuerzo invertido es peor: quedaría un token que nada usa y que el próximo lector tomaría por vigente.
