## 1. Casos dorados del motor

El contrato va primero: es lo único que impide que las dos implementaciones del motor diverjan (design.md — D5).

- [x] 1.1 Crear `fixtures/estimation-model/casos-dorados.json` en la raíz del repo con al menos ocho casos (modelo de entrada + respuestas + plazo + resultado esperado), cubriendo los tres tipos de pregunta, una pregunta que no aporta a una salida, una que aporta sólo a riesgo, y los cuatro plazos; verificar que el archivo valida contra su propio esquema con un test de forma
- [x] 1.2 Escribir el runner de C# que lee ese archivo y lo ejecuta contra `EvaluationEngine`, y verificar que **falla** hoy (el motor todavía no es paramétrico) — un runner que pasa antes de reescribir el motor está leyendo mal
- [x] 1.3 Escribir el runner de Vitest que lee el **mismo** archivo y lo ejecuta contra `computeEvaluation`, y verificar que falla por las mismas razones que 1.2

## 2. Dominio del modelo de estimación

- [x] 2.1 Crear `EstimationModel` y `ModelVersion` en `backend/src/GestionCapacidad.Domain/Entities/`, con estado (`Borrador`, `Vigente`, `Archivada`), vigencia y la regla de que toda mutación fuera de `Borrador` tira `DomainException`; verificar con tests de dominio que un `Vigente` rechaza cada mutación
- [x] 2.2 Crear `Driver`, `QuestionOption`, `QuestionOutputWeight` y `MixModifier`, y colgarlos de `ModelVersion`; verificar que una versión no acepta dos opciones con el mismo valor normalizado en la misma pregunta ni tramos solapados en una cuantitativa
- [x] 2.3 Extender `PoolQuestion` con tipo (`Cuantitativa`/`Evaluativa`/`Binaria`), unidad y driver, moviéndola dentro de `ModelVersion`; verificar que una cuantitativa sin unidad y una evaluativa sin opciones son rechazadas
- [x] 2.4 Extender `TallaBand` con el PM esperado y validar `mínimo ≤ esperado ≤ máximo`; verificar con tests de dominio los tres bordes
- [x] 2.5 Cambiar `CapabilityMixRow` de personas a porcentaje y exigir que cada columna de talla sume 100; verificar que una columna en 99 o en 101 es rechazada con el mensaje que nombra la talla
- [x] 2.6 Implementar la función pura de los nueve chequeos de validación sobre `ModelVersion`, devolviendo `(código, estado, qué falta, sección)`; verificar con un test por chequeo que falla sólo el que corresponde
- [x] 2.7 Implementar la publicación en el dominio: pasa la versión a `Vigente`, archiva la anterior, exige que la validación no deje impedimentos; verificar que publicar con un impedimento tira y que la anterior sigue vigente

## 3. Persistencia y migración de datos

- [x] 3.1 Agregar las configuraciones de EF de las entidades nuevas y las columnas nuevas en `backend/src/GestionCapacidad.Infrastructure/Persistence/EntityConfigurations/`; verificar que `dotnet ef migrations add` genera la migración esperada y que `dotnet ef database update` corre limpio sobre `gestioncapacidad_dev`
- [x] 3.2 Escribir la migración de datos que crea el modelo de Fase 1 con su versión 1 en `Vigente`, poblada desde los cuatro agregados actuales: pesos volcados a la salida de tamaño, PM esperado inicializado en el punto medio de la banda, mix convertido a porcentaje por columna, tipos y opciones de pregunta tomados de los que hoy asigna el mock por id; verificar con un test de integración que la v1 resultante reproduce la talla, el puntaje de tamaño y el rango de persona-mes que da el motor de hoy para tres iniciativas ya evaluadas — el persona-mes **esperado** sí cambia, y es el defecto que el cambio corrige (design.md — D10)
- [x] 3.3 Registrar, como salida de 3.2, qué chequeos de 2.6 **no** pasaría la v1 migrada (se crea `Vigente` sin validar, design.md — Risks); verificar que ese listado queda en el log de la migración y no en un comentario
- [x] 3.4 Agregar `ModelVersionId` obligatorio a `InitiativeEvaluation` y asignar la versión 1 a todas las evaluaciones guardadas; verificar que no queda ninguna evaluación sin versión con una consulta de conteo en el test de migración
- [x] 3.5 Actualizar `DevelopmentDataSeeder` para sembrar una versión vigente completa, una archivada y un borrador; verificar que un arranque en Development muestra los tres estados en la lista

