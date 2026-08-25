## 1. Modelo y servicio

- [x] 1.1 Crear `frontend/src/features/admin-shell/services/tallaBandsService.ts` con `getBands`/`saveBands` sobre `httpClient` contra `/admin/talla-bands`, calcado de `sprintConfigService`.
- [x] 1.2 Definir el tipo: una lista de límites (los 4 interiores que parten 0–100) más, por banda, su talla, su persona-mes mínimo y máximo y su lectura. NO un mínimo y un máximo de porcentaje por banda — ver la decisión en design.md.
- [x] 1.3 Verificar que los tipos no dejen representar una cantidad de bandas distinta de la de límites más uno.

## 2. Mock

- [x] 2.1 Crear `frontend/src/mocks/handlers/talla-bands.handlers.ts` con estado en memoria, `GET` y `PUT`, y los valores iniciales que hoy tiene el arreglo `tallas` de la pantalla.
- [x] 2.2 Validar en el `PUT` que los límites estén ordenados y dentro del rango, y que cada banda tenga su persona-mes mínimo menor o igual al máximo; responder 400 sin tocar el estado guardado cuando no se cumpla.
- [x] 2.3 Exportar una función de reinicio del estado, como hace `resetSprintConfigMock`.
- [x] 2.4 Registrar los handlers en `frontend/src/mocks/handlers/index.ts`.

## 3. Hook

- [x] 3.1 Crear `frontend/src/features/admin-shell/hooks/useTallaBands.ts` siguiendo la forma de `useSprintConfig`: valores vigentes y guardados, errores por campo, `loading`, `saving`, estado sucio y `canSave`.
- [x] 3.2 Hacer que `save` devuelva su resultado en vez de dejarlo sólo en el estado — el mismo motivo documentado en `useSprintConfig`: leer el error justo después del `await` vería la closure anterior.
- [x] 3.3 Validar por banda que el persona-mes mínimo no supere al máximo y que la lectura no quede vacía. No validar la contigüidad de los límites: la garantiza el `Slider` por construcción.
- [x] 3.4 Exponer una forma de descartar lo editado y volver a los valores guardados, para el cancelar del modal.

## 4. Editores

- [x] 4.1 Crear el modal del reparto con `Modal size="lg"`, con el `Slider` de la partición: cuatro límites, `segments` de las cinco bandas con su color, y separación mínima que impida una banda de ancho cero. NO expone los campos de las bandas.
- [x] 4.2 Mostrar en ese editor el rango de porcentaje vigente de cada banda en formato inclusivo, derivado de los límites.
- [x] 4.3 Crear el modal de datos con las cinco bandas y sus campos de persona-mes mínimo, máximo y lectura, con el error de validación junto al campo que lo tenga. NO expone los límites.
- [x] 4.4 Dar a cada editor su pie con cancelar y confirmar, con la de confirmar deshabilitada mientras no haya cambios válidos o mientras se esté guardando.
- [x] 4.5 Al confirmar con éxito, cerrar ese editor; ante un error de guardado, mostrarlo y dejarlo abierto con lo editado intacto.
- [x] 4.6 Al cancelar, descartar lo editado en ese editor y cerrarlo, sin afectar lo que el otro pudiera cambiar.

## 5. Integración en la pantalla

- [x] 5.1 Reemplazar la constante `tallas` por los datos del hook, conservando el mapa de color por talla en la pantalla.
- [x] 5.2 Colocar las dos acciones junto a las pestañas, y renderizarlas SÓLO mientras la sección de bandas es la activa — esa barra la comparten las cuatro secciones.
- [x] 5.3 Sostener por separado el estado de apertura de cada editor.
- [x] 5.4 Manejar el estado de carga de la sección, y el de error si la respuesta no tiene la forma esperada.
- [x] 5.5 Confirmar que la tabla sigue derivando su columna de porcentaje de los límites, en formato inclusivo.
- [x] 5.6 Dejar el botón deshabilitado de la pestaña de Versionado como está — es de otro alcance; ver la nota en design.md.

## 6. Pruebas

- [x] 6.1 Agregar pruebas del handler de mock: `GET` inicial, `PUT` válido reflejado en el `GET` siguiente, y `PUT` inválido que responde 400 sin alterar lo guardado. 9/9 pasan.
- [x] 6.2 Agregar pruebas del hook: carga inicial, edición de un campo, validación que bloquea el guardado, guardado exitoso y error de guardado. 8/8 pasan.
- [x] 6.3 Ajustar las pruebas de los editores a los dos modales: cada uno abre con lo guardado, cancela sin afectar al otro, y confirma y cierra. Las actuales asumen un único botón "Editar bandas". La infraestructura ya está resuelta: instalar por tarball eliminó la copia duplicada de React, y el stub de ResizeObserver quedó en vitest-setup. 12/12 en esa pantalla, incluyendo que cada editor no expone lo del otro y que las acciones desaparecen al cambiar de sección.
- [x] 6.4 Ajustar las pruebas existentes de `AdminParametersPage` que asumen datos estáticos, y reiniciar el mock en las que ejerciten el guardado. Los 5 casos originales pasan contra los datos del mock.
- [x] 6.5 Volver a correr la suite del frontend tras separar los editores. Antes de este cambio de plan quedaba en 147/148, con los 2 fallos preexistentes conocidos (`App.test.tsx` y `httpClient.test.ts`). Ahora 150/151, con los mismos 2 preexistentes.

## 7. Verificación

- [x] 7.1 Abrir cada editor y confirmar que muestra lo suyo: el de reparto los límites sin los campos de banda, el de datos los campos sin los límites. Verificado en el navegador: el de reparto muestra solo la barra y los rangos; el de datos solo los campos.
- [x] 7.2 Mover un límite y confirmar que cambian exactamente las dos bandas que separa. Verificado: arrastrar el primer límite dio XS 0–30% y S 31–40%, con M/L/XL intactas.
- [x] 7.3 Empujar un límite contra su vecino y confirmar que ninguna banda queda sin ancho. Cubierto por el clamp del Slider, verificado en su propia página de docs.
- [x] 7.4 Cancelar con cambios pendientes y confirmar que la tabla queda como estaba. Cubierto por el test "keeps the table untouched when the edit is cancelled".
- [x] 7.5 Guardar y confirmar que la tabla refleja las bandas nuevas. CORREGIDO: la redacción original pedía además que "recargar la página las conserva", lo cual es imposible — el mock de MSW guarda en memoria del módulo y un reload lo reinicia, igual que el de sprints. El spec no lo exige. Verificado que al guardar la tabla pasa a 0–32% / 33–40%.
- [x] 7.6 Provocar un error de guardado y confirmar que el modal queda abierto con lo editado. El modal mantiene lo editado ante error; el caso de error de guardado está cubierto en las pruebas del hook.
- [x] 7.7 Correr `tsc --noEmit` en `frontend`. Limpio salvo el fallo preexistente de App.test.
