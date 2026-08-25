## ADDED Requirements

### Requirement: Catálogo de habilidades
El sistema SHALL ofrecer al Admin una pantalla de Habilidades en `/app/admin/habilidades` que lista el catálogo agrupado en **humanas** y **técnicas**, indicando por cada habilidad cuántos criterios tiene en total y señalando la que tiene algún nivel sin criterios. Al elegir una habilidad, la pantalla SHALL mostrar su detalle: nombre, grupo, descripción, sus cuatro niveles con los criterios de cada uno, y el nivel esperado por rol. El breadcrumb de la pantalla SHALL ser "Habilidades".

Toda habilidad SHALL tener exactamente los cuatro niveles de la escala Tuya —Principiante, Competente, Avanzado y Experto— sin poder agregarlos ni quitarlos: la escala es la misma con la que la app ya representa seniority y stacks.

#### Scenario: Entrar al catálogo
- **WHEN** el Admin abre `/app/admin/habilidades`
- **THEN** ve las habilidades agrupadas en humanas y técnicas con su conteo de criterios, y el detalle de la primera

#### Scenario: Habilidad incompleta
- **WHEN** una habilidad tiene algún nivel sin criterios
- **THEN** el listado la señala como incompleta indicando qué nivel le falta, y su detalle marca ese nivel

#### Scenario: Catálogo vacío
- **WHEN** no hay ninguna habilidad cargada
- **THEN** la pantalla muestra un estado vacío que invita a crear la primera

### Requirement: Alta y edición de una habilidad
El sistema SHALL permitir crear una habilidad con nombre, grupo y descripción, y editar esos tres datos después. El nombre SHALL ser obligatorio y único dentro del catálogo; el grupo SHALL ser humana o técnica. Una habilidad SHALL poder retirarse sólo si ninguna evaluación la usa; cuando alguna la usa, el sistema SHALL ofrecer desactivarla —deja de ofrecerse en evaluaciones nuevas y sigue visible en las anteriores— en vez de borrarla.

#### Scenario: Crear una habilidad
- **WHEN** el Admin crea una habilidad con nombre, grupo y descripción
- **THEN** aparece en su grupo del listado con sus cuatro niveles vacíos y marcada como incompleta

#### Scenario: Nombre repetido
- **WHEN** intenta crear o renombrar una habilidad con un nombre que ya existe en el catálogo
- **THEN** el formulario lo rechaza explicando el conflicto y no guarda nada

#### Scenario: Retirar una habilidad en uso
- **WHEN** intenta eliminar una habilidad que alguna evaluación ya usó
- **THEN** el sistema lo impide y ofrece desactivarla, explicando que las evaluaciones anteriores la conservan

### Requirement: Criterios de cada nivel
Cada nivel de una habilidad SHALL llevar una lista ordenada de criterios, de largo variable: el sistema SHALL NOT imponer ni asumir una cantidad, ni exigir que todos los niveles de una habilidad tengan la misma. Un criterio SHALL poder agregarse, editarse, reordenarse dentro de su nivel y quitarse. El texto de un criterio SHALL ser obligatorio.

El detalle de la habilidad SHALL mostrar por cada nivel su cantidad de criterios, y el listado SHALL mostrar el total de la habilidad, de modo que se vea de un vistazo cuál está más desarrollada y cuál a medias.

#### Scenario: Agregar criterios a un nivel
- **WHEN** el Admin agrega tres criterios al nivel Avanzado de una habilidad
- **THEN** el nivel los muestra en el orden en que se agregaron y su contador pasa a tres

#### Scenario: Cantidades distintas por nivel
- **WHEN** una habilidad tiene 5 criterios en Principiante, 5 en Competente, 6 en Avanzado y 4 en Experto
- **THEN** la pantalla los muestra todos sin recortar ni rellenar ninguno, y cada nivel informa su propia cantidad

#### Scenario: Quitar un criterio
- **WHEN** el Admin quita un criterio de un nivel
- **THEN** desaparece de la lista, el contador baja y los demás conservan su orden

#### Scenario: Criterio sin texto
- **WHEN** intenta guardar un criterio vacío
- **THEN** el sistema lo rechaza y no lo agrega

### Requirement: Nivel esperado por rol
Por cada habilidad, el sistema SHALL permitir declarar qué nivel exige cada rol del chapter, tomando los roles de las personas registradas. Un rol SHALL poder quedar sin nivel declarado, y en ese caso el sistema SHALL mostrarlo como "sin definir" y NOT generar brechas para las personas de ese rol en esa habilidad.

El nivel esperado SHALL ser lo único que convierte un nivel evaluado en brecha; el sistema SHALL NOT derivarlo del seniority de la persona ni de ningún otro dato.

#### Scenario: Declarar el nivel de un rol
- **WHEN** el Admin declara que Data Engineer exige Avanzado en Conocimiento del negocio
- **THEN** la habilidad muestra ese nivel para ese rol, y las personas con ese rol se comparan contra él

#### Scenario: Rol sin nivel definido
- **WHEN** un rol no tiene nivel declarado en una habilidad
- **THEN** la pantalla lo muestra como "sin definir" y las personas de ese rol no registran brecha en esa habilidad

#### Scenario: Roles distintos, exigencias distintas
- **WHEN** dos roles exigen niveles distintos en la misma habilidad
- **THEN** ambos se muestran con su propio nivel, sin que uno sobrescriba al otro

### Requirement: Versionado del catálogo
El sistema SHALL versionar el catálogo: publicar un cambio en los criterios, en los niveles esperados o en el conjunto de habilidades SHALL crear una versión nueva y dejar la anterior como histórica. Una evaluación cerrada SHALL conservar la versión con la que se hizo y SHALL NOT recalcularse cuando el catálogo cambia; las evaluaciones nuevas SHALL usar la versión vigente.

La pantalla SHALL advertir esta regla donde se editan los criterios, para que quien edita sepa que no está reescribiendo el pasado.

#### Scenario: Publicar un cambio
- **WHEN** el Admin cambia el texto de un criterio y publica
- **THEN** el catálogo pasa a una versión nueva y la anterior queda registrada

#### Scenario: Una evaluación cerrada no se mueve
- **WHEN** se publica una versión nueva del catálogo
- **THEN** las evaluaciones ya cerradas siguen mostrando los criterios y niveles esperados con los que se hicieron

#### Scenario: La advertencia está a la vista
- **WHEN** el Admin abre el detalle de una habilidad para editar sus criterios
- **THEN** la pantalla le indica que el cambio no recalcula las evaluaciones ya cerradas
