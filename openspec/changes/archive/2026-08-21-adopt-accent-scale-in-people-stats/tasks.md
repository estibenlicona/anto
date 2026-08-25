## 1. Dependencia del sistema de diseño

- [x] 1.1 Confirmar que el change `swap-accent-teal-for-gold` del repositorio `tuip` está aplicado y que su `pnpm run publish:local` dejó el `.tgz` con el matiz `gold` y la rama `tone` de `SegmentedBar`. Sin esto, nada de lo que sigue tipa.
- [x] 1.2 Reinstalar la dependencia en `frontend/` y comprobar que `AccentTone` incluye `gold`, que `SegmentedBarSegment` acepta `tone`, y que `styles.css` trae las cuatro clases `bg-accent-<matiz>-fill`.
- [x] 1.3 Levantar la app y confirmar el efecto esperado de la sola actualización: en el listado, "Avanzado" ya se muestra dorado en vez de turquesa, sin haber tocado este repo. Recorrer también las demás pantallas que consumen el paquete (Squads, Asignaciones, Home, Parámetros) para confirmar que nada más cambió.

## 2. Card de distribución

- [x] 2.1 En `PeopleStatsCards.tsx`, reescribir `SENIORITY_COLORS` como `Record<number, AccentTone>` — `{1: "slate", 2: "blue", 3: "gold", 4: "purple"}` — importando el tipo desde `@tuya-ui/components`, y actualizar el comentario del mapeo: el color ahora viene del vocabulario ordinal del sistema, no del categórico.
- [x] 2.2 Cambiar los segmentos de la barra de `color: SENIORITY_COLORS[...]` a `tone: SENIORITY_COLORS[...]`, con fallback `slate` para un nivel fuera del catálogo.
- [x] 2.3 Reescribir `LEGEND_DOT_CLASSES` con las clases literales `bg-accent-slate-fill` / `bg-accent-blue-fill` / `bg-accent-gold-fill` / `bg-accent-purple-fill`, conservando el comentario del JIT y con fallback `bg-accent-slate-fill`.
- [x] 2.4 Confirmar que no queda ninguna referencia de la card a los colores categóricos ni a las clases `-bold` semánticas para representar niveles.

## 3. Pruebas

- [x] 3.1 Agregar cobertura de la correspondencia: el punto de leyenda de cada nivel lleva la clase `bg-accent-<matiz>-fill` que corresponde a su posición en la escala — la misma clase, no un color computado ni un hex.
- [x] 3.2 Agregar la aserción de que la barra recibe tonos de acento y no colores categóricos (ninguna clase semántica `-bold` en los segmentos de la distribución).
- [x] 3.3 Correr `npx vitest run src/features/people` y `npm run lint` en `frontend/`, y confirmar que no hay regresiones nuevas frente al baseline conocido (2 fallos preexistentes: `App.test.tsx` y `httpClient.test.ts`; 3 errores de lint preexistentes por `setState` en efectos de hooks no tocados).

## 4. Verificación en pantalla

- [x] 4.1 Levantar `pnpm dev:auth`, entrar a Personas y confirmar que los segmentos de la barra y los puntos de la leyenda muestran los cuatro matices de la escala: gris, azul, dorado, morado.
- [x] 4.2 Comparar la card contra el listado: el matiz de cada nivel en la leyenda es el mismo que en el medidor de las filas — un solo código de color en la pantalla.
- [x] 4.3 Confirmar que las otras dos cards del resumen (Personas activas, FTE disponible) no cambiaron.

## 5. Cierre

- [x] 5.1 Antes de archivar, revisar el delta de `specs/people/spec.md`: está escrito sobre el texto pendiente de `add-identity-avatar-colors` para "Resumen del módulo de Personas". Si aquél cambió o se abandonó, reconciliar. Orden recomendado: `add-identity-avatar-colors` primero, éste después.

  **Resultado de la revisión (al aplicar este change):** el delta de `add-identity-avatar-colors` sigue intacto — su oración de avatares y sus seis escenarios de "Resumen" son los mismos sobre los que esta unión se escribió, así que no hubo nada que reconciliar. La recomendación de orden queda en pie: si éste archiva último de los dos, tampoco se pierde nada, porque su texto ya incluye el de aquél.
