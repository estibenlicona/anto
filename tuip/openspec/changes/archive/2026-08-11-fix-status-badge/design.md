## Context

Ver proposal.md - Why. `packages/tokens/src/semantic-colors.ts` ya define cinco roles de estado (`danger`, `warning`, `success`, `info`, `discovery`) con el mismo patrón de tres pasos: `background.subtle` (paso 100), `background.bold` (paso 600) y `text.default`/`text.bold` (paso 800). `discovery` existe en los tokens desde antes de este change pero ningún componente lo consume todavía — es exactamente el rol morado que la definición usa para "Sugerido por IA". El sexto estado de la definición, "Sin iniciar", no es un rol de estado sino el gris neutro del sistema.

## Goals / Non-Goals

**Goals:**
- Igualar el marcado y las clases de Badge a lo que la definición de diseño ilustra, reusando únicamente tokens ya existentes (ningún color ni radio nuevo).
- Dejar el componente en un estado donde `component-library` - "Componentes basados en design tokens" siga cumpliéndose: cero valores de estilo embebidos que no vengan de un token.

**Non-Goals:**
- Construir `Tag` (la píldora de clasificación que la misma sección de la definición documenta). La definición ya lo trata como un componente aparte de Badge, y Chip cubre hoy un rol de etiqueta removible distinto; se deja fuera de este change.
- Migrar los cuatro usos de `variant="primary"` en la documentación de Badge de forma automática: al eliminarse `primary`, cada sitio que lo usaba se reescribe a mano con la variante semánticamente correcta, no con un mapeo mecánico.

## Decisions

### Punto del badge: `bg-{role}-bold` para los cinco roles de estado, técnica `bg-current` solo para `neutral`

La definición dibuja el punto un paso más saturado que el texto: el texto usa el paso 800 de la familia (ya expuesto como `text-{role}-default`) y el punto usa el paso 600 (ya expuesto, pero como *background*, en `bg-{role}-bold`). Para los cinco roles de estado alcanza con aplicar `bg-{role}-bold` directamente al punto — no hace falta ningún valor nuevo.

`neutral` no sigue el mismo patrón de tres pasos: `NeutralBackground` no tiene un paso "bold" en el gris medio que pide la definición (su `bold` es `p.neutral[800]`, casi negro, pensado para superficies oscuras, no para un punto sutil). El paso correcto para el punto de `neutral` sí existe, pero solo como color de *texto*: `text-neutral-subtle` (`p.neutral[600]`). La solución sin inventar un token nuevo es darle al punto su propio `text-neutral-subtle` y pintarlo con `bg-current`, en vez de agregar un paso de fondo que ningún otro componente necesita. Es la única variante que usa esta técnica; las cinco de estado usan `bg-{role}-bold` directo, más simple.

Alternativa descartada: agregar un paso `background.neutral.subtleBold` (o similar) a `semantic-colors.ts` solo para este punto. Se descarta porque sería un token de un solo uso, y la técnica `bg-current` ya resuelve el caso con lo que existe.

### Forma cuadrada: `radius.control` en vez de un radio nuevo

La definición pide radio 3. `radius.control` es el radio que ya usan Button, Input, Select y Card — reusarlo (en vez de declarar un `radius.badge` propio) mantiene la regla de "Componentes basados en design tokens" y hace que Badge se lea visualmente emparentado con los demás controles cuadrados del sistema, tal como distingue de Chip (pill).

### Variante por defecto: `neutral`

Con `primary` eliminado (prohibido por la regla de marca), el valor por defecto no puede ser un estado con carga semántica propia (`success`, `danger`, etc. implicarían una lectura falsa si el consumidor omite `variant`). `neutral` es el único de los seis que no afirma nada por sí solo, igual que "Sin iniciar" es el estado inicial en la definición.

## Risks / Trade-offs

- [Cambio de API sin período de transición: `primary` deja de existir] → Mitigación: Badge no tiene otros consumidores en el repo (verificado por búsqueda); el único costo es reescribir los cuatro usos dentro de la propia documentación de Badge, que este change ya cubre.
- [Asimetría entre el punto de `neutral` (`bg-current` + `text-neutral-subtle`) y el de los cinco roles de estado (`bg-{role}-bold` directo)] → Mitigación: documentado arriba; es una diferencia de una línea de clases, no de comportamiento observable, y evita agregar un token de un solo uso.
