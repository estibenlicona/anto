## MODIFIED Requirements

### Requirement: Cierres de facturación por período
El sistema SHALL mostrar, bajo la ruta de Facturación del Chapter Lead, un selector de período mensual (el mes en curso por defecto y los meses anteriores disponibles), tres indicadores del período elegido —facturas del mes con cuántas están por revisar y cuántas objetadas; facturado contra esperado con la diferencia; y novedades del período (días de ausencia aprobados y horas extra registradas)— y un listado con una fila por proveedor que tenga personas externas: proveedor, cantidad de personas, facturado, esperado, diferencia, novedades y estado.

La diferencia SHALL mostrarse por severidad y no de forma decorativa: en cero se lee como conforme, y distinta de cero SHALL destacarse con el signo, indicando si la factura llegó por encima o por debajo de lo esperado. El estado SHALL mostrarse con el componente de estado del sistema de diseño: **Sin cierre** (neutro) cuando el proveedor no tiene el esperado generado, **Sin factura** (neutro) cuando el esperado existe y la factura todavía no llegó, **Recibida** (informativo), **En revisión** (advertencia), **Aprobada** (éxito) y **Objetada** (peligro). El nombre del proveedor SHALL ser un enlace neutro al detalle cuando existe; ni el listado ni sus acciones por fila SHALL usar el color de marca.

La acción principal de la pantalla SHALL ser **Registrar factura**; **Generar el esperado del mes** SHALL ofrecerse como acción secundaria y crear el esperado de cada proveedor con personas externas que aún no lo tenga en ese período, sin tocar los existentes. Cada fila SHALL exponer un menú de acciones con Abrir, Registrar factura, Aprobar y Objetar, deshabilitadas según el estado.

#### Scenario: Mes sin cierres
- **WHEN** el Chapter Lead abre Facturación en un mes sin esperado generado
- **THEN** ve los proveedores con externos en estado "Sin cierre", los indicadores del mes en cero y la acción "Generar el esperado del mes"

#### Scenario: Generar cierres
- **WHEN** el Chapter Lead genera el esperado del mes
- **THEN** cada proveedor con externos queda con una línea por persona externa, su tarifa mensual, el descuento derivado de sus ausencias aprobadas y el esperado calculado; el sistema confirma con un toast

#### Scenario: Generar con cierres existentes
- **WHEN** ya hay una factura aprobada para un proveedor y se vuelve a generar el esperado
- **THEN** ese registro se conserva tal cual y sólo se crean los que faltan

#### Scenario: Cambiar de período
- **WHEN** el Chapter Lead elige otro mes
- **THEN** los indicadores y el listado reflejan las facturas y el esperado de ese mes, sin mezclar períodos

#### Scenario: Registrar la factura de un proveedor
- **WHEN** el Chapter Lead registra la factura recibida de un proveedor cuyo esperado ya existe
- **THEN** la fila pasa a "Recibida" y muestra el facturado y la diferencia contra el esperado; al ajustar una línea o corregir un facturado pasa a "En revisión"

#### Scenario: La diferencia del mes se lee de un vistazo
- **WHEN** alguna factura del mes llega por encima de lo esperado
- **THEN** el indicador de facturado contra esperado muestra la diferencia acumulada con su signo, y las filas que difieren la destacan

### Requirement: Detalle de un cierre
El sistema SHALL mostrar la factura de un proveedor en un período con su encabezado (proveedor, período, estado, y —cuando la factura está registrada— su número, la fecha de recepción y la cantidad de personas), tres lecturas del total (facturado, esperado y diferencia) y una tabla con una línea por persona externa: nombre y cargo, célula (o "Sin célula"), tarifa mensual, descuento por ausencias (monto y días, o guion), ajustes (monto con signo y motivo, o guion), esperado, facturado y diferencia; al pie, los totales de cada columna. Los montos SHALL mostrarse en pesos con separador de miles y sin decimales.

