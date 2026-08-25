## Why

Las bandas de talla son el parámetro más delicado del modelo —deciden en qué esfuerzo cae cada iniciativa— y hoy sólo se pueden mirar. Cambiarlas implica editar un arreglo en el código y desplegar.

El obstáculo nunca fue que faltara un formulario sino qué forma tenía que tener. Las cinco bandas parten 0–100% compartiendo límites, así que diez campos numéricos dejarían a quien edita sosteniendo a mano una invariante que puede romper: huecos, solapes, un total distinto de 100. Con `Slider` ya en el catálogo, esa partición se edita como cuatro límites sobre una misma pista — un valor por frontera — y los estados inválidos dejan de poder expresarse.

Lo que falta es la pantalla que lo use y su guardado, y ese patrón ya está resuelto en `sprintConfigService`.

## What Changes

- Agregar dos acciones de edición separadas, junto a las pestañas de la pantalla y visibles sólo mientras la sección de bandas es la activa: una abre el editor de reparto y la otra el de datos. Van separadas porque son tareas distintas —repartir es una decisión visual sobre el conjunto, cargar persona-mes y lectura es un formulario de quince campos— y en un mismo diálogo compiten entre sí.
- Editar el reparto con `Slider` en un modal grande (880px, el contenedor más ancho del catálogo: en una barra que representa 0–100%, cada píxel es precisión al arrastrar), con cuatro límites y una separación mínima para que ninguna banda quede en cero.
- Editar en el otro modal, sin los límites, el persona-mes mínimo y máximo y la lectura de cada banda.
- Cargar y guardar las bandas contra un endpoint mockeado, siguiendo el patrón ya establecido: un servicio con GET/PUT, un hook que sostiene valores, validación, estado sucio y guardado, y un handler de MSW con su función de reinicio para los tests.
- Modelar las bandas como una lista de límites más los datos propios de cada banda, en vez de un mínimo y un máximo por banda, de modo que el modelo de datos tampoco pueda representar huecos ni solapes.
- Mover el arreglo `tallas` de constante de módulo a dato que viene del servicio; el color de cada talla se queda en la pantalla, porque es presentación y no dato del modelo.
- Reparar de paso el escenario de "Parámetros del modelo" en el requisito de pantallas placeholder, que perdió la mención a las pestañas al archivarse un cambio anterior sobre el mismo requisito.
- Sin cambios **BREAKING**: la ruta, las pestañas y las otras tres secciones quedan como están.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `admin-shell`: la pantalla de Parámetros del modelo pasa de sólo lectura a permitir editar y guardar las bandas de talla.
- `api-mocking`: se suma el handler de mock para las bandas de talla.

## Impact

- `frontend/src/features/admin-shell/services/tallaBandsService.ts` — servicio nuevo con GET/PUT, calcado de `sprintConfigService`.
- `frontend/src/features/admin-shell/hooks/useTallaBands.ts` — hook nuevo con la misma forma que `useSprintConfig`, incluida la devolución del resultado del guardado en vez de leerlo del estado.
- `frontend/src/features/admin-shell/components/` — un modal por editor: el del reparto y el de los datos.
- `frontend/src/pages/AdminParametersPage/AdminParametersPage.tsx` — las dos acciones junto a las pestañas, condicionadas a la sección activa, su estado de apertura y las bandas leídas del hook.
- `frontend/src/mocks/handlers/talla-bands.handlers.ts` y `handlers/index.ts` — el mock y su registro en el punto único de extensión.
- Consume `Modal`, `Slider`, `Input` y `Button` de `@tuya-ui/components`; todos existen, así que no hace falta tocar el sistema de diseño.
