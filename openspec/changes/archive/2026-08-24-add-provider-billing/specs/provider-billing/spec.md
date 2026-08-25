## ADDED Requirements

### Requirement: Cierres de facturación por período
El sistema SHALL mostrar, bajo la ruta de Facturación del Chapter Lead, un selector de período mensual (el mes en curso por defecto y los meses anteriores disponibles), tres indicadores del período elegido —total facturado del mes (suma de los cierres, en pesos), proveedores con cierre pendiente de aprobar, y personas externas incluidas— y un listado con una fila por proveedor que tenga personas externas: proveedor, cantidad de personas, suma de ajustes, total y estado. El estado SHALL mostrarse con el componente de estado del sistema de diseño: **Sin cierre** (neutro), **Borrador** (advertencia) y **Aprobado** (éxito). El nombre del proveedor SHALL ser un enlace neutro al detalle del cierre cuando existe.

La única acción principal de la pantalla SHALL ser **Generar cierres del mes**, que crea en borrador un cierre por cada proveedor con personas externas que aún no tenga cierre en ese período; los que ya existen no se tocan. Cada fila SHALL exponer un menú de acciones con Abrir, Aprobar (sólo en borrador) y Reabrir (sólo aprobado), deshabilitadas según el estado.

#### Scenario: Mes sin cierres
- **WHEN** el Chapter Lead abre Facturación en un mes sin cierres
- **THEN** ve los proveedores con externos en estado "Sin cierre", el total del mes en 0 y el botón "Generar cierres del mes"

#### Scenario: Generar cierres
- **WHEN** el Chapter Lead genera los cierres del mes
- **THEN** cada proveedor con externos pasa a "Borrador" con una línea por persona externa y su costo mensual, el total del mes suma los borradores, y el sistema confirma con un toast

#### Scenario: Generar con cierres existentes
- **WHEN** ya hay un cierre aprobado para un proveedor y se vuelve a generar
- **THEN** ese cierre se conserva tal cual y sólo se crean los que faltan

#### Scenario: Cambiar de período
- **WHEN** el Chapter Lead elige otro mes
- **THEN** los indicadores y el listado reflejan los cierres de ese mes, sin mezclar períodos

### Requirement: Detalle de un cierre
El sistema SHALL mostrar el cierre de un proveedor en un período con su encabezado (proveedor, período, estado y total) y una tabla con una línea por persona externa: nombre y cargo, célula (o "Sin célula"), costo mensual, ajuste (monto con signo y motivo, o guion), nota y total de la línea; al pie, subtotal, suma de ajustes y total. Los montos SHALL mostrarse en pesos con separador de miles y sin decimales.

En borrador, cada línea SHALL ofrecer **Ajustar**, que abre un drawer con el monto del ajuste (con signo, distinto de cero), el motivo (obligatorio: Días no laborados · Ingreso parcial · Retiro · Otro) y una nota opcional; guardar recalcula la línea y los totales. Una línea con ajuste SHALL poder quitarlo. El único primario del detalle SHALL ser **Aprobar cierre**, con confirmación que muestre el total; aprobado, el cierre es de sólo lectura y ofrece **Reabrir** como acción secundaria.

#### Scenario: Líneas congeladas
- **WHEN** se cambia el costo mensual de una persona después de generar el cierre
- **THEN** la línea del cierre conserva el costo con el que se generó

#### Scenario: Ajustar una línea
- **WHEN** el Chapter Lead registra un ajuste de −1.200.000 con motivo "Días no laborados" en una línea de 7.900.000
- **THEN** la línea muestra el ajuste y su motivo, su total pasa a 6.700.000 y el total del cierre baja en la misma cifra

#### Scenario: Validación del ajuste
- **WHEN** el Chapter Lead intenta guardar un ajuste sin motivo o con monto cero
- **THEN** el drawer muestra el error en el campo y no llama al servicio

#### Scenario: Aprobar y reabrir
- **WHEN** el Chapter Lead aprueba el cierre y confirma
- **THEN** el estado pasa a "Aprobado", las líneas dejan de ser editables y aparece "Reabrir"; al reabrir vuelve a "Borrador" y se puede ajustar de nuevo

#### Scenario: Cierre inexistente
- **WHEN** se navega al detalle de un id que no existe
- **THEN** el sistema muestra un estado vacío con la vuelta al listado de Facturación
