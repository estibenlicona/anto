## Purpose

Cómo habla el producto: el registro, la persona gramatical y el tono de todo texto que un usuario lee en la interfaz. Es transversal porque ninguna pantalla es dueña de la voz del producto, y estar escrito es lo que evita que cada pantalla nueva invente la suya.

## ADDED Requirements

### Requirement: Registro neutro en el texto de la interfaz
Todo texto que el usuario lee —rótulos, mensajes, confirmaciones, ayudas, estados vacíos y botones— SHALL usar un español neutro, sin formas verbales ni pronombres propios de una variedad regional. En particular NO SHALL usarse el voseo rioplatense ("querés", "podés", "marcá", "elegí", "vos") ni ninguna otra forma que ate el producto a una región.

El texto SHALL tratar al usuario de forma consistente en toda la aplicación: una misma acción no SHALL redactarse de dos maneras distintas según la pantalla. Dos pantallas que hacen lo mismo —confirmar que se va a borrar algo, por ejemplo— SHALL compartir la redacción, porque la diferencia se lee como si significaran cosas distintas.

Cuando una acción es destructiva o irreversible, el texto SHALL decir qué va a pasar antes de que ocurra, y NO SHALL depender de que el usuario deduzca las consecuencias del nombre del botón.

#### Scenario: Sin formas regionales
- **WHEN** se revisa cualquier texto de la interfaz
- **THEN** no aparecen formas verbales ni pronombres del voseo, ni de ninguna otra variedad regional

#### Scenario: La misma acción se dice igual en todas partes
- **WHEN** dos pantallas confirman una acción equivalente, como eliminar un elemento
- **THEN** las dos usan la misma redacción, y no dos maneras distintas de decir lo mismo

#### Scenario: Una acción irreversible lo dice
- **WHEN** el usuario está por confirmar algo que no se puede deshacer
- **THEN** el texto se lo dice antes de que ocurra, en vez de dejarlo deducir del nombre del botón
