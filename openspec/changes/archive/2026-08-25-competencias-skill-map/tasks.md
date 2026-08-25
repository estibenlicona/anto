## 1. El rename

- [x] 1.1 Rutas: `/app/lead/plan-carrera` → `/app/lead/competencias` y `/app/lead/plan-carrera/:personId` → `/app/lead/competencias/:personId` en `routes.tsx`, sin redirección desde la vieja.
- [x] 1.2 Navegación: etiqueta, `href` y mapa de breadcrumbs en `chapter-lead-shell/navigation.ts` pasan a "Competencias".
- [x] 1.3 Actualizar los tres puntos que navegan hacia allá: `SpanMatrixContainer`, `PersonDetailContainer` y `PersonDetailHeader`; y el título de `PlanActionsTable`.
- [x] 1.4 Encabezado de la pantalla: título "Competencias" y descripción acorde a lo que la pantalla hace ahora.
- [x] 1.5 Actualizar `navigation.test.ts`, `routes.test.tsx` y las pruebas del módulo que apuntan a la ruta vieja; que no quede ninguna referencia a `plan-carrera`.

## 2. La sigla de dos letras

- [x] 2.1 Escribir `skillInitials(name)` en `shared`, junto a la lógica de iniciales de personas: dos primeras palabras significativas, o dos primeras letras si es una sola palabra; conectores en minúscula ignorados.
- [x] 2.2 Cubrirla con pruebas: una palabra, una frase, una frase con conector, un nombre con puntuación ("Node.js"), y un nombre de una sola letra.
- [x] 2.3 Usarla en los encabezados de `SpanMatrixTable`, con `Tooltip` para el nombre completo y conservando el nombre accesible de la columna.

## 3. El resumen del span

- [x] 3.1 Declarar `SpanSummaryDto` y `getSpanSummary()` en `careerPlanService`, con la forma acordada en el diseño (totales, cobertura, personas en riesgo, ciclo anterior, serie, top de habilidades y pendientes).
- [x] 3.2 Servir `GET /career-plan/span/summary` en `career-plan.handlers.ts`, calculando sobre las evaluaciones cerradas y los planes del mock — no sobre la página ni el filtro.
- [x] 3.3 Sembrar evaluaciones cerradas de ciclos anteriores para un subconjunto del chapter, sin alterar los datos del ciclo vigente.
- [x] 3.4 Probar el handler: brechas críticas contra totales, cobertura, personas en riesgo, `previousCycle: null` cuando no hay historial, top de habilidades ponderado por tamaño, y los cuatro pendientes.
- [x] 3.5 Probar que el plan individual y la matriz siguen tomando la evaluación del ciclo vigente después de sembrar el historial.

## 4. Los indicadores

- [x] 4.1 Componer las cuatro cards con el patrón de cards de resumen que ya usan Iniciativas y Personas: brechas críticas, cobertura, variación y personas en riesgo.
- [x] 4.2 Variación: signo a la vista, baja como mejora, y el caso "sin ciclo anterior" dicho en palabras en lugar de un cero.
- [x] 4.3 La serie de ciclos: buscar primero en tuip un componente que la cubra (`Meter`, `Progress`, `SegmentedBar`); si no existe, crear la variante en tuip con su propio change y usarla acá. No dibujar la serie a mano en el frontend.
- [x] 4.4 Personas en riesgo: avatares con las iniciales y el color de identidad que ya usa Personas, excedente resumido, y el camino a verlas todas.
- [x] 4.5 Probar que las cuatro cards no cambian al filtrar la matriz por técnicas o humanas.

## 5. La matriz

- [x] 5.1 `SpanControls` ya ofrecía las pestañas Todas · Técnicas · Humanas y el orden por brechas o por nombre con el control segmentado del catálogo: se conserva tal cual.
- [x] 5.2 Rotular los grupos (TÉCNICAS · HUMANAS) sobre las columnas que les corresponden, ajustándose al recorte activo.
- [x] 5.3 Mostrar el rol de cada persona bajo su nombre en la columna fija.
- [x] 5.4 Columna de brechas por fila y pie con cuántas personas tienen brecha por habilidad, ambos siguiendo el recorte activo.
- [x] 5.5 Aviso de personas sin evaluar con su explicación y la acción de abrir esas evaluaciones.
- [x] 5.6 Leyenda con los tres tamaños de brecha y los dos casos que no son brecha.
- [x] 5.7 Probar: los totales de fila cambian al recortar a un grupo; la persona sin evaluar no suma; los encabezados muestran sigla y no nombre completo.

## 6. La columna de apoyo

- [x] 6.1 Sacar `SpanCellDetail` del `Popover` y montarlo en la columna derecha, conservando el foco, el cierre con Escape y la apertura por teclado.
- [x] 6.2 Mantener marcada la celda activa en la matriz para no perder la relación entre la celda y su detalle.
- [x] 6.3 En el detalle: rol de la persona, tamaño de la brecha nombrado, y la distinción entre la que se cierra acompañando y la que exige plan formal.
- [x] 6.4 Bloque de habilidades que concentran la brecha, ponderado por tamaño, presentado como dato del chapter y oculto cuando no hay ninguna brecha.
- [x] 6.5 Bloque de pendientes de gestión, con las cuatro filas siempre presentes —cero incluido— y su camino para atenderlas.
- [x] 6.6 Probar: sin celda activa la columna no deja hueco; al cerrar el detalle la matriz conserva su desplazamiento.

## 7. Cierre

- [x] 7.1 Type-check y suite del frontend sin regresiones; ninguna referencia viva a `plan-carrera`.
- [x] 7.2 Recorrer la pantalla contra los mocks: filtrar por grupo, ordenar, abrir una celda con brecha, una al nivel y una sin evaluar, y comprobar que las cards no se mueven con el filtro.
