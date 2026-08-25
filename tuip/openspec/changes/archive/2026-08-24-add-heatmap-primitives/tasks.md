## 1. Escala de atención

- [x] 1.1 Definir la escala en tokens: tres pasos de relleno derivados de los roles de estado, con el paso alto resolviendo al mismo valor que el relleno de peligro, bajo su propio prefijo y en los dos temas.
- [x] 1.2 Exponerla en el preset de Tailwind como utilidades de fondo, con los nombres del vocabulario.
- [x] 1.3 Ampliar la verificación de contraste a los pasos nuevos, midiéndolos contra **todas** las superficies del sistema sobre las que pueden apoyarse, y dejar el valor medido registrado.
- [x] 1.4 Pruebas: los tres pasos existen, están ordenados y no se repiten; el alto resuelve al relleno de peligro donde el tema lo permite y sale de esa familia donde no; y el piso de contraste rechaza el valor que la escala descartó.

## 2. LevelMeter con marca de umbral

- [x] 2.1 Agregar la posición esperada opcional y dibujar la marca en el **límite** de ese paso, sin mover ni reducir los segmentos y sin salirse del ancho del componente.
- [x] 2.2 Anunciar la posición esperada a tecnologías de asistencia junto con la alcanzada.
- [x] 2.3 Pruebas: con umbral aparece la marca en el límite correcto; sin umbral el componente se dibuja exactamente como antes; el reparto de los segmentos no cambia en ninguno de los dos casos.

## 3. Popover: ancla y relleno

- [x] 3.1 Exponer `PopoverAnchor` como parte atómica, con el mismo criterio que las demás partes atómicas del catálogo, en sus dos formas: envolviendo al elemento o por referencia a uno que el consumidor ya tiene.
- [x] 3.2 Volver reemplazable el relleno del contenido, conservando el valor por defecto para quien no lo declare.
- [x] 3.3 Pruebas: un Popover controlado con ancla y sin disparador se abre junto al elemento anclado; el uso con disparador se comporta igual que antes; el contenido sin relleno conserva borde, radio y elevación.
- [x] 3.5 Acotar la superficie al espacio disponible cuando el contenido es más alto que la pantalla, y desplazar adentro.
- [x] 3.4 Devolver el foco al elemento anclado al cerrar, que sin disparador propio Radix deja suelto en el documento; no hacerlo cuando el cierre vino de afuera ni cuando el consumidor declara su propio manejo.

## 4. Documentación

- [x] 4.1 Documentar la escala de atención con su frontera dicha explícitamente: cuándo usarla, y por qué no reemplaza al acento ni a un rol de estado; incluir que lo que no pide atención va en la familia neutra.
- [x] 4.2 Ejemplos en la referencia: `LevelMeter` con y sin umbral, y un Popover anclado a una celda de una cuadrícula.

## 5. Publicación

- [x] 5.1 Changeset `minor` para tokens y componentes.
- [x] 5.2 Correr pruebas, lint y build del workspace; verificar que las clases nuevas quedan en el CSS construido.
- [x] 5.3 Empacar en `.local-packages` y **reinstalar en la app**; comprobar en el paquete instalado que la escala, el umbral y el ancla llegaron. Si se levanta el dev server para mirarlo, usar un puerto que no se haya usado antes en la sesión: con la misma versión y ruta, el navegador reusa el paquete anterior.
