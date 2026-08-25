## ADDED Requirements

### Requirement: Perfil evaluado de una persona
El sistema SHALL ofrecer al Chapter Lead el plan de carrera de una persona en `/app/lead/plan-carrera/:personId`, accesible desde la matriz del span y desde el detalle de la persona. La pantalla SHALL encabezarse con la persona, su rol, la fecha de su última evaluación y cuántas brechas tiene abiertas.

El perfil SHALL mostrar una fila por habilidad evaluada, agrupadas en técnicas y humanas, con el nivel alcanzado sobre el medidor de cuatro pasos y, sobre ese mismo medidor, una marca en el nivel que su rol pide. Cada fila SHALL indicar si está al nivel o cuántos niveles le faltan. Cuando su rol no tiene nivel declarado para una habilidad, la fila SHALL mostrar el nivel sin marca ni estado de brecha.

#### Scenario: Ver el perfil
- **WHEN** el Chapter Lead abre el plan de una persona evaluada
- **THEN** ve una fila por habilidad con su nivel, la marca de lo que su rol pide y si está al nivel o cuántos le faltan

#### Scenario: Persona sin evaluación cerrada
- **WHEN** la persona no tiene ninguna evaluación cerrada
- **THEN** la pantalla lo dice y ofrece evaluarla, en vez de mostrar un perfil vacío

#### Scenario: Habilidad sin nivel exigido para su rol
- **WHEN** el rol de la persona no declara nivel en una habilidad
- **THEN** la fila muestra el nivel alcanzado, sin marca de umbral ni estado de brecha

### Requirement: Detalle de criterios por habilidad
Al abrir una habilidad del perfil, el sistema SHALL mostrar los criterios que la persona **cumple** en el nivel que alcanzó y los que le **faltan** del nivel que su rol pide, cada uno con su marca, tomados de la evaluación con la que se cerró — no de un texto escrito aparte. Cada bloque SHALL indicar cuántos cumple sobre el total de ese nivel, sin asumir una cantidad de criterios.

Varias habilidades SHALL poder estar abiertas a la vez, y el sistema SHALL NOT cerrar una al abrir otra.

#### Scenario: Abrir una habilidad con brecha
- **WHEN** el Chapter Lead abre una habilidad en la que la persona tiene brecha
- **THEN** ve a la izquierda lo que cumple en su nivel y a la derecha lo que le falta del nivel exigido, con el contador de cada uno

#### Scenario: Abrir una habilidad sin brecha
- **WHEN** abre una habilidad en la que la persona está al nivel o por encima
- **THEN** ve los criterios que cumple en su nivel, y el sistema no inventa un nivel siguiente como exigencia

#### Scenario: Los criterios son los de la evaluación
- **WHEN** el catálogo cambió después de la evaluación
- **THEN** el detalle muestra los criterios de la versión con la que se evaluó, coherente con lo que la evaluación registró

### Requirement: Plan de acciones por brecha
El sistema SHALL permitir registrar acciones del plan de carrera de una persona. Cada acción SHALL declarar de qué **brecha registrada** nace, a qué nivel apunta, para cuándo se compromete y su estado; el sistema SHALL NOT permitir una acción que no esté asociada a una brecha. Una brecha SHALL poder tener varias acciones.

La pantalla SHALL mostrar las acciones con su brecha de origen, su objetivo de nivel, su compromiso y su estado, y SHALL señalar las brechas que todavía no tienen ninguna acción.

#### Scenario: Registrar una acción
- **WHEN** el Chapter Lead registra una acción sobre una brecha, con nivel objetivo y fecha
- **THEN** la acción aparece en el plan asociada a esa brecha, con su estado inicial en curso

#### Scenario: Acción sin brecha
- **WHEN** intenta registrar una acción sin asociarla a una brecha
- **THEN** el sistema lo impide, porque una acción del plan existe para cerrar algo concreto

#### Scenario: Brecha sin plan
- **WHEN** una brecha no tiene ninguna acción registrada
- **THEN** la pantalla la señala como pendiente de plan

### Requirement: Una brecha se cierra reevaluando
Marcar una acción como cumplida SHALL NOT cerrar la brecha que la originó: SHALL registrar que la acción terminó y dejar la brecha abierta. Una brecha SHALL cerrarse únicamente cuando una evaluación posterior deja el nivel de esa habilidad en el que su rol pide o por encima.

La pantalla SHALL dejar esta regla explícita donde se administran las acciones, para que cumplir el plan no se confunda con cerrar la brecha.

#### Scenario: Acción cumplida, brecha abierta
- **WHEN** el Chapter Lead marca una acción como cumplida
- **THEN** la acción queda cumplida y la brecha sigue abierta, con la pantalla indicando que se cierra reevaluando

#### Scenario: La reevaluación cierra la brecha
- **WHEN** una evaluación posterior deja esa habilidad en el nivel que el rol pide o por encima
- **THEN** la brecha deja de contarse como abierta, tanto en el plan de la persona como en los totales del span

#### Scenario: La reevaluación no alcanza
- **WHEN** la evaluación posterior sube el nivel pero sigue por debajo de lo que el rol pide
- **THEN** la brecha continúa abierta, con su tamaño actualizado
