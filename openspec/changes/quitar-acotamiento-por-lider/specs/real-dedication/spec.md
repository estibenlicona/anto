## MODIFIED Requirements

### Requirement: Balance de carga de los colaboradores
El sistema SHALL exponer la pantalla **Capacidad** en `/app/lead/dedicacion`, con breadcrumb `Plataforma / Capacidad` y la entrada "Capacidad" activa en la navegación: una fila por **cada colaborador registrado** —desarrolladores, ingenieros de calidad y cualquier otro perfil— con su señal de balance en el sprint elegido, sin recortar por quién lo tiene a cargo.

La franja del breadcrumb SHALL llevar un **navegador de sprint** —el sprint anterior, el nombre y las fechas del sprint elegido, el siguiente— que mueve **el listado entero** de un sprint a otro, con el sprint en curso elegido al abrir y marcado como tal, y sin avanzar más allá de él. El sprint elegido SHALL viajar en la URL, de modo que el enlace se comparta y el botón de atrás funcione. A su lado SHALL ir cuándo fue la última actualización ("Actualizado hace 12 min" o "Sin actualizar") y la acción **Actualizar** desde Azure DevOps.

Cuatro **indicadores** SHALL encabezar la pantalla, uno por señal, cada uno con el punto de color de su rol: **Posible sobreasignación** (peligro), **Posible subasignación** (advertencia), **Carga habitual** (éxito) y **No evaluables** (neutro, sobre el total de colaboradores y con cuántos son por cada motivo). Cada indicador SHALL nombrar a los colaboradores que cuenta cuando son pocos, y describir el sprint elegido y no el filtro aplicado.

La **tabla** SHALL mostrar, por colaborador y para el sprint elegido, seis columnas: el **colaborador** (avatar, nombre, cargo, enlace neutro a su dashboard); la **célula e iniciativas**, con la célula y, de las iniciativas que sus historias tocaron en el sprint, **sólo la primera** como marca y el resto colapsado en un "+N" que lleva los nombres en su tooltip —la columna dice en qué anduvo la persona, y el ancho que se ahorra se lo llevan las barras de capacidad y demanda—; los nombres repetidos SHALL contarse una sola vez acá, aunque el foco los cuente todos; la **capacidad** (FTE disponible sobre contractual con su barra, y las horas con su descuento debajo); la **demanda vs habitual** (SP comprometidos, su mediana histórica y la **desviación en porcentaje** con el rol de color de la señal, sobre una barra que marca el habitual, y debajo la **tolerancia** —"Tolerancia ±25 %" cuando la desviación se sale de ella, "Dentro de la tolerancia" cuando no—); el **foco**, que es cuánta atención tiene repartida: un **medidor de cuatro tramos** que escala con las HUs abiertas a la vez por los mismos umbrales con los que la evidencia de multitarea cuenta —una sola HU, dos o tres, el umbral, y la desviación fuerte— y, debajo, las dos cifras que lo sostienen ("2 iniciativas · 4 HUs", sin la palabra WIP y sin el adjetivo "abiertas", que en la fila no distingue nada). Sin WIP reconstruido SHALL NOT pintarse el medidor: uno vacío se leería como foco pleno, que es lo contrario de "no se sabe"; y, como última columna, el **balance** reducido a **un solo icono** con nombre accesible y tooltip que lleva la señal, cuántas evidencias la sostienen y el contexto de célula cuando aplica. La columna de balance SHALL NOT llevar texto, marca de estado ni enlace.

La tabla SHALL NOT tener columna de sprint —el sprint es del listado entero— ni columnas de FTE comprometido, de FTE asignado, de porcentajes de dedicación ni de actividad. SHALL ordenarse por defecto poniendo primero las señales que piden acción —sobreasignación y subasignación—, luego la carga habitual y al final las no evaluables; SHALL buscarse por nombre o cargo; SHALL filtrarse por célula con **marcas en línea** que se activan y desactivan al hacer clic, incluida una para quienes no tienen célula; y SHALL paginarse como los demás listados. La toolbar SHALL mostrar a la derecha cuántas filas se están viendo sobre el total ("13 de 13 personas"). El sistema SHALL NOT ofrecer un filtro por señal: los cuatro indicadores ya separan por señal.

