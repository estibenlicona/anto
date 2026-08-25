## Context

Ver `proposal.md` — Why para la motivación, y `specs/component-library/spec.md` para el contrato de comportamiento.

Estado actual relevante:

- Los tres componentes de este change no tienen equivalente HTML nativo con semántica dedicada (a diferencia de Checkbox/Radio sobre `<input>`), pero tampoco necesitan una primitiva headless como Radix: ninguno abre un overlay, atrapa foco ni gestiona un ciclo de apertura/cierre — son estructura y color estático, con como mucho un `<nav>`/`<ol>` (Breadcrumb) o un `role="progressbar"` (Progress) de HTML/ARIA ya estandarizados.
- Los colores exactos que la definición ilustra ya existen como tokens de estado: el verde de Progress (`#116B4B`) es `success.600`, el rojo de saturación (`#8E0F18`) es `danger.600`, y los tres colores de `SegmentedBar` (`#1B5FBF`, `#B57A00`, `#116B4B`) son `info.600`, `warning.600` y `success.600` — los mismos pasos `bold` que `Badge` y `Alert` ya usan. El fondo neutro fijo de `Avatar` (`#26262C`) es `neutral.800`, el mismo `background.neutral.bold` que ya expone `bg-neutral-bold`. Ningún color nuevo hace falta.

## Goals / Non-Goals

**Goals:**

- Que los cinco componentes se construyan enteramente sobre tokens y roles HTML/ARIA ya existentes — cero primitivas nuevas, cero colores nuevos.
- Que `AvatarGroup` y el colapso de `Breadcrumb` resuelvan su propio límite (máximo de avatares visibles, máximo de niveles) sin que el consumidor tenga que calcular manualmente cuántos elementos "caben".

**Non-Goals:**

- No se deriva un color de avatar a partir del nombre o de un hash. La definición es explícita: "nunca colores aleatorios por nombre" — es una regla, no una opción.
- No se construye una librería de gráficos. `SegmentedBar` es la barra proporcional que la definición documenta como "el gráfico por defecto del sistema", no un componente de charts genérico — no admite otros tipos de gráfico (torta, líneas, etc.).
- No se agrega navegación real a `Breadcrumb` más allá de renderizar enlaces `<a>` con el `href` que el consumidor pasa. El componente no sabe de routing de ningún framework.
- Progress no anima la transición de valor. Es una barra estática que refleja el valor recibido; si el consumidor quiere una transición suave, la logra con CSS propio sobre el ancho.

## Decisions

### Avatar usa un fondo neutro fijo, sin prop de color

`Avatar` no acepta una prop `color`. Su fondo es siempre `bg-neutral-bold` con `text-neutral-inverse`, sin importar qué `name` reciba.

*Por qué:* la definición lo dice explícitamente y con una razón concreta — "en una tabla de 24 personas, ocho colores distintos son ruido". Es la misma clase de invariante que ya se aplicó al ícono fijo de `Alert`: una regla del sistema, no una preferencia de implementación que valga la pena dejar configurable.

*Alternativa considerada:* derivar un color de una paleta fija a partir de un hash del nombre (patrón común en otros sistemas). Se descarta explícitamente por la razón que la propia definición da.

### AvatarGroup calcula su propio overflow, con un `max` opcional

`AvatarGroup` recibe sus `Avatar` como `children` y un `max?: number` (por defecto 3, como ilustra la definición). Si hay más hijos que `max`, muestra `max - 1` avatares y un `Avatar` final con el conteo restante, en vez de mostrar `max` avatares completos más el contador aparte.

*Por qué:* mismo criterio que la elipsis de `Pagination` — el componente resuelve el corte, no el consumidor. Restar uno al máximo visible dedica el último cupo al contador, así el total de círculos mostrados nunca supera `max`, algo que el consumidor tendría que calcular a mano si `AvatarGroup` no lo hiciera.

*Alternativa considerada:* mostrar siempre `max` avatares completos más un contador aparte (total `max + 1` círculos). Se descarta: rompe la promesa implícita de "como mucho `max` círculos", que es la que hace útil al prop en primer lugar.

### Progress y SegmentedBar son dos componentes, no uno con dos modos

`Progress` recibe `value: number` (0–100); `SegmentedBar` recibe `segments: { value: number; label?: string }[]`. Ninguno acepta la forma de datos del otro.

*Por qué:* representan preguntas distintas — "¿cuánto se completó de un total?" vs. "¿cómo se reparte un total entre categorías?" — con formas de dato que no se mapean una a la otra sin ambigüedad (¿un `Progress` es un `SegmentedBar` de un segmento? ¿Qué label tendría?). Mismo criterio que ya separó `Checkbox` de `Switch`: dos preguntas parecidas en apariencia, con API y semántica propias cada una.

*Alternativa considerada:* un solo componente `Bar` con una prop `segments` opcional que, si falta, se comporta como progreso simple. Se descarta: la API tendría que decidir de dos formas incompatibles qué significa el color y el valor según qué prop esté presente, en vez de que cada forma de dato tenga su propio componente con su propio contrato.

### SegmentedBar reusa los tonos `bold` de los roles de estado, en el orden que reciba

Cada segmento declara su propio color eligiendo entre los roles de estado ya existentes (`info`, `warning`, `success`, `danger`); `SegmentedBar` no inventa una paleta categórica nueva ni asigna colores automáticamente por posición.

*Por qué:* la definición pide "mismo orden y mismos colores en toda la app" — eso solo es cierto si el significado de cada color sigue siendo el de su rol de estado (igual que ya es cierto para `Badge` y `Alert`), no un color arbitrario de una escala categórica que un componente de gráficos genérico traería.

## Risks / Trade-offs

- **`SegmentedBar` limitado a los cuatro roles de estado como paleta.** → Aceptado: una distribución con más de cuatro categorías necesita agrupar o usar otra visualización; no es el caso que la definición ilustra.
- **Sin animación de transición en `Progress`.** → Aceptado como Non-Goal explícito; es una capa puramente visual que no cambia el contrato del componente si se agrega después.
- **`Breadcrumb` no integra ningún router.** → Es la misma postura que ya tomó el catálogo con enlaces en general (ningún componente existente asume Next.js, React Router, etc.); el consumidor sigue siendo dueño de la navegación real.

## Migration Plan

1. Construir `Avatar` y `AvatarGroup`, sobre tokens ya existentes.
2. Construir `Progress` y `SegmentedBar`.
3. Construir `Breadcrumb`, con el colapso central en puntos suspensivos sobre tres niveles.
4. Registrar `avatar`, `progress` y `breadcrumb` en `definitions.ts` como `stable`, y regenerar `registry.json`.
5. Escribir el contenido de documentación y los ejemplos en vivo de los cinco.

Cada paso deja el monorepo compilando. Ningún paso toca un componente existente.

## Open Questions

Ninguna.
