## Why

Los botones planos y las cards no se distinguen de la superficie que los sostiene: `secondary`, `subtle` y `link` no tienen ningún límite hasta que aparece el hover, y el contorno de Card se apoya en una sombra y un trazo casi imperceptible.

El primer intento atacó esto como un problema de accesibilidad: subir los bordes a un trazo que clarara los 3:1 que WCAG 1.4.11 pide para el límite de un componente. Se implementó, se midió y se descartó al verlo: el resultado cumple el mínimo y se ve mal. Un contorno a 3.5:1 alrededor de un botón secundario lo hace gritar, y el mismo trazo alrededor de una Card la convierte en una caja dura.

De ahí sale el encuadre de este cambio, que ya no es el original: **es un ajuste visual, no de accesibilidad.** El trazo que se adopta ronda 1.23:1 y no pretende cumplir 1.4.11 — su trabajo es insinuar el límite, no declararlo. Se asume explícitamente, no por descuido.

El anillo de foco entra por dos motivos. Uno es un defecto: las clases escritas en el catálogo son `ring-border-<rol>-focus`, pero la clave de color del preset es `<rol>-focus`, así que **34 usos no generan regla** y caen al azul semitransparente que Tailwind trae por defecto. El anillo de marca nunca se vio. El otro es de diseño: separado del control por un offset de 2px que además se pinta blanco, el anillo se lee como un elemento ajeno pegado encima. Va contra el borde y en el tono del propio control.

## What Changes

- Se registra como token el trazo translúcido `#8080802E`. Al componerse sobre la superficie que tenga debajo, se comporta igual en modo claro y oscuro (1.23:1 y 1.25:1), cosa que un valor sólido no hace: un gris sólido pensado para fondo claro desaparece sobre fondo oscuro.
- `Card` y el botón `secondary` usan ese trazo, de modo que contenedor y control compartan el mismo lenguaje de límite.
- `Card` **conserva su sombra, pero deja de leerse como un halo**. El escalón `sm` es `0 1px 2px 0`: el difuminado de 2px se derrama ~1px hacia todos los lados mientras el desplazamiento es de apenas 1px, así que sobresale casi tanto por los costados como por abajo y se percibe como una mancha alrededor en vez de una sombra proyectada. Los escalones `md` y `lg` no tienen ese problema porque su spread negativo recoge los costados. `sm` pasa a la misma familia. El escalón lo usa únicamente `Card`, así que corregirlo en el token no arrastra a ningún otro componente.
- Queda claro el reparto de trabajo: **el trazo delimita y la sombra eleva**. Son cosas distintas, y confundirlas fue lo que llevó a probar la sombra como sustituto del borde. Una sombra proyectada nunca define el borde superior, y por eso no puede delimitar; pero sí comunica que la superficie está por encima del lienzo, que es lo que se le pide.
- El anillo de foco pasa a dibujarse **contra el borde, sin offset**, y en un tono translúcido derivado del color base de cada variante: el de marca para `primary` y `link`, el destructivo para `danger`, el neutro para `secondary` y `subtle`. Deja de ser un anillo ajeno y pasa a leerse como el mismo control encendido.
- Se corrigen los 34 usos de `ring-border-*` que hoy no generan regla, sin los cuales el anillo no puede tomar ningún color del sistema.
- **Los controles de formulario toman el anillo neutro, no el de marca.** El color de marca de este sistema es un rojo de la misma familia que el de error, así que un anillo de marca sobre un campo lo hace parecer un campo con problema. Es la misma regla de "el anillo sale del color base del control" aplicada con rigor: el color base de un campo es neutro, no la marca. El tono de error queda reservado al campo que efectivamente lo está.
- **Se revierte** el paso `neutral[450]` y el token de borde `strong` introducidos por el intento anterior: nada los usa, y un token sin uso hay que mantenerlo en dos modos y verificarlo en cada corrida.
- `subtle` y `link` siguen sin borde, y las cinco variantes siguen ocupando la misma caja.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `design-tokens`: se incorpora el requisito del trazo translúcido y el del anillo de foco derivado del color base del control, ambos definidos para los dos modos.
- `component-library`: la variante secundaria de Button pasa a llevar un trazo que insinúa su límite —sin exigirle un piso de contraste—, las variantes sutil y de enlace a requerir su ausencia, el anillo de foco a ir contra el borde y en el tono del control, y la superficie de Card a delimitarse por su contorno sin recurrir a una sombra.

## Impact

- `packages/tokens/src/primitives.ts` — se revierte el paso `450`.
- `packages/tokens/src/semantic-colors.ts` — sale `border.neutral.strong`, entran el trazo translúcido y los tonos de anillo por rol.
- `packages/tokens/scripts/verify-tokens.ts` — salen las comprobaciones de `strong`. Los tokens nuevos **no** se auditan contra 3:1, porque no pretenden cumplirlo; auditarlos sería declarar un mínimo que el cambio decidió no perseguir.
- `packages/components/src/button.tsx`, `card.tsx` — el trazo, la sombra y el anillo.
- Los 34 usos de `ring-border-*` repartidos por el catálogo.
- `apps/docs` — las páginas de Button, Card y color.
- Hay que reconstruir y reempaquetar ambos paquetes para que el cambio llegue a la app consumidora. No hay cambio de API.

## Consecuencia asumida

Con la sombra fuera y el contorno en 1.23:1, una Card blanca sobre el lienzo queda separada por muy poco: la superficie difiere del lienzo en 1.04:1. Es una decisión visual tomada a conciencia, no un descuido — pero es el mismo terreno donde empezó la queja original, así que queda anotado acá para que el día que vuelva a molestar se sepa dónde mirar: el problema sería del lienzo, no del borde.
