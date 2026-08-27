---
"@tuya-ui/components": minor
---

Las superposiciones del catálogo llegan y se van con movimiento, cada una según la clase de superficie que es.

- **`Modal` y `CommandPalette`** (superficies centradas) se asientan desde apenas abajo con un fundido; el velo se funde con ellas. Al cerrar, salen más rápido de lo que entraron.
- **`Drawer`** entra deslizándose desde el borde derecho y se va por el mismo lado. La transición que declaraba antes nunca llegaba a verse: Radix monta el panel ya abierto y lo desmonta al instante al cerrar, porque sólo espera a una `animation`, no a una `transition`. Ahora sí se ve, en las dos direcciones.
- **`Menu`, `NotificationMenu`, `Popover`, `Select`, `Combobox` y `Tooltip`** (superficies ancladas) crecen desde el borde de su ancla, con el origen que Radix publica según el lado en que cupieron, para que se lea a qué control pertenecen.
- **`Toast`** entra desde el borde derecho, donde vive su viewport, y se funde al cerrarse por tiempo o por su botón; al descartarlo con un swipe sale deslizándose en la dirección del gesto, y si el gesto se cancela vuelve a su sitio con una transición.

Todas las recetas vienen de `@tuya-ui/tokens` (`animate-panel-in`, `animate-float-out`, …), con las duraciones y curvas de motion del sistema: entradas de 100–300 ms según la distancia que recorre la superficie, salidas siempre más cortas. Bajo `prefers-reduced-motion` cada superficie conserva su fundido y pierde el desplazamiento, sin que ningún componente lo declare.

No cambia ninguna prop. Requiere `@tuya-ui/tokens` ≥ la versión que publica las recetas.
