## Context

Ver proposal.md - Why. `EmptyState` y `Skeleton` son los dos estados que faltan de los cinco que la definición exige (vacío, cargando, con datos, error, sin permiso) — "con datos" y "error" ya están cubiertos (el primero es simplemente el render normal de cada componente; el segundo, por `Alert` variant `danger` y por la prop `error` que ya comparten `Input`, `Select`, `Combobox`, `DateField` y `DateRangeField`).

El icono del estado vacío (`status-empty`, un rectángulo punteado con una línea al medio) ya existe en la librería y su geometría coincide exactamente con el dibujo del mockup — no hace falta agregar ningún icono para este change.

## Goals / Non-Goals

**Goals:**
- `EmptyState` como bloque de contenido reusable (icono + título + descripción + acción), sin imponer dónde se coloca ni con qué borde.
- `Skeleton` como primitiva de forma libre, no como un catálogo de formas predefinidas (avatar/línea/etc.).
- Documentar las tres situaciones de EmptyState y el umbral de tiempo de Skeleton como guía de uso, ya que ninguna de las dos es algo que el componente pueda decidir por sí mismo.

**Non-Goals:**
- Que `Skeleton` orqueste automáticamente el retraso de 300ms o el mensaje de más de 10 segundos. El componente no tiene visibilidad de cuánto lleva esperando una petición — esa lógica vive del lado del consumidor (un `useEffect` con `setTimeout`, o el propio estado de la librería de datos que use). `Skeleton` solo es la pieza visual.
- Un catálogo cerrado de "formas" de Skeleton (`variant="circle" | "line" | "block"`). La definición pide que imite la forma real del contenido, que es abierta por naturaleza; forzar un enum sería más rígido que el propio `className` que el resto de los componentes del catálogo ya expone para casos así.
- Una prop `type`/`variant` en `EmptyState` para sus tres situaciones (sin datos, sin resultados, sin permiso). Difieren en contenido (qué icono, qué texto, si hay acción), no en estructura ni en comportamiento — exactamente el tipo de diferencia que este catálogo resuelve con guía de uso y ejemplos, no con una prop.

## Decisions

### `EmptyState` sin contenedor propio

El bloque de la definición (icono, título, descripción, acción, todo centrado) aparece dentro de una tarjeta en el mockup, pero esa tarjeta es el marco de demostración que envuelve *todas* las secciones del documento (Button, Badge, etc. están en el mismo tipo de caja) — no es parte del componente. `EmptyState` se apoya en la superficie que lo aloja (el `Card` de una página, el `<tbody>` de una `Table` sin filas), igual que `Alert` no impone su propia tarjeta y se apoya en el layout del consumidor.

### `Skeleton`: un solo bloque con `animate-pulse`, forma por `className`

`animate-pulse` es una utilidad de Tailwind que el preset del sistema no reemplaza (el preset solo extiende `theme.extend` para colores, tipografía, espaciado, radios — nunca tocó `animation`/`keyframes`), así que está disponible sin agregar nada. El color de fondo usa `bg-neutral-subtle` (el mismo tono que ya usan las superficies neutras del sistema) en vez de los dos grises que alterna el mockup (`#EFEFF0`/`#F4F4F5`): esa alternancia es una variación decorativa del mockup entre filas sucesivas, no una regla — forzar dos tonos fijos en el propio componente le quitaría al consumidor la libertad de decidir cuántas piezas de skeleton arma y cómo las agrupa.

Forma libre por `className`: `<Skeleton className="h-9 w-9 rounded-pill" />` para el círculo de avatar del mockup, `<Skeleton className="h-2.5 w-1/2" />` para una línea de texto. El componente en sí solo aporta `animate-pulse bg-neutral-subtle rounded-control` como base, con `rounded-control` como valor por defecto — un rectángulo con las esquinas del sistema, no un `rounded-pill` que privilegiaría la forma de círculo/línea sobre cualquier otra.

### Guía de uso en vez de comportamiento del componente (umbral de tiempo, tres situaciones de EmptyState)

Ambas reglas de la definición (300ms/10s para Skeleton; los tres tipos de EmptyState) son decisiones que dependen de información que el componente no tiene (cuánto lleva esperando una petición real; qué situación de negocio representa la lista vacía). Se documentan como guía de uso con ejemplos, siguiendo el mismo patrón que ya usa el catálogo para el umbral entre radios/Select/Combobox (una guía de "qué componente/qué configuración corresponde según el contexto", no una prop que el componente resuelva internamente).

## Risks / Trade-offs

- [Sin variantes explícitas, dos equipos podrían armar EmptyState de formas visualmente distintas para la misma situación] → Mitigación: los ejemplos en vivo cubren las tres situaciones con el icono y el texto sugeridos para cada una, que es lo que ya hace el catálogo para separar comportamiento del componente de convención de uso (ej. Table documenta la convención de alineación sin imponerla vía prop).
- [`Skeleton` sin lógica de temporizado interna podría usarse mal — mostrarse siempre, incluso en respuestas instantáneas] → Mitigación: el umbral de 300ms queda documentado de forma explícita en la guía de uso, con la razón (un parpadeo por debajo de ese tiempo molesta más de lo que ayuda) tomada directamente de la definición.
