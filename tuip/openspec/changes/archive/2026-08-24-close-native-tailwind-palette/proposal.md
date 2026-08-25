## Why

El preset de Tailwind expone los tokens semánticos de tuip, pero no cierra la puerta a la paleta nativa de Tailwind: hoy `bg-blue-500`, `text-red-600` o cualquier color de la escala por defecto siguen compilando en cualquier proyecto que use el preset, tuip incluido. La razón es mecánica: `backgroundColor`, `textColor`, `borderColor`, `fill`, `stroke` y `colors` se declaran bajo `theme.extend`, y en Tailwind esas claves resuelven por defecto a una función que trae toda la paleta nativa — extenderlas sólo agrega los tokens de tuip encima, sin quitar nada. El propio preset ya resolvió este mismo problema para tipografía (`fontSize` reemplaza la escala en vez de extenderla, con el comentario explícito de por qué: "extending would leave `text-sm`, `text-xs`... resolving to Tailwind's own values"), pero nunca se aplicó el mismo criterio a color.

Si tuip gobierna las interfaces, el vocabulario de color que puede usarse en una pantalla debería ser exactamente el que tuip define — ni más angosto (que ya fue el problema que motivó esta cadena de cambios, cuando `frontend` no podía usar un token real porque no había preset registrado) ni más ancho (que es este). Hoy nada impide que un componente, en tuip o en cualquier consumidor, escriba `bg-purple-600` y quede fuera del sistema sin que ninguna verificación lo note.

## What Changes

- El preset deja de extender `backgroundColor`, `textColor`, `borderColor`, `fill`, `stroke` y `colors`: pasan a reemplazar esas claves en la raíz de `theme`, con el mismo criterio que ya usa `fontSize`. Después de este cambio, un color fuera del vocabulario de tuip no compila a ninguna regla, en ningún proyecto que use el preset.
- El objeto de reemplazo conserva `transparent` y `current`: son primitivos de CSS, no colores de marca, y el catálogo los usa en 25 lugares reales (`border-transparent`, `bg-transparent`, `bg-current`, `border-current`) — perderlos rompería componentes existentes, Button entre ellos.
- `white` y `black` no se conservan. Sólo se usan dos veces en todo tuip, las dos en `apps/docs` (no en el catálogo publicado): un overlay de diálogo y un borde decorativo. Se migran al vocabulario del sistema en vez de preservarse como excepción.
- No se agrega ni se modifica ningún token de color: el cambio es sobre qué expone el preset como utilidad de Tailwind, no sobre los valores del sistema.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `design-tokens`: se incorpora el requisito de que el preset de Tailwind exponga exclusivamente el vocabulario de color de tuip — ni la paleta nativa de Tailwind ni valores fuera del sistema, salvo los primitivos de CSS que el propio catálogo necesita.

## Impact

- `packages/tokens/src/tailwind-preset.ts` — mueve seis claves de `extend` a la raíz de `theme`.
- `apps/docs/src/components/SearchDialog.tsx` — el overlay del diálogo de búsqueda, de `bg-black/40` al mismo patrón que ya usan Modal, Drawer y CommandPalette.
- `apps/docs/src/components/ComponentChips.tsx` — el borde del botón de copiar, de `border-white/25` al trazo translúcido del sistema.
- Ningún archivo de `packages/components/src` cambia: ya se verificó que ninguno usa un color fuera de `transparent`/`current` y el vocabulario de tuip.
- `frontend` no se toca en este change. Es un cambio aparte, que depende de este: hasta que `frontend` registre el preset (ver el change siguiente), sigue consumiendo el CSS ya compilado de tuip como hoy, y este cambio no le afecta en nada porque no usa ningún color nativo tampoco.

## Lo que este cambio no resuelve

Cerrar la paleta impide escribir un color fuera del sistema, pero no impide agregar uno **al** sistema cuando hace falta de verdad — ni debería. Cuando un consumidor necesite un tono que el catálogo no tiene, el camino sigue siendo proponerlo como token nuevo en `design-tokens`, no reabrir la paleta nativa como atajo.