Un colaborador **sin identidad DevOps**, **sin sprint** o con **histórico insuficiente** SHALL aparecer con el icono de "No evaluable" y sin cifras de capacidad, demanda ni foco, con el motivo en el tooltip; su nombre sigue llevando a su dashboard. Sin ningún colaborador registrado, la pantalla SHALL mostrar un estado vacío. Mientras carga SHALL mostrar el esqueleto de la tabla, sin desplazar los indicadores.

#### Scenario: Abrir el balance de carga
- **WHEN** el Líder de Expertise entra a Dedicación
- **THEN** ve el navegador de sprint en el sprint en curso y marcado como tal, los cuatro indicadores por señal, la tabla con una fila por cada colaborador registrado, ordenada por señal accionable, la acción de actualizar con la hora de la última actualización, y la entrada "Dedicación" activa

#### Scenario: Leer una fila
- **WHEN** un colaborador con FTE contractual 0.80 y 0.72 disponible comprometió 30 SP contra un histórico de 22, tocando 2 iniciativas con 4 HUs abiertas
- **THEN** su fila muestra "0.72 / 0.80 FTE" con "72 h · −8 h por ausencias", "30 SP · habitual 22 · +36 %" con "Tolerancia ±25 %", el medidor de foco con tres de sus cuatro tramos encendidos sobre "2 iniciativas · 4 HUs", y el icono de su señal, cuyo tooltip da la señal y cuántas evidencias concurrentes la sostienen

#### Scenario: Una fila dentro de la tolerancia
- **WHEN** un colaborador comprometió 18 SP contra un histórico de 22, una desviación del −18 % que no llega a la tolerancia de ±25 %
- **THEN** su fila muestra "18 SP · habitual 22 · −18 %" con el pie "Dentro de la tolerancia" y el icono de "Carga habitual"

#### Scenario: Cambiar de sprint mueve el listado entero
- **WHEN** el Líder de Expertise retrocede un sprint en el navegador de la franja
- **THEN** los cuatro indicadores y todas las filas pasan a ese sprint sin recargar la aplicación, el sprint elegido queda en la URL y deja de mostrarse la marca de sprint en curso

#### Scenario: No se avanza más allá del sprint en curso
- **WHEN** el sprint elegido es el en curso
- **THEN** la acción de avanzar al sprint siguiente está deshabilitada

#### Scenario: Ordenar por señal accionable
- **WHEN** hay colaboradores con las cuatro señales
- **THEN** la tabla muestra primero los de posible sobreasignación y subasignación, luego los de carga habitual y al final los no evaluables

#### Scenario: Filtrar por señal y por célula
- **WHEN** el Líder de Expertise hace clic en la marca de la célula Backend Platform
- **THEN** la tabla muestra sólo los colaboradores de esa célula desde la primera página, el conteo de la derecha dice cuántos se están viendo sobre el total, y los indicadores no cambian: describen el sprint, no el filtro; la toolbar SHALL NOT ofrecer un filtro por señal, porque los cuatro indicadores ya separan por señal

#### Scenario: Colaborador no evaluable
- **WHEN** un colaborador no tiene identidad DevOps vinculada
- **THEN** su fila muestra el icono de "No evaluable" sin cifras, el tooltip dice que falta la identidad, y cuenta en el indicador de no evaluables por ese motivo

#### Scenario: Ir al dashboard de un colaborador
- **WHEN** el Líder de Expertise hace clic en el nombre de un colaborador
- **THEN** el sistema abre `/app/lead/dedicacion/<id>` con el sprint que estaba mirando ya elegido, sin recargar la aplicación, y la entrada "Dedicación" sigue activa

#### Scenario: Sin colaboradores a cargo
- **WHEN** no hay ninguna persona registrada
- **THEN** la pantalla muestra un estado vacío que lo dice y no muestra la tabla

