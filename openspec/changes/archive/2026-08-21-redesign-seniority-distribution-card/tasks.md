## 1. Dependencia y rename, en un solo paso

- [x] 1.1 Confirmar que `restore-accent-teal` (tuip) está aplicado y su `.tgz` publicado con `teal` en el tipo `AccentTone`, en los mapas y en el CSS.
- [x] 1.2 En el mismo paso: reinstalar la dependencia en `frontend/` **y** renombrar en `PeopleStatsCards.tsx` `"gold"` → `"teal"` y `bg-accent-gold-fill` → `bg-accent-teal-fill`. Correr el typecheck para confirmar que no queda ninguna referencia al dorado.
- [x] 1.3 Levantar la app y confirmar el efecto de la sola actualización: "Avanzado" vuelve a verse turquesa en el listado y en la card actual, sin regresiones en las demás pantallas.

## 2. La card nueva

- [x] 2.1 Definir junto al mapeo de tonos la constante de descriptores por nivel (1: "con acompañamiento", 2: "autónomo", 3: "resuelve y guía", 4: "referencia técnica"), con el comentario de que es lectura de negocio de esta pantalla y sube al catálogo si aparece otro consumidor.
- [x] 2.2 Reescribir la tercera card: encabezado con "DISTRIBUCIÓN POR SENIORITY" y el total como "N personas"; una fila por nivel en orden de escala con nombre, descriptor debajo, barra horizontal (track `bg-neutral-subtle` redondeado, relleno `bg-accent-<matiz>-fill` con ancho inline `count/axisMax`), porcentaje del total junto a la barra y conteo a la derecha.
- [x] 2.3 Implementar el eje común: máximo = mayor conteo redondeado al par siguiente (mínimo 4), marcas numéricas de 0 al máximo alineadas bajo las barras con posiciones inline.
- [x] 2.4 Implementar el pie separado por filete: "X% en avanzado o superior" (niveles 3+4 sobre el total) y "N requieren acompañamiento" (conteo del nivel 1), calculados de `bySeniority`.
- [x] 2.5 Quitar el uso de `SegmentedBar` en esta card y su import si ninguna otra lo usa; confirmar que las dos primeras cards no cambiaron.
- [x] 2.6 Manejar el caso de un nivel con conteo 0 (fila presente con barra vacía y 0%) y el de total 0 (la card no divide por cero; los porcentajes muestran 0%).

## 3. Pruebas

- [x] 3.1 Reescribir `PeopleStatsCards.test.tsx` para la representación nueva: una fila por nivel con su nombre y descriptor, la clase `bg-accent-<matiz>-fill` correcta por nivel (con `teal` en el tercero), el ancho inline esperado según el eje, y el porcentaje y conteo de cada fila.
- [x] 3.2 Probar las dos lecturas del pie con los datos del mock (18 personas: 2/5/7/4 → "61% en avanzado o superior", "2 requieren acompañamiento").
- [x] 3.3 Probar el redondeo del eje (máximo 7 → eje 8) y el caso de conteo 0 en un nivel.
- [x] 3.4 Correr `npx vitest run src/features/people` y `npm run lint`, sin regresiones nuevas frente al baseline conocido.

## 4. Verificación en pantalla

- [x] 4.1 Levantar `pnpm dev:auth`, entrar a Personas y comparar la card contra la imagen de referencia: filas, descriptores, barras turquesa/azul/gris/morado, porcentajes, conteos, eje y pie.
- [x] 4.2 Confirmar que ningún estilo cayó en el vacío (clases inexistentes en el CSS compilado): las barras tienen track y relleno visibles, el eje se alinea, el pie se separa con su filete.
- [x] 4.3 Confirmar la correspondencia de color con el listado por clase compartida (mismo `bg-accent-<matiz>-fill` en barra y medidor) y que las tres cards del resumen conviven sin desbordes.
