## Why

El módulo se llama Facturación y habla de **facturas**, pero lo que el Líder de Expertise revisa no son facturas: son **prefacturas**. Una factura ya está emitida — objetarla es un problema contable. Una prefactura es lo que el proveedor propone cobrar, y revisarla a tiempo es justamente el punto del módulo. Que la interfaz use la palabra equivocada no es una imprecisión de estilo: describe mal el momento en que se está interviniendo, y sugiere que la decisión llega tarde.

Y la unidad está en el nivel equivocado. Hoy un cierre es **por proveedor**: una fila por proveedor, un documento por período, y las personas dentro como líneas. Pero quien valida gestiona **personas**, y cada persona se imputa a su propia célula, su centro de costos y su orden de compra. Con un documento por proveedor, esa imputación no tiene dónde vivir, y "¿esta persona está bien facturada?" —que es la pregunta real— se contesta leyendo una fila dentro de un total ajeno.

Falta además casi todo lo que hace falta para trazar la ejecución. De los doce datos que el control necesita, el sistema guarda tres: número, valor total y mes. Concepto, cuenta contable y su número, centro de costos, orden de compra y cuenta destinada al pago no existen. Sin ellos el módulo dice si la cifra cuadra, pero no contra qué se imputó ni con qué orden se pagó.

Dos cosas más, chicas, de la misma pantalla: el selector de **Período** —que manda sobre todo lo que se ve— está suelto sobre el listado, con el mismo peso que un filtro cualquiera; y la card de novedades cierra con "Nacen en Ausencias y se comprueban acá", que dice de dónde viene el dato en un registro que no es el de la aplicación.

## What Changes

- **El módulo pasa a hablar de prefacturas.** Registrar, revisar, aprobar y objetar se refieren a la prefactura, en la pantalla, en las rutas de la interfaz y en el contrato.
- **BREAKING** — **la unidad de validación pasa a ser la persona.** Cada persona externa tiene su prefactura del período, con su número, su fecha de recibida y su valor total. El listado deja de ser de proveedores y pasa a ser de personas; el proveedor pasa a ser un dato de cada fila y un criterio para agrupar y filtrar.
- **Cada prefactura lleva su imputación completa**: célula o CoE, concepto, cuenta contable y su número, centro de costos, orden de compra, cuenta destinada al pago, valor total, moneda y mes.
- **El selector de período sube al encabezado**, junto al título del módulo, porque no filtra el listado: determina de qué mes es todo lo que la pantalla muestra, indicadores incluidos.
- **La card de novedades explica qué se comprueba**, no de dónde viene el dato.

### Fuera de alcance

- **Facturas en otra moneda que COP.** La moneda se captura y se muestra, y COP es el único valor en uso. Comparar lo prefacturado contra lo esperado exige una sola moneda: el esperado sale del costo mensual de cada persona, que hoy es COP. Habilitar USD sin tasa de cambio trazada haría que la diferencia mienta, y con tasa es otro trabajo — decidido explícitamente para más adelante.
- El paso de prefactura a factura emitida. Este módulo termina donde la prefactura queda aprobada u objetada.
- Administrar catálogos de cuentas contables o centros de costos desde la interfaz.

## Capabilities

### Modified Capabilities

- `provider-billing`: la unidad de validación pasa del proveedor a la persona; el documento pasa a ser una prefactura y gana su imputación contable completa; el período pasa al encabezado.
- `api-mocking`: el handler pasa a servir prefacturas por persona con sus campos de imputación, en vez de un cierre por proveedor.

## Impact

- **Contrato de API** — **BREAKING**: el recurso deja de ser un cierre por proveedor con líneas y pasa a ser una prefactura por persona y período. Los campos de imputación —célula o CoE, concepto, cuenta contable y su número, centro de costos, orden de compra, cuenta de pago, moneda— son nuevos. Es un acuerdo con quien implemente el backend.
- **Datos**: hay que decidir qué valores de imputación llevan las personas externas sembradas, y sembrar **más de una persona del mismo proveedor imputadas a células distintas** — con una sola por proveedor, la razón entera de este change no se puede probar.
- Frontend: `features/billing` completo —listado, detalle, resumen, el panel de registro y el de ajuste— y `mocks/handlers/billing.handlers.ts`.
- **Lo que cambia de significado**: los tres indicadores del período pasan a contar prefacturas por persona, no cierres por proveedor. La misma pantalla va a mostrar números más grandes sin que nada falle; hay que revisarlos uno por uno.
- **Advertencia declarada**: la persona que valida es el **Líder de Expertise**, que en `add-people-roles-and-technical-lead` es uno de los cuatro roles del catálogo. Ese change deja los roles como dato y **no** los ata a permisos, porque `auth-session` todavía no está archivada. Este módulo sigue viviendo bajo el shell del Chapter Lead hasta que eso ocurra; quién puede validar prefacturas se decide ahí, no acá.
- **Orden**: `provider-billing` y el handler de facturación de `api-mocking` no tienen deltas pendientes. `api-mocking` sí los tiene en otros requisitos (`add-auth-port-and-simulator`, `add-expertise-lines`), que no tocan éste.
- **Deuda que este change corrige de paso**: el `Purpose` de `provider-billing` quedó como `TBD - created by archiving change add-provider-billing`. Como el punto de partida es justamente el objetivo del módulo, se escribe.
