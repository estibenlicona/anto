## Why

La sección "Preguntas" de Parámetros del modelo hoy muestra cuatro dimensiones inventadas —"Complejidad técnica", "Impacto de negocio", "Riesgo", "Dependencias"— con conteos y pesos que no salen de ninguna pregunta real: son valores de relleno que nunca se conectaron con el modelo de scoring que la plataforma va a usar.

Ese modelo ya existe y está documentado: el MVP de referencia (`context/mvps/plataforma_dimensionamiento_v7_unificado.html`, heredado de la v1 histórica) define **7 dimensiones y 30 preguntas**, cada una con un código estable (N1, F2, I3…), su texto y su peso entero. La pantalla de Parámetros del modelo del propio MVP describe esta sección como "Pool de preguntas" y aclara que "los pesos… los sirve el backend… aquí se recalibran" — es decir, se espera que sea editable, igual que las bandas de talla y el mix de capacidades ya lo son.

Este cambio reemplaza los datos de relleno por el modelo real, deja ver las 30 preguntas (no sólo el resumen por dimensión) y agrega su edición, siguiendo el mismo patrón que ya tienen Bandas y Capacidades en esta misma pantalla.

## What Changes

- La sección Preguntas pasa a cargarse desde un endpoint mockeado, con las 30 preguntas reales del modelo de referencia: su dimensión, su texto y su peso.
- Las 7 dimensiones son las siete del modelo de referencia —Negocio y cliente, Alcance funcional, Integraciones, Datos/seguridad y cumplimiento, Tecnología y arquitectura, Operación y soporte, Incertidumbre y dependencias— y son una lista fija: este cambio no ofrece crear, borrar ni renombrar dimensiones. Son el eje estructural del modelo de scoring, no un dato de negocio como sí lo es cada pregunta.
- La tabla que hoy se ve —dimensión, cantidad de preguntas, peso total, máximo de puntos— se mantiene, pero sus valores se derivan de las preguntas reales en vez de estar escritos a mano. "Peso total" deja de mostrarse como porcentaje: el modelo no pesa en porcentajes, pesa en enteros por pregunta que se suman por dimensión.
- Se agrega una acción "Editar preguntas", visible sólo con la sección Preguntas activa —igual que "Editar reparto"/"Editar datos" en Bandas y "Editar mix" en Capacidades— que abre un editor con las preguntas agrupadas por dimensión.
- El editor permite modificar el texto y el peso de cada pregunta, y agregar o quitar preguntas dentro de una dimensión. No permite mover una pregunta de una dimensión a otra ni crear una dimensión nueva.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `admin-shell`: se agrega el modelo real de preguntas a la sección Preguntas de Parámetros del modelo (hoy sólo tenía datos de relleno, sin requisito propio que los describiera) y se incorpora su edición, con el mismo patrón de acciones ya establecido para Bandas y Capacidades.

## Impact

- `frontend/src/features/admin-shell/services/questionPoolService.ts` — nuevo. Tipos, dimensiones fijas y llamadas HTTP.
- `frontend/src/mocks/handlers/question-pool.handlers.ts` — nuevo. Estado en memoria sembrado con las 30 preguntas reales.
- `frontend/src/features/admin-shell/hooks/useQuestionPool.ts` — nuevo, con la misma forma que `useCapabilityMix`.
- `frontend/src/features/admin-shell/components/QuestionPoolModal.tsx` — nuevo editor.
- `frontend/src/pages/AdminParametersPage/AdminParametersPage.tsx` — la sección Preguntas pasa de datos estáticos a datos del hook, y suma su acción de edición.
- Pruebas de servicio, hook y pantalla, siguiendo la cobertura que ya tienen Bandas y Capacidades.
- No hay cambio de componentes de `@tuya-ui/components`: se reutilizan Table, Card, Modal, Input, Button y Alert, ya usados en los otros editores de esta pantalla. No hace falta trabajo en `tuip`.

## Supuestos a confirmar

- **Las dimensiones son fijas, las preguntas no.** Es la lectura de "se puedan editar" que se adoptó: las siete dimensiones son el eje estructural del modelo (equivalentes a que Bandas tenga exactamente cinco tallas, editables en su contenido pero no en su cantidad), mientras que las preguntas son el dato de negocio dentro de ese eje (equivalentes a las filas del mix de capacidades). Si la intención era también poder agregar o renombrar dimensiones, es un cambio de alcance mayor y conviene decirlo antes de aplicar esto.
- **El máximo de puntos por pregunta es 4**, tomado de la escala cualitativa de 5 niveles (0 a 4) que usa el modelo de referencia para calificar cada pregunta. No es un valor que este cambio proponga hacer editable: es una constante del modelo de scoring, igual que el máximo de puntos por dimensión se deriva del peso y no se guarda como dato aparte.
