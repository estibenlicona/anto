## 1. El contrato: la prefactura por persona

- [x] 1.1 Cambiar la unidad del recurso: de un cierre por proveedor con líneas, a una prefactura por persona externa y período. El proveedor pasa a ser un dato de cada prefactura.
- [x] 1.2 Agregar los campos de imputación: célula o CoE, concepto, cuenta contable y su número, centro de costos, orden de compra, cuenta destinada al pago y moneda. Todos admiten `null` salvo número, fecha de recibida y valor total, que son obligatorios.
- [x] 1.3 Renombrar *factura* a *prefactura* en el DTO y en el servicio. No es cosmético: mientras el contrato diga `invoice`, quien lo lea va a asumir que el documento ya está emitido.
- [x] 1.4 Pruebas del adapter: una prefactura sin imputación completa se mapea con los campos en `null` y no en cadena vacía — es lo que permite distinguir "falta" de "en blanco".

## 2. El handler y las semillas

- [x] 2.1 Que el handler sirva prefacturas por persona: listado del período, generación del esperado, registro, ajuste, corrección del valor y cambio de estado.
- [x] 2.2 Rechazar con 400 cualquier moneda distinta de COP, diciendo el motivo. Sin esta guarda el módulo calcula una diferencia entre monedas distintas que parece válida.
- [x] 2.3 Sembrar **dos personas del mismo proveedor imputadas a células distintas**. Con una sola por proveedor, la razón entera de este change no se puede probar.
- [x] 2.4 Conservar los casos que las semillas ya cubrían: mes anterior con una aprobada y otra objetada; mes en curso con esperado generado, una en revisión con diferencia por descuento no aplicado, y una persona sin prefactura.
- [x] 2.5 Pruebas: generar no duplica; registrar dos veces la misma persona y período responde 400; sin esperado generado también; una moneda que no es COP se rechaza; y las dos personas del mismo proveedor devuelven prefacturas independientes.

## 3. El listado y el período

- [x] 3.1 Cambiar las filas de proveedor a persona: persona, proveedor, célula o CoE, prefacturado, esperado, diferencia y estado. El nombre de la persona es el enlace neutro al detalle.
- [x] 3.2 Mover el selector de período al encabezado, junto al título. No es un filtro del listado: manda sobre los indicadores también, y el mes visible tiene que leerse sin abrir el selector.
- [x] 3.3 Ofrecer agrupar o filtrar por proveedor, que deja de ser la unidad pero sigue siendo con quien se reclama.
- [x] 3.4 Revisar los tres indicadores del período **uno por uno**: ahora cuentan prefacturas por persona. Las cifras van a crecer sin que nada falle — hay que ajustar cada lectura para que diga la unidad.
- [x] 3.5 Pruebas: el período se lee en el encabezado; las filas son personas; y las lecturas de los indicadores nombran prefacturas y no cierres.

## 4. El detalle y la imputación

- [x] 4.1 Mostrar la imputación completa en el detalle: los doce datos, con la persona, el proveedor y el mes en el encabezado.
- [x] 4.2 Marcar como faltante cada dato de imputación sin llenar, en vez de dejar el espacio vacío.
- [x] 4.3 Pruebas: la imputación se lee entera; un campo sin llenar se distingue de uno revisado; y el detalle de un id inexistente sigue mostrando su estado vacío con la vuelta al listado.

## 5. El registro

- [x] 5.1 Capturar en el panel de registro los campos nuevos, exigiendo sólo número, fecha de recibida y valor total. La imputación se puede completar después: la prefactura llega antes que la orden de compra.
- [x] 5.2 El valor total en pesos colombianos con separador de miles, y el número sin formato hacia el backend. Es la parte que se rompe callada: la pantalla se ve bien y el valor guardado es otro.
- [x] 5.3 Pruebas: registrar sin orden de compra guarda igual y la marca faltante; sin número, fecha o valor no llama al backend; y el valor que viaja es el número.

## 6. Los textos y el objetivo

- [x] 6.1 Reemplazar *factura* por *prefactura* en toda la interfaz del módulo: título, acciones, estados, panel de registro, objeción y estados vacíos.
- [x] 6.2 Reescribir el pie de la card de novedades: qué se comprueba con esos días, no de qué pantalla vienen.
- [x] 6.3 Escribir el `Purpose` de `provider-billing` en `openspec/specs`, que quedó como `TBD - created by archiving`. Es edición directa de la spec principal: el `Purpose` de un delta se ignora para una capability que ya existe.

## 7. Cierre

- [x] 7.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido (`App.test.tsx` y `httpClient.test.ts` fallan de antes y no cuentan).

## 8. Verificación

- [x] 8.1 Con `pnpm dev:auth`, en `/app/lead/facturacion`: el mes se lee en el encabezado, las filas son personas con su proveedor y su célula, y en ningún lado dice "factura".
- [x] 8.2 Abrir la prefactura de una persona y comprobar que la imputación se lee entera, y que un campo sin llenar aparece como faltante y no en blanco.
- [x] 8.3 Registrar una prefactura con valor de ocho cifras y volver a abrirla: el valor tiene que ser el mismo, no uno truncado por el formato.
- [x] 8.4 Mirar las dos personas del mismo proveedor en células distintas y comprobar que cada una tiene su propia imputación y su propio estado.
