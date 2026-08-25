## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La dependencia lleva la versión en la ruta**: `file:../tuip/.local-packages/tuya-ui-components-0.1.0.tgz`. Cambiar la versión cambia el nombre del archivo y, con él, la especificación que la aplicación declara.
- **Instalada y fuente son ambas `0.1.0`.** No es que estén desincronizadas: es que la versión nunca se movió, así que no puede distinguir dos contenidos.
- **Vite deriva el hash de su caché** (`?v=…`) de la ruta resuelta y la versión del paquete. Con las dos iguales, no reoptimiza — y hace bien, dada la información que tiene.
- `component-library-publishing` no tiene deltas pendientes.

## Goals / Non-Goals

**Goals:**

- Que un cambio de contenido siempre venga con un cambio de identidad.
- Que el modo de fallar deje de ser silencioso: hoy el síntoma acusa al componente equivocado.

**Non-Goals:**

- Tocar la caché de Vite, que es de la aplicación.
- Automatizar la actualización de la dependencia en la aplicación; este change garantiza que la versión cambie, no que alguien la actualice.
- Elegir herramienta de versionado.

## Decisions

- **La versión se incrementa al empacar, no al publicar.** Publicar a un registro es un evento que hoy no ocurre; empacar local es el que la aplicación consume todos los días, y era el único camino sin la garantía. Poner la regla sólo en "publicar" es lo que dejó el hueco.
- **Reutilizar una versión se impide, no se desaconseja.** Una convención que depende de que alguien se acuerde falla exactamente el día en que importa. Y el costo de que falle es alto: el consumidor no ve un error de instalación, ve un componente que "no exporta" algo que sí exporta.
- **El incremento por defecto es `PATCH`.** La mayoría de los reempaquetados locales son correcciones; quien haga un cambio de API o agregue un componente sube el escalón que corresponde, que ya está escrito en el requisito.
- **La verificación va en el empaquetado, no en una revisión.** Es el mismo criterio que el resto del paquete ya usa —la verificación de la hoja de estilos y la de colores fallan el build— y por el mismo motivo: en este repositorio el modo de fallar habitual es el silencio.

## Risks / Trade-offs

- **[La aplicación tiene que actualizar su dependencia con cada versión]** → Es el costo directo de la decisión: la ruta lleva la versión. Es también lo que hace visible que el paquete cambió, que es justamente lo que faltaba. Si esa fricción molesta, la salida no es volver a la versión fija: es que la aplicación deje de instalar por ruta con versión.
- **[Números de versión que suben rápido]** → Un tarball local por cada iteración hace crecer el `PATCH` sin que eso signifique nada para nadie fuera del repositorio. Es ruido barato comparado con una caché que miente.
- **[No arregla una caché ya envenenada]** → Quien tenga hoy el pre-bundle viejo lo va a seguir teniendo hasta que lo borre o use un puerto nuevo. El change impide que vuelva a ocurrir, no repara el estado actual, y eso queda dicho en el Impact.

## Migration Plan

1. Incrementar la versión del paquete.
2. Que el paso de empaquetado local incremente y verifique: sin incremento, no hay tarball.
3. Empacar y actualizar la dependencia de la aplicación a la ruta nueva.
4. Comprobar en la aplicación, con la caché vieja todavía presente, que el export llega sin borrar nada a mano — que es la prueba de que el problema quedó cerrado.

Rollback: volver la versión y el paso de empaquetado. Ningún consumidor cambia código.

## Open Questions

- Si conviene que el incremento sea automático o pedido explícitamente al empacar. Se puede responder al implementarlo sin cambiar el requisito, que exige que la versión cambie, no quién la escribe.
