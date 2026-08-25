## Why

El mix de capacidades dice cuánta gente de cada perfil pide una iniciativa según su talla. Es el segundo parámetro del modelo, después de las bandas, y hoy sigue siendo una tabla de marcador de posición: cambiarlo implica editar un arreglo en el código y desplegar.

Hay algo más que conviene arreglar en el mismo movimiento. Las columnas del mix son las mismas cinco tallas que administra la pestaña vecina, pero el mix las repite como campos sueltos (`xs`, `s`, `m`, `l`, `xl`) dentro de su propio tipo. Son dos listas de tallas que nada obliga a coincidir: el día que se agregue una, el mix queda con una columna que ya no existe o sin una que sí.

## What Changes

- Agregar una acción de edición para la sección de capacidades, junto a las pestañas y visible sólo mientras esa sección es la activa, con el mismo criterio que ya usan las acciones de bandas.
- Editar en un modal la matriz completa —una fila por capacidad, una columna por talla— y confirmar todo junto, como el editor de datos de bandas.
- Permitir agregar y quitar capacidades además de editar sus números, porque la lista de perfiles crece con el tiempo; el nombre de cada una no puede quedar vacío ni repetirse.
- Indexar los números por talla en vez de guardarlos como campos fijos, y derivar las columnas de las bandas guardadas, de modo que exista una sola lista de qué tallas hay.
- Dar a cada fila una identidad propia y estable, separada de su nombre: el nombre se edita, así que no puede ser también lo que identifica la fila.
- Cargar y guardar contra un endpoint mockeado, con el mismo patrón de servicio, hook y handler que ya usan las bandas.
- No **BREAKING** para la app: cambia el contenido de una pestaña que hoy es marcador de posición.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `admin-shell`: la sección de mix de capacidades pasa de sólo lectura a permitir editar, agregar y quitar capacidades, y sus columnas pasan a derivarse de las bandas.
- `api-mocking`: se suma el handler de mock para el mix de capacidades.

## Impact

- `frontend/src/features/admin-shell/services/capabilityMixService.ts` — servicio nuevo con GET/PUT, calcado de `tallaBandsService`.
- `frontend/src/features/admin-shell/hooks/useCapabilityMix.ts` — hook nuevo, con la misma forma que `useTallaBands` más el alta y baja de filas.
- `frontend/src/features/admin-shell/components/CapabilityMixModal.tsx` — el editor de la matriz.
- `frontend/src/pages/AdminParametersPage/AdminParametersPage.tsx` — la acción, su estado de apertura, y la tabla leyendo del hook con las columnas derivadas de las bandas.
- `frontend/src/mocks/handlers/capability-mix.handlers.ts` y `handlers/index.ts` — el mock y su registro.
- La sección pasa a depender de que las bandas carguen, porque de ahí salen sus columnas.
