## Why

Dos motivos, uno visual y uno de consumo.

El visual: el usuario pidió reemplazar el turquesa de la escala de acento —el matiz del tercer paso, "Avanzado" en seniority— por un amarillo. La petición original decía "amarillo pastel"; un pastel de verdad no pasa el piso de contraste de 3:1 que `verify-tokens` impone contra las cuatro superficies del sistema (ronda 1.3:1 contra la fila blanca), así que lo acordado con el usuario es un **ocre dorado** — el amarillo más profundo que pasa el build con margen, partiendo de la zona de `#B45309`, con el tono final afinado visualmente durante la implementación según cuatro criterios: que se lea como amarillo y no naranja, margen ≥ 0.3 sobre el piso de 3:1, distinguible de sus vecinos azul y morado, y lejos del rojo de marca.

El de consumo: la card "Distribución por seniority" de la aplicación de gestión de capacidad muestra hoy los niveles con el vocabulario **categórico** (`gray`/`amber`/`blue`/`purple` → clases semánticas `-bold`), mientras el listado de la misma pantalla los muestra con la escala de **acento**. El mismo nivel viste dos colores distintos a centímetros de distancia. Para que la card pueda adoptar la escala, `SegmentedBar` —que hoy sólo acepta roles de estado o colores categóricos— necesita un tercer vocabulario: los tonos de acento.

## What Changes

- **El tercer matiz de la escala de acento deja de ser turquesa y pasa a ser ocre dorado.** Cambia el valor y cambia el nombre: `teal` → `gold`, porque los matices se nombran por lo que son y un `teal` con valor amarillo sería mentira. El cambio alcanza a todo lo que la escala tiñe: el medidor de `LevelMeter`, la fila de "Avanzado" en `SeniorityCard`, la documentación de fundamentos y las utilidades distribuidas (`bg-accent-teal-fill` → `bg-accent-gold-fill`). **BREAKING** para cualquier consumidor que use la clase o el nombre `teal` directamente — hoy no hay ninguno fuera del propio paquete: la aplicación consumidora no usa clases de acento todavía.
- **`SegmentedBar` gana un tercer vocabulario de color: los tonos de acento.** Un segmento puede colorearse por rol de estado, por color categórico **o por tono de acento**, excluyentes entre sí por segmento, igual que hoy los dos primeros. Es lo que permite que una barra de distribución pinte sus segmentos con los mismos matices que el medidor de nivel.
- **La verificación de contraste sigue mandando.** El valor final de `gold` tiene que pasar los mismos pares que los demás matices (fila blanca, lienzo, fila seleccionada, fila oscura, piso 3:1); `verify-tokens` itera la paleta, así que el matiz nuevo entra a la verificación solo.
- Sin cambios de comportamiento en ninguna otra pieza: `LevelMeter` y `SeniorityCard` cambian de color en su tercer paso, no de forma ni de API.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `design-tokens`: el requisito "Paleta de acento sin significado de estado" cambia su tercer matiz de `teal` a `gold` y su escenario de progresión (gris → azul → **ocre dorado** → morado). **Ese requisito vive todavía en el delta pendiente de `add-seniority-card-component`**: este change debe archivarse después de aquél.
- `component-library`: "Opciones del componente SegmentedBar" (spec principal) suma el vocabulario de acento como tercera forma de colorear un segmento (MODIFIED); "Opciones del componente SeniorityCard" actualiza la progresión de matices nombrada en su texto (MODIFIED — también vive en el delta pendiente de `add-seniority-card-component`).

## Impact

- **Tokens**: `packages/tokens/src/accent-colors.ts` (matiz y valor), tabla de contraste del encabezado. `tailwind-preset.ts`, `generate-css.ts` y `verify-tokens.ts` iteran la paleta y absorben el rename solos.
- **Componentes**: `lib/accent-tone.ts` (tipo y lista ordenada), `level-meter.tsx` (mapa literal de clases), `progress.tsx` (`SegmentedBar`: variante de segmento por tono de acento + mapa literal `bg-accent-<matiz>-fill`). `seniority-card.tsx` no cambia: deriva el tono por índice de `accentTones`.
- **Docs**: sección de acento en fundamentos (swatches y tabla derivan de `accentColorNames`, se regeneran solas; revisar la prosa), `content/level-meter.tsx` y sus dos ejemplos que nombran `teal`, la página de `SegmentedBar` (nueva opción de color y su criterio de uso), tabla de props regenerada.
- **Distribución**: changeset `MINOR` de `@tuya-ui/tokens` y `@tuya-ui/components` con la nota de cambio visual y el rename **BREAKING** de la clase; `registry.json` y Skill regenerados; `pnpm run publish:local`.
- **Consumidor a la espera**: el change `adopt-accent-scale-in-people-stats` del repositorio de la aplicación depende de este `.tgz`.
- **Orden de archivado**: después de `add-seniority-card-component`, cuyos deltas definen dos de los requisitos que éste modifica.
