## 1. Modelo y servicio

- [x] 1.1 Crear `frontend/src/features/admin-shell/services/capabilityMixService.ts` con `getMix`/`saveMix` sobre `httpClient` contra `/admin/capability-mix`, calcado de `tallaBandsService`.
- [x] 1.2 Definir el tipo: una lista de filas, cada una con un id propio, su nombre de capacidad y sus cantidades indexadas por talla. NO campos fijos `xs`, `s`, `m`, `l`, `xl` — ver la decisión en design.md.
- [x] 1.3 Agregar un helper que devuelva la cantidad de una fila para una talla, tratando la ausencia como cero: una talla nueva deja celdas por completar, no rompe el render.

## 2. Mock

- [x] 2.1 Crear `frontend/src/mocks/handlers/capability-mix.handlers.ts` con estado en memoria, `GET` y `PUT`, y como valores iniciales las tres capacidades que hoy están en la pantalla, indexadas por talla.
- [x] 2.2 Validar en el `PUT` que ningún nombre quede vacío ni repetido y que las cantidades sean enteros no negativos; responder 400 sin tocar lo guardado cuando no se cumpla.
- [x] 2.3 Exportar la función de reinicio, como `resetTallaBandsMock`.
- [x] 2.4 Registrar los handlers en `frontend/src/mocks/handlers/index.ts`.

## 3. Hook

- [x] 3.1 Crear `frontend/src/features/admin-shell/hooks/useCapabilityMix.ts` siguiendo la forma de `useTallaBands`: valores vigentes y guardados, errores por fila, `loading`, `saving`, `loadError`, estado sucio, `canSave`, `discard` y un `save` que devuelve su resultado.
- [x] 3.2 Incluir la guarda de forma sobre la respuesta, por el mismo motivo que en bandas: sin mocks el dev server responde su `index.html` con 200 y la pantalla recibe HTML.
- [x] 3.3 Exponer alta y baja de filas, generando un id propio al agregar.
- [x] 3.4 Validar por fila que el nombre no quede vacío ni repita el de otra, comparando sin distinguir mayúsculas ni espacios de sobra.

## 4. Editor

- [x] 4.1 Crear `frontend/src/features/admin-shell/components/CapabilityMixModal.tsx` con la matriz: una fila por capacidad, una columna por talla, y los rótulos de columna una sola vez arriba — el mismo criterio que el editor de datos de bandas.
- [x] 4.2 Recibir las tallas desde afuera, no derivarlas dentro del modal: el editor no sabe de dónde salen.
- [x] 4.3 Dar a cada fila su acción de quitar, y al editor una de agregar.
- [x] 4.4 Mostrar el error de nombre junto al campo que lo tiene, y deshabilitar confirmar mientras haya alguno.
- [x] 4.5 Al confirmar con éxito cerrar; ante error de guardado mostrarlo y dejar el editor abierto con lo editado.
- [x] 4.6 Al cancelar, descartar todo lo editado, incluidas altas y bajas.

## 5. Integración en la pantalla

- [x] 5.1 Reemplazar la constante `mix` por los datos del hook.
- [x] 5.2 Derivar las columnas de la tabla de las bandas guardadas, en su mismo orden.
- [x] 5.3 Agregar la acción de editar junto a las pestañas, visible sólo con la sección de capacidades activa.
- [x] 5.4 Manejar los estados de la sección: cargando, error de carga del mix, y el caso de que las bandas no estén disponibles.
- [x] 5.5 Confirmar que la condición que muestra las acciones de bandas sigue siendo la suya y no se cruza con la del mix.

## 6. Pruebas

- [x] 6.1 Pruebas del handler: `GET` inicial, `PUT` válido reflejado después, y `PUT` inválido (nombre vacío, nombre repetido, cantidad negativa) que responde 400 sin alterar lo guardado.
- [x] 6.2 Pruebas del hook: carga, edición de una cantidad, alta, baja, validación de nombre que bloquea el guardado, guardado exitoso y error.
- [x] 6.3 Pruebas del editor: abre con lo guardado, agregar suma una fila, quitar la saca, cancelar descarta todo, confirmar guarda y cierra.
- [x] 6.4 Un caso que cubra que renombrar una fila conserva sus cantidades — es lo que justifica el id propio.
- [x] 6.5 Un caso de la sección sin bandas disponibles.
- [x] 6.6 Ajustar las pruebas de `AdminParametersPage` que hoy asumen el mix estático.
- [x] 6.7 Correr la suite del frontend; los únicos fallos esperados son los dos preexistentes.

## 7. Verificación

- [x] 7.1 Abrir el editor y confirmar que muestra las capacidades y cantidades guardadas, con una columna por talla.
- [x] 7.2 Agregar una capacidad, completarla y guardar; confirmar que aparece en la tabla.
- [x] 7.3 Quitar una capacidad y guardar; confirmar que desaparece.
- [x] 7.4 Renombrar una capacidad y confirmar que conserva sus cantidades.
- [x] 7.5 Dejar un nombre vacío y otro repetido, y confirmar que cada uno señala su campo y bloquea el guardado.
- [x] 7.6 Cancelar con altas y bajas pendientes y confirmar que la tabla queda intacta.
- [x] 7.7 Confirmar que la acción de editar el mix sólo aparece en su pestaña.
- [x] 7.8 Correr `tsc --noEmit` en `frontend`.
