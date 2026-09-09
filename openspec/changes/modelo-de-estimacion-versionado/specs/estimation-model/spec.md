## Purpose

Define el modelo de estimación paramétrico y su ciclo de vida: las versiones que lo componen, cómo cada respuesta se convierte en tamaño, esfuerzo y riesgo a través de drivers y pesos por salida, y qué tiene que cumplir una configuración para poder publicarse sin reescribir lo ya estimado.

## ADDED Requirements

### Requirement: Modelo de estimación y sus versiones

El sistema SHALL organizar los parámetros de estimación en modelos, y cada modelo en versiones. Un modelo SHALL declarar su nombre y la fase de estimación a la que sirve. Una versión SHALL declarar su número, su estado —`Borrador`, `Vigente` o `Archivada`— y, si dejó de ser borrador, la fecha desde la cual rige.

Un modelo SHALL tener a lo sumo una versión `Vigente` a la vez. Las estimaciones nuevas SHALL calcularse siempre con la versión vigente del modelo de su fase.

#### Scenario: Ver los modelos y sus versiones
- **WHEN** el administrador entra a Parámetros del modelo
- **THEN** el sistema lista cada modelo con su fase y, bajo él, sus versiones con número, estado, vigencia y cuántas estimaciones calculó cada una

#### Scenario: Un modelo sin versión vigente
- **WHEN** un modelo tiene sólo versiones en borrador o archivadas
- **THEN** el sistema no ofrece ese modelo para estimar y lo indica en la lista

### Requirement: Una versión publicada es inmutable

El sistema SHALL impedir editar el contenido de una versión que no esté en estado `Borrador`. Para cambiar algo de una versión vigente o archivada, el administrador SHALL crear una versión nueva a partir de ella, que nace en `Borrador` con una copia de todo su contenido.

El sistema SHALL ofrecer esa acción en el mismo lugar donde niega la edición, de modo que la negativa no deje al administrador sin salida.

#### Scenario: Intentar editar una versión vigente
- **WHEN** el administrador abre una versión cuyo estado es `Vigente` o `Archivada`
- **THEN** el sistema muestra su contenido sin controles de edición y ofrece la acción de crear una versión nueva a partir de ella

#### Scenario: Crear una versión a partir de otra
- **WHEN** el administrador crea una versión a partir de la vigente
- **THEN** el sistema crea una versión en `Borrador` con una copia de sus dimensiones, preguntas, opciones, drivers, pesos, reglas de talla, parámetros de esfuerzo, mix y modificadores, y la versión de origen queda intacta

### Requirement: Contenido de una versión

Una versión SHALL contener, como un todo indivisible, las dimensiones del cuestionario, sus preguntas con sus opciones de respuesta, los drivers, la matriz de pesos por salida, las reglas de talla, los parámetros de esfuerzo, el mix base de capacidades y sus modificadores.

El sistema SHALL mostrar ese contenido resumido al abrir la versión, con la cantidad de cada elemento y cuáles cambiaron respecto de la versión de la que se creó.

#### Scenario: Ver la composición de un borrador
- **WHEN** el administrador abre una versión en borrador
- **THEN** el sistema muestra cuántas dimensiones, preguntas, opciones, drivers, pesos, reglas de talla, parámetros de esfuerzo, capacidades del mix y modificadores tiene, y marca los que difieren de la versión de origen

### Requirement: Dimensiones del cuestionario

El sistema SHALL permitir crear, renombrar, reordenar y activar o desactivar dimensiones dentro de una versión en borrador. El orden de las dimensiones SHALL ser el orden en que el cuestionario las presenta.

Desactivar una dimensión SHALL sacarla del cuestionario sin borrarla ni borrar sus preguntas, porque las estimaciones ya calculadas las siguen necesitando para leerse.

#### Scenario: Reordenar las dimensiones
- **WHEN** el administrador cambia el orden de una dimensión
- **THEN** el cuestionario de las estimaciones nuevas presenta las dimensiones en el orden nuevo, y las estimaciones ya guardadas conservan el que tenían

#### Scenario: Desactivar una dimensión
- **WHEN** el administrador desactiva una dimensión que tiene preguntas
- **THEN** el sistema la saca del cuestionario, conserva sus preguntas y las estimaciones anteriores siguen mostrando su aporte al puntaje

### Requirement: Tipo de pregunta y opciones de respuesta

Cada pregunta SHALL declarar su tipo: `Cuantitativa` cuando pide una magnitud, `Evaluativa` cuando pide un nivel dentro de una escala definida, o `Binaria` cuando detecta una condición.

Cada pregunta SHALL declarar sus opciones de respuesta, y cada opción SHALL llevar su etiqueta, su criterio y su puntaje normalizado entre 0 y 1. En una pregunta cuantitativa el criterio SHALL ser un tramo sobre el número que responde el usuario, y los tramos SHALL cubrir todo el dominio sin huecos ni solapes.

