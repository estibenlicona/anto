## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **`PeopleStatsCards.tsx` ya centraliza el mapeo** en dos constantes: `SENIORITY_COLORS` (nivel → color categórico de `SegmentedBar`) y `LEGEND_DOT_CLASSES` (nivel → clase `-bold` semántica para el punto de la leyenda). El cambio es reescribir esas dos constantes y la prop del segmento; la estructura del componente no se toca.
- **La app no compila Tailwind propio**: consume `@tuya-ui/components/styles.css`, que contiene sólo las clases que aparecen literalmente en el fuente de `tuip`. Las clases `bg-accent-<matiz>-fill` están ahí porque `LevelMeter` las escribe literales, y la rama `tone` nueva de `SegmentedBar` las reescribe. La app puede usarlas en los puntos de la leyenda sin generar CSS.
- **El dato llega por número de nivel** (`entry.seniority`: 1–4), no por nombre — el mapeo de la card es por índice, igual que hoy.
- **La pieza del sistema que la card necesita** (`SegmentedBar` con `tone`) la publica el change `swap-accent-teal-for-gold` de `tuip`. Sin ese `.tgz`, nada de esto tipa.

## Goals / Non-Goals

**Goals:**

- Un solo código de color por nivel en toda la pantalla de Personas: card y listado toman la misma escala del sistema.
- Que la app deje de decidir colores de nivel: si la escala cambia de matiz en `tuip`, la card lo refleja con la sola actualización del paquete.

**Non-Goals:**

- No se rediseña la card: título, contador, barra separada y leyenda 2×2 quedan como están.
- No se crea una suite nueva para `PeopleStatsCards` más allá de los casos de color: la cobertura estructural del resumen sigue viviendo en `PeopleContainer.test.tsx`.
- No se toca el turquesa→dorado desde este repo: ese cambio viaja dentro del paquete.

## Decisions

- **La barra usa `tone`, no `color`.** `SENIORITY_COLORS` pasa a `Record<number, AccentTone>` — `{1: "slate", 2: "blue", 3: "gold", 4: "purple"}` — y el segmento declara `tone` en vez de `color`. Alternativa considerada: mantener el vocabulario categórico eligiendo los tonos "parecidos". Es el estado actual y es exactamente lo que el change elimina: `amber` categórico no es `gold` de acento, y el mismo dato seguiría vistiendo dos colores.
- **Los puntos de la leyenda usan `bg-accent-<matiz>-fill` literal.** `LEGEND_DOT_CLASSES` cambia sus cuatro valores; el comentario existente sobre por qué el mapa es literal (el JIT de Tailwind) sigue valiendo y se conserva. Alternativa considerada: renderizar un `LevelMeter` mínimo como swatch. Se descarta: un punto de leyenda es un punto, no un medidor, y la clase de relleno ya es el contrato público del matiz.
- **El fallback de nivel desconocido queda en el tono más bajo (`slate`)**, igual que hoy cae en `gray`/`bg-neutral-bold`. La card de distribución agrupa por catálogo, así que un nivel fuera de 1–4 no debería llegar; si llega, un gris neutro es el estado menos mentiroso.
- **La correspondencia card–listado se prueba por clase compartida, no por hex.** El test toma el punto de leyenda de un nivel y asserta que su clase es la misma `bg-accent-<matiz>-fill` que usa la escala del sistema — no un color computado, que jsdom no resuelve, ni un hex, que es asunto de `tuip`. La correspondencia visual final es revisión en pantalla.
- **El delta del spec se escribe sobre el texto pendiente de `add-identity-avatar-colors`** (único otro change que modifica "Resumen del módulo de Personas"), incluyendo sus escenarios de avatares. Mismo seguro contra el orden de archivado que `adopt-neutral-name-link-in-people` documenta para "Listar personas": si éste archiva último, no pisa nada.

## Risks / Trade-offs

- **[La card pierde el ámbar/azul semánticos que hoy tienen más contraste que algunos tonos de acento]** → Los cuatro tonos de acento pasan el piso 3:1 contra las superficies del sistema por verificación automática en `tuip`; el punto de leyenda además nunca está solo — lleva la etiqueta del nivel al lado, así que el color no es el único canal.
- **[Este change depende de una publicación del otro repositorio]** → Igual que `adopt-seniority-card-in-people` y `adopt-neutral-name-link-in-people`: la primera tarea es la dependencia, y hasta reinstalar no se toca nada. No hay estado intermedio roto.
- **[El delta afirma comportamiento que `add-identity-avatar-colors` construyó (avatares con color por persona)]** → Ya construido y visible en `PeopleStatsCards.tsx` (`colorId={person.id}`); mismo criterio y misma revisión pre-archivado que el change del enlace neutro dejó escrita.
- **[Al reinstalar, "Avanzado" cambia de turquesa a dorado también en el listado, y alguien podría reportarlo como regresión de este change]** → Es el efecto pedido del change de `tuip` y está anotado en su changeset como cambio visual; el proposal de éste lo repite para que la revisión en pantalla lo espere en vez de sorprenderse.

## Migration Plan

1. `tuip` publica `swap-accent-teal-for-gold` (`pnpm run publish:local`).
2. La app reinstala; el listado ya muestra el dorado sin tocar código.
3. Se reescriben las dos constantes y la prop del segmento en `PeopleStatsCards.tsx`; se ajustan pruebas.
4. Revisión en pantalla de la correspondencia card–listado.

Rollback: revertir la celda y las constantes, y reinstalar el `.tgz` anterior si también se quiere volver del dorado. Sin datos ni contratos involucrados.
