# absences Specification

## Purpose
TBD - created by archiving change add-absences. Update Purpose after archive.
## Requirements
### Requirement: Pantalla de ausencias del chapter
El sistema SHALL ofrecer al Chapter Lead una pantalla de Ausencias en `/app/lead/ausencias` que lista las ausencias del chapter por mes: abre en el mes actual, permite navegar a meses anteriores y siguientes, y muestra las ausencias cuyo rango toca el mes visible. El breadcrumb de la pantalla SHALL ser "Gestionar Ausencias".

La pantalla SHALL encabezar el listado con tres lecturas del mes visible: cuántas ausencias hay y cuántos días hábiles suman, el impacto en FTE de las ausencias aprobadas **frente al FTE del chapter en ese mes** (nombrando la célula que más pierde), y cuántas solicitudes esperan decisión. Cada fila SHALL mostrar la persona (con su proveedor debajo del nombre cuando es de un tercero, o "Planta" cuando no), el tipo como etiqueta categórica, el rango de fechas, los días hábiles, la célula más afectada, el impacto en FTE del mes visible, el estado y las acciones que su estado admite: aprobar y rechazar mientras está Solicitada, y rechazar cuando ya está Aprobada, porque una aprobación equivocada tiene que poder corregirse.

La pantalla SHALL explicar, al pie del listado, qué alcance tiene lo que se registra ahí: que la ausencia se registra una sola vez y que de ese registro salen las consecuencias en la factura del proveedor y en la capacidad de la célula. El texto SHALL decir qué de eso ya ocurre y qué todavía no, en esos términos, y NO SHALL referirse a fases o etapas del plan de trabajo: quien mira la pantalla necesita saber qué pasa con lo que registra, no en qué punto del cronograma está el equipo.

#### Scenario: Entrar a la pantalla
- **WHEN** el Chapter Lead navega a `/app/lead/ausencias`
- **THEN** ve el mes actual con sus ausencias, las tres lecturas del período y el breadcrumb "Gestionar Ausencias"

#### Scenario: El aviso del alcance se entiende sin contexto interno
- **WHEN** el Chapter Lead lee el aviso al pie del listado
- **THEN** entiende que registra la ausencia una sola vez y qué consecuencias tiene ese registro, sin encontrarse con referencias a fases o etapas de un plan que no está mirando

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
El sistema SHALL permitir al Chapter Lead aprobar una ausencia mientras está Solicitada, y rechazarla mientras está Solicitada **o ya Aprobada**. El rechazo SHALL exigir un motivo, que queda trazado con la ausencia.

**Aprobar SHALL pedir confirmación antes de aplicarse.** Aprobar descuenta capacidad del mes y de ese registro salen decisiones aguas abajo; hoy es un clic inmediato con el botón pegado al de rechazar, mientras que rechazar —la acción reversible— abre un panel y exige escribir. La confirmación SHALL decir de quién es la ausencia y cuánto FTE descuenta del mes, para que la consecuencia esté a la vista en el momento de decidir y no después.

**Una aprobación SHALL poder revertirse rechazándola.** La ausencia pasa a Rechazada con su motivo trazado, y el impacto del mes deja de contarla. Revertir NO SHALL devolverla a Solicitada: una aprobación que ocurrió deja rastro, y borrarla haría que el registro mienta sobre lo que pasó. Una ausencia Rechazada SHALL ser terminal, y un registro equivocado se corrige rechazándolo y registrando la ausencia de nuevo.

Ninguna ausencia decidida SHALL editarse.

#### Scenario: Aprobar
- **WHEN** el Chapter Lead aprueba una ausencia Solicitada y confirma
- **THEN** la ausencia pasa a Aprobada, su fila deja de ofrecer aprobar y pasa a ofrecer sólo rechazar, y el impacto del mes la incorpora

#### Scenario: Aprobar pide confirmación
- **WHEN** el Chapter Lead pulsa aprobar en una ausencia Solicitada
- **THEN** el sistema pregunta antes de aplicarla, diciendo de quién es y cuánto FTE descuenta del mes, y el estado no cambia hasta que confirma

