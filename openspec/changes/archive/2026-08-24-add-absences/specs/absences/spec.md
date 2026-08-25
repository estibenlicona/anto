## ADDED Requirements

### Requirement: Pantalla de ausencias del chapter
El sistema SHALL ofrecer al Chapter Lead una pantalla de Ausencias en `/app/lead/ausencias` que lista las ausencias del chapter por mes: abre en el mes actual, permite navegar a meses anteriores y siguientes, y muestra las ausencias cuyo rango toca el mes visible. El breadcrumb de la pantalla SHALL ser "Gestionar Ausencias".

La pantalla SHALL encabezar el listado con tres lecturas del mes visible: cuántas ausencias hay y cuántos días hábiles suman, el impacto en FTE de lo aprobado (con la célula más afectada), y cuántas solicitudes esperan decisión. Cada fila SHALL mostrar la persona (con su proveedor debajo del nombre cuando es de un tercero, o "Planta" cuando no), el tipo como etiqueta categórica, el rango de fechas, los días hábiles, la célula más afectada, el impacto en FTE del mes visible, el estado y — sólo en las solicitadas — las acciones de aprobar y rechazar.

#### Scenario: Entrar a la pantalla
- **WHEN** el Chapter Lead navega a `/app/lead/ausencias`
- **THEN** ve el mes actual con sus ausencias, las tres lecturas del período y el breadcrumb "Gestionar Ausencias"

#### Scenario: Navegar de mes
- **WHEN** el usuario retrocede al mes anterior
- **THEN** el listado y las tres lecturas se recalculan para ese mes, incluyendo las ausencias que sólo lo tocan parcialmente

#### Scenario: Mes sin ausencias
- **WHEN** el mes visible no tiene ninguna ausencia
- **THEN** la pantalla muestra un estado vacío que invita a registrar la primera, sin lecturas en cero engañosas ni tabla vacía

### Requirement: Registro de una ausencia
El sistema SHALL permitir registrar una ausencia desde la pantalla, eligiendo una persona del chapter, un tipo — Vacaciones, Permiso o Incapacidad — y un rango de fechas (un solo día es un rango de un día). Los días de la ausencia SHALL contarse como días hábiles (lunes a viernes) del rango. Toda ausencia registrada SHALL nacer en estado Solicitada.

El registro SHALL rechazarse cuando el rango es inválido (fin anterior al inicio) o cuando se solapa con otra ausencia no rechazada de la misma persona, explicando el motivo en el formulario.

#### Scenario: Registrar una ausencia
- **WHEN** el Chapter Lead registra Vacaciones de una persona para un rango válido
- **THEN** la ausencia aparece en el listado en estado Solicitada con sus días hábiles contados y todavía no suma al impacto del mes

#### Scenario: Solape con otra ausencia
- **WHEN** se intenta registrar una ausencia que se cruza con otra Solicitada o Aprobada de la misma persona
- **THEN** el formulario explica el conflicto y no crea nada

#### Scenario: Rango inválido
- **WHEN** la fecha de fin es anterior a la de inicio
- **THEN** el formulario lo señala y el envío no ocurre

### Requirement: Aprobación y rechazo de una ausencia
El sistema SHALL permitir al Chapter Lead aprobar o rechazar una ausencia únicamente mientras está Solicitada. El rechazo SHALL exigir un motivo, que queda trazado con la ausencia. Una ausencia Aprobada o Rechazada SHALL NOT volver a Solicitada ni editarse: un registro equivocado se corrige rechazándolo y registrando la ausencia de nuevo.

#### Scenario: Aprobar
- **WHEN** el Chapter Lead aprueba una ausencia Solicitada
- **THEN** la ausencia pasa a Aprobada, sus acciones desaparecen de la fila y el impacto del mes la incorpora

#### Scenario: Rechazar con motivo
- **WHEN** el Chapter Lead rechaza una ausencia Solicitada escribiendo el motivo
- **THEN** la ausencia pasa a Rechazada con el motivo trazado y no cuenta en ninguna lectura

#### Scenario: El motivo es obligatorio
- **WHEN** intenta confirmar un rechazo sin motivo
- **THEN** el formulario lo exige y el estado no cambia

### Requirement: Impacto calculado en la capacidad del período
El sistema SHALL calcular el impacto de cada ausencia sobre un mes como: días hábiles del rango que caen dentro del mes ÷ días hábiles del mes × FTE disponible de la persona. El impacto SHALL repartirse entre las células de la persona en proporción a su dedicación; la fila muestra la célula de mayor dedicación y el reparto completo respalda las lecturas agregadas. Sólo las ausencias Aprobadas SHALL contar en el impacto del período; la lectura agregada SHALL nombrar la célula que más FTE pierde en el mes.

#### Scenario: Lectura del impacto de una aprobada
- **WHEN** una persona con 1.0 FTE disponible y dedicación en una sola célula tiene 3 días hábiles aprobados en un mes de 23 días hábiles
- **THEN** su fila muestra un impacto de −0.13 FTE sobre esa célula y el KPI del mes lo incluye

#### Scenario: Una solicitada no cuenta
- **WHEN** el mes tiene una ausencia Solicitada
- **THEN** aparece en el listado y en el conteo de solicitudes, pero el impacto en FTE del mes no la suma

#### Scenario: Persona repartida entre células
- **WHEN** la persona ausente dedica 60% a una célula y 40% a otra
- **THEN** el impacto del mes se reparte 60/40 entre ambas y la fila muestra la célula del 60%

#### Scenario: Ausencia que cruza el fin de mes
- **WHEN** una ausencia aprobada va del 28 de un mes al 4 del siguiente
- **THEN** cada mes cuenta sólo los días hábiles que caen dentro de él, y la ausencia aparece al navegar cualquiera de los dos meses
