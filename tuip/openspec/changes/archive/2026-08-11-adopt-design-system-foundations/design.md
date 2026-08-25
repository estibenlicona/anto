## Context

Ver `proposal.md` — Why para la motivación, y `specs/` para el contrato de comportamiento.

Estado actual relevante para el enfoque:

- `packages/tokens` define los tokens en módulos TypeScript (`primitives.ts`, `semantic-colors.ts`, `typography.ts`, `tokens.ts`) y genera de ahí tanto `dist/tokens.css` como el preset de Tailwind. `cssVarName` y `flattenTokens` en `css-var-name.ts` son el único lugar donde se decide cómo se llama una variable CSS: hoy emiten `--tuya-<ruta>`.
- `scripts/verify-tokens.ts` ya corre como `test` del paquete y hace dos cosas: comprueba que el CSS generado esté en sincronía con los módulos, y verifica el contraste de una lista explícita de pares texto/fondo. Es la "verificación automática" que el spec de tokens exige.
- El CLI copia `assets/tokens.css` —una copia del CSS generado— al proyecto anfitrión durante `init`. Un proyecto ya inicializado tiene esa copia congelada, con los nombres de hoy.
- El sitio de documentación lee las escalas desde el paquete de tokens y las renderiza; no transcribe valores. Esa garantía se conserva y es lo que hace que las páginas de fundamentos se actualicen solas al cambiar los tokens.
- Los documentos de `design-system/` son HTML plano. El de iconografía **contiene los iconos dibujados**: ~88 elementos `<svg>` en retícula de 24×24 con trazo de 1.5. No son una descripción de los iconos, son los iconos.

## Goals / Non-Goals

**Goals:**

- Que el paquete de tokens exprese el sistema de Tuya y no el de otro, de modo que el requisito de identidad visual que el sitio ya declara pase a ser cierto.
- Que las páginas de fundamentos sigan derivando cada valor del paquete de tokens, incluidos los grupos nuevos, sin transcribir nada.
- Que la librería de iconos entre como código verificable y distribuible por el CLI, no como una carpeta de archivos sueltos.

**Non-Goals:**

- No se construye ningún componente nuevo. La definición documenta dieciocho; el repositorio tiene cuatro, y los catorce restantes son las fases siguientes.
- No se cambia el modelo de distribución. El CLI que copia código fuente es la forma de distribuir los componentes, y las recomendaciones Q3 y Q8 del documento —base headless y paquetes npm— quedan cerradas en ese sentido para este change.
- No se reintroduce el modo oscuro en el sitio de documentación. Los tokens oscuros se actualizan porque son parte del sistema; el sitio sigue en tema claro único.

## Decisions

### Dos vocabularios de nombre, uno por capa

Las primitivas conservan el prefijo `--tuya-` y nombran su familia y su paso (`--tuya-red-500`). Las semánticas pasan a `--color-[propiedad]-[rol]-[énfasis]-[estado]` (`--color-bg-brand-bold`). `cssVarName` y `flattenTokens` dejan de aplicar un prefijo único y pasan a recibirlo según la capa que estén emitiendo.

*Por qué:* es lo que hace el propio archivo de referencia del documento, y separa dos cosas que se consumen distinto. La primitiva es un inventario interno del sistema y le conviene un prefijo que la marque como propia; la semántica la escriben a diario quienes construyen interfaces, y `--color-bg-brand-bold` se lee en voz alta mientras que `--tuya-color-background-brand-bold` se copia y se pega.

*Alternativa considerada:* conservar `--tuya-` en ambas capas para evitar cualquier colisión con CSS del proyecto anfitrión. Se descarta porque el documento fija la nomenclatura como parte del sistema y fue la opción elegida explícitamente; el riesgo de colisión se anota abajo.

*Consecuencia:* `background` pasa a `bg` en el nombre de la variable. El objeto TypeScript puede seguir llamándose `background` para que el sitio y los componentes lo lean con esa palabra; la abreviatura vive en la emisión, no en el modelo.

### La escala tipográfica de siete estilos reemplaza la de encabezados, con un mapa de traducción explícito