El sistema SHALL guardar la respuesta cruda además del puntaje normalizado, de modo que el cálculo se pueda reconstruir.

#### Scenario: Responder una pregunta cuantitativa
- **WHEN** el usuario escribe una magnitud en una pregunta cuantitativa
- **THEN** el sistema ubica el número en su tramo, aplica el puntaje normalizado de ese tramo y muestra la derivación completa: número, tramo, puntaje, driver y salidas a las que aporta

#### Scenario: Tramos con un hueco
- **WHEN** el administrador define tramos de una pregunta cuantitativa que dejan un valor del dominio sin cubrir, o que se solapan
- **THEN** el sistema marca la pregunta como inválida y explica qué parte del dominio queda sin cubrir o duplicada

#### Scenario: Cambiar el tipo de una pregunta
- **WHEN** el administrador cambia el tipo de una pregunta que ya tenía opciones
- **THEN** el sistema conserva las opciones existentes y marca las que dejaron de ser válidas para el tipo nuevo

### Requirement: Drivers

El sistema SHALL permitir definir drivers dentro de una versión. Un driver SHALL declarar su código, su descripción y sobre qué salidas actúa: tamaño, esfuerzo, riesgo o mix.

Cada pregunta SHALL apuntar a exactamente un driver, y cada driver SHALL ser alimentado por al menos una pregunta y actuar sobre al menos una salida.

#### Scenario: Ver qué alimenta a cada driver
- **WHEN** el administrador abre la sección de drivers
- **THEN** el sistema muestra, por cada driver, sobre qué salidas actúa y qué preguntas lo alimentan

#### Scenario: Un driver sin preguntas
- **WHEN** el administrador desactiva la única pregunta que alimenta un driver
- **THEN** el sistema marca ese driver como huérfano y lo señala como impedimento para publicar

### Requirement: Pesos por salida

El sistema SHALL mantener el peso de cada pregunta por separado para cada salida —tamaño, esfuerzo y riesgo— y para el mix. Una pregunta SHALL poder pesar distinto en cada salida, o no aportar a alguna.

"No aporta a esta salida" SHALL ser un estado distinto de "pesa cero": el sistema SHALL distinguirlos al mostrarlos y al calcular.

Las salidas SHALL mantenerse independientes: el sistema SHALL NOT permitir que el peso de riesgo de una pregunta modifique el tamaño ni el esfuerzo de la iniciativa.

#### Scenario: Editar la matriz de pesos
- **WHEN** el administrador cambia el peso de una pregunta en la salida de riesgo
- **THEN** el sistema recalcula el reparto del peso entre salidas y muestra el efecto sobre una iniciativa de referencia, sin que su talla cambie por ese solo cambio

#### Scenario: Una pregunta que no aporta a una salida
- **WHEN** una pregunta no aporta a la salida de tamaño
- **THEN** el sistema muestra esa celda como "no aporta" y la excluye del puntaje máximo de tamaño, en lugar de sumarle cero

#### Scenario: Preguntas que no mueven ningún resultado
- **WHEN** una pregunta activa no tiene peso en ninguna salida
- **THEN** el sistema lo advierte al publicar, sin impedir la publicación

### Requirement: Reglas de talla y parámetros de esfuerzo

Una versión SHALL definir los umbrales que reparten el puntaje de tamaño entre las tallas, y esos umbrales SHALL ser contiguos y cubrir el dominio entero sin huecos.

Para cada talla, la versión SHALL definir tres valores de esfuerzo en persona-mes —mínimo, esperado y máximo— y el esperado SHALL estar entre los otros dos. El esfuerzo esperado SHALL ser un parámetro propio y no derivarse del punto medio del rango.

#### Scenario: Mover un umbral
- **WHEN** el administrador mueve el límite entre dos tallas
- **THEN** el sistema ajusta las dos bandas contiguas de modo que sigan siendo contiguas, y muestra cuántas estimaciones históricas caerían en otra talla con ese cambio

#### Scenario: Esfuerzo esperado fuera del rango
- **WHEN** el administrador deja el esfuerzo esperado de una talla por debajo del mínimo o por encima del máximo
- **THEN** el sistema marca esa talla como inválida y la publicación queda bloqueada

### Requirement: Mix de capacidades en porcentaje

El mix de capacidades SHALL expresar la participación de cada perfil en el esfuerzo de la iniciativa como un porcentaje, y los porcentajes de cada talla SHALL sumar exactamente 100.

El sistema SHALL derivar el FTE por perfil aplicando ese porcentaje al FTE total de la iniciativa, y SHALL NOT expresar el mix como una cantidad de personas: el mix describe demanda de perfiles, no asignación de personas.

#### Scenario: Una columna que no cierra
- **WHEN** los porcentajes de una talla no suman 100
- **THEN** el sistema marca esa talla, dice cuántos puntos faltan o sobran y bloquea la publicación

#### Scenario: Ver la demanda por perfil de una estimación
- **WHEN** una estimación termina con una talla y un FTE
- **THEN** el sistema muestra, por cada capacidad del mix, su porcentaje y el FTE que le corresponde, y la suma de los FTE por perfil es igual al FTE total

