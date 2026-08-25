## 1. Requisitos previos y datos

- [x] 1.1 Verificado: `add-skills-catalog` (14/14) y `add-skill-assessment` (14/14) aplicados. El paquete de tuip con `add-matrix-table-primitives` estaba empacado pero **no reinstalado** en la app: se corrió el reinstall, y ahora la app tiene `density="matrix"`, `stickyFirstColumn` y la fila con detalle. **Orden de archivado: modernize-table-suite → add-matrix-table-primitives (tuip); add-skills-catalog → add-skill-assessment → add-span-skill-matrix (app).**
- [x] 1.2 `careerPlanService` + adapter del agregado del span: matriz de personas × habilidades activas con el nivel de cada celda, la marca de brecha calculada contra el rol de cada persona, los totales por fila y columna, y el conteo de pendientes de evaluar.
- [x] 1.3 Pruebas del adapter: dos roles con exigencias distintas sobre el mismo nivel, rol sin nivel declarado, persona sin evaluar excluida de los totales, y totales recalculados al acotar habilidades.

## 2. La matriz

- [x] 2.1 Construir la matriz sobre la `Table` nueva: columna de persona fija, densidad de matriz, columnas agrupadas en técnicas y humanas.
- [x] 2.2 Celda: medidor de cuatro pasos con el nivel evaluado, marca de brecha con cuántos niveles faltan, y celda sin dato para quien no tiene evaluación cerrada.
- [x] 2.3 Totales por columna y por fila, total del span, y la línea que informa cuántas personas están pendientes de evaluar.
- [x] 2.4 Acotar habilidades (por grupo o eligiéndolas) y ordenar filas y columnas por brechas, dejando dicho que los totales siguen a lo visible.
- [x] 2.5 Estado vacío cuando todavía no hay ninguna evaluación cerrada.
- [x] 2.6 Pruebas de la matriz (celdas, marcas, totales, pendientes, acotar y ordenar).

## 3. Detalle por habilidad

- [x] 3.1 Drawer que agrupa a las personas evaluadas por el nivel que sacaron, de menor a mayor, con su rol y la marca de al nivel o con brecha; un nivel sin nadie se muestra igual.
- [x] 3.2 Encabezado del drawer con el reparto del span en esa habilidad, cuántas tienen brecha y cuántas quedan sin evaluar.
- [x] 3.3 Pruebas del drawer, incluida la de dos personas en el mismo nivel con situaciones distintas.

## 4. Ruta y navegación

- [x] 4.1 Registrar `/app/lead/plan-carrera`, la entrada "Plan de carrera" en el grupo Capacidad y el breadcrumb; ajustar las pruebas del shell y de rutas.
- [x] 4.2 Typecheck, lint y suite completa sin regresiones frente al baseline conocido.

## 5. Verificación

- [x] 5.1 Con `pnpm dev:auth`: recorrer la matriz a lo ancho comprobando que la columna de persona no se pierde, verificar que dos personas en el mismo nivel con roles distintos se marcan distinto, acotar a las técnicas y confirmar que los totales acompañan, y abrir una habilidad para ver a las personas agrupadas por nivel.
