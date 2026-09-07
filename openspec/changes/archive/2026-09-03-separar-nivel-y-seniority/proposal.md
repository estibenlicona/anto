# Separar Nivel (escala Tuya) de Seniority

## Why

Hoy la plataforma usa un solo campo para dos conceptos distintos: la escala Tuya de 4 niveles (Principiante, Competente, Avanzado, Experto) se muestra bajo el nombre "Seniority" en listados, formularios, tarjetas y fichas. El usuario necesita que sean atributos separados: el **Nivel** (la escala de 4, la misma de habilidades y stacks) y el **Seniority** (Junior, Intermedio, Senior), cada uno con su vocabulario en todo el sitio.

## What Changes

- **La persona tiene dos campos propios y editables**: `Nivel` (escala de 4) y `Seniority` (Junior / Intermedio / Senior). El formulario de crear/editar persona ofrece los dos selects, cada uno desde su catálogo.
- **Las comparaciones siguen siendo por Nivel**: lo que una célula pide para asignar ("pide Avanzado") y la lectura del costo ("en rango para Avanzado") se leen contra el Nivel; el Seniority es descriptivo de la persona. **BREAKING** en el contrato mockeado: el campo numérico `seniority` (1–4) pasa a llamarse `level`/`levelLabel`, y `seniority`/`seniorityLabel` pasan a llevar Junior/Intermedio/Senior.
- **Listado de Personas con ambas columnas**: Seniority (texto Junior/Intermedio/Senior) y Nivel (el medidor de 4 con el nombre). El filtro existente de 4 valores se renombra **Nivel** y se agrega el filtro **Seniority** (J/I/S). La tarjeta "Distribución por seniority" pasa a distribuir por Junior/Intermedio/Senior.
- **Ficha de la persona**: a la fila Nivel se le suma la fila **Seniority** (Junior/Intermedio/Senior).
- **Barrido de vocabulario en el resto del sitio**: donde se muestra la escala de 4 con el medidor (líneas de expertise, asignaciones de una célula, drawer de reasignación, panel de margen de la Torre) el rótulo dice **Nivel**, no Seniority; el filtro de asignaciones por la escala de 4 se renombra Nivel.
- **Catálogos**: `seniorities` pasa a servir Junior/Intermedio/Senior; nace `levels` con la escala de 4.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: resumen del módulo (distribución por Seniority J/I/S), listado (ambas columnas y ambos filtros), selección desde catálogo (dos catálogos), detalle (fila Seniority junto a Nivel).
- `allocations`: el filtro por la escala de 4 se renombra Nivel.
- `expertise-lines`: el listado de personas de una línea rotula la escala de 4 como Nivel.
- `api-mocking`: el handler de personas sirve `level`/`levelLabel` + `seniority`/`seniorityLabel` (J/I/S) y los dos catálogos.

## Impact

- `frontend/src/features/people` (servicio, adaptadores, formulario y validación, listado, stats cards, detalle), `allocations`, `expertise-lines`, `control-tower` (drawer y panel de margen), `dedication` (adaptadores que leen `seniorityLabel`), y sus mocks (`people.handlers`, `personDetail.*`, `chapters`, `capacity overview`) y tests.
- Sin cambios en tuip: el medidor de 4 (`SeniorityCard`/`LevelMeter`) sigue presentando el Nivel.
- **Dependencia de archivo**: el cambio activo `redisenar-detalle-persona` modifica el mismo requirement "Detalle de persona"; debe archivarse **antes** que este cambio (el delta de acá está escrito sobre esa anatomía).
- Supuesto anotado (semilla de datos): el Seniority inicial de cada persona mockeada se deriva de su nivel — 1–2 → Junior, 3 → Intermedio, 4 → Senior — y luego se edita libremente.