## 4. Motor del backend

- [x] 4.1 Reescribir `EvaluationEngine` para leer respuesta → opción → valor normalizado → driver → peso por salida, con las tres salidas separadas; verificar que el runner de 1.2 pasa entero
- [x] 4.2 Hacer que el PM esperado salga del parámetro de la banda y no del punto medio; verificar con un caso dorado en el que el esperado no es el punto medio y el resultado lo respeta
- [x] 4.3 Calcular el mix leyendo porcentajes y aplicando los modificadores por driver, repartiendo sin agregar; verificar que el FTE total por perfil suma el FTE de la iniciativa en todos los casos dorados

## 5. Casos de uso y API

- [x] 5.1 Crear los casos de uso de lectura (`GetEstimationModels`, `GetModelVersionContent`, `GetModelVersionValidation`, `GetModelVersionDiff`, `GetModelVersionHistory`) bajo `UseCases/Admin/`; verificar cada uno con su test de caso de uso
- [x] 5.2 Crear los casos de uso de escritura (`CreateModelVersionFrom`, `SaveModelVersionSection` por sección, `PublishModelVersion`), todos exigiendo el autor en el request y rechazando su ausencia con 400; verificar que una escritura sin autor no guarda ni el cambio ni la entrada de historial
- [x] 5.3 Registrar los endpoints en `AdminEndpoints.cs`, con 409 para escrituras sobre una versión que no es borrador y 422 con los chequeos que no pasan al publicar; verificar con tests de `GestionCapacidad.WebApi.Tests` los tres códigos
- [x] 5.4 Actualizar el `GET` del modelo de evaluación para servir el contenido de la versión vigente, incluyendo su identificador de versión y los pesos con "no aporta" distinto de cero; verificar que publicar una versión nueva cambia lo que devuelve y guardar un borrador no
- [x] 5.5 Hacer que guardar una evaluación persista `ModelVersionId` y validar las respuestas contra las opciones de la versión, no contra el rango 0–4; verificar que un valor que no es opción de esa pregunta responde 400 sin tocar la evaluación previa

## 6. Mocks del frontend

- [x] 6.1 Crear `frontend/src/mocks/handlers/model-versions.seeds.ts` con una versión vigente completa, una archivada y un borrador, alineados con lo que siembra `DevelopmentDataSeeder`; verificar que el mix sembrado nombra los mismos seis perfiles que ya usan las células (`allocations.seeds.ts`)
- [x] 6.2 Crear `model-versions.handlers.ts` con el listado, el contenido, la creación desde otra versión, el `PUT` por sección, el 409 sobre publicadas y la función de reinicio; verificar con tests de handler cada escenario de la spec
- [x] 6.3 Crear `model-publish.handlers.ts` con validación, diferencias, publicación (422 con impedimentos) e historial; verificar que publicar cambia lo que devuelve el handler del modelo de evaluación en la misma sesión
- [x] 6.4 Reescribir `initiatives.handlers.ts` para persistir la versión con cada evaluación y validar contra las opciones; verificar que una evaluación guardada antes de publicar conserva su resultado y su versión después de publicar
- [ ] 6.5 Eliminar `talla-bands.handlers.ts`, `capability-mix.handlers.ts` y `question-pool.handlers.ts` y sus registros en `index.ts`; verificar que la suite completa pasa sin ellos

## 7. Motor y contrato del frontend

- [ ] 7.1 Reescribir los tipos de `evaluationModel.ts` (versión, tipo de pregunta, opciones, drivers, pesos por salida, mix en porcentaje) y `computeEvaluation` contra ellos; verificar que el runner de 1.3 pasa entero
- [ ] 7.2 Actualizar `EvaluationAdapter.ts` y `SavedEvaluationAdapter.ts` para las etiquetas de los tres tipos y para leer la banda de la **versión guardada** en vez de la vigente; verificar que una evaluación calculada con otra versión ya no se re-etiqueta con la banda de hoy
- [x] 7.3 Actualizar los servicios de Admin para consumir los endpoints de versiones; verificar que los tests de servicio cubren el 409 y el 422

## 8. Componentes nuevos

