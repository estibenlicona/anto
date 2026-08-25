## Why

Las utilidades que publica el paquete le ganan a las que escribe la aplicación, y eso rompe pantallas en silencio.

El mecanismo está verificado, no supuesto:

- La aplicación importa primero `tailwindcss` y después `@tuya-ui/components/styles.css` (`frontend/src/styles/styles.css`).
- Las dos hojas escriben sus utilidades en **la misma capa**, `@layer utilities`.
- Entre utilidades la especificidad siempre empata (0,1,0), así que dentro de una capa manda el orden de aparición. Lo del paquete aparece después: le gana a todo lo de la aplicación.

Dentro de **una** hoja, Tailwind ordena las variantes después de las utilidades base, y por eso `w-full lg:w-80` funciona. Concatenando dos hojas ese orden se pierde: la variante de la aplicación queda antes que la base del paquete y deja de aplicarse.

**Hay al menos una pantalla rota hoy.** En `LineCapacity.tsx` el bloque de capacidad declara `grid grid-cols-2 gap-4 sm:grid-cols-4`. Medido en el navegador a 1920 px de ancho: el elemento resuelve a **dos** columnas de 442 px. Sin la clase base, `sm:grid-cols-4` sí da cuatro columnas de 213 px. El bloque se queda en dos columnas en todos los tamaños, y nadie lo notó porque no hay error en ninguna parte.

No es un caso aislado sino una familia: cualquier par (utilidad base que el paquete publica, variante responsive que escribe la aplicación) sobre la misma propiedad. `flex-col` contra `md:flex-row`, `p-4` contra `lg:p-8`. En la aplicación de gestión de capacidad, 17 de sus 21 clases con variante pertenecen a familias que el paquete también publica: hoy chocan dos, mañana cualquiera.

Es de la misma familia que la comprobación 2 de `verify-stylesheet.ts` —"las dos hojas se componen"—, pero aquélla vigila la **misma** clase definida dos veces con propiedades distintas. Ésta es otra: clases **distintas** que compiten por la misma propiedad, y ninguna comprobación la mira.

## What Changes

- **Las utilidades publicadas dejan de ganarle a las del consumidor.** El paquete las emite en una subcapa propia dentro de `@layer utilities`, de modo que lo que el consumidor escribe —que llega suelto en esa capa— mande sobre lo que el paquete trae, sin que el consumidor tenga que declarar ni ordenar nada.
- **Se vigila.** Una comprobación más en `verify-stylesheet.ts`: si las utilidades publicadas vuelven a quedar fuera de esa subcapa, la suite falla. Hoy el defecto no lo detecta nada.
- **Se documenta la regla de importación** que el consumidor sí tiene que cumplir, si queda alguna.

### Fuera de alcance

- Arreglar los usos ya escritos en la aplicación (`LineCapacity.tsx`, y el `max-lg:w-full lg:w-80` que se escribió esquivando este defecto): se corrigen del lado de la aplicación cuando el paquete deje de imponer el orden.
- Cambiar qué utilidades publica el paquete, o dejar de publicarlas.
- La duplicación en sí: seguir publicando utilidades que el consumidor también compila es una decisión vigente, y la comprobación 2 ya la cubre.

## Capabilities

### Modified Capabilities

- `component-library`: la hoja publicada pasa a exigir que sus utilidades no le ganen a las del consumidor, y que esa condición se sostenga sola.

## Impact

- `packages/components/scripts/build-css.ts` — cómo se emite la hoja publicada.
- `packages/components/scripts/verify-stylesheet.ts` — la comprobación que lo vigila.
- Consumidores: la aplicación de gestión de capacidad y `apps/docs`, al reinstalar el paquete empacado. El efecto esperado es que dejen de ganar utilidades del paquete que hoy ganan — conviene mirar las pantallas que dependían de ese orden sin saberlo.
- Verificación: `LineCapacity.tsx` en Líneas de expertise es el caso testigo — cuatro columnas a partir de `sm`.