### Requirement: Modificadores de mix por driver

El sistema SHALL permitir definir modificadores que ajusten el mix base según los drivers de la iniciativa. Cada modificador SHALL declarar su driver, la condición que lo dispara, las tallas a las que aplica, y el ajuste en puntos porcentuales.

Un modificador SHALL repartir y no agregar: lo que suma a un perfil SHALL restarlo de otro, de modo que el mix siga sumando 100. El sistema SHALL NOT permitir que un modificador deje a un perfil por debajo de cero.

#### Scenario: Un modificador que se dispara
- **WHEN** una iniciativa cumple la condición de un modificador
- **THEN** el sistema aplica el ajuste sobre el mix base, el mix resultante sigue sumando 100, y la estimación muestra qué driver lo movió

#### Scenario: Un modificador que no reparte
- **WHEN** el administrador define un modificador cuya suma y resta no se compensan
- **THEN** el sistema lo marca como inválido y bloquea la publicación

### Requirement: Validación antes de publicar

El sistema SHALL validar una versión en borrador antes de permitir su publicación, y SHALL NOT publicar una configuración incompleta o inconsistente.

Cada resultado de la validación SHALL decir qué falta y llevar a donde se arregla. El sistema SHALL distinguir los impedimentos, que bloquean la publicación, de las advertencias, que no.

#### Scenario: Publicar con impedimentos
- **WHEN** la validación de un borrador encuentra al menos un impedimento
- **THEN** el sistema mantiene la publicación deshabilitada, dice cuántos impedimentos quedan y ofrece ir a cada uno

#### Scenario: Publicar con advertencias
- **WHEN** la validación encuentra sólo advertencias
- **THEN** el sistema permite publicar, dejando las advertencias a la vista

### Requirement: Diferencias y efecto de una publicación

Antes de publicar, el sistema SHALL mostrar en qué difiere el borrador de la versión vigente, agrupado por sección, con el valor anterior y el nuevo.

El sistema SHALL mostrar además qué habría pasado si el borrador hubiera estado vigente: cuántas estimaciones históricas cambiarían de talla y cómo se movería el esfuerzo esperado. Esa lectura SHALL ser una simulación y SHALL NOT modificar ninguna estimación guardada.

#### Scenario: Ver el diff antes de publicar
- **WHEN** el administrador abre la publicación de un borrador
- **THEN** el sistema lista los cambios por sección, cada uno con su valor anterior y el nuevo

#### Scenario: La simulación no toca el histórico
- **WHEN** el administrador consulta el efecto simulado y luego publica
- **THEN** las estimaciones históricas conservan su talla, su esfuerzo y la versión con la que se calcularon

### Requirement: Publicación y vigencia

Al publicar, el sistema SHALL pasar el borrador a `Vigente` desde la fecha indicada, archivar la versión que regía y registrar la nota de cambio.

#### Scenario: Publicar una versión
- **WHEN** el administrador publica un borrador válido con su fecha de vigencia y su nota de cambio
- **THEN** esa versión pasa a `Vigente`, la anterior pasa a `Archivada` con su vigencia cerrada, y las estimaciones nuevas empiezan a usar la publicada

### Requirement: Auditoría de los cambios de configuración

El sistema SHALL registrar, por cada cambio de configuración y por cada publicación, qué cambió, cuándo y quién lo hizo, y SHALL mostrar ese historial en la versión.

El autor SHALL viajar en la petición desde la sesión del cliente. El sistema SHALL tratar esa firma como declarativa y no como una identidad verificada, dado que la interfaz de programación todavía no valida el token de quien llama.

#### Scenario: Ver el historial de una versión
- **WHEN** el administrador abre una versión
- **THEN** el sistema muestra sus cambios en orden, cada uno con qué cambió, cuándo y el autor que informó el cliente

#### Scenario: Un cambio sin autor
- **WHEN** una petición de cambio de configuración llega sin autor
- **THEN** el sistema rechaza la petición en lugar de registrar un cambio anónimo

### Requirement: Cada estimación guarda su versión

Cada estimación SHALL guardar con qué versión del modelo se calculó, y el sistema SHALL leerla siempre contra esa versión y no contra la vigente.

Publicar una versión nueva SHALL NOT cambiar el resultado, la talla, el esfuerzo ni la lectura de ninguna estimación anterior.

#### Scenario: Leer una estimación después de publicar
- **WHEN** se publica una versión que mueve un umbral de talla y luego se abre una estimación calculada con la versión anterior
- **THEN** la estimación muestra la misma talla, el mismo esfuerzo y las mismas bandas que cuando se guardó, y dice con qué versión se calculó

#### Scenario: Recalcular es un acto explícito
- **WHEN** una estimación fue calculada con una versión distinta de la vigente
- **THEN** el sistema lo indica y ofrece recalcularla, sin hacerlo por su cuenta
