## 1. La versión cambia al empacar

- [x] 1.1 Incrementar la versión de `@tuya-ui/components` desde `0.1.0`, que es la que hoy comparten el paquete instalado y el fuente y por eso no distingue dos contenidos.
- [x] 1.2 Que el paso que arma el tarball local incremente la versión, de modo que el archivo de `.local-packages` lleve un nombre distinto en cada empaquetado.
- [x] 1.3 Impedir que se distribuya contenido nuevo bajo una versión ya distribuida. Una convención que depende de acordarse falla el día en que importa, y acá el costo de que falle es un consumidor que sirve una copia vieja sin enterarse.

## 2. La verificación

- [x] 2.1 Que la comprobación viva en el empaquetado y lo detenga, como ya hacen la verificación de colores y la de la hoja de estilos. En este repositorio el modo de fallar habitual es el silencio, y una comprobación que sólo avisa se ignora.
- [x] 2.2 Pruebas: empacar dos veces sin cambiar la versión falla; empacar tras incrementarla produce un tarball con nombre nuevo.

## 3. Cierre

- [x] 3.1 Build del paquete y suite de tuip sin regresiones, con las verificaciones corriendo.

## 4. Verificación

- [x] 4.1 Empacar, actualizar la dependencia de la aplicación a la ruta nueva y reinstalar.
- [x] 4.2 **Sin borrar `node_modules/.vite` y en un puerto ya usado**, abrir Plan de carrera y comprobar que carga. Es la prueba de que el problema quedó cerrado: si sólo funciona con la caché limpia o con un puerto nuevo, el change no logró nada.
- [x] 4.3 Comprobar que la ruta del tarball en la dependencia de la aplicación coincide con la versión nueva, que es lo que fuerza la reoptimización.
