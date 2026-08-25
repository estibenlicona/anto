## 1. Los estados

- [x] 1.1 Que los tres estados de una iniciativa lleven variantes distintas: "En evaluación" pasa al rol que el sistema usa para lo que está en curso, "Activa" y "Cerrada" no cambian.
- [x] 1.2 Pruebas: los tres estados resuelven a variantes distintas entre sí, y ningún par comparte tratamiento. La comprobación va sobre el mapa, no sobre una fila: es lo que la hace válida para el listado y para la cabecera de la evaluación a la vez.

## 2. Los textos

- [x] 2.1 Reescribir los cuatro textos en español neutro y con la terminología del dominio:
  - el subtítulo del drawer, en sus **dos** variantes (alta y edición);
  - el estado vacío del listado, que dice lo mismo con otras palabras;
  - el pie del indicador de FTE demandado;
  - la descripción de la pantalla.
- [x] 2.2 Pruebas: actualizar las que afirmen esos textos, y comprobar que las dos variantes del drawer siguen diciendo lo mismo de una sola manera.

## 3. La verificación del registro

- [x] 3.1 Cambiar la verificación de una lista de formas a un reconocimiento de la **forma**, con una lista de excepciones para las palabras corrientes que terminan igual. Acotarla al texto de interfaz, no a todo el código.
- [x] 3.2 Dejar escrito junto a cada excepción por qué está: sin el motivo, la lista se vuelve un lugar donde esconder hallazgos incómodos.
- [x] 3.3 Pruebas: la verificación encuentra `Registrá`, que la versión anterior dejaba pasar; no marca las palabras corrientes de la lista de excepciones; y si crecen demasiado las excepciones, queda anotado para revisar el patrón.

## 4. Cierre

- [x] 4.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido (`App.test.tsx` y `httpClient.test.ts` fallan de antes y no cuentan).

## 5. Verificación

- [x] 5.1 Con `pnpm dev:auth` y un puerto que no se haya usado antes en la sesión: en `/app/lead/iniciativas`, comprobar que los tres estados se distinguen de un vistazo y que los cuatro textos dicen lo que deben. Anotar si el rol de información para "En evaluación" se lee como "en curso" o como un aviso.
