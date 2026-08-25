## Context

Ver proposal.md - Why. `Switch` es hoy el único componente del catálogo que lee `SemanticColorPalette.background.switch` (`SwitchBackground`, con `trackOff`/`thumbOff`), un par de tokens declarado específicamente para él en `packages/tokens/src/semantic-colors.ts`. El resto de sus colores (track encendido, thumb) ya usan roles generales (`brand`, `neutral`) que otros componentes también consumen.

## Goals / Non-Goals

**Goals:**
- Igualar Switch al mockup: thumb blanco en ambos estados, track apagado en gris neutro, track encendido en marca (sin cambios ahí).
- No dejar tokens sin consumidores: si `SwitchBackground` deja de usarse, se elimina en vez de quedar declarado y muerto.

**Non-Goals:**
- Cambiar el borde del track (`border-neutral-bold` en reposo, `border-brand-default` encendido). El pedido es sobre fondos ("el fondo... el círculo"), no sobre el borde, y el borde actual ya es coherente con un track gris neutro de fondo.
- Revisar el modo oscuro más allá de eliminar las entradas de `SwitchBackground` que ya no se usan y agregar `background.neutral.strong`. Los tokens generales (`brand-bold`, `neutral-0`) ya tienen su propia definición de modo oscuro, y `strong` se define explícitamente para ambos temas, verificada por el mismo script de contraste.

## Decisions

### Reemplazar `SwitchBackground` por tokens generales en vez de corregir sus valores in situ

Alternativa considerada: mantener `trackOff`/`thumbOff` como tokens propios de Switch, solo cambiando sus valores (`trackOff: p.neutral[200]`, quitar `thumbOff` en favor de blanco). Se descarta porque, una vez que track-apagado y thumb dejan de necesitar un tono exclusivo de Switch, un par de tokens de un solo componente que replica valores que `neutral-200` y `neutral-0` ya expresan es una capa de indirección sin función — el propio comentario de `SwitchBackground` en el código ya lo señalaba como "scoped to Switch alone, not a general semantic role". Se prefiere eliminarlo y que Switch lea `background.neutral.subtlePressed` (`neutral-200`) y `background.neutral.default` (`neutral-0`) directamente, igual que cualquier otro componente que necesite esos mismos grises.

### Track apagado: `neutral-500` (paso nuevo `background.neutral.strong`), no `neutral-200`

`neutral-200` (`subtlePressed`) fue la primera opción, por ser el paso ya existente más cercano al pedido original ("neutral 200"). Pero el verificador de contraste del propio paquete (`scripts/verify-tokens.ts`) lo rechaza: el thumb blanco sobre `neutral-200` da 1.28:1, muy por debajo del piso de 3:1 que exige WCAG 1.4.11 para el límite de un control no textual. Ningún paso *de fondo* ya declarado alcanza 3:1 contra un thumb blanco (claro) o casi negro (oscuro): `neutral-400` da 2.60:1 (no alcanza) y recién `neutral-500` da 4.62:1 en claro y 3.87:1 en oscuro contra el thumb de cada tema. Ese hueco entre `subtlePressed` (200 claro / 600 oscuro) y `bold` (800 claro / 100 oscuro) no tenía ningún paso intermedio declarado como fondo — solo existía como borde (`border.neutral.bold`) o ícono (`icon.neutral.subtle`), buckets que no generan utilidades `bg-*`.

Se agrega `background.neutral.strong` (`p.neutral[500]` en ambos temas) en vez de reutilizar el valor de borde por otra vía (ej. una clase arbitraria apuntando a la variable de `border.neutral.bold`): es un hueco real en la escala de fondo, no un capricho de un solo componente — cualquier superficie neutra que necesite leerse como límite por sí misma, sin depender de tinte, puede reutilizarlo después. Decisión del usuario (opción 2 de tres alternativas planteadas): oscurecer el track en vez de mantener `neutral-200` con un chequeo relajado, o agregarle un borde propio al thumb.

### Thumb: `background.neutral.default` (`neutral-0`) sin condicional por estado

Con el thumb blanco en ambos estados, la clase deja de necesitar una variante `data-[state=checked]:`. Se simplifica a una sola clase de color en vez de una base más un override, reduciendo el número de clases condicionales del componente.

### Marcado + deshabilitado: selector compuesto `disabled:data-[state=checked]:*`, reutilizando `neutral-disabled`

Hallazgo posterior a la implementación inicial: un Switch marcado y deshabilitado se veía igual que uno marcado y habilitado. La causa es de especificidad CSS, no de mapeo de color: `data-[state=checked]:bg-brand-bold` y `disabled:bg-neutral-disabled` tienen la misma especificidad (una sola pseudo-clase/atributo cada una), y en el CSS compilado la regla de `data-[state=checked]` se emite después que la de `disabled` — así que gana la de marcado, y la de deshabilitado nunca se aplica cuando ambas condiciones coinciden.

La corrección es un selector que exige las dos condiciones a la vez, `disabled:data-[state=checked]:bg-neutral-disabled` (y su equivalente de borde): al combinar dos condicionales, su especificidad es mayor que la de cualquiera de las reglas de una sola condición, así que gana sin depender del orden en que Tailwind emite las reglas.

Color elegido: el mismo `bg-neutral-disabled` / `border-neutral-disabled` (`neutral-100`) que ya usan Button, Input, Select y Checkbox para su estado deshabilitado — no un tono nuevo. WCAG 1.4.11 exime explícitamente a los controles deshabilitados del piso de contraste de 3:1, así que no hace falta calcular una combinación nueva; corresponde la misma que ya representa "deshabilitado" en todo el catálogo. El estado marcado/no-marcado sigue siendo distinguible sin depender del color: la posición del thumb (`data-[state=checked]:translate-x-[18px]`) no está condicionada por `disabled`, así que se mueve igual estando el control activo o no.

## Risks / Trade-offs

- [Eliminar `SwitchBackground` es un cambio en `packages/tokens`, no solo en `packages/components`] → Mitigación: se verificó por búsqueda que ningún otro archivo del repo importa `SwitchBackground` ni referencia `bg-switch-track-off`/`bg-switch-thumb-off`; el radio de impacto queda contenido a `semantic-colors.ts` y a `switch.tsx`.
- [El track apagado se vuelve más oscuro/prominente que el `neutral-200` pedido originalmente] → Mitigación: decisión explícita del usuario tras conocer que `neutral-200` no pasa el chequeo de contraste; `neutral-500` sigue siendo un gris neutro sin tinte de marca, que es el requisito que sí quedó fijado en la spec.
- [Nuevo token de fondo (`background.neutral.strong`) verificado solo por el caso de uso de Switch] → Mitigación: su definición no menciona a Switch — está redactado como un paso general de la escala neutra — y el script de contraste lo valida en ambos temas igual que al resto de los pasos, no con una excepción puntual.
