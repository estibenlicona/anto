## Why

`design-system/Componentes Tuya.dc.html` agrupa "Tooltip y Menu" en una misma sección (11) del catálogo, con comportamiento completo especificado — retraso de aparición, ancho máximo, navegación por teclado, orden de ítems — que hoy nadie puede reproducir: el catálogo no tiene ninguno de los dos. `Menu` en particular es el patrón exacto que le falta a `Table` para las "acciones secundarias de una fila" que la propia definición usa como caso de uso.

## What Changes

- Se agrega `Tooltip` al catálogo: una frase corta (máximo 240px de ancho), aparece a los 500ms de hover/foco y desaparece al instante, nunca contiene acciones ni información imprescindible. Construido sobre `@radix-ui/react-tooltip`, autocontenido (no exige montar un Provider aparte, a diferencia de Toast) porque su estado es local a cada instancia, sin cola ni coordinación entre tooltips.
- Se agrega `Menu` al catálogo como familia compuesta — `Menu`, `MenuItem`, `MenuSeparator` — siguiendo el mismo patrón compositivo que ya usa `Table`. Navegable con flechas, `Escape` cierra, `Home`/`End` saltan a los extremos, todo resuelto por `@radix-ui/react-dropdown-menu`.
- `MenuItem` admite una marca `destructive` para la variante de peligro (texto en el rol `danger`); la definición pide que lo destructivo vaya siempre último y separado por un divisor — se documenta como guía de uso, ya que Menu no puede reordenar ni forzar un divisor sin saber cuántos ítems tiene ni cuáles son.
- Ambos reusan tokens ya existentes: `Tooltip` reutiliza el mismo par `bg-neutral-bold`/`text-neutral-inverse` que ya valida `Toast` para una superficie siempre invertida respecto del canvas; `MenuItem` destructivo reutiliza `text-danger-default`, que coincide exacto con el color del mockup. Ningún ícono nuevo: `edit`, `duplicate` y `delete` ya existen en la librería y coinciden con los tres ítems que ilustra la definición.

## Capabilities

### Modified Capabilities

- `component-library`: el catálogo mínimo garantizado pasa a incluir `Tooltip` y `Menu`; se agregan sus requisitos de opciones.

## Impact

- `packages/components/package.json`: nuevas dependencias `@radix-ui/react-tooltip` y `@radix-ui/react-dropdown-menu`.
- `packages/components/src/tooltip.tsx`, `packages/components/src/menu.tsx`: componentes nuevos.
- `packages/components/registry/definitions.ts`: dos entradas nuevas, categoría `overlays` (se agrega esa categoría al tipo del registro — `apps/docs/src/data/navigation.ts` ya reserva su etiqueta "Superposiciones" sin ningún componente que la use todavía), `status: "stable"`, con sus `npmDependencies` declaradas.
- `apps/docs/src/content/tooltip.tsx`, `apps/docs/src/content/menu.tsx`: contenido de uso, anatomía y accesibilidad.
- `apps/docs/src/examples/tooltip/*.tsx`, `apps/docs/src/examples/menu/*.tsx`: ejemplos en vivo, incluido un menú de fila con ítem destructivo separado.
- `apps/docs/src/content/index.ts`: registro del contenido nuevo.
- `openspec/specs/component-library/spec.md`: el catálogo mínimo garantizado y los requisitos de opciones de `Tooltip` y `Menu`.
