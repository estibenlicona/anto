## Context

`Person.name` (`frontend/src/features/people/adapters/PersonAdapter.ts`) es una sola cadena "Nombre Apellido" (ej. "María González"); no hay un campo separado de nombres/apellidos en el DTO ni en el backend. El componente `Avatar` de `@tuya-ui/components` ya soporta `children` (iniciales visibles, provistas por el consumidor), `label` (nombre completo, para accesibilidad), `size` y `color` — no requiere cambios. Ver proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Derivar iniciales "primer nombre + primer apellido" a partir de `Person.name` en el cliente, sin tocar el backend ni el DTO.
- Insertar el avatar en la celda de nombre del listado de Personas, con el nombre completo como `label` accesible.

**Non-Goals:**
- No se agrega selección ni asignación de `color` por persona (queda el gris/neutro por defecto de `Avatar`).
- No se cambia el modelo de datos de `Person`/`PersonDto` para separar nombres de apellidos.
- No se agregan avatares a otros listados (Células, Asignaciones) — fuera de alcance de este cambio.

## Decisions

**Regla de derivación de iniciales**: separar `name` por espacios; tomar la primera letra del primer token y la primera letra del segundo token, en mayúsculas (ej. "María González" → "MG"). Para nombres de un solo token, se usa solo esa primera letra. Para nombres compuestos de 3+ tokens (ej. "Ana María Torres Gómez"), esta regla toma el primer y segundo token tal cual, sin distinguir dónde terminan los nombres y empiezan los apellidos — el DTO no tiene esa estructura, así que no es posible resolverlo con certeza. Se documenta como limitación conocida; todos los datos mock actuales son de dos tokens y no la exhiben.

**Color del avatar**: se deja el valor por defecto (`gray`, neutro) del componente `Avatar`, sin pasar `color`. La propuesta del usuario solo pidió iniciales, no color por persona; agregar una asignación de color sería una decisión de diseño no solicitada.

**Tamaño del avatar**: `size="small"` para que se ajuste a la altura de fila de la tabla.

**Mocks**: no se requiere ningún cambio estructural en `people.handlers.ts` — los tres registros existentes ("María González", "Laura Ruiz", "Carlos López") ya son nombres de dos tokens, compatibles con la regla de derivación.

## Risks / Trade-offs

- [Nombres compuestos o con un solo token producen iniciales potencialmente "incorrectas" o de una sola letra] → Aceptado como limitación conocida dado que el modelo de datos actual no distingue nombres de apellidos; documentado en la especificación mediante el escenario de iniciales.
