---
"@tuya-ui/tokens": minor
---

Los tokens de motion pasan de ser sólo números a ser vocabulario que se usa.

- **Utilidades de transición.** `duration-fast` / `duration-normal` / `duration-slow` y `ease-standard` / `ease-entrance` / `ease-exit`, cada una referenciando su variable (`--motion-duration-*`, `--motion-easing-*`), para que una transición escrita en un componente tome los pasos del sistema y no los de fábrica de Tailwind.
- **Recetas de movimiento** (`motionRecipe`, exportado desde el paquete): cómo llega y cómo se va cada clase de superficie. `fade` (el velo y las salidas sin dirección), `panel` (una superficie centrada se asienta desde apenas abajo), `float` (una superficie anclada crece desde su ancla), `slide` (una superficie que entra por un borde viaja su propio ancho). Toda salida es más rápida que su entrada y usa la curva de salida.
- **`@keyframes` en `@tuya-ui/tokens/css`** (`tuya-fade-in`, `tuya-panel-in`, `tuya-float-out`, `tuya-slide-in-right`, …) y una utilidad `animate-*` por receta en el preset de Tailwind (`animate-panel-in`, `animate-float-out`, …), con duración y curva tomadas de las variables de motion.
- **Movimiento reducido incorporado.** Bajo `prefers-reduced-motion: reduce` la hoja redefine los mismos `@keyframes` como fundidos: cada receta conserva la aparición y la desaparición —que son feedback— y pierde el desplazamiento. Ningún componente tiene que declararlo; lo hereda al nombrar la receta.

No cambia ningún token existente ni ningún nombre de variable.
