## Why

Las dos pantallas de Administración se contradicen entre sí y con el resto de la aplicación.

**Líneas de expertise no tiene encabezado.** Ni título ni descripción: la página abre con un espacio vacío y el botón "Nueva línea" flotando solo a la derecha. No es un descuido — su requisito lo prohíbe expresamente, razonando que la navegación lateral y el breadcrumb ya identifican la pantalla. Pero Habilidades sí lo tiene, y Células, Personas, Iniciativas y Facturación también. La regla se escribió para una pantalla y el resto del producto fue en la otra dirección: hoy es la única de seis sin encabezado, y quien la abre encuentra una acción sin contexto en vez de una pantalla que se presenta.

**En las dos pantallas, todas las acciones se ven iguales.** Editar, Archivar, Desactivar y Eliminar comparten el mismo tratamiento sutil. Lo que borra una habilidad se ve exactamente igual que lo que la edita, y la única diferencia entre ellas es la palabra. Es la clase de igualdad que se paga una sola vez y con algo que no se puede deshacer.

**Las cuatro cifras de una línea son una rejilla pelada**, sin las cards con las que todos los demás módulos presentan sus indicadores. Se leen como cuatro datos sueltos y no como el resumen que son.

Y el drawer de **Asignar personas** lista trece personas sin buscador: hay que recorrerlas con la vista y hacer scroll para encontrar a alguien. Con un chapter más grande deja de ser incómodo y pasa a ser inviable.

## What Changes

- **Líneas de expertise gana su encabezado** —título, descripción y la acción primaria—, como los otros cinco módulos. **Se revierte** la regla que lo prohibía: la escribimos para una pantalla y el producto entero fue para el otro lado.
- **Las acciones se jerarquizan en las dos pantallas.** Lo que destruye deja de verse igual que lo que edita.
- **Los cuatro indicadores de una línea pasan a presentarse como el resumen que son**, con el mismo tratamiento que los del resto de la aplicación.
- **El drawer de asignar personas gana un buscador**, con la misma mecánica que el índice de líneas ya tiene.

### Fuera de alcance

- **La forma de las casillas del drawer**, que se leen como radios porque el Checkbox del sistema de diseño se dibuja redondo. Se arregla donde nace, en `square-the-checkbox`; compensarlo acá dejaría al resto de la aplicación con el mismo engaño.
- Repasar textos y espaciados de las dos pantallas más allá de lo enumerado. Lo que entra son defectos verificables; lo demás es criterio y se decide viéndolo.
- La estructura de dos paneles de ambas pantallas, que funciona.

## Capabilities

### Modified Capabilities

- `expertise-lines`: la pantalla pasa a presentarse con encabezado propio, sus indicadores se presentan como resumen, sus acciones se jerarquizan y el drawer de asignar personas gana buscador.
- `skills-catalog`: la pantalla declara su encabezado y sus acciones se jerarquizan, con lo destructivo distinguible.

## Impact

- Frontend: `features/expertise-lines` (índice, detalle, capacidad y el drawer de asignar) y `features/skills` (encabezado y detalle).
- **Un requisito se revierte, no se completa**: el que prohíbe repetir el título en Líneas. Queda dicho por qué, para que quien lo lea después no crea que se olvidó.
- **Dependencia declarada**: el drawer va a seguir mostrando casillas redondas hasta que `square-the-checkbox` se aplique y tuip se reinstale. El buscador es útil igual; la forma es un arreglo aparte.
- **Orden**: `skills-catalog` está en `openspec/specs` y no tiene deltas pendientes. `expertise-lines` **no está en `openspec/specs`** — vive sólo en `add-expertise-lines`, que está a una tarea de terminar. El delta parte de ese texto, que es la única fuente.
