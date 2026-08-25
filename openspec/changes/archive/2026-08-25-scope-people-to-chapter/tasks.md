## 1. El dato

- [x] 1.1 Definir en los mocks un catálogo de chapters con su lead, y asignar un chapter a cada persona: `chapterId` deja de ser `null`. Sembrar **más de un chapter**, porque con uno solo la regla no se puede probar — es lo que dejó pasar el problema hasta ahora.
- [x] 1.2 Atar la sesión del Chapter Lead a un lead concreto del dato: hoy el simulador entra como alguien que no existe en las semillas, y sin eso no hay a quién resolverle la responsabilidad.
- [x] 1.3 Pruebas: cada persona tiene chapter, cada chapter tiene lead, y hay al menos dos chapters con personas.

## 2. El acotado, en el servidor

- [x] 2.1 Que los endpoints de los mocks que devuelven personas —o cifras derivadas de personas— acoten por el titular del token: personas, span, equipos de célula, ocupación, ausencias y asignaciones.
- [x] 2.2 Comprobar que la interfaz **no** filtra por su cuenta en ninguna pantalla. Si aparece un filtro por responsabilidad en el cliente, sacarlo: el requisito lo prohíbe explícitamente y no es una omisión.
- [x] 2.3 Pruebas: con dos chapters poblados, cada endpoint devuelve sólo lo del lead de la sesión; cambiar de lead cambia el conjunto; un lead sin personas recibe una lista vacía y no un error.

## 3. Una sola relación de responsabilidad

- [x] 3.1 Que el Chapter Lead que la ficha de una persona muestra salga de su chapter y no del líder de su línea de expertise. Es el punto más fácil de pasar por alto del change: hoy funciona y seguiría funcionando, mostrando un nombre equivocado.
- [x] 3.2 Pruebas: el lead que la ficha muestra es el mismo que ve a esa persona en su listado.

## 4. Los totales

- [x] 4.1 Revisar **uno por uno** los totales, promedios y porcentajes que la interfaz presenta como "del chapter", y decidir para cada uno si pasa a acotarse o si de verdad es del sistema. Una capacidad objetivo o un catálogo de stacks pueden no cambiar; "18 personas activas" y "39% del chapter" sí.
- [x] 4.2 Dejar anotado el resultado de esa revisión: cuáles se acotaron y cuáles no, con el motivo. Es lo que evita que la próxima persona vuelva a preguntárselo.
- [x] 4.3 Pruebas de los que cambian: con dos chapters, la cifra corresponde al del lead de la sesión.

## 5. Cierre

- [x] 5.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido (`App.test.tsx` y `httpClient.test.ts` fallan de antes y no cuentan). Muchas pruebas afirman cifras sobre las dieciocho personas: las que cambien de conjunto hay que actualizarlas con criterio, no bajando el número hasta que pasen.

## 6. Verificación

- [x] 6.1 Con `pnpm dev:auth` y un puerto que no se haya usado antes en la sesión: recorrer las seis pantallas con dos chapters poblados y comprobar que ninguna muestra personas ajenas — listado, span, equipos de célula, ocupación, ausencias y asignaciones.
- [x] 6.2 Cambiar el lead de la sesión y comprobar que el conjunto cambia entero, incluidos los totales.
- [x] 6.3 Abrir la ficha de una persona y comprobar que el Chapter Lead que muestra es el que la ve en su listado.
