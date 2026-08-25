## Context

Cómo se arma hoy la hoja publicada (`scripts/build-css.ts`): se compilan las utilidades con la CLI de Tailwind a partir del código del paquete y se concatenan `tokens.css` + utilidades + `src/base.css` en `dist/styles.css`. La salida de Tailwind trae sus utilidades dentro de `@layer utilities`, y declara arriba el orden `properties, theme, base, components, utilities`.

Cómo la consume la aplicación (`frontend/src/styles/styles.css`): `@import "tailwindcss"` primero, `@import "@tuya-ui/components/styles.css"` después. Las dos hojas terminan escribiendo en `@layer utilities`; la del paquete queda al final.

Dos hechos medidos en el navegador, sobre la aplicación real:

- `w-full lg:w-80` a 1920 px mide 1912 px. Sólo `lg:w-80` mide 320 px. La base publicada le gana a la variante del consumidor.
- `grid grid-cols-2 sm:grid-cols-4` a 1920 px resuelve a dos columnas de 442 px; sin la clase base, a cuatro de 213 px. Es `LineCapacity.tsx`, en producción.

Restricción que aparece al intentar arreglarlo, y que ya costó una vuelta: bajar las utilidades del paquete a una capa de nivel superior declarada **antes** de `utilities` las deja también por debajo de `base`, donde la aplicación tiene su reset universal (`* { margin: 0; padding: 0 }`, en `frontend/src/styles/styles.css`). Comprobado: con ese arreglo, un `p-4` que el paquete publica y la aplicación no compila queda en `0px`.

## Goals / Non-Goals

**Goals:**

- Que la variante del consumidor le gane a la utilidad base del paquete, en cualquier familia.
- Que el consumidor no tenga que declarar capas, ordenar importaciones ni escribir `!important`.
- Que las utilidades publicadas sigan ganándole a la base y a los componentes.
- Que perder esta condición vuelva a ser detectable antes de publicar.

**Non-Goals:**

- Dejar de publicar utilidades, o cambiar cuáles se publican.
- Arreglar los usos ya escritos en la aplicación.
- Tocar el orden de importación del consumidor.

## Decisions

### 1. Una subcapa dentro de `@layer utilities`, no una capa aparte

Las utilidades publicadas se emiten envueltas en una subcapa nombrada, anidada dentro de la capa que Tailwind ya usa:

```css
@layer utilities {
  @layer tuya-ui {
    /* utilidades publicadas */
  }
}
```

Lo que lo hace funcionar es la regla de las capas anidadas: **dentro de una capa, lo que no está en una subcapa se comporta como una última subcapa implícita**, y por lo tanto gana. Las utilidades del consumidor llegan sueltas dentro de `utilities`, así que pasan a mandar sobre todo lo que venga de `tuya-ui` sin que el consumidor declare nada.

- **Anidada y no de nivel superior**: una capa propia (`@layer tuya-ui, utilities`) tendría que declararse antes de `utilities` para perder contra el consumidor, y con eso quedaría también antes de `base`. Ahí el reset universal de la aplicación le gana a cualquier utilidad que sólo publique el paquete. Medido: `p-4` → `0px`, `mt-2` → `0px`. Anidada, las utilidades siguen por encima de `base` y de `components`.
- **Sin tocar al consumidor**: no hace falta que declare `@layer` ni que reordene sus importaciones. Es la diferencia entre un arreglo que sostiene el paquete y una regla que cada aplicación tiene que recordar.

**Alternativa descartada — pedirle al consumidor que importe la hoja del paquete antes de `tailwindcss`.** Arregla el caso, pero traslada la condición a cada consumidor y a cada archivo de estilos nuevo; nada la vigila del lado del paquete, y el síntoma cuando se pierde vuelve a ser una pantalla desacomodada sin error.

**Alternativa descartada — dejar de publicar utilidades y que el consumidor las genere escaneando el paquete.** Elimina la duplicación de raíz y es probablemente el destino correcto, pero obliga a cada consumidor a configurar el escaneo de `node_modules`, deja fuera a quien no use Tailwind y cambia el contrato del paquete. Es un cambio de modelo, no el arreglo de este defecto.

### 2. La transformación vive en `build-css.ts` y falla ruidosamente

`build-css.ts` envuelve el cuerpo de `@layer utilities` que produce la CLI. La operación es textual, así que se blinda: si la salida de Tailwind no trae exactamente un bloque `@layer utilities`, el build **falla** en vez de publicar una hoja a medias. Una hoja mal envuelta no se distingue a simple vista de una bien envuelta, y el defecto que causaría es justo el que este change viene a cerrar.

### 3. La comprobación vigila la hoja publicada, no la intención

`verify-stylesheet.ts` gana una comprobación más, con la misma forma que las otras tres: leer `dist/styles.css` y exigir que **todas** las utilidades estén dentro de `@layer utilities { @layer tuya-ui { … } }`, sin nada suelto fuera de la subcapa. Una sola regla que quede afuera vuelve a ganarle al consumidor, y es exactamente la clase de pérdida silenciosa que ya pasó dos veces en este paquete —el `translate` de la migración y el cursor de Preflight—.

La comprobación tiene que saber fallar: se prueba quitando la subcapa y viendo que rechaza.

## Risks / Trade-offs

- **Cambia quién gana en los consumidores actuales.** Alguna pantalla puede depender hoy, sin saberlo, de que la utilidad del paquete pisara la suya. El efecto es acotado —sólo aplica donde el consumidor escribió una clase de la misma familia— pero conviene recorrer las pantallas que combinan utilidades propias con componentes del catálogo.
- **La subcapa es una convención que el consumidor no ve.** Si alguien declara `@layer tuya-ui` en su propia hoja con otro sentido, el orden se altera. El nombre es lo bastante propio como para que no ocurra por accidente.
- **Envolver texto de la salida de un compilador es frágil por naturaleza.** Se acota exigiendo la forma esperada y fallando si cambia, en vez de intentar adivinarla.
- **No resuelve la duplicación**, que sigue ahí: dos hojas siguen definiendo las mismas clases. Lo que resuelve es cuál gana. La comprobación 2 sigue siendo la que vigila que digan lo mismo.
