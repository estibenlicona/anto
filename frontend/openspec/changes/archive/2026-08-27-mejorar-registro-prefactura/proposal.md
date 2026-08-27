## Why

El drawer "Registrar prefactura" (`RegisterInvoiceDrawer`) es donde el chapter lead transcribe el documento que llega del proveedor, y hoy hace tres cosas a medias. Apila diez campos a una columna en 480px, así que la mitad queda bajo el pliegue. El esperado —la única cifra contra la que se compara lo que se digita— vive como un `hint` de 14px bajo el campo, sin decir de dónde sale, y la diferencia aparece como un párrafo ámbar suelto. Y la imputación, que en la práctica llega después del documento y por eso es opcional, no lo dice en ningún sitio: la explicación vive sólo en un comentario del código. Además el subtítulo nombra al proveedor y el mes, pero no a la persona, que es la unidad de la prefactura desde que dejó de serlo el proveedor.

La propuesta de diseño aprobada (canvas "Registro de prefactura") resuelve los cuatro puntos sin salirse del sistema de diseño; este change la implementa.

## What Changes

- **Encabezado con la persona.** El subtítulo pasa a `Persona · Proveedor · mes`. Para eso el drawer recibe la prefactura completa (`PrefactureDto`) en vez de cuatro props sueltas; sus dos consumidores ya la tienen.
- **Número y fecha en una fila.** Los dos campos cortos de "El documento" comparten fila a dos columnas; el valor total sigue solo, a ancho completo.
- **Valor con separadores de miles.** El campo deja de ser `type="number"`: acepta sólo dígitos y se muestra con puntos de miles mientras se escribe (`11.500.000`), como todas las cifras de la pantalla.
- **Bloque de conciliación** bajo el valor, en lugar del hint y el párrafo: muestra el esperado del período con su desglose (tarifa, menos ausencias, más ajuste cuando los hay) y, debajo, la lectura de la diferencia con severidad: ámbar "Difiere en ±$X" con la nota de que se registra igual, verde "Sin diferencia contra lo esperado" cuando coincide, y nada mientras el valor está vacío. Un enlace **"Usar el esperado"** junto al rótulo llena el valor con el esperado.
- **Imputación marcada como opcional.** El título de la zona lleva la etiqueta "Opcional" y una línea que explica que suele llegar después y que lo que falte queda marcado en el detalle. Los cuatro campos cortos (cuenta contable, número de cuenta, centro de costos, orden de compra) van a dos columnas; "Célula o CoE" llega prellenada con la célula de la persona y "Concepto" sugiere "Servicios profesionales" como placeholder.
- **Variante corregida más informativa.** Al registrar la corregida de una objetada, la zona del documento abre con el motivo de la objeción, su fecha y el número y valor del documento anterior; la imputación se hereda del documento objetado; el botón dice "Registrar corregida". El título y el subtítulo se conservan ("Registrar prefactura corregida", "… · vuelve a revisión").
- **BREAKING (interno):** cambia la firma de `RegisterInvoiceDrawer` (`billing: PrefactureDto` reemplaza a `providerName`, `period`, `expected`, `isCorrection`). No hay más consumidores que los dos contenedores de facturación.
- Lo que se envía al backend (`RegisterPrefactureRequest`) no cambia.

## Capabilities

### New Capabilities
- `prefacture-register-form`: comportamiento del formulario de registro de prefactura — qué contexto muestra, cómo se agrupan y validan los campos del documento, cómo se compara el valor contra el esperado, qué es opcional en la imputación y con qué llega prellenada, y qué cambia al registrar una corregida.

### Modified Capabilities
<!-- Ninguna. No existe spec previa del formulario; `billing-period-view` describe la
     vista de listado y no cambia (el botón "Registrar prefactura" abre el mismo
     drawer). -->

## Impact

- `src/features/billing/components/RegisterInvoiceDrawer.tsx`: nueva firma, fila a dos columnas, campo de valor formateado, bloque de conciliación, enlace "Usar el esperado", zona de imputación con etiqueta/explicación/grid y prellenado, bloque de objeción en la corregida.
- `src/features/billing/adapters/BillingAdapter.ts`: helpers de formato para el campo (dígitos ↔ texto con puntos) y una fecha corta para "Objetada el 12 ago".
- `src/features/billing/BillingContainer.tsx` y `BillingDetailContainer.tsx`: pasan `billing` en vez de las cuatro props.
- `src/shared/components/FormSection.tsx`: admite un nodo opcional junto al título (la etiqueta "Opcional") y una línea de descripción bajo él; los formularios de Personas, Células y Asignaciones no cambian de aspecto.
- Tests: `BillingComponents.test.tsx` (el `renderDrawer` pasa un DTO; el assert de "Difiere del esperado" cambia al texto nuevo; se añaden los de conciliación, "Usar el esperado", formato del valor, prellenado y variante corregida). `BillingContainers.test.tsx` no cambia en lo funcional.
- No se tocan el servicio, los mocks, el contrato con el backend ni el resto del detalle de prefactura.
- Fuera de alcance: `AdjustLineDrawer`, `EditInvoicedDialog`, `BillingDecisionDialog` y cualquier cambio en las reglas de negocio de aprobación/objeción.
