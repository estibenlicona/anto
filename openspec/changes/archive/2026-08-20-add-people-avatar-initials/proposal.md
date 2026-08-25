## Why

El listado de Personas hoy muestra el nombre como texto plano, sin ninguna referencia visual que ayude a identificar rápidamente a cada fila. Un avatar con las iniciales de la persona (primera letra del primer nombre + primera letra del primer apellido) mejora el escaneo visual del listado sin requerir fotos ni datos adicionales del backend.

## What Changes

- La columna "Nombre" del listado de Personas muestra un avatar circular con las iniciales de la persona (primera letra del primer nombre + primera letra del primer apellido), junto al nombre completo.
- Las iniciales se derivan en el cliente a partir del campo `name` existente (una sola cadena "Nombre Apellido"), sin cambios al modelo de datos del backend ni al DTO.
- El avatar usa el color neutro por defecto del componente `Avatar` de `@tuya-ui/components` (no se asigna un color por persona en este cambio).
- Los datos mock de personas (`people.handlers.ts`) se revisan para confirmar que los nombres usados siguen el formato "Nombre Apellido" esperado por la derivación de iniciales; no se requieren cambios estructurales al DTO mockeado.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: el requisito "Listar personas" ahora exige que cada fila muestre un avatar con las iniciales de la persona junto a su nombre.

## Impact

- `frontend/src/features/people/components/PeopleList.tsx`: agrega el `Avatar` en la celda de nombre.
- Nueva función de derivación de iniciales (primer nombre + primer apellido) a partir de `Person.name`.
- `frontend/src/mocks/handlers/people.handlers.ts`: sin cambios estructurales; se valida que los nombres mock ya son compatibles.
- No hay cambios a `tuip` (el componente `Avatar` ya soporta `children` como iniciales, `label` para accesibilidad y `color` opcional).
