## 1. Datos: mocks y contrato

- [x] 1.1 Verificado el estado de archivado de `add-absences` y `add-provider-billing`: ninguno está archivado. Decisión del usuario: implementar igual, porque la dependencia es de archivado y no de código. **Al archivar hay que respetar el orden: add-absences → add-provider-billing → add-invoice-reconciliation.**
- [x] 1.2 En `absences.handlers.ts`, exponer el snapshot de sólo lectura de ausencias **aprobadas** de un período (días hábiles de cada una dentro del mes y días hábiles del mes), sin cambiar las rutas ni el comportamiento de la pantalla.
- [x] 1.3 En `billing.handlers.ts`: derivar el descuento por ausencias de ese snapshot al generar y al leer una factura no aprobada; agregar el sub-recurso de factura recibida (número, fecha, monto), el `PUT` del facturado por línea, los estados `Received | InReview | Approved | Objected` con sus reglas (nota obligatoria al aprobar con diferencia, motivo obligatorio al objetar, la corregida vuelve a `Received`) y el congelado de cifras al aprobar; cambiar `UnworkedDays` por `Overtime` en el catálogo de motivos.
- [x] 1.4 Actualizar las semillas: mes anterior con una aprobada y una objetada; mes en curso con el esperado generado, una factura en revisión con diferencia por un descuento no aplicado, y un proveedor sin factura.
- [x] 1.5 Ajustar y ampliar las pruebas del handler de facturación (esperado derivado y no digitado, una factura por proveedor y período, registro sin esperado → 400, aprobar con diferencia sin nota → 400, objetar sin motivo → 400, factura aprobada inmune a cambios de ausencias) y las del handler de ausencias para el snapshot.
- [x] 1.6 Actualizar `billingService.ts` y `BillingAdapter.ts` al contrato nuevo (facturado, esperado, diferencia, novedades por línea, estados y etiquetas) con sus pruebas.

## 2. Listado del período

- [x] 2.1 `BillingStatsCards`: pasar a las tres lecturas del diseño — facturas del mes (con por revisar y objetadas), facturado contra esperado con la diferencia, y novedades del período (días de ausencia y horas extra).
- [x] 2.2 `BillingList`: columnas Proveedor · Personas · Facturado · Esperado · Diferencia · Novedades · Estado; diferencia por severidad con signo; estados nuevos en el badge; menú de fila con Abrir · Registrar factura · Aprobar · Objetar según estado; primario "Registrar factura" y secundario "Generar el esperado del mes" en el encabezado, sin marca dentro de la tabla.
- [x] 2.3 Drawer de registro de factura (proveedor, número, fecha, monto) con sus validaciones y los errores del servidor en el formulario.
- [x] 2.4 Pruebas del listado y del drawer.

## 3. Detalle y conciliación

- [x] 3.1 `BillingLinesTable`: columnas Persona · Célula · Tarifa mes · Ausencias (monto y días) · Ajustes · Esperado · Facturado · Diferencia, con el pie de totales por columna; el descuento por ausencias no editable.
- [x] 3.2 Encabezado del detalle: número de factura, fecha de recepción y personas; tres lecturas (facturado, esperado, diferencia); alerta que nombra a la persona y el monto cuando una novedad no está reflejada; bloque de novedades del período que sustentan el cálculo.
- [x] 3.3 Acciones: "Aprobar factura" (primario; con nota obligatoria si hay diferencia) y "Objetar con nota" (secundario, motivo obligatorio y trazado); factura aprobada de sólo lectura. Ajustar línea conserva el drawer, con `Overtime` como motivo nuevo.
- [x] 3.4 Pruebas del detalle (conciliación con diferencia, aprobar sin y con diferencia, objetar, sólo lectura tras aprobar).

## 4. Cierre

- [x] 4.1 Correr typecheck, lint y la suite completa sin regresiones frente al baseline conocido.
- [x] 4.2 Verificación en pantalla con `pnpm dev:auth`: registrar una factura, ver la diferencia por el descuento de una ausencia aprobada, objetarla con motivo, registrar la corregida y aprobarla; comparar el resultado contra los dos artboards del canvas aprobado.
