# provider-billing Specification

## Purpose
Llevar el control de ejecución y validación de las prefacturas de proveedores: revisar, persona por persona, que lo que el proveedor propone cobrar coincida con lo que la plataforma espera —tarifa, ausencias aprobadas y ajustes— y que cada prefactura quede imputada a su célula o CoE, su cuenta contable, su centro de costos y su orden de compra. Se revisa la **prefactura**, antes de que la factura se emita: después la corrección deja de ser una objeción y pasa a ser un problema contable.
## Requirements
### Requirement: Prefacturas del período
El sistema SHALL ofrecer, bajo la ruta de Facturación, la revisión de las **prefacturas** del período: lo que cada proveedor propone cobrar por cada una de sus personas externas, antes de que se emita la factura. El sistema SHALL usar la palabra prefactura en toda la pantalla y NO SHALL llamarlas facturas: una factura ya emitida se corrige por la vía contable, mientras que una prefactura se objeta a tiempo, y nombrarlas igual sugiere que la decisión llega tarde.

La unidad de revisión SHALL ser la **persona**, no el proveedor: cada persona externa SHALL tener su propia prefactura del período, con su número, su fecha de recibida y su valor total. Quien valida gestiona personas, y cada persona se imputa a su propia célula, su centro de costos y su orden de compra; con un solo documento por proveedor esa imputación no tiene dónde vivir, y la pregunta que importa —si **esta persona** está bien facturada— se responde leyendo una fila dentro de un total ajeno. El proveedor SHALL seguir presente como dato de cada prefactura y como criterio para agrupar y filtrar, porque es con quien se reclama.

El **selector de período** SHALL ubicarse en el encabezado de la pantalla, junto al título del módulo, y NO SHALL presentarse como un filtro más sobre el listado: no acota lo que se lista, determina de qué mes es todo lo que la pantalla muestra, indicadores incluidos. El período visible SHALL leerse sin abrir el selector.

El listado SHALL mostrar una fila por prefactura con la persona, su proveedor, la célula o CoE a la que se imputa, el valor prefacturado, el esperado, la diferencia y el estado. La diferencia SHALL mostrarse por severidad y no de forma decorativa: en cero se lee como conforme, y distinta de cero SHALL destacarse con el signo, indicando si el proveedor propone cobrar por encima o por debajo de lo esperado. El estado SHALL mostrarse con el componente de estado del sistema de diseño: **Sin esperado** (neutro) cuando la persona no tiene el esperado generado, **Sin prefactura** (neutro) cuando el esperado existe y la prefactura todavía no llegó, **Recibida** (informativo), **En revisión** (advertencia), **Aprobada** (éxito) y **Objetada** (peligro). El nombre de la persona SHALL ser un enlace neutro al detalle cuando existe; ni el listado ni sus acciones por fila SHALL usar el color de marca.

La acción principal de la pantalla SHALL ser **Registrar prefactura**; **Generar el esperado del mes** SHALL ofrecerse como acción secundaria y crear el esperado de cada persona externa que aún no lo tenga en ese período, sin tocar los existentes. Cada fila SHALL exponer un menú de acciones con Abrir, Registrar prefactura, Aprobar y Objetar, deshabilitadas según el estado.

Los indicadores del período SHALL contar prefacturas por persona y no cierres por proveedor, y sus lecturas SHALL decirlo, de modo que una cifra mayor que antes se entienda como un cambio de unidad y no como un salto de volumen.

#### Scenario: El período se lee antes que el listado
- **WHEN** el Chapter Lead abre Facturación
- **THEN** el mes visible aparece en el encabezado junto al título, sin que haga falta abrir el selector ni buscarlo entre los filtros del listado

#### Scenario: Mes sin cierres
- **WHEN** el Chapter Lead abre Facturación en un mes sin esperado generado
- **THEN** ve las personas externas en estado "Sin esperado", los indicadores del mes en cero y la acción "Generar el esperado del mes"

#### Scenario: Generar cierres
- **WHEN** el Chapter Lead genera el esperado del mes
- **THEN** cada persona externa queda con su tarifa mensual, el descuento derivado de sus ausencias aprobadas y el esperado calculado; el sistema confirma con un toast

#### Scenario: Generar con cierres existentes
- **WHEN** ya hay una prefactura aprobada para una persona y se vuelve a generar el esperado
- **THEN** ese registro se conserva tal cual y sólo se crean los que faltan

#### Scenario: Cambiar de período
- **WHEN** el Chapter Lead elige otro mes
- **THEN** los indicadores y el listado reflejan las prefacturas y el esperado de ese mes, sin mezclar períodos

#### Scenario: Registrar la factura de un proveedor
- **WHEN** el Chapter Lead registra la prefactura recibida por una persona cuyo esperado ya existe
- **THEN** la fila pasa a "Recibida" y muestra el valor prefacturado y la diferencia contra el esperado; al ajustar el esperado o corregir el valor pasa a "En revisión"

#### Scenario: La diferencia del mes se lee de un vistazo
- **WHEN** alguna prefactura del mes llega por encima de lo esperado
- **THEN** el indicador de prefacturado contra esperado muestra la diferencia acumulada con su signo, y las filas que difieren la destacan

