## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La falta de encabezado en Líneas está especificada.** Su requisito dice `SHALL NOT repetir en el contenido de la página el título ni la categoría`, con su razón escrita. No es un olvido, y por eso el change lo revierte en vez de completarlo.
- **`skills-catalog` no dice nada del encabezado**, ni a favor ni en contra. La implementación tiene uno; el requisito simplemente no lo cubría.
- **Todas las acciones de las dos pantallas son `variant="subtle"`**, incluidas Archivar, Desactivar y Eliminar.
- **El drawer no tiene buscador**: `AssignPeopleDrawer` no importa `SearchField` ni nada equivalente, y lista trece personas en dos grupos.
- **Las casillas del drawer son `Checkbox` de tuip**, que se dibuja redondo. Se arregla en `square-the-checkbox`, no acá.
- **`expertise-lines` no está en `openspec/specs`**: vive sólo en `add-expertise-lines`, a una tarea de terminar. Es la única fuente, así que no hay unión que armar.

## Goals / Non-Goals

**Goals:**

- Que las dos pantallas de Admin se presenten como el resto del producto y como entre sí.
- Que lo irreversible se distinga de lo reversible antes de leer la palabra.
- Que elegir personas no dependa de recorrer una lista con la vista.

**Non-Goals:**

- La forma de las casillas, que se arregla en tuip.
- Repasar textos y espaciados más allá de lo enumerado.
- La estructura de dos paneles, que funciona.

## Decisions

- **La regla del título se revierte, y el requisito dice que fue a propósito.** Su argumento —que la navegación y el breadcrumb ya identifican la pantalla— es cierto sobre la identificación y no sobre lo demás: un encabezado también dice qué se hace acá y ofrece la acción principal. Sin él, la pantalla abre con un botón flotando sobre un vacío. Escribir *por qué* se revierte importa: sin esa frase, quien lo lea el año que viene va a pensar que la regla se perdió en una fusión.
- **La jerarquía se especifica como distinción, no como variante concreta.** El requisito dice que archivar y eliminar no compartan tratamiento con editar, no cuál usa cada uno. Un requisito que nombra `subtle` o `secondary` se rompe cuando el sistema de diseño renombre sus variantes, y lo que importa no es el nombre: es que se distingan.
- **El buscador reusa la mecánica del índice**, que ya busca por nombre o código en la misma pantalla. Inventar un patrón distinto para el mismo problema a diez centímetros de distancia es cómo una pantalla termina con dos formas de buscar.
- **Buscar no puede desmarcar.** Es el defecto clásico de un selector múltiple con filtro: la selección vive en la lista visible y filtrar la vacía. Está escrito como escenario porque es el que se rompe primero y el que nadie prueba.
- **La forma de las casillas queda fuera, y se declara.** Compensarlo acá —con un contador o un "seleccionar todos"— arreglaría este drawer y dejaría al resto de la aplicación con el mismo engaño. El drawer va a mostrar casillas redondas hasta que tuip se reinstale, y el buscador sirve igual mientras tanto.

## Risks / Trade-offs

- **[Revertir una decisión escrita]** → Alguien la tomó con un argumento. Lo que lo justifica es que el producto entero fue en la otra dirección: cinco de seis módulos tienen encabezado, y el que no lo tiene es el que se ve incompleto. Queda escrito el porqué para que la próxima reversión, si la hay, tenga con qué discutir.
- **[La jerarquía sin nombrar variantes deja margen]** → Dos implementaciones pueden cumplir el requisito y verse distintas entre sí. Es el precio de no atar la spec al sistema de diseño; lo que lo acota es que las dos pantallas se hacen juntas y contra los mismos módulos de referencia.
- **[El drawer sigue mostrando casillas redondas]** → Hasta que `square-the-checkbox` esté aplicado y tuip reinstalado, alguien puede seguir creyendo que elige una sola persona. El buscador no lo arregla; está declarado como dependencia y no disimulado.
- **[`expertise-lines` no está archivada]** → El delta parte de un change sin archivar. No hay unión que armar porque es la única fuente, pero si `add-expertise-lines` cambia antes de aplicarse esto, hay que revalidar.

## Migration Plan

1. El encabezado de Líneas y el de Habilidades declarado.
2. La jerarquía de acciones en las dos pantallas.
3. Los indicadores de una línea presentados como resumen.
4. El buscador del drawer, con la selección sobreviviendo al filtro.

Rollback: los cuatro pasos son de interfaz. Revertir el primero devuelve la regla anterior, que quedaría contradiciendo al resto del producto otra vez.

## Open Questions

- Si el buscador del drawer debería además filtrar por cargo, como el de Personas. Se puede responder al implementarlo sin cambiar el requisito, que exige búsqueda por nombre y no la limita.
