## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- El Sidebar usa `background.neutral.subtlest` y el lienzo de la app usa `background.neutral.subtlest`. No es un parecido: es el mismo token, así que están a 1.00:1 por construcción.
- La barra superior en variante clara ya usa `background.neutral.default`.
- El ítem activo usa hoy `background.neutral.default` — el mismo blanco al que va a pasar la barra. Ahí está la colisión que obliga a tratar los dos juntos.
- Los ítems inactivos usan `background.neutral.subtle-hover` (`neutral[100]`, `#EFEFF0`) al pasar el puntero.
- `background.neutral.selected` existe y está anotado en el propio archivo de tokens como el paso para selección y fila activa. Vale `brand[50]` (`#FFF1F2`) en claro y `brand[900]` (`#52080C`) en oscuro. Su par con el texto de cuerpo y con el texto de marca ya está auditado por `verify-tokens`.

## Goals / Non-Goals

**Goals:**

- Que la navegación y el contenido se lean como dos planos.
- Que el shell —barra superior y Sidebar— se lea como una sola pieza.
- Que el ítem activo conserve sus tres señales, y que activo, hover y reposo sigan siendo tres estados distinguibles.

**Non-Goals:**

- Cambiar el valor de `subtlest` ni el lienzo de la página.
- Agregar tokens: los tres involucrados ya existen y están definidos en ambos modos.
- Rediseñar el filete que separa el Sidebar del contenido.
- Tocar la variante oscura de la barra superior.

## Decisions

- **El ítem activo toma `selected` y no un gris.** Es el token que el sistema reservó para selección y fila activa, y usarlo acá es aplicar una decisión ya tomada en vez de inventar una. Además acompaña al riel de marca que el ítem ya lleva, de modo que las dos señales de color hablan del mismo rol en vez de dos.

  La alternativa evaluada era `subtle` (`#F4F4F5`). Se descartó porque queda a un paso de `subtle-hover` (`#EFEFF0`), el fondo del hover: activo y hover pasarían a distinguirse por casi nada, y el requisito pide que se lean como estados distintos. Con `selected` la diferencia es de tono, no de claridad, y eso los separa aunque sus luminancias sean parecidas.

- **La superficie del Sidebar es exactamente la de la barra superior, no un blanco propio.** Que compartan token es lo que hace que el shell se lea como una pieza; si cada uno tomara su propio valor, la coincidencia de hoy sería una casualidad que el próximo cambio rompe sin que nadie lo note. Queda como requisito por eso mismo.

- **El requisito del ítem activo se refuerza en vez de dejarse como está.** Su redacción actual —"un fondo distinto"— se cumplía con el blanco mientras la barra no fuera blanca. Es una condición que dependía de un supuesto no escrito sobre la superficie que había debajo. Al hacerlo explícito —el fondo tiene que distinguirse **de la barra**, y también del hover— el requisito deja de ser cierto por accidente.

- **No se toca el lienzo, aunque la separación quede chica.** Blanco contra `subtlest` da 1.04:1. Alcanza para que el plano exista, pero el filete va a seguir haciendo buena parte del trabajo. Mover `subtlest` es un cambio con radio mucho mayor —lo usa el lienzo de todas las pantallas— y merece decidirse por sí mismo, no como efecto lateral de acomodar una barra.

## Risks / Trade-offs

- [El ítem activo suma un fondo rosado a un riel rojo] → Es la señal de rol repetida, no dos señales compitiendo. `selected` es el paso más claro de la escala, pensado para leerse como tinte y no como relleno. Si al verlo resulta cargado, la salida es bajar el riel, no el fondo: el fondo es el que sostiene el requisito de las tres señales.
- [La separación entre shell y contenido queda en 1.04:1] → Anotado arriba como decisión, no como descuido. El próximo lugar a mirar es `subtlest`.
- [Activo y hover podrían seguir pareciéndose] → Es lo que hay que mirar al verificar, y por eso el requisito lo pide explícitamente y no se da por hecho. Se comparan los tres estados juntos, no de a uno.
- [El modo oscuro invierte el problema] → En oscuro `selected` es `brand[900]`, un rojo muy oscuro, y la superficie del Sidebar pasará a `default` (`neutral[900]`). Son dos tonos oscuros próximos, así que la verificación tiene que hacerse también ahí y no asumirse resuelta por el modo claro.