Se retira `heading.xxsmall`–`heading.xxlarge` y entra la escala cerrada del documento. Cada uso actual se traduce por el rol que cumple, no por su tamaño: el título de una página va a `display`, el de una sección a `heading.lg`, el de una tarjeta a `heading.md`, y los pasos menores que hoy se usan como encabezado pasan a `label` o a `body.sm` según sean rótulo o texto.

*Por qué:* la escala vieja tenía seis pasos de encabezado más cinco de texto, once combinaciones para una jerarquía que en pantalla nunca pasa de cuatro niveles. Traducir por rol y no por tamaño es lo que impide que la escala nueva herede el exceso de la vieja.

*Trade-off aceptado:* algunos usos actuales no tienen equivalente exacto y quedarán un paso más grandes o más chicos. Eso es la escala haciendo su trabajo: cuando un texto necesita un tamaño que no existe, el problema casi siempre es de jerarquía en la pantalla.

### Los alias de espaciado son la interfaz; la escala numérica queda como inventario

La escala `100`–`900` se define, pero el preset de Tailwind y la documentación exponen los nueve alias como la forma normal de espaciar. El alias apunta al paso, nunca al píxel.

*Por qué:* un número no dice cuándo usarlo, y esa es exactamente la decisión que se toma al maquetar. Con el alias, recalibrar el ritmo del sistema entero es cambiar a qué paso apunta cada alias.

*Riesgo asumido:* nada impide usar el paso numérico directamente. La documentación lo desaconseja, pero no hay forma de prohibirlo sin quitar la escala del preset, y quitarla rompería los casos legítimos donde hace falta un valor concreto.

### Los grupos nuevos entran como módulos propios, no como apéndices del color

Alturas de control, anchos máximos por tipo de contenido, capas de superposición y puntos de quiebre entran en un módulo de layout propio, y el anillo de foco en el de borde. Todos se exponen en el preset de Tailwind y en el CSS generado.

*Por qué:* son decisiones de sistema con la misma jerarquía que el color o el espaciado, y la definición las trata así. Dejarlas como constantes dentro de los componentes es lo que produce el `z-index: 9999` que el documento señala como síntoma.

### Los iconos se extraen del documento, no se redibujan

El módulo de iconos se genera a partir de los `<svg>` del documento de iconografía, emparejando cada dibujo con su nombre de la librería, y el resultado se revisa contra las reglas de trazo antes de fijarlo.

*Por qué:* los iconos ya están dibujados y son la fuente de verdad. Redibujarlos introduciría diferencias con lo aprobado, y "un icono correcto es invisible dentro del set" es una propiedad que no sobrevive a un redibujo a mano.

*Alternativa considerada:* adoptar una librería abierta y dibujar solo los catorce del vocabulario de dominio. Se descarta porque mezclaría dos gramáticas de trazo, que es justo lo que el documento evita al tener set propio.

*Consecuencia a verificar:* el documento dibuja alrededor de ochenta y ocho `<svg>`, y la librería declara setenta y dos iconos; parte de esos dibujos son ilustraciones de las reglas, no entradas de la librería. La extracción tiene que emparejar dibujo con nombre y reportar los que queden sin pareja, en vez de asumir que el orden coincide.

### El componente `Icon` es una entrada del registro como cualquier otra

`Icon` y su mapa de trazos se distribuyen por el CLI, con el mapa como dependencia interna del componente.

*Por qué:* es coherente con que el equipo sea dueño del código, y hace que el peso de los iconos aparezca en la documentación como el de cualquier componente.

*Consecuencia:* el peso de esa entrada será muy superior al de los componentes actuales, porque son setenta y dos dibujos. Conviene que el mapa de trazos sea un archivo aparte del componente, para que se lea en la documentación como lo que es.

### Las familias tipográficas se auto-hospedan en el sitio y se declaran como requisito para el consumidor

El sitio de documentación sirve IBM Plex Sans y Mono desde sus propios archivos. El CSS de tokens declara la familia y su respaldo, y la documentación de instalación indica que el proyecto anfitrión debe servirla.

*Por qué:* "servida internamente" descarta depender de un CDN externo, que además es una petición a terceros desde toda pantalla del sistema. Pero empaquetar los binarios de la fuente dentro del registro que el CLI copia haría que cada proyecto anfitrión recibiera megabytes de tipografía por copiar un botón.

