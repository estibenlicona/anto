## 1. Modelo y servicio

- [x] 1.1 Crear `frontend/src/features/admin-shell/services/questionPoolService.ts` con `getPool`/`savePool` sobre `httpClient` contra `/admin/question-pool`, calcado de `capabilityMixService`.
- [x] 1.2 Definir el tipo de una fila: `{ id: string; dimension: string; texto: string; peso: number }`. El pool es una lista plana, no agrupada — ver la decisión en design.md.
- [x] 1.3 Exportar `QUESTION_DIMENSIONS`, la lista fija de las siete dimensiones en su orden de referencia: Negocio y cliente, Alcance funcional, Integraciones, Datos, seguridad y cumplimiento, Tecnología y arquitectura, Operación y soporte, Incertidumbre y dependencias.
- [x] 1.4 Exportar `QUESTION_SCORE_MAX = 4` (la escala cualitativa de 5 niveles del modelo, 0 a 4) y un helper `dimensionSummary(pool)` que devuelva, para cada dimensión en el orden de `QUESTION_DIMENSIONS`, su cantidad de preguntas, la suma de sus pesos y `pesoTotal * QUESTION_SCORE_MAX`.

## 2. Mock

- [x] 2.1 Crear `frontend/src/mocks/handlers/question-pool.handlers.ts` con estado en memoria, sembrado con las 30 preguntas reales del modelo de referencia: `context/mvps/plataforma_dimensionamiento_v7_unificado.html`, array `QUESTIONS` (comentario `/* [código, dimensión, texto, peso, tipo] */`, alrededor de la línea 1490) y `DIMS` para los nombres de dimensión por índice. Tomar código, dimensión (mapeada por índice a su nombre) y texto y peso, tal cual — el campo `tipo` del array de origen no aplica acá, es del motor de scoring que esta pantalla no construye.
- [x] 2.2 GET y PUT del pool completo.
- [x] 2.3 Validar en el PUT que cada pregunta tenga texto no vacío, peso entero positivo, y una dimensión que esté en `QUESTION_DIMENSIONS`; responder 400 sin tocar lo guardado cuando no se cumpla.
- [x] 2.4 Exportar la función de reinicio, como `resetQuestionPoolMock`.
- [x] 2.5 Registrar los handlers en `frontend/src/mocks/handlers/index.ts`.

## 3. Hook

- [x] 3.1 Crear `frontend/src/features/admin-shell/hooks/useQuestionPool.ts` siguiendo la forma de `useCapabilityMix`: valores vigentes y guardados, errores por fila, `loading`, `saving`, `loadError`, estado sucio, `canSave`, `discard` y un `save` que devuelve su resultado.
- [x] 3.2 Incluir la guarda de forma sobre la respuesta, por el mismo motivo que en bandas y capacidades: sin mocks el dev server responde su `index.html` con 200.
- [x] 3.3 Exponer `setRowTexto`, `setRowPeso`, `addRow(dimension)` (genera un id propio, arranca con texto vacío) y `removeRow(index)`.
- [x] 3.4 Validar por fila que el texto no quede vacío y que el peso sea un entero positivo.

## 4. Editor

- [x] 4.1 Crear `frontend/src/features/admin-shell/components/QuestionPoolModal.tsx` agrupando las preguntas por dimensión, en el orden de `QUESTION_DIMENSIONS`, con el nombre de cada dimensión como subtítulo de su grupo.
- [x] 4.2 Cada pregunta con su texto y su peso editables, y su acción de quitar. Cada grupo con su acción de agregar, que crea la pregunta ya asignada a esa dimensión.
- [x] 4.3 Mostrar el error de una pregunta junto al campo que lo tiene, y deshabilitar confirmar mientras haya alguno.
- [x] 4.4 Al confirmar con éxito cerrar; ante error de guardado mostrarlo y dejar el editor abierto con lo editado.
- [x] 4.5 Al cancelar, descartar todo lo editado, incluidas altas y bajas.

## 5. Integración en la pantalla

- [x] 5.1 En `AdminParametersPage.tsx`, reemplazar la constante `preguntas` por `dimensionSummary(pool.saved)` del hook nuevo.
- [x] 5.2 La columna "Peso total" pasa a mostrar un número entero, sin `%`.
- [x] 5.3 Agregar la acción "Editar preguntas" junto a las pestañas, visible sólo con la sección Preguntas activa — mismo criterio que "Editar mix" y las acciones de bandas.
- [x] 5.4 Manejar los estados de la sección: cargando y error de carga del pool.
- [x] 5.5 Confirmar que la condición que muestra las acciones de bandas y de mix sigue siendo la suya, y no se cruza con la de preguntas.

## 6. Pruebas

- [x] 6.1 Pruebas del handler: `GET` inicial (30 preguntas, 7 dimensiones), `PUT` válido reflejado después, y `PUT` inválido (texto vacío, peso no entero o no positivo, dimensión fuera de la lista) que responde 400 sin alterar lo guardado.
- [x] 6.2 Pruebas del hook: carga, edición de texto y de peso, alta, baja, validación que bloquea el guardado, guardado exitoso y error.
- [x] 6.3 Pruebas de `dimensionSummary`: cuenta, suma de pesos y máximo de puntos correctos por dimensión, incluida una dimensión sin preguntas.
- [x] 6.4 Pruebas del editor: abre agrupado por dimensión con lo guardado, agregar suma una pregunta a su grupo, quitar la saca, cancelar descarta todo, confirmar guarda y cierra.
- [x] 6.5 Ajustar las pruebas de `AdminParametersPage` que hoy asumen las preguntas estáticas.
- [x] 6.6 Correr la suite del frontend; los únicos fallos esperados son los dos preexistentes (`App.test.tsx`, `httpClient.test.ts`).

## 7. Verificación

- [x] 7.1 Abrir la sección Preguntas y confirmar que la tabla muestra las siete dimensiones con conteo, peso total y máximo de puntos reales — no los valores de relleno de antes.
- [x] 7.2 Confirmar que el total de preguntas suma 30 y el peso total general suma 70, contra los datos del modelo de referencia.
- [x] 7.3 Abrir el editor y confirmar que las 30 preguntas están, agrupadas correctamente por dimensión.
- [x] 7.4 Editar el peso de una pregunta, guardar, y confirmar que el peso total y el máximo de puntos de su dimensión cambiaron en la tabla.
- [x] 7.5 Agregar una pregunta a una dimensión, completarla y guardar; confirmar que el conteo de esa dimensión subió.
- [x] 7.6 Quitar una pregunta y guardar; confirmar que el conteo bajó y el resto no cambió.
- [x] 7.7 Dejar un texto vacío y un peso inválido, y confirmar que cada uno señala su campo y bloquea el guardado.
- [x] 7.8 Confirmar que la acción de editar preguntas sólo aparece en su pestaña, y no interfiere con las de bandas o capacidades.
- [x] 7.9 Correr `tsc --noEmit` en `frontend`.
