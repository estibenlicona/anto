## Why

El listado de Personas muestra quién es cada persona (nombre, cargo, rol, seniority, modalidad) pero no cuánta capacidad tiene ni cuánta está usando — para eso hay que abrir el drawer de edición (FTE) o cruzar mentalmente con la pantalla de Capacidades (asignaciones). El usuario entregó una referencia: una columna con el FTE disponible y otra con la **utilización** como una barra pequeña de porcentaje, coloreada por estado — verde en uso normal, vacía en 0%, naranja al llegar al 100%.

Con eso, el listado responde de un vistazo la pregunta operativa del Chapter Lead: quién tiene espacio y quién está al tope.

## What Changes

- **Dos columnas nuevas en el listado**, después de Modalidad: **FTE** (el `availableFte` que ya viaja en el DTO, como número plano — `1`, `0.8`, `0.5`) y **Utilización** (barra pequeña + porcentaje).
- **La barra colorea por estado con los roles semánticos del sistema**: 0% deja el track vacío, entre 1% y 99% pinta `success`, exactamente 100% pinta `warning` (al tope, como el naranja de la referencia), y más de 100% satura a `danger` — la misma convención de sobrecarga que ya usa `Progress` en la card de FTE. El porcentaje acompaña la barra como texto.
- **El contrato de datos gana un campo calculado**: `PersonDto.utilization` (0–100+, porcentaje de la capacidad asignada sobre el FTE disponible), que el backend calcula desde las asignaciones. En este repo lo sirven los mocks: valores variados por persona en el catálogo de MSW (cubriendo 0, rangos medios y 100), y `0` para una persona recién creada — sin asignaciones todavía.
- **La celda de utilización se compone en la app** (track + relleno con clases semánticas + porcentaje), no con el `Progress` de `tuip`: `Progress` pinta verde todo valor ≤ 100 y la referencia pide naranja exactamente al 100%. Doblar el contrato de `Progress` por un consumidor sería peor que una celda de diez líneas; si el patrón se repite, se propone en `tuip`.

### Fuera de alcance

- Editar FTE o asignaciones desde el listado: siguen viviendo en el drawer y en Capacidades. La columna FTE es lectura — número plano, no una caja con aspecto de input como la de la referencia, que en aquella UI sí edita.
- Ordenar o filtrar por las columnas nuevas.
- Backend real y `tuip`.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: "Listar personas" suma las columnas de FTE y utilización, con la barra coloreada por umbrales de estado y el campo calculado en el contrato (MODIFIED).

## Impact

- **Contrato/mocks**: `PersonDto` (+`utilization`), `frontend/src/mocks/handlers/people.handlers.ts` — valores por persona del catálogo y `0` en las altas. El guard de validación de create/update no cambia: el campo es calculado, no se envía.
- **Adapter**: `PersonAdapter` propaga `utilization` al modelo de UI del listado.
- **Listado**: `PeopleList.tsx` — dos `TableHead`/`TableCell` nuevos y la celda compuesta de la barra.
- **Pruebas**: `PeopleList.test.tsx` — columnas presentes, umbrales de color por clase semántica, porcentaje mostrado; casos 0%, medio, 100% y >100%.
- **Sin impacto**: `tuip`, el resumen, el formulario, búsqueda/filtros/paginación.
