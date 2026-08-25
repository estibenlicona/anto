## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **`availableFte` ya está en todas las capas** (DTO, modelo `Person`, mocks, formulario): la columna FTE es sólo mostrarlo.
- **`utilization` no existe en ninguna**: nace en este change como campo calculado del contrato. En el mundo real lo computaría el backend desde las asignaciones (dedicaciones por célula); acá lo sirven los handlers de MSW. No se computa en el cliente: exigiría traer las asignaciones de todas las células por cada página del listado (N+1), y el cálculo es del dominio del backend.
- **`Progress` de `tuip` no encaja en los umbrales de la referencia**: pinta `success` para todo valor ≤ 100 y `danger` sólo al pasarse; la referencia pide `warning` exactamente al 100%. Las clases semánticas de relleno (`bg-success-bold`, `bg-warning-bold`, `bg-danger-bold`) y el track (`bg-neutral-subtle`, `rounded-pill`) están en el CSS compilado del paquete (las escriben `SegmentedBar` y `Progress`).
- Los anchos calculados van por estilo inline, como en toda esta feature: la app no compila Tailwind.

## Goals / Non-Goals

**Goals:**

- Que el listado responda "¿quién tiene espacio y quién está al tope?" sin abrir nada más.
- Umbrales de color idénticos a la referencia y coherentes con la convención de sobrecarga que `Progress` ya estableció (danger al pasarse).

**Non-Goals:**

- No se edita FTE ni utilización desde el listado; no se ordena ni filtra por las columnas nuevas.
- No se extiende `Progress` en `tuip` con umbral de warning: un consumidor no justifica cambiar el contrato de una pieza estable; queda anotado como candidato si el patrón reaparece.
- No se toca el cálculo agregado de la card de FTE del resumen.

## Decisions

- **`utilization` viaja en `PersonDto` como entero 0–100+ (porcentaje), calculado, sólo de lectura.** No entra en `CreatePersonRequest`/`UpdatePersonRequest` ni en el formulario: nadie lo escribe, el backend lo deriva. El guard de validación de los handlers no cambia. Alternativa considerada: un endpoint aparte de utilización por persona. Se descarta: obliga a una segunda petición por página para un dato que pertenece a la misma fila.
- **Los mocks asignan valores fijos y variados por persona** — cubriendo 0, rangos medios (40–80), 100 y al menos un caso > 100 para ver el danger saturado — y `0` en las altas. Fijos y no derivados: el catálogo de mocks es determinista a propósito (las pruebas assertan contra él).
- **La celda de la barra se compone local**: track `bg-neutral-subtle rounded-pill` de alto inline (~0.375rem), relleno con la clase del umbral y ancho inline `min(utilization, 100)%`, y el porcentaje como texto `tabular-nums` al lado. Umbrales: `0` sin relleno; `1–99` → `bg-success-bold`; `100` → `bg-warning-bold`; `>100` → `bg-danger-bold` saturado al 100% de ancho. El mapeo umbral → clase vive en una función pura junto al componente, exportable a la prueba.
- **El texto del porcentaje va en color neutro**, no teñido como en la referencia: los pasos de texto semánticos (`text-success-*`…) no están garantizados en el CSS compilado — sólo los de `danger` se usan hoy — y la barra ya lleva el color. Registrado como desviación consciente de la referencia; si se quiere el texto teñido, primero hay que verificar qué clases de texto llegan del paquete.
- **FTE como número plano** (`tabular-nums`), no la caja con borde de la referencia: allá es un input editable; acá una caja que parece input prometería una edición que el listado no ofrece.
- **Columnas después de Modalidad y antes del menú de acciones**, cabeceras "FTE" y "Utilización". La celda de utilización fija un ancho mínimo inline para que la barra no colapse en pantallas angostas.

## Risks / Trade-offs

- **[La fila gana dos columnas y la tabla se acerca a su límite de ancho en pantallas chicas]** → La tabla ya scrollea dentro de su contenedor si no entra; la barra fija ancho mínimo y el resto de columnas ya truncan. Se mira en la verificación en pantalla.
- **[`utilization` fijo en mocks puede desalinearse de las asignaciones mockeadas de Capacidades]** → Aceptado y anotado en el handler: los mocks de este repo no comparten estado entre features (el de Capacidades tampoco lee personas). La coherencia real la dará el backend cuando calcule el campo.
- **[El umbral `warning` exactamente en 100 difiere del `Progress` de `tuip` (verde hasta 100 inclusive)]** → Deliberado y pedido por la referencia; queda escrito en el spec con su escenario. Si `tuip` adopta el patrón algún día, esta celda migra a la pieza.
- **[Texto del % en neutro difiere de la referencia (teñido)]** → Desviación registrada arriba, con el camino para revertirla si importa.

## Migration Plan

1. DTO + adapter + mocks (campo nuevo con valores).
2. Columnas en `PeopleList.tsx` y celda de la barra.
3. Pruebas y verificación en pantalla.

Rollback: quitar las dos columnas y el campo del DTO/mocks — nada más depende de `utilization`.
