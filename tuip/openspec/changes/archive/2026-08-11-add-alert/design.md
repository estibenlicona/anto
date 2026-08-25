## Context

Ver `proposal.md` — Why para la motivación, y `specs/component-library/spec.md` para el contrato de comportamiento.

Estado actual relevante:

- Los tokens de estado (`danger`/`warning`/`success`/`info`) ya resuelven fondo, texto, borde e ícono para cada severidad — el comentario de `packages/tokens/src/semantic-colors.ts` sobre `statusLight`/`statusDark` nombra explícitamente "chips, alerts y celdas de tabla" como los consumidores previstos de ese par fondo-sutil/texto-marcado. `Alert` es el primer componente que efectivamente los usa para las cuatro severidades a la vez; `Badge` y el estado de error de `Input`/`Select`/`Combobox` ya usan la misma familia para una severidad a la vez.
- El catálogo de íconos ya tiene un ícono dedicado por severidad: `status-error`, `status-warning`, `status-success`, `status-info` — no hace falta ningún ícono nuevo.
- `Icon` hereda `currentColor` (ver `icon.tsx`), así que el color de severidad se aplica una sola vez, con una clase `text-{role}-default` en el contenedor, y el ícono y cualquier texto que la use lo heredan sin repetirla.

## Goals / Non-Goals

**Goals:**

- Que las cuatro severidades usen exclusivamente los tokens de estado ya existentes — ningún color nuevo, ningún valor fuera de la escala.
- Que el ícono sea parte fija de cada severidad, no una prop — la definición es explícita en que el color solo no comunica severidad.

**Non-Goals:**

- No se agrega un botón de cierre ni lógica de descarte. La definición aclara que Alert "vive dentro del flujo... nunca flotando" — es contenido persistente hasta que la condición que lo generó se resuelve, no una notificación efímera que el usuario descarta. Eso es responsabilidad de un futuro `Toast`, un componente distinto con su propio ciclo de vida.
- No se implementa lógica de reintento, temporizado ni cola de alertas. La acción (`action`) es un slot que el consumidor llena con su propio control interactivo (por ejemplo, un `Button`); Alert no sabe qué hace esa acción ni la ejecuta.
- No se agrega una variante `discovery`, aunque el token ya existe en `semantic-colors.ts`. La definición no la ilustra para Alert y no hay un caso de uso real todavía — se reconsidera si aparece uno, igual que ya se hizo con Non-Goals anteriores.

## Decisions

### Alert es un componente único, no compuesto

A diferencia de `Card` o `Table`, `Alert` no expone partes (`AlertTitle`, `AlertDescription`, ...). Recibe `variant`, `title?` y `action?` como props, y su descripción como `children`.

*Por qué:* el contenido de un Alert tiene una forma fija y acotada — ícono, título opcional, descripción, acción opcional — a diferencia de `TabsContent` o `TableCell`, que llevan contenido de página arbitrario y sin forma predecible. Forzar partes compuestas acá agregaría ceremonia (`<Alert><AlertIcon/><AlertTitle/><AlertDescription/></Alert>`) sin ganar nada, porque no hay heterogeneidad real que una API de props no cubra — el mismo criterio que ya distinguió `Select` (opciones uniformes, un componente) de `Table` (contenido heterogéneo, partes compuestas).

*Alternativa considerada:* partes compuestas como `Table`. Se descarta: no hay contenido de forma libre que una sola prop `children` no resuelva: la descripción de un Alert es texto, no un formulario ni una tabla.

### El ícono es fijo por variante, no una prop

Cada `variant` trae su propio ícono (`status-error` para `danger`, `status-warning`, `status-success`, `status-info`), sin una prop `icon` que lo sobreescriba.

*Por qué:* la definición es explícita — "Icono obligatorio, porque el color solo no basta" — como una regla del sistema, no una preferencia por Alert. Dejar el ícono como prop abriría la puerta a un Alert de severidad `danger` con un ícono que no comunica peligro, exactamente lo que la regla busca evitar.

*Alternativa considerada:* una prop `icon` opcional con el ícono de severidad como valor por defecto. Se descarta: "obligatorio" en la definición se lee como una invariante del componente, no una opción con un valor por defecto sensato — permitir override reintroduce el problema que la regla previene.

### La acción es un slot (`ReactNode`), no una prop `label`/`onClick`

`Alert` acepta `action?: ReactNode`, donde el consumidor compone su propio control (típicamente un `Button` variante `link` o `subtle`).

*Por qué:* mismo criterio que ya se aplicó en `CardFooter` y `TableToolbar` — un slot de composición no le pide a Alert que entienda semántica de clic, estilos de botón o estados de carga, que `Button` ya resuelve. Una prop `label`/`onClick` reimplementaría un botón adentro de Alert en vez de reusar el que ya existe.

*Alternativa considerada:* `action: { label: string; onClick: () => void }`, generando un botón de texto internamente como en la definición ("Reintentar"). Se descarta: reimplementaría estados de foco, disabled y carga que `Button` ya tiene resueltos, duplicando trabajo por una superficie más chica de personalización.

## Risks / Trade-offs

- **Sin botón de cierre, un Alert queda visible hasta que el consumidor deje de renderizarlo.** → Es la decisión correcta según la definición ("vive dentro del flujo"); si un caso real pide descarte, es candidato a extender el componente entonces, no a anticiparlo ahora.
- **El ícono fijo por variante no se puede personalizar.** → Aceptado: es explícitamente lo que la definición pide evitar (severidad que dependa solo del color, o un ícono que no coincida con la severidad real).

## Migration Plan

1. Construir `Alert` con las cuatro variantes de severidad, sobre los tokens de estado ya existentes.
2. Registrar `alert` en `definitions.ts` como `stable`, categoría `feedback`, y regenerar `registry.json`.
3. Escribir el contenido de documentación: anatomía, guía de uso, notas de accesibilidad.
4. Escribir los ejemplos en vivo: las cuatro severidades, con y sin título, con y sin acción.

Cada paso deja el monorepo compilando. Ningún paso toca un componente existente.

## Open Questions

Ninguna.
