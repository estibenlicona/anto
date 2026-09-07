## MODIFIED Requirements

### Requirement: Dashboard de balance de un colaborador
El sistema SHALL exponer el dashboard de balance de un colaborador en `/app/lead/dedicacion/:personId`, con breadcrumb `Plataforma / Dedicación real / <nombre del colaborador>` y la entrada "Dedicación" activa.

La **franja del breadcrumb** SHALL llevar, a la derecha del rastro: el **navegador de sprint** —flechas *Sprint anterior* y *Sprint siguiente* con el nombre y el rango del elegido entre ellas, el mismo componente y la misma redacción del listado, deshabilitada la que no tiene a dónde ir—; la **marca de estado del sprint** (*En curso* en rol informativo, *Finalizado* en neutro); y las acciones **Actualizar** (secundaria), **Ver ficha** (neutra) y **Reasignar** (primaria, mismo drawer de reasignación de la Torre de control; *Asignar a una célula* cuando no tiene célula). Elegir otro sprint SHALL cambiar todo lo que sigue a ese sprint sin recargar la aplicación, y SHALL quedar en la URL para que el enlace se comparta. La ficha SHALL NOT mostrar además una tira de pestañas de sprints: el navegador es el único selector.

El **encabezado de identidad** SHALL ser una sola línea de datos bajo el nombre: avatar con las iniciales, nombre del colaborador, y debajo su cargo, su célula, el **FTE declarado en su asignación rotulado como dato que la célula reporta**, y las **iniciativas que sus historias tocaron en el sprint** como marcas, colapsadas en un "+N" cuyo tooltip lleva los nombres restantes.

**La cabecera** SHALL ser una fila de tres tarjetas de anchos desiguales, con el balance al frente:

1. **Balance del sprint**, que SHALL ocupar aproximadamente el doble que cada una de las otras dos y SHALL llevar el borde en el rol de color de la señal cuando ésta pide una decisión de carga. Muestra un punto de color, el **nombre de la señal en tipografía de titular**, la **frase que la explica**, cuántas señales concurrentes la sostienen, y al pie la procedencia del sprint —la fecha de sellado, o el aviso de que el sprint sigue en curso y las cifras pueden cambiar—.
2. **Capacidad**: el FTE disponible sobre el contractual como cifra grande, con su barra y las horas con su descuento debajo.
3. **Demanda vs referencia**: los SP comprometidos como cifra grande, la desviación frente al habitual en SP y en porcentaje con el rol de color de la señal, y una barra que marca dónde está el habitual.

La cabecera SHALL NOT llevar una tarjeta de Referencia —esas cifras viven en la pestaña *Señales*— ni una línea de resumen en lenguaje natural.

Bajo la cabecera SHALL ir una **fila de cuatro métricas secundarias**, cada una con su rótulo, su cifra grande y su lectura al lado: **Cumplimiento** ("40 %" · "12 de 30 SP en Closed"), **Trabajo no planificado** ("36.4 %" · "+8 SP sobre 22"), **Carry-over** ("0 %" · "0 SP") y **Foco** ("2" · "iniciativas · 4 HUs abiertas a la vez"). Las cifras que se salen de su tolerancia SHALL llevar el rol de color que les corresponde.

Todo lo demás SHALL vivir en **una sola tarjeta con cuatro pestañas** —**Señales**, **Historias**, **Actividad** y **Tendencia**—, cada una con un **subtítulo** que resume su contenido sin abrirla ("3 de 6 hacia sobrecarga", "6 historias · 30 SP", "5 días activos · 24 commits", "7 sprints · +0.4 %"). La pestaña activa SHALL marcarse con una regla en el rol de marca.

- **Señales** SHALL listar las seis evidencias como una tabla de **Señal · Valor · Tolerancia**, cada fila con un icono de dirección, el nombre de la evidencia, su **veredicto en palabras** —"Fuera de tolerancia", "Fuera de tolerancia · desviación fuerte", "Dentro de la tolerancia", "No se pudo evaluar: <motivo>"—, su cifra y el umbral contra el que se comparó; las que cuentan hacia la señal SHALL destacarse por color y no sólo por posición. Encabezando la tabla SHALL ir la frase que explica la regla: cada señal tiene una tolerancia y cuenta cuando el valor la excede. A la derecha SHALL ir la **Referencia** —histórico del colaborador, histórico de la célula y sprint actual, cada uno con su cifra, su desviación y una barra a la misma escala— y el **Trabajo no planificado** como una **barra apilada** de lo comprometido al inicio contra lo agregado, con su leyenda y los tres totales.
- **Historias** SHALL listar las del sprint elegido con número, título, épica y tablero, la iniciativa mapeada como marca, el estado en DevOps como marca de estado, la marca **Entró después** cuando llegó con el sprint arrancado, los puntos y el enlace para abrirla en DevOps. Al pie SHALL ir el recuento: cuántas historias y cuántos SP, cuántos en Closed, cuántos sin cerrar, cómo se calcula el cumplimiento y cuántas entraron después del inicio.
- **Actividad** SHALL mostrar el mapa de actividad —una celda por día calendario del sprint agrupadas por semana con su encabezado de días, la intensidad de commits, releases y features creadas, el nombre accesible con el detalle por tipo y su leyenda— junto a los totales por tipo y la última actividad.
- **Tendencia** SHALL mostrar, por cada sprint de la ventana, los SP comprometidos y completados, el % de cumplimiento, el carry-over % y una barra de cumplimiento, **del más reciente al más antiguo**, con los sprints sin snapshot marcados y excluidos del cálculo. Cada fila SHALL ser **accionable**: elegirla lleva la ficha entera a ese sprint. La fila del sprint elegido SHALL marcarse como tal.

