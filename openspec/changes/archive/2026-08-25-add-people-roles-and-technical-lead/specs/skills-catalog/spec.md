## REMOVED Requirements

### Requirement: Nivel esperado por rol
**Reason**: El nivel que se le exige a una persona pasa a derivarse de su **cargo** y no de su rol. El rol deja de ser texto libre y pasa a ser un catálogo cerrado de cinco valores de participación —Administrador, Líder Técnico, Líder de Expertise, Product Owner, Colaborador—, que no describe una disciplina y no puede fijar el nivel de una habilidad. Los escenarios de este requisito nombran el rol como vara de medir, así que se retira entero y se reemplaza por su equivalente contra el cargo.
**Migration**: Ninguna para quien usa la pantalla: lo que antes se leía del rol se lee del cargo, y las expectativas ya estaban declaradas con nombres de cargo ("Backend Dev", "Data Engineer"). Ver el requisito que lo reemplaza en la sección ADDED.

## ADDED Requirements

### Requirement: Nivel esperado por cargo
Por cada habilidad, el sistema SHALL permitir declarar qué nivel exige cada cargo del chapter, tomando los cargos de las personas registradas. Un cargo SHALL poder quedar sin nivel declarado, y en ese caso el sistema SHALL mostrarlo como "sin definir" y NOT generar brechas para las personas de ese cargo en esa habilidad.

Lo que se exige SHALL depender de a qué se dedica la persona y NO de cómo participa en la aplicación: el **rol** —Administrador, Líder Técnico, Líder de Expertise, Product Owner, Colaborador— es un catálogo cerrado de cinco valores y no describe una disciplina, así que no puede fijar el nivel de una habilidad técnica. Declararlo contra el rol dejaría a cinco valores respondiendo por todas las disciplinas del chapter.

El nivel esperado SHALL ser lo único que convierte un nivel evaluado en brecha; el sistema SHALL NOT derivarlo del seniority de la persona ni de ningún otro dato.

#### Scenario: Declarar el nivel de un cargo
- **WHEN** el Admin declara que Data Engineer exige Avanzado en Conocimiento del negocio
- **THEN** la habilidad muestra ese nivel para ese cargo, y las personas con ese cargo se comparan contra él

#### Scenario: Cargo sin nivel definido
- **WHEN** un cargo no tiene nivel declarado en una habilidad
- **THEN** la pantalla lo muestra como "sin definir" y las personas de ese cargo no registran brecha en esa habilidad

#### Scenario: Cargos distintos, exigencias distintas
- **WHEN** dos cargos exigen niveles distintos en la misma habilidad
- **THEN** ambos se muestran con su propio nivel, sin que uno sobrescriba al otro

#### Scenario: Cambiar el rol de una persona no mueve ninguna exigencia
- **WHEN** una persona pasa de Colaborador a Líder Técnico sin que su cargo cambie
- **THEN** los niveles que se le exigen en cada habilidad son los mismos que antes, porque los fija su cargo

## MODIFIED Requirements

### Requirement: Catálogo de habilidades
El sistema SHALL ofrecer al Admin una pantalla de Habilidades en `/app/admin/habilidades` que lista el catálogo agrupado en **humanas** y **técnicas**, indicando por cada habilidad cuántos criterios tiene en total y señalando la que tiene algún nivel sin criterios. Al elegir una habilidad, la pantalla SHALL mostrar su detalle: nombre, grupo, descripción, sus cuatro niveles con los criterios de cada uno, y el nivel esperado por cargo. El breadcrumb de la pantalla SHALL ser "Habilidades".

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