#### Scenario: Dos personas del mismo proveedor en células distintas
- **WHEN** un proveedor tiene dos personas externas imputadas a células distintas
- **THEN** cada una tiene su propia prefactura con su propia imputación, y ninguna hereda la célula ni el centro de costos de la otra

### Requirement: Detalle de una prefactura
El sistema SHALL exponer el detalle de la prefactura de una persona en un período, con todo lo que hace falta para validarla y para trazar su ejecución.

El detalle SHALL mostrar, además del cálculo, la **imputación completa** de la prefactura: la célula o **CoE** a la que se carga, el **concepto**, la **cuenta contable** con su **número**, el **centro de costos**, la **fecha en que se recibió la prefactura**, el **número de prefactura**, la **orden de compra**, la **cuenta destinada al pago**, el **valor total**, la **moneda** y el **mes**. Sin esos datos el sistema puede decir si la cifra cuadra, pero no contra qué se imputó ni con qué orden se paga, que es la otra mitad del control.

La **moneda** SHALL registrarse con cada prefactura. COP SHALL ser el único valor en uso: la diferencia contra el esperado se calcula sobre el costo mensual de la persona, que está en COP, y restar dos monedas sin una tasa trazada produce una diferencia que miente. Una prefactura en otra moneda SHALL rechazarse antes de guardarse, con el motivo dicho, en vez de guardarse y compararse mal.

Un dato de imputación que falte SHALL mostrarse como faltante y NO SHALL dejarse en blanco: en un control de ejecución, un campo vacío y un campo que nadie llenó se leen igual y no son lo mismo.

#### Scenario: Abrir el detalle
- **WHEN** el Chapter Lead abre la prefactura de una persona
- **THEN** ve su cálculo del período y su imputación completa, con la persona, el proveedor y el mes identificados en el encabezado

#### Scenario: La imputación se lee entera
- **WHEN** el Chapter Lead revisa una prefactura registrada con todos sus datos
- **THEN** encuentra célula o CoE, concepto, cuenta contable y su número, centro de costos, fecha de recibida, número de prefactura, orden de compra, cuenta de pago, valor total, moneda y mes, sin salir de la pantalla

#### Scenario: Un dato de imputación sin llenar
- **WHEN** una prefactura se registró sin la orden de compra
- **THEN** el detalle lo señala como faltante en vez de mostrar el espacio vacío, de modo que se distinga de un dato que sí se revisó

#### Scenario: Una prefactura en otra moneda
- **WHEN** se intenta registrar una prefactura en una moneda distinta de COP
- **THEN** el sistema la rechaza diciendo que hoy sólo compara en COP, en vez de guardarla y calcular una diferencia entre monedas distintas

#### Scenario: Líneas congeladas
- **WHEN** se cambia el costo mensual de una persona después de generar el esperado
- **THEN** su prefactura conserva la tarifa con la que se generó

#### Scenario: Ajustar una línea
- **WHEN** el Chapter Lead registra un ajuste de +1.140.000 con motivo "Horas extra" sobre una prefactura cuyo esperado era 17.500.000
- **THEN** la prefactura muestra el ajuste y su motivo, su esperado pasa a 18.640.000, la diferencia contra lo prefacturado se recalcula y los totales del período acompañan

#### Scenario: Validación del ajuste
- **WHEN** el Chapter Lead intenta guardar un ajuste sin motivo o con monto cero
- **THEN** el drawer muestra el error en el campo y no llama al servicio

#### Scenario: Aprobar y reabrir
- **WHEN** el Chapter Lead aprueba una prefactura sin diferencias y confirma
- **THEN** el estado pasa a "Aprobada", la prefactura deja de ser editable y no se ofrece ajustar; una prefactura objetada vuelve a "Recibida" cuando se registra la corregida

#### Scenario: Cierre inexistente
- **WHEN** se navega al detalle de un id que no existe
- **THEN** el sistema muestra un estado vacío con la vuelta al listado de Facturación

#### Scenario: La factura no refleja un descuento
- **WHEN** una persona tiene ausencias aprobadas en el período y el proveedor prefacturó su tarifa completa
- **THEN** su prefactura muestra el descuento esperado y la diferencia, y el encabezado nombra a esa persona y el monto que sobra

#### Scenario: Corregir el valor prefacturado
- **WHEN** el Chapter Lead corrige el valor que el proveedor propuso
- **THEN** la diferencia se recalcula y el estado pasa a "En revisión"

#### Scenario: Volver al listado
- **WHEN** el Chapter Lead vuelve desde el detalle
- **THEN** regresa al listado en el mismo período que estaba mirando

### Requirement: Registro de la prefactura recibida
El sistema SHALL permitir registrar la prefactura que un proveedor propone por una persona, capturando su número, la fecha en que se recibió, el valor total, la moneda y su imputación: célula o CoE, concepto, cuenta contable y su número, centro de costos, orden de compra y cuenta destinada al pago.

El registro SHALL exigir número, fecha de recibida y valor total, y SHALL aceptar que la imputación se complete después: en la práctica el documento llega antes que la orden de compra, y bloquear el registro hasta tenerla esconde prefacturas que ya están sobre la mesa. Lo que falte SHALL quedar visible como faltante.

