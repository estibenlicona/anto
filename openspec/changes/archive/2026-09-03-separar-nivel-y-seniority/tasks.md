# Tasks — Separar Nivel de Seniority

## 1. Contrato y mocks

- [x] 1.1 `personService`: renombrar `seniority`/`seniorityLabel` numéricos a `level`/`levelLabel`; agregar `seniority: "Junior"|"Intermediate"|"Senior"` + `seniorityLabel`; tipos de filtros del listado (`level`, `seniority`) y payloads de alta/edición con ambos campos. Verificar: tsc marca todos los consumidores.
- [x] 1.2 Mocks de personas (`people.handlers`): catálogo `levels` (4) + `seniorities` (Junior/Intermedio/Senior), campos nuevos en las semillas (seniority derivado del nivel: 1–2 Junior, 3 Intermedio, 4 Senior), filtros `level` y `seniority` en el listado, resumen con distribución por seniority (3). Verificar con tests del handler.
- [x] 1.3 Renombrar el numérico en los demás contratos mockeados que lo repiten (`capacityOverviewService`, `expertiseLinesService`, `allocationService`, `personDetailService`, `dedicationService` si aplica) y `requiredSfia` → `requiredLevel` en células/sugerencias; actualizar sus handlers y semillas. Verificar: tsc limpio y suites de mocks verdes.

## 2. Adaptadores

- [x] 2.1 `PersonAdapter`/`PersonDetailAdapter`: exponer `levelLabel` (escala de 4) y `seniorityLabel` (J/I/S); `sfiaGap` → `levelGap` comparando `level` vs `requiredLevel`; `costReading` etiquetado "para <levelLabel>". Verificar con tests de adaptadores.
- [x] 2.2 Adaptadores de allocations, expertise-lines, control-tower y dedication que leían `seniorityLabel` numérico: pasar a `levelLabel`. Verificar: `grep -i seniority` en esos features sólo encuentra J/I/S.

## 3. Personas (UI)

- [x] 3.1 `PersonFormDrawer` + `personFormValidation`: dos selects desde catálogo (Nivel y Seniority), ambos obligatorios; payloads con los dos campos. Verificar con tests del formulario (crear y editar).
- [x] 3.2 `PeopleList`: columna **Nivel** (medidor + nombre, como hoy) y columna **Seniority** (texto plano J/I/S); filtro existente renombrado **Nivel** y filtro nuevo **Seniority**; ambos multiselección y reinician la página. Verificar con tests del listado.
- [x] 3.3 `PeopleStatsCards`: "Distribución por seniority" con Junior/Intermedio/Senior (tonos ordinales de menor a mayor), pie con "% Senior" y "N Junior (acompañamiento)". Verificar con tests.
- [x] 3.4 Ficha (`PersonProfilePanel`): fila **Seniority** (J/I/S) debajo de Nivel. Verificar con tests del detalle.

## 4. Barrido del resto del sitio

- [x] 4.1 Renombrar el rótulo a **Nivel** donde se muestra la escala de 4: asignaciones de una célula (columna y filtro), personas de una línea de expertise (tabla, drawer, sin línea), drawer de reasignación y panel de margen de la Torre, y cualquier encabezado que diga "Seniority" sobre la escala de 4. Verificar: `grep -rn "Seniority"` en src sólo aparece donde es J/I/S.
- [x] 4.2 Señal de la célula ("pide Avanzado"): rotularla por nivel en Células/Torre donde exista; revisar `Roles_y_Permisos_Plataforma.md` y `Especificacion_...` y actualizar el vocabulario. Verificar con `grep`.

## 5. Puerta

- [x] 5.1 Actualizar tests y fixtures al contrato nuevo en todos los features tocados. Verificar: `npx vitest run` sin regresiones nuevas.
- [x] 5.2 Puerta completa: `npx prettier --check`, `npx eslint src`, `npx tsc --noEmit`, `npx vitest run`, y verificación visual con mocks (listado con ambas columnas y ambos filtros, formulario con dos selects, tarjeta por J/I/S, ficha con las dos filas). Verificar: sin regresiones nuevas.
