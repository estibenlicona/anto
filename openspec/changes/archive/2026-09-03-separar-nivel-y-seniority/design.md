# Diseño — Separar Nivel de Seniority

## Context

Ver proposal.md — Why. Hoy `PersonDto.seniority` es un número 1–4 con `seniorityLabel` en la escala Tuya (Principiante → Experto); el catálogo `seniorities` sirve esos 4 valores, y toda la UI (listado, formulario, tarjetas, ficha, líneas de expertise, asignaciones, drawer de reasignación, panel de margen) lo rotula "Seniority". Las comparaciones (`requiredSfia` de la célula, `costReading`) también se calculan sobre ese número. Todo el backend es mockeado: el contrato se puede mover sin migración real.

**Dependencia de archivo**: `redisenar-detalle-persona` (activo) modifica "Detalle de persona"; se archiva antes que este cambio, cuyo delta ya está escrito sobre esa anatomía.

## Goals / Non-Goals

**Goals**
- Dos campos propios y editables en la persona: `level` (1–4, escala Tuya) y `seniority` (Junior/Intermedio/Senior).
- Comparaciones por Nivel (lo que pide la célula, la lectura del costo) sin cambiar su lógica: sólo cambia el nombre del campo y el rótulo.
- Vocabulario limpio en todo el sitio: "Nivel" para la escala de 4, "Seniority" para J/I/S.

**Non-Goals**
- No se toca tuip: `SeniorityCard`/`LevelMeter` siguen presentando la escala de 4 (el nombre del componente no se renombra).
- No se agrega filtro de Seniority fuera de Personas (Asignaciones sólo renombra el suyo a Nivel).
- No cambian Competencias ni skills-catalog: ya usan la escala de 4 correctamente.
- El backend real queda fuera: el contrato nuevo vive en los mocks.

## Decisions

1. **Renombrar el campo numérico a `level` y estrenar `seniority` como enum** (`"Junior" | "Intermediate" | "Senior"` + `seniorityLabel`). Alternativa descartada: dejar `seniority` numérico y agregar `seniorityBand` — perpetúa el nombre equivocado sobre la escala de 4 y el barrido de vocabulario quedaría a medias.
2. **Catálogos**: `GET /catalogs/levels` (4) y `GET /catalogs/seniorities` (3). El hook `useCatalogs` expone ambos; el formulario agrega el select de Nivel junto al de Seniority.
3. **Comparaciones**: `sfiaGap` pasa a `levelGap` (persona.level ≥ requiredLevel de la célula; `requiredSfia` del DTO de células se renombra `requiredLevel` en mocks y adaptadores) y `costReading` se etiqueta "en rango para <levelLabel>". La lógica no cambia.
4. **Presentación del Seniority: texto plano** (columna y fila de ficha), sin medidor ni badge — es una escala de 3 sin componente propio; el medidor queda reservado al Nivel para que las dos escalas no se confundan visualmente.
5. **Distribución del resumen por Seniority** con los tres primeros tonos del vocabulario ordinal (sky → blue → violet) recorridos de menor a mayor; deja de acoplarse a la columna del listado (que ahora es Nivel).
6. **Semillas**: el seniority inicial se deriva del nivel (1–2 → Junior, 3 → Intermedio, 4 → Senior) y queda editable; los tests que fijaban "Avanzado" como seniority pasan a fijar nivel "Avanzado" + seniority explícito.
7. **Barrido por búsqueda de símbolos**, no por texto: se renombra en los DTOs (`personService`, `capacityOverviewService`, `expertiseLinesService`, `allocationService`, `dedicationService` donde toque) y el compilador arrastra adaptadores y componentes; al final, `grep -i seniority` sólo debe encontrar el concepto J/I/S.

## Risks / Trade-offs

- **Churn amplio y mecánico** (muchos archivos, poco riesgo por archivo): el tipo nuevo hace que tsc marque cada punto pendiente.
- La palabra "Seniority" cambia de significado en el contrato mockeado: cualquier rama vieja que se rebase sobre esto compila pero puede leer el campo equivocado; mitigado porque el numérico ya no se llama `seniority` (rompe en compilación, no en silencio).
- El drawer de reasignación y el panel de margen muestran hoy `seniorityLabel`: pasan a mostrar el Nivel (decisión 3); si en uso real se extraña el Seniority ahí, se agrega después.

## Migration Plan

Un solo cambio de frontend + mocks; sin datos reales que migrar. Orden: contrato/mocks → adaptadores → UI → tests → docs (`context/docs/Roles_y_Permisos_Plataforma.md` y `Especificacion_...` donde nombren seniority para la escala de 4).

## Open Questions

(ninguna — las tres decisiones de alcance las tomó el usuario: dos campos propios, comparaciones por Nivel, listado con ambas columnas)
