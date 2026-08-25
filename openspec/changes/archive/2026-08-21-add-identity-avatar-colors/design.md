## Context

`Avatar` (`tuip/packages/components/src/avatar.tsx`) rellena hoy con `bg-*-bold` + `text-neutral-inverse` y toma su color de `CategoricalColor`, el vocabulario de seis tonos que comparte con `Tag`. Los tres usos de la aplicación omiten `color`, así que todos caen en el gris por defecto.

La paleta (`tuip/packages/tokens/src/primitives.ts`) tiene siete familias y **todas son semánticas**: brand, neutral, danger, warning, success, info, discovery. No existe ningún vocabulario de color sin significado, y `CategoricalColor` no lo es tampoco: mapea uno a uno contra esas mismas familias semánticas.

El design system prohíbe hoy, de forma explícita y en tres lugares, exactamente lo que este change quiere hacer:
- el JSDoc de `AvatarProps.color`: *"Always an explicit choice by the consumer — never derived from the name or any other variable data about the person."*
- un par do/dont de la documentación: *"dont: Calcular el color a partir del nombre, el id, o cualquier otro dato de la persona."*
- una nota de la anatomía, que repite lo mismo.

Ver proposal.md - Why para la motivación.

## Goals / Non-Goals

**Goals:**
- Que el avatar sirva para reconocer a una persona de un vistazo en una tabla larga.
- Que el color sea estable de verdad: la misma persona, el mismo color, en cualquier pantalla, entre sesiones, y aunque cambien sus datos.
- Sumar los colores sin ensuciar el vocabulario semántico existente.

**Non-Goals:**
- No se replican los ~28 colores de la paleta de personas de Fluent. Se toma un subconjunto de ~12 bien separados en tono: alcanza para que las repeticiones sean raras en equipos de decenas de personas, y evita cuadruplicar la paleta para alimentar un solo componente.
- No se conserva el relleno sólido como variante. Queda un único tratamiento; mantener dos obliga a documentar y sostener ambos sin que nadie haya pedido el viejo.
- No se toca `Tag` ni ningún otro consumidor de `CategoricalColor`. El vocabulario de identidad es nuevo y separado, no un reemplazo.

## Decisions

- **La regla que prohíbe derivar el color se reescribe, no se elimina.** El motivo declarado en la documentación es *"el color nunca varía sólo porque cambia el nombre"* — es decir, el riesgo real que describe es derivarlo de datos **mutables**. Anclar el color a un identificador inmutable satisface esa preocupación en vez de ignorarla. La regla pasa entonces a exigir un identificador estable y a seguir prohibiendo derivarlo del nombre o de cualquier dato editable. Alternativa considerada: dejar la regla como está y que cada consumidor calcule el color y lo pase por `color`. Se descarta porque mueve el reparto a la capa de feature, donde cada pantalla podría implementarlo distinto y la misma persona terminaría de dos colores según dónde se la mire — que es justo lo que el requisito prohíbe.
- **El vocabulario de identidad es un tipo aparte de `CategoricalColor`, no una extensión suya.** Son cosas distintas: `CategoricalColor` distingue *categorías* dentro de un set conocido y sus seis tonos mapean a familias semánticas; el de identidad distingue *individuos* y sus colores no significan nada. Fusionarlos haría que `Tag` pudiera pedir "cranberry" y que `Avatar` pudiera pedir "danger", dos cosas que no queremos.
- **El reparto vive en el componente, alimentado por un identificador que pasa el consumidor.** `Avatar` recibe el identificador y aplica una función determinista de identificador a color. Que la función esté en un solo lugar es lo que garantiza el escenario "un mismo color en las dos vistas": listado y resumen no pueden divergir porque no calculan nada.
- **El identificador es el `id` de la persona, no su nombre ni su UPN.** Es el único de los tres que no cambia: el nombre puede corregirse y el UPN puede cambiar si la persona cambia de apellido o de dominio. Anclarlo al `id` es lo que hace cierto el escenario "el color no cambia".
- **Los valores exactos se toman de la fuente de Fluent UI al implementar, no de memoria.** Los nombres de la paleta de personas son conocidos, pero los hexadecimales no se van a inventar ni aproximar: un color "parecido al de Teams" pero incorrecto es peor que uno propio, porque promete una correspondencia que no cumple. Si la fuente no resulta accesible al implementar, corresponde volver a preguntar antes que adivinar.

## Risks / Trade-offs

- [**Dependencia de orden con `add-people-name-link-and-email`**, que sigue activo y también modifica "Listar personas". Si un delta se escribe contra el spec principal actual y el otro se archiva primero, el segundo pisa lo del primero] → Mitigado: el delta de este change ya incluye el texto del correo y del enlace de aquel change, además de lo suyo. Así el resultado es el mismo se archive en el orden que se archive, y ninguno de los dos pierde contenido. Si aquel change se modifica antes de archivarse, hay que revisar este delta otra vez.
- [Con ~12 colores y un reparto por hash, dos personas visibles en la misma pantalla pueden coincidir de color] → Aceptado y reflejado en el escenario, que dice que dos personas *tienden* a recibir colores distintos, no que se garantice. El color acompaña a las iniciales y al nombre, nunca es el único identificador, así que una coincidencia molesta pero no confunde. Garantizar unicidad exigiría repartir según el contenido de la página, y entonces el color de una persona cambiaría al cambiar de página o de filtro — rompiendo el requisito más importante de los dos.
- [Cambiar el relleno sólido por el tenue baja el contraste entre las iniciales y su fondo] → Hay que verificar el par fondo/texto de cada uno de los ~12 colores contra el mínimo de contraste para texto pequeño, en tema claro y oscuro, en vez de confiar en que los valores de Fluent ya cumplen en este contexto. Es una tarea explícita, no un supuesto.
- [`AvatarGroup` superpone los círculos con un anillo `bg-neutral-default`; con fondos tenues el anillo separa menos que contra los sólidos] → Se revisa en el recorrido manual, junto al resto del cambio visual.
