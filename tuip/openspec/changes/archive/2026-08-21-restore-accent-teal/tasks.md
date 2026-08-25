## 1. Tokens

- [x] 1.1 En `packages/tokens/src/accent-colors.ts`, reemplazar `gold: { fill: "#AD7A0B" }` por `teal: { fill: "#2E97A3" }` (tercera posición), restaurar la fila del turquesa en la tabla de contraste del encabezado (3.46 / 3.32 / 3.15 / 5.17) y retirar la nota de `gold`/`warning` y el comentario del dorado sobre la entrada.
- [x] 1.2 Ajustar la prosa del encabezado que nombre al dorado (la frase "Un paso `gold`..." vuelve a `teal`).
- [x] 1.3 Correr `pnpm --filter @tuya-ui/tokens build` y `test`: el CSS emite `--color-accent-teal-fill` una sola vez, `gold` desapareció, y los 16 pares de acento pasan.

## 2. Componentes

- [x] 2.1 Renombrar `gold` → `teal` en `lib/accent-tone.ts` (tipo y lista, tercera posición), en el mapa de `level-meter.tsx` y en el mapa `accentToneClasses` de `progress.tsx`.
- [x] 2.2 Confirmar que `seniority-card.tsx` sigue sin necesitar cambios y que "Avanzado" resuelve a `teal`.
- [x] 2.3 Actualizar los tests que nombran `gold` (`level-meter.test.tsx`, `seniority-card.test.tsx`, `segmented-bar.test.tsx`) y correr `pnpm --filter @tuya-ui/components test` completo.

## 3. Documentación

- [x] 3.1 Revertir en `apps/docs/src/content/fundamentos.tsx` la prosa de `gold`/`warning` a su forma anterior (slate/neutral, blue/info) y la frase del dorado en el medidor.
- [x] 3.2 Actualizar `content/level-meter.tsx`, sus ejemplos, y los ejemplos de `progress` que usan `tone="gold"` (`05-barra-segmentada-ordinal.tsx`, `06-barra-segmentada-separada.tsx`) a `tone="teal"`; la mención "dorado en un listado" del contenido de level-meter vuelve a "turquesa".
- [x] 3.3 Regenerar el registry y verificar en el sitio: fundamentos muestra el turquesa con sus contrastes, la escala de SeniorityCard y LevelMeter se ve gris → azul → turquesa → morado, y la página de Progress muestra los ejemplos ordinales en turquesa.

## 4. Distribución

- [x] 4.1 Crear el changeset `MINOR` de ambos paquetes: el tercer matiz vuelve a turquesa `#2E97A3` por referencia de diseño (cambio visual en cascada, "Avanzado" incluido), rename `gold` → `teal` **BREAKING** para consumo directo del nombre.
- [x] 4.2 Correr `pnpm run build`, `pnpm test` y `pnpm lint` en la raíz.
- [x] 4.3 Correr `pnpm run publish:local` y confirmar que el `.tgz` trae `teal` en el tipo, el mapa y el CSS.
- [x] 4.4 Avisar que `redesign-seniority-distribution-card` (repo de la app) queda desbloqueado — y que la app **no debe reinstalar** antes de aplicar su propio rename.