El dashboard SHALL usar el mismo vocabulario de cuatro señales, tolerancia, horas, HUs y **foco** que el listado: las dos pantallas SHALL NOT nombrar distinto lo mismo. En particular, la evidencia de dispersión de la atención SHALL llamarse **Foco** en la tarjeta secundaria, en la fila de la tabla de señales y en cualquier otro rótulo visible, y SHALL NOT llamarse "Multitarea" ni "WIP".

Un colaborador **sin identidad DevOps** SHALL mostrar, en lugar del dashboard, un estado vacío con la acción de vincularla desde su ficha. Un colaborador **sin sprints** SHALL mostrar un estado vacío que lo diga con la acción de actualizar. Un colaborador con **histórico insuficiente** SHALL mostrar el sprint elegido con sus cifras y, en la tarjeta de Balance, el aviso de cuántos sprints sellados hay y cuántos faltan.

#### Scenario: Abrir el dashboard de un colaborador
- **WHEN** el Líder de Expertise abre el dashboard de un colaborador con identidad, célula e histórico suficiente
- **THEN** ve la franja del breadcrumb con el navegador en el sprint en curso y la marca "En curso", la línea de identidad con sus iniciativas, la tarjeta de Balance al frente con Capacidad y Demanda al lado, las cuatro métricas secundarias, y la tarjeta de pestañas abierta en *Señales*

#### Scenario: Cabecera de cuatro tarjetas
- **WHEN** un colaborador con FTE disponible 0.72 sobre 0.80, 30 SP comprometidos, mediana histórica de 22 SP y tres evidencias hacia sobrecarga abre su dashboard
- **THEN** la cabecera **ya no son cuatro tarjetas iguales con una línea de resumen debajo**: son tres desiguales, sin tarjeta de Referencia y sin línea de resumen. La de Balance, al frente y del doble de ancho, dice "Posible sobreasignación" con su frase, "3 señales" y el aviso de sprint en curso; la de Capacidad dice "0.72 / 0.80 FTE" con "72 h · −8 h por ausencias"; y la de Demanda dice "30 SP" con "+8 SP · +36 %" sobre una barra que marca el histórico de 22 SP

#### Scenario: Las cuatro métricas secundarias
- **WHEN** el sprint elegido cerró 12 de 30 SP, tuvo 8 SP que entraron después de los 22 iniciales, no arrastró nada y tocó 2 iniciativas con 4 HUs abiertas a la vez
- **THEN** la fila muestra "40 %" con "12 de 30 SP en Closed", "36.4 %" con "+8 SP sobre 22", "0 %" con "0 SP", y "2" con "iniciativas · 4 HUs abiertas a la vez" bajo el rótulo **Foco**

#### Scenario: Por qué esta señal
- **WHEN** se abre la pestaña *Señales* de un sprint en curso cuya demanda por FTE disponible se pasó fuerte de la tolerancia
- **THEN** la tabla lista las seis evidencias —también las neutras y las no evaluables— con su valor y su tolerancia; esa fila dice "Fuera de tolerancia · desviación fuerte" con su cifra destacada, y las que todavía no se pueden evaluar dicen "No se pudo evaluar: sprint en curso" con un guion en lugar de cifra

#### Scenario: El contexto de célula se anota, no atenúa
- **WHEN** la señal del sprint elegido es "Posible subasignación" y la célula del colaborador se desvía igual que él
- **THEN** la tarjeta de Balance sigue diciendo "Posible subasignación" —el comportamiento de la célula no baja la señal— y la ficha no repite la anotación, que se lee en el tooltip de su fila del listado

#### Scenario: Las pestañas dicen qué hay dentro sin abrirlas
- **WHEN** se mira la tarjeta de pestañas sin cambiar de pestaña
- **THEN** cada pestaña lleva su subtítulo con el resumen de su contenido —cuántas evidencias van hacia sobrecarga, cuántas historias y SP, cuántos días activos y commits, y cuántos sprints tiene la tendencia—

#### Scenario: Cambiar de sprint
- **WHEN** el Líder de Expertise usa la flecha de sprint anterior en la franja del breadcrumb
- **THEN** la cabecera, las métricas secundarias y las cuatro pestañas pasan a ese sprint sin recargar la aplicación, la marca de estado pasa a "Finalizado", el sprint queda en la URL, y la tendencia no cambia

#### Scenario: Ir a un sprint desde la tendencia
- **WHEN** el Líder de Expertise elige una fila de la pestaña *Tendencia*
- **THEN** la ficha entera pasa a ese sprint, el navegador del breadcrumb lo refleja, y esa fila queda marcada como la elegida

