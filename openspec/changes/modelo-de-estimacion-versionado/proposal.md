## Why

El módulo de Parámetros del modelo hoy son cuatro tablas planas —bandas, mix, preguntas y una pestaña de "Versionado" con el botón deshabilitado— que se editan en bloque sobre una única fila de base. Eso deja tres agujeros que la HU de estimación paramétrica cierra:

1. **Lo publicado se puede reescribir hacia atrás.** Los cuatro parámetros se guardan como agregados de fila única: cada guardado hace `Replace()` sobre la misma fila. No hay historial, ni estado, ni vigencia. Cambiar un peso hoy cambia lo que dicen las 123 estimaciones ya calculadas, que alguien usó para decidir.
2. **El motor no es paramétrico, es una suma.** Una pregunta tiene un peso escalar y una escala de 0 a 4 cableada. La HU pide que cada respuesta pase por un driver y que ese driver pese distinto en cada salida —tamaño, esfuerzo, riesgo/confianza—, porque hoy una pregunta de riesgo agranda la talla, que es justo lo que la regla de negocio prohíbe.
3. **El mix pide perfiles que las células no tienen.** El mix se expresa en personas por talla y sólo nombra tres capacidades. Una célula de datos o de canales aparece descubierta contra una demanda que nunca nombra su perfil, y el PM esperado no existe como parámetro: se deriva como punto medio de la banda en cuatro lugares distintos, lo que hace que todas las iniciativas de una talla reciban la misma cifra sin importar su puntaje.

## What Changes

- **Versión como unidad de trabajo.** Se introduce el modelo de estimación con versiones (`Borrador`, `Vigente`, `Archivada`), vigencia por fecha e inmutabilidad: una versión que ya calculó estimaciones no se edita, se crea una nueva a partir de ella. La raíz de Parámetros pasa de cuatro pestañas a la lista de modelos y sus versiones; el editor vive dentro de una versión, con cinco secciones.
- **Snapshot en cada estimación.** Cada evaluación guarda con qué versión se calculó, de modo que publicar deja de reescribir el pasado. **BREAKING**: `InitiativeEvaluation` gana un campo obligatorio de versión; las evaluaciones ya guardadas se migran apuntando a la versión inicial.
- **Tipos de pregunta y opciones de respuesta.** Cada pregunta declara su tipo —cuantitativa, evaluativa o binaria— y sus opciones: para una cuantitativa, tramos sobre el número que responde el usuario, con su puntaje normalizado. **BREAKING**: reemplaza el `kind` de dos valores que hoy vive en las semillas del mock y no en el pool.
- **Drivers y pesos por salida.** Se introduce el driver como nivel intermedio entre respuesta y resultado, y el peso pasa de escalar a una matriz pregunta × salida donde "no aporta" es distinto de cero. **BREAKING**: reescribe el motor en sus dos implementaciones.
- **Reglas de talla con PM esperado propio** y mix expresado en porcentaje por perfil, con modificadores por driver que reparten sin agregar. **BREAKING**: `PorTalla` deja de ser personas.
- **Validación antes de publicar.** Nueve chequeos que bloquean la publicación de una configuración incompleta o inconsistente, más el diff contra la versión vigente y la simulación de qué habría pasado sobre las estimaciones históricas.
- **Auditoría de cada cambio** con fecha, autor y versión. El autor viaja en el request desde la sesión del cliente: el backend todavía no valida el token, así que la firma es declarativa y no criptográfica, y queda anotada como tal hasta que exista autenticación en la API.

## Capabilities

### New Capabilities
- `estimation-model`: el modelo de estimación paramétrico y su ciclo de vida — versiones, dimensiones, preguntas con tipo y opciones, drivers, pesos por salida, reglas de talla y esfuerzo, mix en porcentaje con modificadores, validación, publicación y auditoría.

### Modified Capabilities
- `admin-shell`: la pantalla de Parámetros del modelo deja de ser cuatro pestañas planas de tablas y pasa a ser la lista de modelos y versiones más el editor de una versión; las requirements de edición de bandas, mix y pool se reemplazan por las del editor versionado.
- `initiatives`: el motor de evaluación pasa a pesos por salida y tipos de pregunta, el mix se lee en porcentaje, el PM esperado sale del parámetro y no del punto medio, y la evaluación guarda la versión con la que se calculó.
- `api-mocking`: los handlers de bandas, mix y pool se reemplazan por los de versiones del modelo, y se agregan los de drivers, pesos, modificadores, validación y publicación.

## Impact

**Dominio y datos.** Entidades nuevas (`EstimationModel`, `ModelVersion`, `Driver`, `QuestionOption`, `MixModifier`) y migración de EF: los cuatro agregados de fila única pasan a ser contenido de una versión, `PoolQuestion` gana tipo, driver y pesos por salida, `TallaBand` gana PM esperado, `CapabilityMixRow` cambia de personas a porcentaje. Las 123 evaluaciones guardadas conservan su snapshot y se les asigna la versión inicial.

**Motor.** `EvaluationEngine` en backend y `computeEvaluation` en el front —la misma lógica escrita dos veces— se reescriben juntos: el servidor manda al persistir y el cliente calcula la vista en vivo, así que divergir rompe la pantalla.

**Frontend.** Seis pantallas bajo `admin/parametros`: modelos y versiones, y las cinco secciones del editor de una versión. `AdminParametersPage` y los tres modales de hoy se reemplazan.

**Componentes.** El diseño necesita cinco piezas que tuip no tiene y que no se componen con lo que hay: `MatrixNumberCell` (celda con el estado "no aporta", que no es cero), `ValidationList`, `ValueDiff`, `PairedBar` y un `tone` por opción en `SegmentedControl`. Se escriben en `frontend/src/shared/components` y se proponen para el catálogo, igual que se hizo con `BandScale`.

**Fuera de alcance.** El tablero de Calibración histórica y el gráfico de cierres reales de la sección de tallas: los dos leen esfuerzo real, que sólo existe cuando exista la Fase 3 de cierre. La autenticación del backend, de la que depende una auditoría no declarativa.