*Alternativa considerada:* enlazar Google Fonts, como hace el prototipo del sitio. Se descarta por la dependencia externa; el prototipo es una especificación visual, no una decisión de infraestructura.

### La verificación de contraste es la puerta de entrada de la paleta nueva

`verify-tokens.ts` se extiende con los pares que introduce la paleta nueva —incluido el rol `info`— y ningún valor entra si no pasa. El documento afirma que su paleta cumple WCAG 2.2 AA; esa afirmación se comprueba, no se asume.

*Por qué:* el sistema anterior dejó pasar un par de 4.44:1 que nadie detectó hasta que se midió a mano. La lista explícita de pares es lo que convierte "cumple AA" en algo que falla el build cuando deja de ser cierto.

## Risks / Trade-offs

- **El renombre rompe todo proyecto que ya corrió `tuya-ui init`.** → No hay migración automática posible: el CSS vive copiado en el repositorio del consumidor. Se publica como versión mayor de los paquetes, y la documentación de instalación describe el cambio de nombres. Con el catálogo de consumidores actual el costo es bajo; con uno grande esta decisión habría que replantearla.
- **Las semánticas pierden el prefijo `--tuya-` y pasan a nombres genéricos como `--color-text-default`.** → Colisionan con cualquier variable homónima del proyecto anfitrión. Se mitiga documentándolo en la página de instalación; no se mitiga técnicamente, porque el nombre es el que fija la definición.
- **La extracción de iconos puede emparejar mal un dibujo con un nombre.** → El emparejamiento se revisa icono por icono contra el documento, y la página de iconografía del sitio muestra nombre y dibujo juntos, que es donde un cruce se ve de inmediato.
- **Los valores de modo oscuro cambian y el sitio no los muestra en ninguna parte.** → La página de color documenta el modo oscuro como conjunto de valores, así que quedan a la vista aunque el sitio no se pinte con ellos. Aun así, un valor oscuro roto no se notaría al usar el sitio: es deuda conocida que se salda cuando alguna aplicación consuma el tema.
- **La paleta nueva puede no cumplir AA en algún par que la actual sí cumplía.** → La verificación corre antes de fijar los valores. Si un par falla, no entra: el documento establece que un token que no pasa no entra, y esa regla se aplica también a los suyos.
- **Retokenizar los cuatro componentes existentes toca código que hoy funciona.** → Su comportamiento no cambia y `component-library` no cambia de requisitos, así que la comprobación es visual y de build. El riesgo real es dejar un valor viejo sin traducir, que se detecta con una búsqueda de los nombres retirados.

## Migration Plan

1. Reescribir las primitivas y los semánticos con los valores de la definición, conservando la emisión actual de nombres. En este punto el sistema es de Tuya pero se llama como antes, y todo sigue compilando.
2. Extender `verify-tokens.ts` con los pares de la paleta nueva y dejarlo en verde. Nada avanza hasta que el contraste esté comprobado.
3. Cambiar la emisión de nombres a los dos vocabularios, actualizar el preset de Tailwind y traducir los cuatro componentes y el sitio. Es el paso que rompe; se hace de una vez porque un estado intermedio con dos nomenclaturas vivas es peor que el cambio.
4. Reemplazar la escala tipográfica y las familias, y traducir los usos por rol.
5. Añadir espaciado con alias, layout, foco y el resto de los grupos nuevos.
6. Extraer la librería de iconos, publicar `Icon` en el registro y añadir la página de iconografía.
7. Reescribir las páginas de fundamentos sobre los tokens nuevos.

Los pasos 1 y 2 dejan el sistema utilizable y son reversibles. Del 3 en adelante el cambio es de una pieza: revertirlo es volver a la versión anterior de los paquetes.

## Open Questions

- Si el rol `info` necesita variantes `hover` y `pressed`. Hoy ningún componente lo consume, y la respuesta depende de qué componente lo use primero —probablemente el Alert de la fase siguiente—. Añadirlas después es aditivo y no cambia ningún requisito de este change.
- Si conviene subsetear las fuentes por rango de caracteres. Depende de cuánto pesen los archivos completos, que se sabrá al incorporarlas, y no cambia el enfoque ni el desglose de tareas.