#### Scenario: Sprint sin snapshot en el dashboard
- **WHEN** el sprint elegido cerró sin snapshot sellado
- **THEN** el pie de la tarjeta de Balance lo dice, la señal de ese sprint es "No evaluable" por ese motivo, las evidencias de cumplimiento y carry-over dicen que no se pudieron evaluar, y la tendencia marca ese punto como faltante

#### Scenario: Mapa de actividad de un sprint con actividad
- **WHEN** el colaborador hizo commits, publicó releases o creó features en varios días del sprint elegido
- **THEN** la pestaña *Actividad* muestra cada día con la intensidad de su actividad total, el nombre accesible de la celda detalla cuántos de cada tipo, y al lado aparecen los totales por tipo, los días con actividad y la última actividad

#### Scenario: Reasignar desde el dashboard
- **WHEN** el Líder de Expertise usa "Reasignar" y confirma un plan válido
- **THEN** el sistema aplica el cambio con la misma semántica que la Torre de control y el dato de asignación de la línea de identidad se actualiza sin recargar la aplicación; la señal de balance no cambia por ello, porque no depende del FTE asignado

#### Scenario: Colaborador sin identidad en su dashboard
- **WHEN** se abre el dashboard de un colaborador sin identidad DevOps
- **THEN** la pantalla muestra el estado vacío "Sin identidad DevOps" con la acción de ir a su ficha a vincularla, y no muestra navegador de sprint, tarjetas ni pestañas

#### Scenario: Colaborador con histórico insuficiente
- **WHEN** se abre el dashboard de un colaborador con 2 sprints sellados y un mínimo de 3
- **THEN** las tarjetas de Capacidad y Demanda muestran sus cifras, la de Balance dice "No evaluable" con cuántos sprints sellados hay y cuántos faltan, y las pestañas muestran lo que sí se puede medir del sprint elegido

### Requirement: Trabajo no planificado y multitarea
El sistema SHALL exponer, por colaborador y por sprint, el **trabajo no planificado**: los **SP comprometidos al inicio** del sprint, los **SP agregados durante** el sprint (historias que entraron al sprint después de su fecha de inicio) y el **total trabajado** (la suma). SHALL mostrar los tres juntos siempre que muestre el cumplimiento, para que un cumplimiento bajo se lea contra el trabajo que realmente entró, y SHALL calcular la **proporción de trabajo no planificado** (agregado sobre comprometido al inicio).

El sistema SHALL exponer la **atención repartida** del colaborador en el sprint: las **HUs simultáneas** —cuántas historias estuvieron a la vez en un estado activo en Azure DevOps, con el máximo del sprint como WIP— y las **iniciativas simultáneas** —cuántas épicas distintas tocan sus historias del sprint—. Cada iniciativa simultánea SHALL mostrarse con el nombre de la iniciativa cuando la épica está mapeada a una y con el título de la épica cuando no lo está, indicando cuántos SP aporta cada una.

Esa lectura SHALL llamarse **Foco** en toda superficie visible —la columna del listado, la tarjeta de la ficha, la fila de la tabla de señales y cualquier otro rótulo—, y SHALL NOT llamarse "Multitarea" ni "WIP". El campo del contrato SHALL seguir llamándose `wip`, que es el nombre que Azure DevOps y el backend usan: renombrarlo sólo para la pantalla haría más difícil rastrear de dónde sale.

El sistema SHALL tratar el foco como **contexto de carga**: 28 SP en una sola iniciativa y 28 SP repartidos en cuatro no describen la misma situación, y la segunda tiene mayor riesgo de fragmentación de atención. SHALL NOT convertir por sí solo el foco en un veredicto.

#### Scenario: Trabajo no planificado en el sprint
- **WHEN** un colaborador se comprometió a 22 SP al inicio, recibió 8 SP más durante el sprint y completó 20
- **THEN** el trabajo no planificado se lee "36.4 %" con "+8 SP sobre 22" entre las métricas secundarias, y la pestaña de señales lo desarrolla como una barra apilada de 22 SP al inicio contra 8 SP agregados sobre un total de 30 SP

#### Scenario: Iniciativas simultáneas por épica
- **WHEN** las historias del sprint de un colaborador pertenecen a cuatro épicas distintas, dos de ellas mapeadas a iniciativas
- **THEN** el foco indica 4 iniciativas simultáneas, nombrando las dos iniciativas mapeadas y las dos épicas sin mapear, con los SP que aporta cada una

#### Scenario: Foco en una sola iniciativa
- **WHEN** los 28 SP del sprint pertenecen a una sola épica
- **THEN** el foco indica 1 iniciativa simultánea y no aporta evidencia de sobreasignación

#### Scenario: WIP del sprint
- **WHEN** en algún momento del sprint el colaborador tuvo cinco historias a la vez en estado activo
- **THEN** el foco del sprint cuenta 5 HUs abiertas a la vez y las muestra junto a las iniciativas simultáneas, sin usar la sigla WIP en la pantalla
