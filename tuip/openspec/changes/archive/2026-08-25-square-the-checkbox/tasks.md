## 1. La forma

- [x] 1.1 Que el Checkbox se dibuje cuadrado, con un redondeo propio que a 16 px se lea como esquina y no como circunferencia. Hoy toma `rounded-control` (8 px), que sobre una caja de 16 px es exactamente media cara.
- [x] 1.2 No tocar el valor de `control`: es correcto para botones y campos de 32 px o más, y bajarlo achataría el redondeo de todo el catálogo para arreglar un caso chico.
- [x] 1.3 Comprobar los tres estados —marcado, desmarcado e indeterminado— y el deshabilitado, que comparten la misma caja.

## 2. La prueba que faltaba

- [x] 2.1 Comparar Checkbox y RadioGroup **sin marcar**. Es el caso que falla hoy y el que nadie miraba: marcados se distinguen por el tilde contra el punto, y por eso el defecto sobrevivió.
- [x] 2.2 Que la prueba afirme que las formas **difieren**, no cuál es cada una. Atarla a un valor concreto la rompe con el próximo ajuste; atarla a la diferencia la hace fallar exactamente cuando vuelven a coincidir, que es lo que importa.

## 3. Cierre

- [x] 3.1 Build del paquete y suite de tuip sin regresiones, con las verificaciones corriendo.

## 4. Verificación

- [x] 4.1 Publicar y reinstalar en la aplicación. Si `version-every-local-pack` todavía no está aplicado, hace falta un puerto no usado en la sesión para que Vite suelte el `?v=` viejo.
- [x] 4.2 En Líneas de expertise, abrir **Asignar personas**: las trece casillas tienen que leerse como cuadradas, es decir, como que se puede elegir más de una.
- [x] 4.3 Mirar una casilla y un radio juntos en el catálogo de documentación y comprobar que se distinguen sin seleccionarlos.
