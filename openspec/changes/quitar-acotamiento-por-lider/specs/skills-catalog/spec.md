## MODIFIED Requirements

### Requirement: Nivel esperado por cargo
Por cada habilidad, el sistema SHALL permitir declarar qué nivel exige cada cargo, tomando los cargos de las personas registradas. Un cargo SHALL poder quedar sin nivel declarado, y en ese caso el sistema SHALL mostrarlo como "sin definir" y NOT generar brechas para las personas de ese cargo en esa habilidad.

Lo que se exige SHALL depender de a qué se dedica la persona y NO de cómo participa en la aplicación: el **rol** —Administrador, Líder Técnico, Líder de Expertise, Product Owner, Colaborador— es un catálogo cerrado de cinco valores y no describe una disciplina, así que no puede fijar el nivel de una habilidad técnica. Declararlo contra el rol dejaría a cinco valores respondiendo por todas las disciplinas.

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

