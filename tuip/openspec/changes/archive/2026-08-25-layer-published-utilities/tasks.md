## 1. La subcapa

- [x] 1.1 En `scripts/build-css.ts`, envolver el cuerpo de `@layer utilities` que devuelve la CLI en una subcapa anidada `@layer tuya-ui`, antes de concatenar tokens y base.
- [x] 1.2 Fallar el build si la salida de Tailwind no trae exactamente un bloque `@layer utilities` que se pueda envolver: publicar una hoja a medias reintroduce el defecto sin que se note.
- [x] 1.3 Dejar escrito en el archivo por qué va anidada y no en una capa de nivel superior (por debajo de `base`, el reset universal del consumidor anula las utilidades que sólo publica el paquete).

## 2. La comprobación

- [x] 2.1 Agregar a `scripts/verify-stylesheet.ts` una comprobación sobre `dist/styles.css`: todas las utilidades publicadas dentro de `@layer utilities { @layer tuya-ui { … } }`, sin reglas sueltas fuera de la subcapa.
- [x] 2.2 Comprobar que falla si se quita la subcapa, y que pasa con ella puesta.

## 3. Cierre en el paquete

- [x] 3.1 `pnpm test` en `packages/components`: tipos, las cuatro comprobaciones anteriores y la suite.
- [x] 3.2 Revisar la documentación (`apps/docs`) con la hoja nueva: es el otro consumidor, y sirve para ver si algo dependía del orden viejo.

## 4. Verificación en la aplicación

- [x] 4.1 `publish:local` y reinstalar en `frontend`.
- [x] 4.2 Caso testigo: en Líneas de expertise, el bloque de capacidad de `LineCapacity.tsx` (`grid-cols-2 sm:grid-cols-4`) tiene que mostrar **cuatro** columnas por encima de `sm`. Hoy muestra dos.
- [x] 4.3 Comprobar el par que motivó el hallazgo: un elemento con `w-full lg:w-80` mide 20rem por encima de `lg`.
- [x] 4.4 Recorrer las pantallas que combinan utilidades propias con componentes del catálogo —Competencias, Células, Personas, Torre de control— buscando lo que hubiera dependido del orden viejo.

## 5. Lo que queda del lado de la aplicación

- [x] 5.1 Anotar para la aplicación (no se hace acá): quitar el rodeo `max-lg:w-full lg:w-80` de `SpanMatrixContainer.tsx`, que existe sólo para esquivar este defecto, y volver a `w-full lg:w-80`.
