## Context

`NavbarUtilities` (`packages/components/src/navbar.tsx`) pinta la zona derecha de la barra: enlaces de utilidad, campana de notificaciones, disparador de cuenta y, en la variante compacta, el botón de menú. Todos compartían el helper `interactive`, que junta tres cosas en una clase: `rounded-control`, el anillo de foco (`focus-visible:ring-focus focus-visible:ring-brand-focus-ring`) y las superficies de hover / `data-[state=open]` calibradas por variante (`getNavbarTone`). El disparador de cuenta es un `button` con un `Avatar` circular y, por encima de 1120px, el nombre; por debajo, sólo el avatar.

El panel de cuenta es un `Menu` (Radix `DropdownMenu`): al cerrarse, Radix devuelve el foco al disparador con `focus()`, y Chrome cuenta ese enfoque programático como recorrido de teclado, así que `:focus-visible` engancha aunque el panel se haya abierto y cerrado sólo con el mouse. `AppShell` reusa `NavbarUtilities` tal cual. Ver proposal.md — Why.

## Goals / Non-Goals

**Goals:**
- Que el disparador de cuenta no pinte ninguna superficie, ni en hover ni abierto, en las dos variantes de color.
- Que el anillo de foco siga existiendo y signifique teclado: aparece tras un recorrido por teclado, no tras un clic.
- Cero cambio para el resto de la barra y para la API pública.

**Non-Goals:**
- Rediseñar `interactive` o `getNavbarTone`.
- Un realce circular alternativo para el avatar (el pedido es "sin realce alguno").
- Cambiar cómo se abre el panel: ya abre con clic.

## Decisions

**1. El disparador deja de usar `interactive` y copia sólo su parte de foco.**
Alternativa: añadir a `interactive` una opción "sin superficie". Descartada porque el helper existe para los controles rectangulares, y una bandera para el único que no lo es complica al helper por una excepción de un solo uso. El disparador declara a mano `rounded-control outline-none focus-visible:ring-focus focus-visible:ring-brand-focus-ring` —lo mismo que aporta `interactive` menos los `hover:bg-*` / `data-[state=open]:bg-*`— con un comentario que dice que la omisión es deliberada, para que el próximo que unifique clases no lo "arregle". Geometría intacta: `h-9`, `py-0.5 pl-0.5 pr-2`, `gap-2`.

**2. Con el panel abierto tampoco hay superficie.**
`interactive` pinta lo mismo en `data-[state=open]` que en hover; quitar uno y dejar el otro devolvería el cuadrado en cuanto se abre el panel. El panel desplegado ya dice que el control está activo.

**3. El anillo tras un clic se evita cancelando la devolución de foco de Radix, no quitando el foco después.**
Se recuerda con qué se abrió el panel: `onPointerDown` marca `openedWithPointerRef = true`, `onKeyDown` lo pone en `false` (el último en correr antes de la apertura es el que manda: Enter/Espacio pasan por `keydown`, el clic por `pointerdown`). En `onCloseAutoFocus` del `Menu`, si se abrió con el puntero, `event.preventDefault()` cancela el `focus()` de Radix y se limpia la marca; si se abrió por teclado no se cancela nada y el foco vuelve al disparador con su anillo. Alternativa probada y descartada: dejar que Radix enfoque y hacer `blur()` después — es una carrera contra el `focus()` de Radix y se pierde: en el navegador el anillo reaparecía.

**4. Pruebas por clases y por foco, en `navbar.test.tsx` y `app-shell.test.tsx`.**
El "no hay superficie" se afirma sobre `className` (sin `hover:bg-` ni `data-[state=open]:bg-`, y sí `focus-visible:ring-focus`) en las dos variantes, porque jsdom no calcula estilos de hover. Los dos caminos de foco se prueban abriendo con `pointerDown`+`click` o con teclado y comprobando dónde queda `document.activeElement` al cerrar. `AppShell` repite la comprobación de clases porque hereda el disparador. Los demás controles se afirman con su realce presente, para que quitar el helper del avatar no se extienda por accidente.

**5. Entrega por `publish:local`, sin cambio de API.**
Changeset `patch` (corrección visual). El frontend recibe el cambio al reinstalar el tarball; la confirmación final se hace en Gestión de Capacidad, donde se reportó: clic → cerrar → sin anillo; Tab → cerrar → con anillo.

## Risks / Trade-offs

- [Alguien vuelve a poner `interactive` en el disparador por uniformidad] → Comentario en el código y prueba de clases que falla si aparecen `hover:bg-*` / `data-[state=open]:bg-*`.
- [Un consumidor abre el panel por teclado pero con un `pointerdown` previo colgado] → La marca se limpia en cada `keydown` y en cada cierre, así que sólo cuenta la interacción que abre el panel actual.
- [En el navegador el anillo se comporta distinto que en jsdom] → Se verificó en Chrome sobre el frontend: sin anillo tras clic, con anillo tras teclado.
