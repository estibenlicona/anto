## 1. Requisitos previos y datos

- [x] 1.1 Confirmar que la app tiene reinstalado el paquete de tuip con `add-heatmap-primitives` —escala de atención, `PopoverAnchor` y `LevelMeter` con umbral— y que `add-span-skill-matrix` está aplicado; si falta alguno, avisar y acordar el orden antes de tocar código. Si se levanta el dev server, usar un puerto nuevo: con la misma versión del paquete el navegador reusa el anterior.
- [x] 1.2 Ampliar el adapter del span con el paso de atención por celda —derivado de cuántos niveles faltan— y con los tres estados que no son brecha distinguidos entre sí, incluido el que supera lo exigido.
- [x] 1.3 Exponer desde el adapter, por celda, cuántas personas del span tienen brecha en esa misma habilidad, tomándolo del mismo cálculo que alimenta el pie de la columna.
- [x] 1.4 Pruebas del adapter: la intensidad crece con la brecha; los tres estados sin brecha no comparten paso; superar lo exigido se distingue de estar justo al nivel; el conteo por columna del panel coincide con el del pie.

## 2. El mapa

- [x] 2.1 Celda: cuadro de tamaño uniforme con el color de su paso, activable con mouse y con teclado, y con nombre accesible que diga persona, habilidad y situación.
- [x] 2.2 Tabla: conservar la semántica de tabla y la columna de persona fija; encabezado de habilidad sin nombre a la vista —el nombre queda en el detalle de la celda— pero conservándolo como nombre accesible de la columna.
- [x] 2.3 Leyenda junto a la matriz, nombrando cada paso en palabras además del color.
- [x] 2.4 Comprobar que se conservan sin cambios los totales por fila y columna, el total del span, el conteo de pendientes, el acotado por grupo, el orden por brechas y el panel por habilidad.
- [x] 2.5 Pruebas del mapa: todas las celdas miden lo mismo con nombres de habilidad de largo distinto; una persona sin evaluar no cuenta; el estado vacío se conserva.

## 3. El detalle de la celda

- [x] 3.1 Un único panel controlado por la pantalla, anclado a la celda activa; se cierra con Escape o al activar fuera, y devuelve el foco a la celda.
- [x] 3.2 Contenido con brecha: persona y fecha de evaluación, nivel alcanzado con la marca del exigido, criterios faltantes de esa evaluación, cuántas personas más del span tienen brecha en esa habilidad, y la acción del plan o su ausencia.
- [x] 3.3 Variantes sin brecha y sin evaluar, con su propio contenido y su propio camino de salida.
- [x] 3.4 Enlaces al plan de la persona y al detalle de la habilidad.
- [x] 3.5 Pruebas del panel: las tres variantes, el conteo de la columna, el cierre con Escape y la apertura con teclado.

## 4. Cierre

- [x] 4.1 Typecheck, lint y suite completa sin regresiones frente al baseline conocido.

## 5. Verificación

- [x] 5.1 Con `pnpm dev:auth` y un puerto nuevo: comprobar que la matriz completa entra sin desplazarse, que los cuadros más intensos son las brechas más grandes, abrir una celda con brecha y verificar que los criterios son los de su evaluación y que el conteo coincide con el pie de esa columna, abrir una sin brecha y una sin evaluar, y confirmar que acotar y ordenar siguen funcionando. Anotar si 26 px resulta cómodo para apuntar y si el paso más bajo se distingue del neutro.