Cuando alguna línea tenga diferencia distinta de cero, el sistema SHALL destacar en el encabezado la novedad que la factura no refleja, nombrando a la persona y el monto. El detalle SHALL mostrar además las novedades del período que sustentan el cálculo (ausencias aprobadas y horas extra), dejando claro que nacen en sus módulos y que acá sólo se comprueba que la factura las refleje.

Mientras la factura no esté aprobada, cada línea SHALL ofrecer **Ajustar**, que abre un drawer con el monto del ajuste (con signo, distinto de cero), el motivo (obligatorio: Horas extra · Ingreso parcial · Retiro · Otro) y una nota opcional; guardar recalcula el esperado de la línea y los totales. Una línea con ajuste SHALL poder quitarlo. El descuento por ausencias SHALL NOT ser editable acá: se corrige en Ausencias. El primario del detalle SHALL ser **Aprobar factura** y la acción secundaria **Objetar con nota**; aprobada, la factura es de sólo lectura.

#### Scenario: Líneas congeladas
- **WHEN** se cambia el costo mensual de una persona después de generar el esperado
- **THEN** la línea conserva la tarifa con la que se generó

#### Scenario: Ajustar una línea
- **WHEN** el Chapter Lead registra un ajuste de +1.140.000 con motivo "Horas extra" en una línea cuyo esperado era 17.500.000
- **THEN** la línea muestra el ajuste y su motivo, su esperado pasa a 18.640.000, la diferencia contra lo facturado se recalcula y los totales del pie acompañan

#### Scenario: Validación del ajuste
- **WHEN** el Chapter Lead intenta guardar un ajuste sin motivo o con monto cero
- **THEN** el drawer muestra el error en el campo y no llama al servicio

#### Scenario: Aprobar y reabrir
- **WHEN** el Chapter Lead aprueba una factura sin diferencias y confirma
- **THEN** el estado pasa a "Aprobada", las líneas dejan de ser editables y no se ofrece ajustar; una factura objetada vuelve a "Recibida" cuando se registra la corregida

#### Scenario: Cierre inexistente
- **WHEN** se navega al detalle de un id que no existe
- **THEN** el sistema muestra un estado vacío con la vuelta al listado de Facturación

#### Scenario: La factura no refleja un descuento
- **WHEN** una persona tiene ausencias aprobadas en el período y el proveedor facturó su tarifa completa
- **THEN** su línea muestra el descuento esperado y la diferencia, y el encabezado nombra a esa persona y el monto que sobra

## ADDED Requirements

### Requirement: Registro de la factura recibida
El sistema SHALL permitir registrar la factura que llegó de un proveedor para un período: número, fecha de recepción y monto total. SHALL existir a lo sumo una factura por proveedor y período, y registrarla SHALL requerir que el esperado de ese proveedor ya exista. Al registrarla, la factura SHALL quedar en estado **Recibida** y cada línea SHALL tomar como facturado la tarifa mensual congelada de esa persona, corregible línea por línea mientras la factura no esté aprobada. La factura SHALL pasar a **En revisión** en cuanto el Chapter Lead la trabaje —ajustando una línea o corrigiendo un facturado—, de modo que el listado distinga la que nadie miró todavía de la que ya se está conciliando.

El sistema SHALL avisar cuando la suma de los facturados de las líneas no coincida con el monto total declarado, sin impedir seguir trabajando: es información para revisar, no un bloqueo. Los datos de la factura SHALL poder corregirse mientras no esté aprobada.

#### Scenario: Registrar una factura
- **WHEN** el Chapter Lead registra la factura de un proveedor con su número, fecha y monto
- **THEN** la factura queda "Recibida", cada línea arranca facturada por su tarifa y el detalle muestra facturado, esperado y diferencia

#### Scenario: Una sola factura por proveedor y período
- **WHEN** se intenta registrar una segunda factura para el mismo proveedor y período
- **THEN** el sistema lo rechaza explicando que ya existe y ofrece abrir la registrada