El valor total SHALL capturarse y mostrarse en pesos colombianos con separador de miles, y la cifra que viaja al backend SHALL ser el número sin formato.

#### Scenario: Registrar una factura
- **WHEN** el Chapter Lead registra la prefactura de una persona con su número, fecha, valor e imputación
- **THEN** la prefactura queda "Recibida" y el detalle muestra el valor prefacturado, el esperado y la diferencia

#### Scenario: Una sola factura por proveedor y período
- **WHEN** se intenta registrar una segunda prefactura para la misma persona y período
- **THEN** el sistema lo rechaza explicando que ya existe y ofrece abrir la registrada

#### Scenario: El monto declarado no cuadra con las líneas
- **WHEN** el valor total de la prefactura difiere del esperado de esa persona
- **THEN** el detalle lo advierte indicando ambas cifras, y las acciones de aprobar y objetar siguen disponibles

#### Scenario: Sin esperado generado
- **WHEN** se intenta registrar la prefactura de una persona cuyo esperado del período no existe
- **THEN** el sistema lo impide y explica que primero hay que generar el esperado del mes

#### Scenario: Registrar sin la imputación completa
- **WHEN** el Chapter Lead registra una prefactura sin la orden de compra
- **THEN** el sistema la guarda igual y señala la orden de compra como faltante, en vez de impedir el registro

#### Scenario: Falta un dato obligatorio
- **WHEN** intenta registrar sin número, sin fecha o sin valor total
- **THEN** el formulario lo exige y no llama al backend

### Requirement: Cálculo del esperado a partir de las novedades del período
El sistema SHALL calcular, por persona externa y período, el esperado como su tarifa mensual congelada menos el descuento derivado de sus ausencias aprobadas, más los ajustes manuales registrados. El esperado SHALL congelarse al generarse, de modo que un cambio posterior de tarifa no reescriba un período ya revisado.

Las novedades del período SHALL presentarse diciendo **qué se comprueba con ellas**, no de qué pantalla vienen: quien revisa una prefactura necesita saber que esos días de ausencia son los que justifican el descuento, y la procedencia del dato no le cambia la decisión.

#### Scenario: Ausencia aprobada que descuenta
- **WHEN** una persona externa tiene 3 días hábiles de vacaciones aprobados en un mes de 21 días hábiles
- **THEN** su prefactura descuenta la parte proporcional de la tarifa y muestra los días que la sustentan

#### Scenario: Una solicitada no descuenta
- **WHEN** la ausencia del período está solicitada o rechazada
- **THEN** la prefactura no descuenta nada por ella y su esperado es la tarifa más sus ajustes

#### Scenario: Aprobar una ausencia recalcula el esperado
- **WHEN** se aprueba una ausencia del período y la prefactura de esa persona todavía no está aprobada
- **THEN** su esperado y los totales del período incorporan el descuento

#### Scenario: Una factura aprobada no se mueve
- **WHEN** cambian las ausencias de un período cuya prefactura ya fue aprobada
- **THEN** esa prefactura conserva el esperado, el descuento y la diferencia con los que se aprobó

#### Scenario: Esperado sin novedades
- **WHEN** una persona externa no tuvo ausencias ni ajustes en el período
- **THEN** su esperado es su tarifa mensual congelada

#### Scenario: Las novedades dicen qué comprueban
- **WHEN** el Chapter Lead lee el indicador de novedades del período
- **THEN** entiende que esos días de ausencia y esas horas extra son los que justifican el descuento o el ajuste de las prefacturas del mes, sin una nota sobre en qué pantalla se registraron

### Requirement: Objeción de una prefactura
El sistema SHALL permitir objetar una prefactura exigiendo un motivo, que queda trazado con el registro. Objetar SHALL ser el camino normal de este módulo y no una excepción: una prefactura se revisa justamente para poder objetarla antes de que se emita la factura.

#### Scenario: Objetar con motivo
- **WHEN** el Chapter Lead objeta una prefactura escribiendo el motivo
- **THEN** pasa a "Objetada" con el motivo trazado, deja de editarse y el listado la cuenta entre las objetadas del mes

#### Scenario: El motivo es obligatorio
- **WHEN** intenta confirmar la objeción sin escribir el motivo
- **THEN** el formulario lo exige y el estado no cambia

#### Scenario: Aprobar con diferencia exige nota
- **WHEN** el Chapter Lead aprueba una prefactura cuya diferencia no es cero
- **THEN** la confirmación pide una nota que justifique aceptar la diferencia y sin ella no aprueba

#### Scenario: La factura corregida reabre la revisión
- **WHEN** el proveedor manda la prefactura corregida de una persona objetada y se registra
- **THEN** vuelve a "Recibida" con las cifras nuevas y el motivo de la objeción anterior queda como historia

#### Scenario: Objetar la de una persona no afecta a las demás
- **WHEN** el Chapter Lead objeta la prefactura de una persona de un proveedor con varias
- **THEN** sólo esa queda objetada, y las de sus compañeros conservan su estado
