## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El rename se propaga casi solo.** `tailwind-preset.ts` (`accentVars`), `generate-css.ts` y `verify-tokens.ts` iteran la paleta; `seniority-card.tsx` deriva el tono por índice de `accentTones`. Los únicos lugares con `teal` literal son tres: `accent-colors.ts` (la definición), `lib/accent-tone.ts` (tipo y lista) y `level-meter.tsx` (mapa literal de clases). En docs: `content/level-meter.tsx` y dos ejemplos.
- **`verify-tokens` es el árbitro del valor.** Mide cada matiz contra fila clara, lienzo, fila seleccionada y fila oscura con piso 3:1. La fila seleccionada es la superficie más exigente del lado claro (~0.91× del ratio contra blanco).
- **`SegmentedBar` vive en `progress.tsx`** y su segmento es una unión discriminada: `{ role } XOR { color }`. Los mapas de clase son literales por la restricción del JIT de Tailwind.
- **Dos de los requisitos que este change modifica** viven en el delta pendiente de `add-seniority-card-component`, no en el spec principal.

## Goals / Non-Goals

**Goals:**

- Que el tercer paso de la escala se lea como amarillo dorado en todas las piezas que la consumen, pasando el build de contraste con margen.
- Que `SegmentedBar` pueda pintar una distribución ordinal con los mismos matices que el medidor de nivel.

**Non-Goals:**

- No se agrega ningún paso nuevo a la paleta (ni `ink` ni `surface`): sigue habiendo un paso por matiz.
- No se toca el vocabulario categórico ni los roles de estado de `SegmentedBar`: se suma un vocabulario, no se reemplaza ninguno.
- No se migra ningún uso existente de `SegmentedBar` en docs o ejemplos a los tonos nuevos: los ejemplos actuales muestran los vocabularios que ya existían y siguen siendo válidos.

## Decisions

- **El matiz se renombra: `teal` → `gold`.** Los matices de acento se nombran por su matiz (es la convención documentada del vocabulario categórico y de acento); un `teal` con valor `#B45309` obligaría a cada lector a saber la historia del cambio para entender el código. Alternativa considerada: conservar el nombre para no romper `bg-accent-teal-fill`. Se descarta porque el único consumidor de esas clases es el propio paquete — la aplicación no usa clases de acento — así que el costo del rename es interno y se paga una sola vez, mientras que el nombre mentiroso se pagaría para siempre.

- **El valor parte de `#B45309` y lo afino yo durante la implementación, contra los cuatro criterios acordados con el usuario:** (1) que se lea como amarillo/ocre y no como naranja, (2) margen ≥ 0.3 sobre el piso de 3:1 en las cuatro superficies — con la fila seleccionada como la restricción activa del lado claro —, (3) distinguible de `blue` y `purple` a simple vista y en el medidor de cuatro segmentos, (4) lejos del rojo de marca de Tuya. El criterio (2) es el que descartó el "pastel" literal del pedido original: un pastel ronda 1.3:1 contra blanco y `verify-tokens` lo rechaza. La decisión de tono quedó explícitamente delegada por el usuario.

- **La tabla de contraste del encabezado de `accent-colors.ts` se recalcula, no se estima.** El encabezado documenta los ratios medidos de los cuatro matices; con `gold` adentro, los valores salen de correr `verify-tokens`, que ya los computa. Si `gold` queda más ajustado que `slate` en alguna superficie, el comentario sobre "el más ajustado" cambia de protagonista.

- **`SegmentedBar` suma una tercera rama a su unión discriminada: `{ tone: AccentTone }`.** Misma forma que las dos existentes — `{ role } XOR { color } XOR { tone }` — con mapa literal `bg-accent-<matiz>-fill`, el mismo paso de relleno que usa `LevelMeter`. Alternativas consideradas: (a) aceptar `className` por segmento — abre la puerta a cualquier color y desarma los vocabularios cerrados que el spec del componente establece; (b) que el consumidor use el vocabulario categórico "que más se parezca" — es exactamente el estado actual que motivó el change: `amber` categórico ≠ `gold` de acento, y el mismo dato viste dos colores. Se descarta ambas.

- **`components` depende de `tokens` en workspace, así que el rename viaja junto en una sola publicación.** No hay ventana en la que `level-meter` pida `bg-accent-gold-fill` y el preset todavía emita `--color-accent-teal-fill`: el changeset cubre los dos paquetes y `publish:local` empaqueta ambos.

## Risks / Trade-offs

- **[`gold` es visualmente pariente del `amber` semántico de `warning`, y un segmento dorado podría leerse como advertencia]** → Es el mismo riesgo que ya corren `slate` frente a `neutral` y `blue` frente a `info`, y se mitiga igual: el vocabulario vive bajo su propio prefijo, la documentación de fundamentos dice explícitamente que el acento no comunica estado, y el delta del spec lo afirma ahora también para `gold` por nombre. El uso lo desambigua: un dorado en el tercer paso de un medidor de cuatro no se parece a un badge de advertencia.
- **[La progresión pierde la lógica de temperatura (gris → azul → turquesa → morado eran fríos; el dorado es cálido) y el tercer paso ahora "salta" cromáticamente]** → Decisión estética del usuario, que es dueño del sistema. La paridad perceptual que el encabezado de la paleta defiende se conserva en lo medible — mismo tratamiento, contraste comparable — y el salto cálido tiene un beneficio lateral: el tercer paso se distingue de sus vecinos más que el turquesa, que rozaba al azul.
- **[El cambio de color de "Avanzado" aterriza en el listado de Personas sin que ese repositorio cambie una línea]** → Es el efecto pedido, no un accidente — el usuario eligió explícitamente "toda la escala". Se anota en el changeset como cambio visual para que la próxima actualización del `.tgz` no sorprenda.
- **[Renombrar `bg-accent-teal-fill` rompe a un consumidor externo hipotético]** → Hoy no existe: la aplicación consumidora no usa ninguna clase `accent-*` (verificado con grep). El changeset lo declara BREAKING igual, porque el registry distribuye el fuente y alguien pudo copiarlo.

## Migration Plan

1. Tokens: matiz y valor nuevos, tabla recalculada, `verify-tokens` verde.
2. Componentes: rename en `accent-tone.ts` y `level-meter.tsx`; rama `tone` en `SegmentedBar`.
3. Docs, registry, changeset, `publish:local`.
4. El consumidor (`adopt-accent-scale-in-people-stats`, en el repo de la app) reinstala y adopta.

Rollback: revertir el commit y republicar el `.tgz` — el rename es simétrico y no hay datos ni contratos HTTP involucrados.

## Open Questions

- ~~El hex final de `gold`~~ — **Resuelta en la implementación: `#AD7A0B`.** Se midieron siete candidatos contra las cuatro superficies con el propio `contrastRatio` del paquete. `#B45309` (el punto de partida) pasa con más margen (min 3.56) pero se lee naranja — R 180 / G 83 —, y `#B8860B` (darkgoldenrod) falla en la fila seleccionada (2.96). `#AD7A0B` es el dorado más claro que cumple los cuatro criterios: se lee amarillo (G/R ≈ 0.71), margen 0.43 sobre el piso en su peor superficie, y lejos del rojo de marca. Contrastes medidos: fila clara 3.77:1, lienzo 3.62:1, fila seleccionada 3.43:1, fila oscura 4.74:1. `slate` (3.08 en fila seleccionada) sigue siendo el par más ajustado de la escala, así que la prosa del encabezado no cambió de protagonista.
