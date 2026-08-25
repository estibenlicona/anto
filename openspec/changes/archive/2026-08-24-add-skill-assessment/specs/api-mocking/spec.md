## ADDED Requirements

### Requirement: Handler de mock para evaluaciones de habilidades
El sistema SHALL exponer un handler de mock con `GET` de la evaluación de una persona en un ciclo (devuelve la en curso, o la última cerrada cuando no hay ninguna en curso), `POST` para abrir una (400 si ya existe una en curso para esa persona y ciclo), `PUT` de una habilidad de la evaluación (nivel elegido, criterios marcados y nota; 400 si hay brecha y la nota viene vacía, o si el nivel no está en la escala) y `PUT` de cierre (400 si alguna habilidad activa quedó sin nivel).

El handler SHALL derivar, y NOT aceptar digitados: el nivel que pide el rol de la persona —del catálogo, contra la versión que corresponda—, la existencia y el tamaño de la brecha, y los criterios sin marcar del nivel exigido. Al cerrar SHALL estampar la versión vigente del catálogo, y a partir de ahí SHALL resolver esa evaluación contra esa versión aunque el catálogo cambie.

Los cambios SHALL persistir en memoria durante la sesión del mock, en Node y en navegador, con función de reinicio. Los datos de ejemplo SHALL incluir evaluaciones cerradas de varias personas con roles distintos —de modo que la misma habilidad tenga niveles esperados distintos entre ellas—, una evaluación en curso a medio recorrer, y al menos una persona sin evaluar.

El handler SHALL exponer un snapshot de sólo lectura de las evaluaciones cerradas, con nivel y brecha por persona y habilidad, para que la matriz del span y el plan individual lo consuman.

#### Scenario: Abrir y retomar
- **WHEN** se hace un `POST` para una persona sin evaluación en curso y luego un `GET`
- **THEN** el primero la crea en curso y el segundo la devuelve con lo guardado hasta el momento; un segundo `POST` responde 400

#### Scenario: Guardar una habilidad
- **WHEN** se hace un `PUT` de una habilidad con nivel y criterios marcados
- **THEN** responde la evaluación actualizada con la brecha derivada y los criterios sin marcar del nivel exigido; con brecha y sin nota responde 400

#### Scenario: Cerrar
- **WHEN** se hace un `PUT` de cierre con todas las habilidades activas evaluadas
- **THEN** la evaluación queda cerrada con la versión del catálogo estampada; con alguna habilidad sin nivel responde 400 indicando cuáles

#### Scenario: Una cerrada no se mueve
- **WHEN** el catálogo publica una versión nueva
- **THEN** el `GET` de una evaluación cerrada sigue devolviendo los criterios y niveles esperados de la versión con la que se cerró