- [x] 8.1 Crear `MatrixNumberCell` en `frontend/src/shared/components` con sus tres estados —número, guion de "no aporta", vacío editable—; verificar con tests que el guion no es un cero y que el estado se anuncia
- [x] 8.2 Crear `ValidationList`, con estado por ítem y la acción que lleva a su sección; verificar que cada ítem que falla expone su acción y que los que pasan no
- [x] 8.3 Crear `ValueDiff` (valor anterior → valor nuevo) y `PairedBar` (demandado contra disponible); verificar que los dos se leen sin color como único canal
- [x] 8.4 Extender `SegmentedControl` con `tone` por opción en un envoltorio local; verificar que la variante sin `tone` sigue igual a la de tuip
- [x] 8.5 Documentar los cinco como propuestos para tuip, con la API que tendrían en el catálogo, igual que se hizo con `BandScale`; verificar que el documento nombra el archivo destino de cada uno

## 9. Pantallas de Parámetros

- [x] 9.1 Reemplazar `AdminParametersPage` por la lista de modelos y versiones, con la acción que corresponde al estado de cada una; verificar que una versión publicada ofrece crear una nueva y no un botón muerto
- [x] 9.2 Agregar las rutas `admin/parametros/:modeloId/:versionId/:seccion` en `frontend/src/module/routes.tsx`; verificar que recargar sobre una sección la abre en esa sección
- [x] 9.3 Construir el marco del editor: barra de contexto con modelo, versión, estado y cambios sin publicar, y las cinco secciones con una visible a la vez; verificar que una versión publicada se muestra sin controles de edición
- [x] 9.4 Construir la sección de dimensiones y preguntas, con el tipo y las opciones de cada una; verificar que agregar una cuantitativa exige unidad y tramos
- [x] 9.5 Construir la sección de drivers y pesos con `MatrixNumberCell`; verificar que se puede poner "no aporta" y que queda distinto de cero al recargar
- [x] 9.6 Construir la sección de reglas de talla con el PM esperado propio y los umbrales contiguos; verificar que mover un umbral mueve el vecino y nunca deja hueco
- [x] 9.7 Construir la sección de mix en porcentaje con sus modificadores; verificar que una columna que no suma 100 se marca antes de guardar
- [x] 9.8 Construir la sección de publicar: validación con `ValidationList`, diferencias con `ValueDiff`, y el botón que dice cuántos impedimentos quedan; verificar que activar un impedimento abre la sección donde se arregla
- [x] 9.9 Construir el historial de cambios de una versión; verificar que cada entrada muestra fecha, autor y qué cambió, y que la pantalla dice que el autor es declarativo

## 10. Evaluación de iniciativas

- [ ] 10.1 Actualizar `DimensionStep` para renderizar el control que corresponde al tipo de cada pregunta —número con unidad, opciones, sí/no—; verificar que ninguna opción muestra su puntaje
- [ ] 10.2 Agregar la derivación de la respuesta (respuesta, valor normalizado, driver, salidas con su peso); verificar que una cuantitativa muestra el tramo en el que cayó el número
- [ ] 10.3 Actualizar el resultado para separar tamaño y esfuerzo, mostrar la capacidad de cada plazo y el mix en porcentaje con su FTE; verificar que cambiar el plazo no mueve talla ni esfuerzo
- [ ] 10.4 Mostrar en una evaluación guardada con qué versión se calculó, y ofrecer recalcular con la vigente sin hacerlo solo; verificar que abrir esa evaluación no dispara ningún guardado

## 11. Limpieza

- [ ] 11.1 Eliminar los casos de uso `GetTallaBands`, `SaveTallaBands`, `GetCapabilityMix`, `SaveCapabilityMix`, `GetQuestionPool`, `SaveQuestionPool` y sus endpoints; verificar que la solución compila y que no queda ninguna referencia con una búsqueda por nombre
- [ ] 11.2 Eliminar los agregados `TallaBandSet`, `CapabilityMix` y `QuestionPool` y sus tablas con una segunda migración; verificar que `dotnet ef database update` corre limpio y que los tests de integración pasan
- [ ] 11.3 Correr la suite completa de frontend y backend y el chequeo de escritura de UI (`uiWriting.test.ts`); verificar que pasa en verde sin tests deshabilitados
- [ ] 11.4 Correr `openspec validate --change "modelo-de-estimacion-versionado" --strict`; verificar que no reporta hallazgos
