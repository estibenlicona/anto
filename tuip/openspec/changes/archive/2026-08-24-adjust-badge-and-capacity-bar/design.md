## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El punto de `Badge` está escrito en el requisito, no sólo en el código.** "SHALL mostrar un punto de color junto al texto en toda variante", con un escenario que dice "sin poder omitirlo". No es un descuido: fue una decisión, y este change la revisa en vez de saltearla.
- **`CapacityPart.tone` es obligatorio y de tipo `AccentTone`.** El comentario que lo acompaña razona que "las partes son pasos de un mismo todo, no estados" — cierto para lo que la barra mide, pero no para lo que las partes *son*.
- **`SegmentedBar` ya resolvió este problema.** Un segmento declara uno de cuatro vocabularios —`role`, `color`, `tone`, `heat`— con tipos que se excluyen entre sí, y expone `segmentFillClass` para que la leyenda pinte su punto con la misma clase que el tramo. `CapacityBar` dibuja su barra con `SegmentedBar`, así que ya tiene debajo lo que necesita.
- Las dos opciones nacen con el comportamiento actual como valor por defecto: ningún consumidor cambia sin pedirlo.

## Goals / Non-Goals

**Goals:**

- Que el punto de un badge sea una decisión de quien lo usa, y que el sistema diga cuándo corresponde cada opción.
- Que `CapacityBar` deje de forzar el vocabulario equivocado para categorías.

**Non-Goals:**

- Cambiar el aspecto de nada existente.
- Unificar `Badge` con `Tag`: son piezas distintas y el sistema ya dice por qué.
- Llevar los cuatro vocabularios de `SegmentedBar` a `CapacityBar`. Se agrega el categórico, que es el que falta; `role` y `heat` no tienen caso conocido acá y un vocabulario sin uso es vocabulario que se elige mal.

## Decisions

- **El punto se apaga con una opción propia, no con `className`.** `cn` en tuip concatena y no fusiona utilidades, así que una clase de afuera no puede quitar un elemento que el componente dibuja. Además el punto es una decisión de contenido —¿esto es un estado o una clasificación?— y no de estilo.
- **El valor por defecto es "con punto".** Lo contrario obligaría a revisar cada badge del catálogo y de las apps para no cambiarles el aspecto, y convertiría una opción nueva en una migración. Con el punto puesto por defecto, este change no cambia una sola pantalla.
- **El requisito pasa a decir el criterio, no la prohibición.** "Estado sí, clasificación no" es lo que hace que la próxima persona elija bien; "el punto es obligatorio" sólo hacía que quien tenía un caso distinto no tuviera salida. Es la parte del change que sobrevive al código.
- **`CapacityPart` declara uno de los dos vocabularios y no los dos.** Con los tipos excluyéndose entre sí, como en `SegmentedBarSegment`: una parte con `tone` y `color` a la vez no tiene un significado obvio, y dejarlo pasar es dejar que la ambigüedad llegue a la pantalla.
- **La leyenda toma su color de la misma fuente que el tramo.** `SegmentedBar` ya expone `segmentFillClass` justamente para eso; `CapacityBar` la usa en vez de mapear el color otra vez por su cuenta. Es lo que garantiza que el punto de la leyenda y su tramo no puedan desincronizarse.

## Risks / Trade-offs

- **[Un badge sin punto se parece más a un `Tag`]** → Se distinguen igual por forma: el badge es cuadrado y el tag es de píldora, que es la distinción que el sistema ya documenta. La documentación de las dos piezas dice cuál usar.
- **[Dos vocabularios en `CapacityBar` es una decisión más para quien la usa]** → Es la misma decisión que `SegmentedBar` ya pide, con el mismo criterio y la misma redacción. Una pieza que envuelve a otra y le esconde una decisión que sí importa no simplifica: elige por vos, y a veces mal — que es exactamente lo que pasó.
- **[Quitar el punto puede tentarse "porque se ve más limpio"]** → El requisito ata la opción a un criterio, no al gusto, y la documentación lo repite donde se lo va a leer.

## Migration Plan

1. `Badge`: la opción y su valor por defecto.
2. `CapacityBar`: el vocabulario categórico en las partes, con la leyenda tomando el color de la misma fuente.
3. Documentación de las dos, con el criterio de elección.
4. Changeset, build, empaquetado y reinstalación en la app.

Rollback: las dos son opciones aditivas con el comportamiento actual por defecto; revertir no deja a ningún consumidor sin nada que ya tuviera.
