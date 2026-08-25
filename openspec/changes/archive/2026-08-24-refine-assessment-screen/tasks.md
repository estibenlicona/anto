## 1. Requisitos previos

- [x] 1.1 Confirmar que la app tiene instalado el tuip que ya trae `Modal`, `Badge` y `Button variant="secondary"`; este change no debe agregar nada al design system. Si aparece la necesidad de un componente o variante que no existe, parar y proponerlo en tuip antes de seguir.

## 2. Encabezado

- [x] 2.1 "Guardar y seguir después" pasa a la variante secundaria: borde visible, área clicable delimitada y distinta de la acción primaria, sin cambiar su texto ni su posición.
- [x] 2.2 Sacar el aviso permanente sobre lo que implica cerrar; su contenido se muda a la confirmación.
- [x] 2.3 Pruebas: el botón de guardar se distingue del primario y sigue disparando la misma acción; el aviso ya no está en la pantalla.

## 3. Confirmación al cerrar

- [x] 3.1 Pedir confirmación antes de cerrar, diciendo qué queda fijado, que se abre el plan de carrera y que no se deshace; con una salida que no cierra nada y que es también lo que ocurre al descartar el diálogo.
- [x] 3.2 Mantener la validación **antes** de mostrar la confirmación: si el borrador en pantalla no se puede guardar, el cierre no se ofrece y el motivo se dice como hoy.
- [x] 3.3 Pruebas: confirmar cierra y deja la evaluación en sólo lectura; desistir la deja en curso con los niveles y criterios intactos; con habilidades sin nivel el diálogo no llega a aparecer y el mensaje de lo que falta se conserva.

## 4. Estados en el índice

- [x] 4.1 "Evaluando" y "Pendiente" pasan a badge, con la variante que corresponde a cada uno; la habilidad ya evaluada conserva su ícono.
- [x] 4.2 Pruebas: los tres estados se distinguen entre sí; una evaluación recién abierta muestra todas las habilidades como pendientes menos la que está en curso; seleccionar otra habilidad mueve el estado "Evaluando" con ella.

## 5. Redacción del nivel exigido

- [x] 5.1 Reescribir la frase del nivel que pide el rol y su variante para cuando el rol no declara ninguno, conservando el nombre del rol tal como viene del dato.
- [x] 5.2 Pruebas: con nivel declarado y sin él, cada frase dice lo suyo y nombra el rol y el nivel que corresponden.

## 6. Cierre

- [x] 6.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido (`App.test.tsx` y `httpClient.test.ts` fallan de antes y no cuentan).

## 7. Verificación

- [x] 7.1 Con `pnpm dev:auth` y un puerto que no se haya usado antes en la sesión: abrir una evaluación en curso, comprobar que el botón de guardar se lee como botón, que el aviso ya no ocupa lugar fijo, que el diálogo aparece al cerrar y que desistir no cambia nada. Anotar si la columna de badges "Pendiente" al abrir resulta ruidosa —es el punto que el diseño dejó marcado para revisar en pantalla.
