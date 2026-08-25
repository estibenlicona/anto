## Why

El usuario pidió esquinas más pronunciadas, igual que en una referencia visual (una tarjeta de tabla con esquinas claramente redondeadas), y que el radio quede sincronizado en toda la aplicación. El radio ya está sincronizado hoy — `control` (3px) y `surface` (6px) son los únicos dos valores que usa todo el catálogo, sin ningún componente con un valor nativo suelto — pero ambos se leen demasiado sutiles frente a la referencia. El ancho de borde, en cambio, sí tiene un gap real: existen los tokens `border.width.default` (1px) y `border.width.bold` (2px), pero ningún componente los usa por nombre — todos escriben la clase nativa `border` (o `border-2`) de Tailwind, que da el mismo resultado visual hoy pero no pasa por la fuente de verdad.

## What Changes

- **El radio de esquinas sube de valor, sin agregar un paso nuevo.** `radius.control` pasa de `3px` a `8px`, `radius.surface` de `6px` a `12px` — en cuatro pasos, cada uno visto aplicado en la app real antes del siguiente: `6px`/`10px`, `8px`/`12px`, `10px`/`14px` y, al verse ese último demasiado marcado, de vuelta a `8px`/`12px` — el mismo valor del segundo paso, que ya había quedado confirmado como el punto justo. `radius.none` y `radius.pill` no cambian. Se mantiene la distinción de dos niveles (controles vs. superficies) — el docblock que la documenta ("la diferencia de radio ya insinúa qué es clickeable") sigue aplicando, sólo que a una escala más marcada. **BREAKING**: cambia el aspecto visual de todo control y toda superficie del catálogo, sin flag de opt-out.
- **Todo componente que dibuja un borde pasa de la clase nativa de Tailwind (`border`, `border-2`) a los tokens `border-default`/`border-bold`.** Es una sincronización de nombre, no de valor — `border-default` sigue siendo 1px, igual que la clase nativa que reemplaza. `border-2` se reemplaza por `border-bold` (2px, mismo valor) en los dos únicos lugares que lo usan hoy (`Button` — el spinner de carga —, `Slider` — el thumb).
- **El requisito "Ancho de borde" pasa a exigir que los componentes consuman los tokens, no sólo que existan.** Hoy sólo exige que `border.width.bold` se use "en vez de un valor de píxeles hardcoded" para el caso destacado; se extiende esa misma exigencia a `border.width.default`, el caso común.
- **Se agrega un requisito nuevo, "Escala de radio de esquinas", que hoy no existe.** El radio se menciona hoy sólo de paso, como una entrada más de la lista de categorías de tokens — no hay ningún requisito propio que documente sus pasos ni sus valores.

**Fuera de alcance:**
- No se agrega un paso de radio nuevo a la escala (ej. algo entre `control` y `surface`, o más grande que `surface`) — sólo se reescalan los dos que ya existen.
- No se toca `border.width.default` ni `border.width.bold` como valores (1px/2px) — sólo se sincroniza qué componentes los consumen.
- No se toca ningún otro token (color, tipografía, espaciado, sombra, motion).

## Capabilities

### Modified Capabilities
- `design-tokens`: el requisito "Ancho de borde" pasa a exigir consumo real por parte de los componentes, no sólo la existencia de los tokens; se agrega el requisito nuevo "Escala de radio de esquinas" con los valores actualizados.

## Impact

- **Tokens** (`packages/tokens/src/tokens.ts`): `radius.control` y `radius.surface` cambian de valor.
- **Paquete** (`packages/components/src/*.tsx`): 31 archivos con la clase nativa `border` pasan a `border-default`; `button.tsx` y `slider.tsx` (los dos únicos con `border-2`) pasan a `border-bold`. Ningún cambio de comportamiento, sólo de qué clase se escribe.
- **Docs** (`apps/docs`): la página de fundamentos ya renderiza la escala de radio y de ancho de borde leyendo los tokens directamente (`apps/docs/src/content/fundamentos.tsx`) — no necesita edición, refleja los valores nuevos solo con reconstruir.
- Ningún cambio en `frontend` (la app) — hereda el radio y el ancho de borde nuevos en cuanto actualice su dependencia de `@tuya-ui/components`/`@tuya-ui/tokens`, sin que sus propias pantallas necesiten ningún cambio.
