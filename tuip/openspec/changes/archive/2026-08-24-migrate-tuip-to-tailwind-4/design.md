## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **Dónde vive Tailwind 3 hoy**: `packages/components` (config con `presets`, `content` y `safelist`; entrada `src/styles.css` con `@tailwind base/components/utilities`) y `apps/docs` (su propio config y su PostCSS). `packages/tokens` no depende de Tailwind: sólo **exporta** el preset.
- **El preset son 232 líneas** que reemplazan namespaces enteros (`colors`, `backgroundColor`, `textColor`, `borderColor`, `fill`, `stroke`, `fontSize`) y extienden otros (`spacing`, `borderRadius`, `boxShadow`, `zIndex`, `screens`, `width`, `height`, `ringWidth`…). El reemplazo es deliberado: es lo que cierra la paleta nativa.
- **El preset tiene un segundo consumidor**: `packages/components/vitest.setup.ts` genera una hoja de estilos desde el mismo objeto para poder afirmar medidas en jsdom. Si el preset deja de ser un objeto JS, ese setup se queda sin fuente.
- **El `safelist` existe porque el escaneo de contenido sólo ve `src/` de este paquete**: la escala tipográfica, `bg-neutral-canvas` y los tres pasos de atención son vocabulario para las pantallas, no para los componentes, y sin safelist se purgan antes de que una app pueda usarlos.
- La verificación de tokens (`verify-tokens.ts`) y la de colores literales (`verify-no-literal-colors.ts`) son independientes de la versión de Tailwind y tienen que seguir pasando.

## Goals / Non-Goals

**Goals:**

- Que las clases que tuip publica tengan la misma implementación que las que genera un consumidor en v4.
- Que el vocabulario quede idéntico: mismos nombres, mismos valores, misma paleta cerrada.

**Non-Goals:**

- Rediseñar el preset o aprovechar la migración para "mejorar" el vocabulario. Cualquier diferencia de aspecto después de migrar es un defecto.
- Cambiar el contrato de consumo (ver la primera decisión).
- Adoptar novedades de v4 —contenedores con consultas, variantes nuevas— más allá de lo que la migración exige.

## Decisions

- **tuip sigue publicando utilidades ya generadas.** La alternativa que elimina el problema de raíz es que el paquete publique su **tema** (`@theme`) y que cada app genere las utilidades: entonces sólo existe una hoja y no hay nada que componer. Se descarta para este change por dos razones: cambia el contrato —el consumidor pasa a tener que compilar Tailwind y declarar el paquete como fuente de escaneo, y hoy la app lo consume como CSS ya hecho—, y convierte una migración verificable en un rediseño de distribución. Migrar de versión y cambiar de contrato a la vez deja sin saber a cuál de los dos culpar cuando algo se vea distinto. Queda como evolución posterior, ya con las dos partes en la misma versión.
- **El preset se conserva como objeto JS y se carga con `@config`.** v4 admite un archivo de configuración legacy, y eso preserva el vocabulario tal como está escrito —incluida la distinción entre namespaces que `@theme` no puede expresar: hoy los pasos de acento y atención existen sólo como fondo, no como texto, y en v4 un `--color-*` alimenta **todas** las utilidades de color a la vez—. Ese matiz no es cosmético: la escala de atención se documenta como "nunca texto" y publicar `text-attention-high-fill` la contradiría. La alternativa —convertir todo a `@theme` y recuperar la distinción con `@utility`— es más idiomática en v4 y queda anotada, pero es exactamente el rediseño que este change evita. Segundo beneficio: `vitest.setup.ts` sigue teniendo su objeto.
- **La paleta nativa se cierra explícitamente y con una prueba que lo vigile.** En v3 el cierre era una consecuencia de reemplazar el namespace; en v4 hay que declararlo. La diferencia importante es de modo de fallo: no cerrarla no rompe nada, sólo vuelve a aceptar toda la paleta de Tailwind. Por eso el requisito pasa a exigir verificación automática — es la única forma de que la regresión se note.
- **El `safelist` se reemplaza por la declaración de fuentes que v4 provee**, con el mismo contenido y el mismo motivo escrito al lado. No se aprovecha para agregar ni quitar clases de la lista: si la lista está mal, es otro change.
- **La comprobación del choque compara hojas, no clases sueltas.** Se genera la hoja de un consumidor de prueba en v4, se cruza con la publicada, y se falla cuando una misma clase declara propiedades distintas. Comparar por nombre no alcanzaría —el problema no es que la clase esté repetida, sino que esté repetida **con otra implementación**—, y una lista escrita a mano de utilidades sospechosas envejece con cada versión de Tailwind.
- **La verificación final es mirar pantallas.** La hoja publicada se regenera entera, así que la superficie de riesgo es toda la app. Las pruebas de tuip afirman clases, no píxeles: pasan igual aunque una utilidad cambie de significado. El modal de eliminar una célula es el caso testigo —se sabe exactamente cuánto estaba corrido— y sirve de prueba de que la migración funcionó.

## Risks / Trade-offs

- **[Una migración de versión mayor con superficie visual total]** → Se acota comparando pantalla por pantalla contra el estado actual, y el orden de trabajo deja la comprobación automática del choque **antes** de la revisión visual, para que lo que se mire ya esté libre del defecto conocido.
- **[`@config` es un camino de compatibilidad, no el idiomático de v4]** → Es deliberado: preserva el vocabulario sin reinterpretarlo. Si algo del preset resulta no estar soportado, esa parte —y sólo ésa— se convierte a la forma nativa, y queda anotado.
- **[Clases cuyo nombre cambió entre v3 y v4]** → Las escalas que el preset **reemplaza** (sombra, radio, espaciado, capa) no se ven afectadas por los renombres de v4, porque sus nombres son propios. El riesgo queda en las utilidades nativas que el catálogo usa tal cual; salen del build, que en v4 falla ante una clase desconocida en vez de ignorarla.
- **[El cierre de la paleta se pierde en silencio]** → Es el modo de fallo que motivó agregarle verificación al requisito.

## Migration Plan

1. Migrar `packages/components`: dependencias, plugin de PostCSS, entrada CSS, configuración y fuentes de escaneo.
2. Adaptar el preset a lo que v4 necesita, sin tocar el vocabulario, y comprobar que el setup de pruebas lo sigue consumiendo.
3. Cerrar la paleta nativa y dejarlo verificado.
4. Comprobación automática de que la hoja publicada y la del consumidor no discrepan.
5. Migrar `apps/docs`.
6. Empacar, reinstalar en la app y revisar pantallas, empezando por el modal descentrado.

Rollback: la migración es de configuración y build. Volver es revertir el change y reempacar; el vocabulario no cambia, así que ninguna pantalla depende de que se haya migrado.

## Open Questions

- Si `@config` resulta no soportar alguna parte del preset, ¿esa parte se convierte a `@theme`/`@utility` dentro de este change, o se corta y se propone aparte? Se puede responder al migrar sin cambiar las specs ni el orden de las tareas: en ambos casos el vocabulario publicado tiene que quedar idéntico, y eso es lo que las tareas verifican.
