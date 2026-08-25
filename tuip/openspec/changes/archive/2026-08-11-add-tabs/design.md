## Context

Ver `proposal.md` — Why para la motivación, y `specs/component-library/spec.md` para el contrato de comportamiento.

Estado actual relevante:

- El criterio ya fijado en `add-select-and-combobox` y aplicado de nuevo en `add-checkbox-radio-switch`: construir a mano sobre el elemento HTML nativo cuando resuelve la semántica y el teclado, y adoptar una primitiva de Radix cuando no hay equivalente nativo. No existe un `<tabs>` nativo en HTML — el patrón ARIA `tablist`/`tab`/`tabpanel` (roving tabindex, flechas, asociación de panel) no lo resuelve ningún elemento por sí solo, a diferencia de `<input type="radio">` para RadioGroup.
- `add-table` fijó el patrón de compound components para partes con contenido heterogéneo (`Table`, `TableHeader`, `TableBody`, ...), en vez de una API de "un componente, un array de opciones" como `Select`/`RadioGroup`. El contenido de cada panel de Tabs es JSX arbitrario de página, no una etiqueta de texto — mismo caso que Table, no el de Select.
- El catálogo ya declara `@radix-ui/react-select`, `@radix-ui/react-popover` y `@radix-ui/react-switch` como dependencias aceptadas de la misma familia.

## Goals / Non-Goals

**Goals:**

- Que `Tabs` herede la accesibilidad del patrón ARIA `tablist` completo (roving tabindex, `aria-selected`, asociación pestaña-panel) sin reimplementarlo a mano.
- Que la API sea un espejo directo de las partes de Radix (`Root`, `List`, `Trigger`, `Content`), consistente con cómo `Select`/`Combobox` ya envuelven Radix — sin inventar un vocabulario propio.

**Non-Goals:**

- No se impone un límite de cinco pestañas en código. La definición lo da como guía de diseño, no como una regla que un componente pueda validar sin conocer el contexto de uso — se documenta en `content/tabs.tsx`, igual que el umbral radios/Select/Combobox se documenta y no se fuerza.
- No se construye el indicador de navegación lateral que la definición menciona como "el mismo eco visual" — eso es un componente de navegación de la app de documentación, no parte del catálogo.

## Decisions

### Tabs se construye sobre `@radix-ui/react-tabs`

`Tabs` (envuelve `Root`), `TabsList` (`List`), `TabsTrigger` (`Trigger`) y `TabsContent` (`Content`) son wrappers delgados con clases de Tailwind sobre las primitivas de Radix.

*Por qué:* mismo criterio que Switch, Select y Combobox — el patrón de accesibilidad (`tablist`/`tab`/`tabpanel`, flechas, `Home`/`End`) es una superficie no trivial que Radix ya resuelve y que el catálogo ya paga como dependencia. Reimplementarlo a mano repetiría trabajo que `@radix-ui/react-tabs` ya hace correctamente.

*Alternativa considerada:* construir el patrón `tablist` a mano con roving tabindex. Se descarta: a diferencia de `RadioGroup` (que reusa `<input type="radio">` nativo gratis), acá no hay elemento nativo que absorba el costo — sería la primera vez que el catálogo reimplementa un patrón ARIA completo desde cero, y el criterio del repo ya es no hacerlo cuando existe una primitiva adoptada y verificada de la misma familia.

### Cuatro partes compuestas, no una API de "un array de tabs"

La API expone `Tabs`, `TabsList`, `TabsTrigger` y `TabsContent` — sin una prop `tabs: { label, content }[]` que genere las pestañas y paneles internamente.

*Por qué:* mismo criterio que `add-table` — el contenido de cada `TabsContent` es JSX de página arbitrario (formularios, tablas, gráficos), no una etiqueta de texto intercambiable como las opciones de `Select`. Forzar una prop de datos empujaría contenido de página completo dentro de una prop, en vez de dejarlo como hijos JSX normales.

*Alternativa considerada:* una prop de datos con `content: ReactNode` por tab. Se descarta: no ahorra nada frente a componer `TabsContent` directamente, y sí fuerza una indirección — el consumidor arma un arreglo para terminar pasando los mismos nodos que pasaría como hijos.

### El contador es una prop de `TabsTrigger`, no contenido libre

`TabsTrigger` acepta `count?: number`, renderizado en fuente monoespaciada junto a la etiqueta.

*Por qué:* a diferencia del texto de resumen de `Pagination` (que se descartó como prop por mezclar conceptos específicos de un caso de uso), el contador de Tabs es un elemento visual fijo y recurrente de la definición ("Capacidades 24"), con una sola forma posible (un número, en mono, junto a la etiqueta) — no hay ambigüedad de redacción que dejarle al consumidor.

## Risks / Trade-offs

- **Una dependencia más (`@radix-ui/react-tabs`) por un componente sin alternativa nativa.** → Aceptado: mismo costo marginal ya aceptado para Select, Combobox y Switch — sumar un paquete más a una familia ya adoptada.
- **El límite de cinco pestañas no se valida en código.** → Aceptado: es una guía de diseño dependiente del contexto (ancho de columna, longitud de etiquetas), no una regla que el componente pueda verificar de forma útil sin arriesgar falsos positivos.

## Migration Plan

1. Agregar `@radix-ui/react-tabs` al paquete de componentes.
2. Construir `Tabs`, `TabsList`, `TabsTrigger` y `TabsContent` sobre las primitivas de Radix, estilados con tokens.
3. Agregar el contador opcional a `TabsTrigger`.
4. Registrar `tabs` en `definitions.ts` como `stable`, categoría `layout`, y regenerar `registry.json`.
5. Escribir el contenido de documentación: anatomía de las cuatro partes, guía de uso con el límite de cinco pestañas, notas de accesibilidad.
6. Escribir los ejemplos en vivo: básico, y con contador.

Cada paso deja el monorepo compilando. Ningún paso toca un componente existente.

## Open Questions

Ninguna.
