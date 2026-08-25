## MODIFIED Requirements

### Requirement: Registro neutro en el texto de la interfaz
Todo texto que el usuario lee —rótulos, mensajes, confirmaciones, ayudas, estados vacíos y botones— SHALL usar un español neutro, sin formas verbales ni pronombres propios de una variedad regional. En particular NO SHALL usarse el voseo rioplatense ("querés", "podés", "marcá", "elegí", "vos") ni ninguna otra forma que ate el producto a una región.

El texto SHALL tratar al usuario de forma consistente en toda la aplicación: una misma acción no SHALL redactarse de dos maneras distintas según la pantalla. Dos pantallas que hacen lo mismo —confirmar que se va a borrar algo, por ejemplo— SHALL compartir la redacción, porque la diferencia se lee como si significaran cosas distintas.

Cuando una acción es destructiva o irreversible, el texto SHALL decir qué va a pasar antes de que ocurra, y NO SHALL depender de que el usuario deduzca las consecuencias del nombre del botón.

El cumplimiento SHALL verificarse de forma automática sobre el código, y la verificación SHALL reconocer la **forma** de las expresiones prohibidas en vez de enumerarlas una por una. Una lista de palabras deja fuera todo verbo que nadie pensó en escribir, y el hueco sólo se descubre leyendo la pantalla: en el barrido inicial se contaron 12 ocurrencias, el reemplazo encontró 56, una primera verificación encontró 24 más, y aun así quedaron tres sin detectar.

#### Scenario: Sin formas regionales
- **WHEN** se revisa cualquier texto de la interfaz
- **THEN** no aparecen formas verbales ni pronombres del voseo, ni de ninguna otra variedad regional

#### Scenario: La misma acción se dice igual en todas partes
- **WHEN** dos pantallas confirman una acción equivalente, como eliminar un elemento
- **THEN** las dos usan la misma redacción, y no dos maneras distintas de decir lo mismo

#### Scenario: Un verbo que nadie enumeró
- **WHEN** alguien agrega un texto con una forma del voseo que la verificación no tenía escrita como caso particular
- **THEN** la verificación la detecta igual, porque reconoce la forma y no una lista

#### Scenario: Una acción irreversible lo dice
- **WHEN** el usuario está por confirmar algo que no se puede deshacer
- **THEN** el texto se lo dice antes de que ocurra, en vez de dejarlo deducir del nombre del botón