#### Scenario: El monto declarado no cuadra con las líneas
- **WHEN** el monto total de la factura difiere de la suma de los facturados por línea
- **THEN** el detalle lo advierte indicando ambas cifras, y las acciones de aprobar y objetar siguen disponibles

#### Scenario: Sin esperado generado
- **WHEN** se intenta registrar una factura de un proveedor cuyo esperado del período no existe
- **THEN** el sistema lo impide y explica que primero hay que generar el esperado del mes

### Requirement: Cálculo del esperado a partir de las novedades del período
El sistema SHALL calcular el esperado de cada línea como la tarifa mensual congelada, menos el descuento por las ausencias **aprobadas** de esa persona dentro del período, más los ajustes manuales registrados. Sólo las ausencias aprobadas SHALL descontar: las solicitadas y las rechazadas no participan del cálculo. El descuento SHALL ser proporcional a los días hábiles ausentes dentro del mes sobre los días hábiles del mes, con la misma cuenta de días hábiles que usa el módulo de Ausencias, de modo que una misma ausencia no se lea distinto en las dos pantallas.

El descuento SHALL recalcularse cuando cambian las ausencias del período mientras la factura no esté aprobada; una factura aprobada conserva las cifras con las que se aprobó. Cada línea SHALL informar cuántos días de ausencia sustentan su descuento.

#### Scenario: Ausencia aprobada que descuenta
- **WHEN** una persona externa tiene 3 días hábiles de vacaciones aprobados en un mes de 21 días hábiles
- **THEN** su línea descuenta la parte proporcional de la tarifa y muestra los días que la sustentan

#### Scenario: Una solicitada no descuenta
- **WHEN** la ausencia del período está solicitada o rechazada
- **THEN** la línea no descuenta nada por ella y su esperado es la tarifa más sus ajustes

#### Scenario: Aprobar una ausencia recalcula el esperado
- **WHEN** se aprueba una ausencia del período y la factura de ese proveedor todavía no está aprobada
- **THEN** el esperado de esa línea y los totales incorporan el descuento

#### Scenario: Una factura aprobada no se mueve
- **WHEN** cambian las ausencias de un período cuya factura ya fue aprobada
- **THEN** esa factura conserva el esperado, el descuento y la diferencia con los que se aprobó

### Requirement: Objeción de una factura
El sistema SHALL permitir objetar una factura que no esté aprobada, exigiendo un motivo que queda trazado con ella; la factura pasa a **Objetada** y deja de ser editable hasta que llegue la corregida. Registrar la factura corregida SHALL devolverla a **Recibida** conservando el motivo de la objeción anterior como historia.

Aprobar una factura cuya diferencia contra el esperado no sea cero SHALL exigir una nota que justifique aceptarla, y esa nota SHALL quedar trazada junto a la aprobación. Aprobar una factura sin diferencias SHALL pedir sólo la confirmación.

#### Scenario: Objetar con motivo
- **WHEN** el Chapter Lead objeta una factura escribiendo el motivo
- **THEN** la factura pasa a "Objetada" con el motivo trazado, sus líneas dejan de editarse y el listado la cuenta entre las objetadas del mes

#### Scenario: El motivo es obligatorio
- **WHEN** intenta confirmar la objeción sin escribir el motivo
- **THEN** el formulario lo exige y el estado no cambia

#### Scenario: Aprobar con diferencia exige nota
- **WHEN** el Chapter Lead aprueba una factura cuya diferencia no es cero
- **THEN** la confirmación pide una nota que justifique aceptar la diferencia y sin ella no aprueba

#### Scenario: La factura corregida reabre la revisión
- **WHEN** el proveedor manda la factura corregida de un período objetado y se registra
- **THEN** la factura vuelve a "Recibida" con las cifras nuevas y el motivo de la objeción anterior queda como historia
