## 1. Tokens: el matiz dorado

- [x] 1.1 En `packages/tokens/src/accent-colors.ts`, reemplazar la entrada `teal: { fill: "#2E97A3" }` por `gold` con el valor de partida `#B45309`, conservando la posición (tercero) en el orden de la escala.
- [x] 1.2 Correr `pnpm --filter @tuya-ui/tokens test` y afinar el hex contra los cuatro criterios acordados: se lee amarillo/ocre y no naranja, margen ≥ 0.3 sobre el piso 3:1 en las cuatro superficies, distinguible de `blue` y `purple`, lejos del rojo de marca. La fila seleccionada es la restricción activa del lado claro.
- [x] 1.3 Recalcular la tabla de contraste del encabezado de `accent-colors.ts` con los valores que reporta `verify-tokens`, y actualizar la prosa si `gold` desplaza a `slate` como el par más ajustado.
- [x] 1.4 Agregar al encabezado la nota de que `gold` no es un alias del `warning` semántico — mismo criterio que la nota existente sobre `slate`/`neutral` y `blue`/`info`.
- [x] 1.5 Correr `pnpm --filter @tuya-ui/tokens build` y confirmar que el CSS generado emite `--color-accent-gold-fill` una sola vez, en el bloque independiente del tema, y que `teal` desapareció.

## 2. Componentes: rename y tercer vocabulario de SegmentedBar

- [x] 2.1 En `packages/components/src/lib/accent-tone.ts`, renombrar `teal` → `gold` en el tipo `AccentTone` y en la lista ordenada `accentTones`, conservando la tercera posición.
- [x] 2.2 En `packages/components/src/level-meter.tsx`, actualizar el mapa literal: `gold: "bg-accent-gold-fill"`.
- [x] 2.3 Confirmar que `seniority-card.tsx` no necesita cambios (deriva el tono por índice de `accentTones`) y que "Avanzado" resuelve a `gold`.
- [x] 2.4 En `packages/components/src/progress.tsx`, extender la unión `SegmentedBarSegment` con la tercera rama `{ tone: AccentTone }`, excluyente con `role` y `color`, siguiendo la forma de las dos existentes.
- [x] 2.5 Agregar el mapa literal `accentToneClasses: Record<AccentTone, string>` con `bg-accent-<matiz>-fill`, con el comentario del JIT de Tailwind, y resolver la clase del segmento en el orden `tone` → `color` → `role`.
- [x] 2.6 Documentar la prop nueva con su comentario de documentación, incluyendo cuándo corresponde cada vocabulario (estado / categórico / ordinal).
- [x] 2.7 Correr `pnpm --filter @tuya-ui/components verify:colors` y `tsc --noEmit`.

## 3. Pruebas

- [x] 3.1 Revisar `seniority-card.test.tsx` y `level-meter.test.tsx`: actualizar toda aserción que nombre `teal` o `bg-accent-teal-fill` al matiz nuevo.
- [x] 3.2 Agregar a la suite la prueba de `SegmentedBar` con tono de acento: un segmento con `tone` recibe la clase `bg-accent-<matiz>-fill` y no una clase semántica `-bold`; los segmentos con `role` y `color` siguen exactamente como antes.
- [x] 3.3 Correr `pnpm --filter @tuya-ui/components test` completo y confirmar verde.

## 4. Documentación

- [x] 4.1 Revisar la sección de acento de `apps/docs/src/content/fundamentos.tsx`: swatches y tabla derivan de `accentColorNames` y se regeneran solos; actualizar la prosa que describa la progresión o nombre al turquesa, y la nota del par más ajustado si cambió.
- [x] 4.2 Actualizar `apps/docs/src/content/level-meter.tsx` y los ejemplos `01-escala-de-cuatro.tsx` y `02-otra-longitud-de-escala.tsx`, que nombran `teal`.
- [x] 4.3 Actualizar la página de SegmentedBar (contenido y ejemplos de `progress`): documentar el tercer vocabulario con su criterio de uso y un ejemplo ejecutable de distribución ordinal con tonos de acento.
- [x] 4.4 Regenerar el registry (`pnpm --filter @tuya-ui/components generate:registry`) y confirmar que la tabla de props de SegmentedBar muestra la opción nueva.
- [x] 4.5 Levantar el sitio y revisar: fundamentos muestra el dorado con sus contrastes medidos, LevelMeter y SeniorityCard muestran la escala nueva, y la página de SegmentedBar documenta los tres vocabularios.

## 5. Distribución

- [x] 5.1 Crear el changeset `MINOR` de `@tuya-ui/tokens` y `@tuya-ui/components`: el tercer matiz pasa de turquesa a ocre dorado (cambio visual en todo lo que consume la escala, "Avanzado" incluido), el rename `teal` → `gold` es **BREAKING** para quien use la clase o el nombre directamente, y `SegmentedBar` gana el vocabulario de acento (aditivo).
- [x] 5.2 Correr `pnpm run build`, `pnpm test` y `pnpm lint` en la raíz.
- [x] 5.3 Correr `pnpm run publish:local` y confirmar que el `.tgz` trae el matiz nuevo y la rama `tone` de SegmentedBar.
- [x] 5.4 Avisar que `adopt-accent-scale-in-people-stats` (repo de la app) queda desbloqueado.

## 6. Cierre

- [x] 6.1 Registrar el hex final elegido para `gold` y sus cuatro contrastes medidos en el design.md de este change (sección Open Questions → resuelta).
- [x] 6.2 Verificar el orden de archivado: este change modifica dos requisitos que viven en el delta pendiente de `add-seniority-card-component`, así que aquél se archiva primero.