#### Scenario: Desistir de la aprobación
- **WHEN** el Chapter Lead cancela la confirmación
- **THEN** la ausencia sigue Solicitada, el impacto del mes no se mueve y la fila conserva sus dos acciones

#### Scenario: Revertir una aprobación equivocada
- **WHEN** el Chapter Lead rechaza una ausencia que ya estaba Aprobada, escribiendo el motivo
- **THEN** la ausencia pasa a Rechazada con ese motivo trazado, el impacto del mes deja de contarla y la célula más afectada se recalcula

#### Scenario: Revertir no vuelve atrás en el tiempo
- **WHEN** se revierte una aprobación
- **THEN** la ausencia queda Rechazada y no Solicitada, de modo que el registro dice que hubo una aprobación y que se revirtió, y no que nunca ocurrió

#### Scenario: Una rechazada es terminal
- **WHEN** el Chapter Lead mira una ausencia Rechazada
- **THEN** su fila no ofrece aprobar ni rechazar, y corregirla significa registrar la ausencia de nuevo

#### Scenario: Rechazar con motivo
- **WHEN** el Chapter Lead rechaza una ausencia Solicitada escribiendo el motivo
- **THEN** la ausencia pasa a Rechazada con el motivo trazado y no cuenta en ninguna lectura

#### Scenario: El motivo es obligatorio
- **WHEN** intenta confirmar un rechazo sin motivo
- **THEN** el formulario lo exige y el estado no cambia

### Requirement: Impacto calculado en la capacidad del período
El sistema SHALL calcular el impacto de cada ausencia sobre un mes como: días hábiles del rango que caen dentro del mes ÷ días hábiles del mes × FTE disponible de la persona. El impacto SHALL repartirse entre las células de la persona en proporción a su dedicación; la fila muestra la célula de mayor dedicación y el reparto completo respalda las lecturas agregadas. Sólo las ausencias Aprobadas SHALL contar en el impacto del período, y una aprobación revertida SHALL dejar de contar desde el momento en que se rechaza.

La lectura agregada SHALL expresar el impacto **contra el FTE del chapter en ese mes**, no como una cifra suelta: un descuento en FTE no se interpreta sin saber de qué total sale. SHALL nombrar además la célula que más FTE pierde en el mes, diciendo qué significa esa lectura en vez de darla por sabida — quien mira la pantalla por primera vez no tiene por qué deducirlo del texto.

#### Scenario: Lectura del impacto de una aprobada
- **WHEN** una persona con 1.0 FTE disponible y dedicación en una sola célula tiene 3 días hábiles aprobados en un mes de 23 días hábiles
- **THEN** su fila muestra un impacto de −0.13 FTE sobre esa célula y el KPI del mes lo incluye

#### Scenario: El impacto se lee contra el total del mes
- **WHEN** el Chapter Lead mira la lectura de impacto del mes
- **THEN** ve cuánto FTE descuentan las ausencias aprobadas y sobre qué total del chapter se descuenta, de modo que la cifra se entiende sin conocer de antemano cómo se calcula

#### Scenario: Qué significa la célula más afectada
- **WHEN** la lectura nombra la célula que más FTE pierde
- **THEN** lo dice con una frase entera que se explica sola, y no como un fragmento que continúa la cifra de arriba

#### Scenario: Revertir mueve las lecturas del mes
- **WHEN** se revierte la aprobación de la ausencia que más pesaba en una célula
- **THEN** el impacto del mes baja y la célula más afectada pasa a ser otra, o ninguna si no queda nada aprobado

#### Scenario: Una solicitada no cuenta
- **WHEN** el mes tiene una ausencia Solicitada
- **THEN** aparece en el listado y en el conteo de solicitudes, pero el impacto en FTE del mes no la suma

#### Scenario: Persona repartida entre células
- **WHEN** la persona ausente dedica 60% a una célula y 40% a otra
- **THEN** el impacto del mes se reparte 60/40 entre ambas y la fila muestra la célula del 60%

#### Scenario: Ausencia que cruza el fin de mes
- **WHEN** una ausencia aprobada va del 28 de un mes al 4 del siguiente
- **THEN** cada mes cuenta sólo los días hábiles que caen dentro de él, y la ausencia aparece al navegar cualquiera de los dos meses

