## Purpose

Define el medio día de una ausencia: para qué tipo existe, sobre qué se pide, cómo se cuenta, cómo se muestra allí donde la aplicación cuenta días y cómo se traduce al descuento de capacidad.

## ADDED Requirements

### Requirement: El medio día es de un permiso, sobre un solo día
El medio día SHALL existir únicamente para las ausencias de tipo Permiso, y SHALL pedirse sobre un único día: un permiso dura un día o medio, no un rango. Unas vacaciones y una incapacidad SHALL registrarse siempre por días completos. El registro SHALL rechazar un medio día pedido para otro tipo, y SHALL rechazarlo también cuando abarque más de un día.

#### Scenario: Permiso de medio día
- **WHEN** se registra un permiso de un día marcado como medio día
- **THEN** la ausencia queda registrada y cuenta 0.5 días hábiles

#### Scenario: Permiso de día completo
- **WHEN** se registra un permiso de un día sin marcarlo como medio día
- **THEN** la ausencia cuenta 1 día hábil

#### Scenario: Medio día en vacaciones o incapacidad
- **WHEN** se intenta registrar unas vacaciones o una incapacidad como medio día
- **THEN** el registro se rechaza y la ausencia no se crea

#### Scenario: Medio día sobre más de un día
- **WHEN** se intenta registrar un medio día cuyo inicio y fin no son el mismo día
- **THEN** el registro se rechaza y la ausencia no se crea

### Requirement: Un día no hábil no puede pedirse
Un permiso pedido sobre un día que no es hábil NO SHALL registrarse, ni como día completo ni como medio día: un día que no se trabaja no descuenta nada.

#### Scenario: Permiso en sábado
- **WHEN** se intenta registrar un permiso sobre un sábado
- **THEN** el registro no se completa y el día se señala como no hábil

### Requirement: Los días se muestran con su medio día
Allí donde la aplicación muestra días hábiles de una ausencia o de un mes —el resumen del formulario de alta, la columna de días de la tabla y el pie de la card del mes— SHALL mostrarse el valor fraccionado. Un valor entero SHALL mostrarse sin decimales; un valor con medio día SHALL mostrarse con un decimal.

#### Scenario: Fila de medio día
- **WHEN** un permiso de medio día se muestra en la tabla
- **THEN** su columna de días dice "0.5"

#### Scenario: Fila sin medio día
- **WHEN** una ausencia de tres días completos se muestra en la tabla
- **THEN** su columna de días dice "3", no "3.0"

#### Scenario: Total del mes con medios días
- **WHEN** el mes suma días hábiles ausentes que incluyen algún medio día
- **THEN** la card del mes muestra el total con su decimal, y el rótulo concuerda en singular sólo cuando el total es exactamente 1

### Requirement: El medio día descuenta la mitad de capacidad
El descuento de capacidad SHALL derivarse de los días hábiles fraccionados con la misma fórmula de siempre, de modo que un permiso de medio día descuente exactamente la mitad que uno de día completo en el mismo mes.

#### Scenario: Medio día frente a día completo
- **WHEN** dos permisos aprobados de la misma persona en el mismo mes duran uno un día completo y otro medio día
- **THEN** el impacto en capacidad del segundo es la mitad del del primero

#### Scenario: El impacto del mes suma fracciones
- **WHEN** el mes tiene ausencias aprobadas con algún medio día
- **THEN** el impacto del mes las suma como fracciones, sin redondear a días enteros

### Requirement: El medio día viaja con la ausencia
El registro de una ausencia SHALL conservar si se pidió como medio día, de modo que al volver a leer el mes se muestre y se cuente igual que al registrarla.

#### Scenario: Releer el mes
- **WHEN** se registra un permiso de medio día y después se recarga el mes
- **THEN** el permiso sigue contando 0.5 y sigue constando como medio día
