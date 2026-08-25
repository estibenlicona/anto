## Why

Los colores de `Switch` no corresponden al mockup de diseño (`design-system/Componentes Tuya.dc.html`, sección "Checkbox · Radio · Switch"). Ahí el círculo (thumb) es blanco en los dos estados, y el track apagado es un gris neutro (`#C9C9CE`). La implementación actual usa un tinte de marca tanto para el track apagado (`brand-100`) como para el thumb apagado (`brand-700`), y para el thumb encendido usa `neutral-inverse` (casi negro en modo claro) en vez de blanco. El resultado no es el switch rojo-sobre-gris-neutro que ilustra la definición, sino uno donde la marca aparece incluso apagado y el círculo encendido queda oscuro en vez de blanco.

## What Changes

- El thumb de Switch pasa a ser `neutral-0` (blanco) en ambos estados, encendido y apagado — deja de depender de `neutral-inverse` (oscuro en modo claro) y del tinte de marca `brand-700`.
- El track apagado pasa de un tinte de marca (`brand-100`) a un gris neutro sin marca. El paso exacto es `neutral-500` (nuevo token `background.neutral.strong`), no `neutral-200`: `neutral-200` no alcanza el piso de contraste de 3:1 contra el thumb (ver nota más abajo).
- El track encendido sigue usando el color de marca de fondo (`brand-bold`), que ya era correcto — no cambia.
- Se elimina `SwitchBackground` (`trackOff`/`thumbOff`) de `packages/tokens/src/semantic-colors.ts`: era un par de tokens con alcance exclusivo a Switch que, tras este cambio, ningún componente vuelve a leer.
- Se agrega `background.neutral.strong` (`neutral-500`) a `NeutralBackground`: el paso de fondo que faltaba entre `subtlePressed` y `bold`, el único de la escala que cumple 3:1 de contraste contra un thumb blanco (claro) o casi negro (oscuro).
- Se agrega a la documentación de Switch la fila de "par de color" que describe el mapeo, siguiendo el mismo patrón que ya tienen Badge y otros componentes.
- Se corrige que un Switch marcado y deshabilitado se veía igual que uno marcado y habilitado: un empate de especificidad CSS entre `data-[state=checked]:bg-brand-bold` y `disabled:bg-neutral-disabled` hacía que la regla de deshabilitado nunca ganara. Se agrega un selector compuesto (`disabled:data-[state=checked]:*`) que reutiliza `neutral-disabled`, el mismo tono que ya usa cualquier otro control deshabilitado del catálogo — sin token nuevo, exento de 3:1 por WCAG 1.4.11 (controles deshabilitados).

## Capabilities

### Modified Capabilities

- `component-library`: el requisito "Opciones del componente Switch" incorpora el mapeo de color de track y thumb (marca en el track encendido, gris neutro en el apagado, thumb blanco en ambos estados, sin tinte de marca fuera del track encendido).

## Impact

- `packages/components/src/switch.tsx`: clases de track y thumb reescritas.
- `packages/tokens/src/semantic-colors.ts`: se elimina la interfaz `SwitchBackground` y sus dos instancias (clara y oscura); `assemble()` deja de recibir `rest.background.switch`. Se agrega `strong` a `NeutralBackground` y a sus dos instancias.
- `packages/tokens/scripts/verify-tokens.ts`: el chequeo de contraste "switch thumb against switch track" pasa a leer `background.neutral.strong` en vez de `background.switch.thumbOff`/`trackOff`.
- `apps/docs/src/content/switch.tsx`: se agrega la fila de par de color a la anatomía.
- `openspec/specs/component-library/spec.md`: el requisito de Switch incorpora el mapeo de color.
- Ningún otro componente del catálogo lee `SwitchBackground`, `bg-switch-track-off` ni `bg-switch-thumb-off` (verificado por búsqueda), así que la eliminación de esos tokens queda contenida a Switch.

## Nota sobre el gris del track apagado

El pedido original pidió `neutral 200`, y el mockup dibuja `#C9C9CE` (`neutral-300`) — ninguno de los dos pasa el chequeo de contraste automático del paquete de tokens: un thumb blanco sobre cualquiera de los dos da menos de 1.7:1, contra el piso de 3:1 que exige WCAG 1.4.11 para el límite de un control no textual. `neutral-400` tampoco alcanza (2.60:1). El primer paso de la escala que sí cumple es `neutral-500` (4.62:1 en claro, 3.87:1 en oscuro contra el thumb de cada tema), así que este change usa ese valor — más oscuro que lo pedido originalmente, decisión que el usuario tomó explícitamente al conocer el problema de contraste (opción 2 de tres alternativas planteadas).
