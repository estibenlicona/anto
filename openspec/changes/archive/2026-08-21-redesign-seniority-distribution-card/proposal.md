## Why

El usuario entregó una card de referencia para "Distribución por seniority" que dice más que la actual con el mismo dato. La card vigente muestra una barra apilada de proporciones y una leyenda 2×2 con conteos; la referencia muestra **una fila por nivel** — nombre, un descriptor corto de qué significa el nivel, una barra horizontal proporcional al conteo sobre un eje común, el porcentaje del total y el conteo — más un pie con dos lecturas de negocio calculadas: qué porcentaje del equipo está "en avanzado o superior" y cuántas personas "requieren acompañamiento". La referencia convierte la card de un gráfico decorativo en una lectura: no sólo cuántos hay de cada nivel, sino qué implica esa distribución para el chapter.

Los colores de la referencia son la escala de acento del sistema — muestreados píxel a píxel: `#8B8B93`, `#3B7ACB`, `#2E97A3`, `#8A63D2` — con el turquesa original de vuelta para "Avanzado". La restauración del turquesa la hace el change `restore-accent-teal` en `tuip`; este change es el rediseño de la card y el consumo del matiz restaurado.

## What Changes

- **La card de distribución se reconstruye con el layout de la referencia**: encabezado con el total ("N personas"), una fila por nivel del catálogo con nombre, descriptor, barra horizontal proporcional al conteo, porcentaje del total y conteo; un eje horizontal común con marcas numéricas; y un pie con las dos lecturas calculadas — porcentaje en Avanzado o superior, y cuántas personas requieren acompañamiento (las de nivel Principiante, cuyo descriptor es justamente "con acompañamiento").
- **Las barras dejan de ser `SegmentedBar`**: la referencia no es una barra de proporciones (partes de un todo) sino un gráfico de barras por categoría contra un eje común — otra forma que el sistema no tiene como pieza. Se compone en la app con las clases de relleno de acento que el paquete ya distribuye, que siguen siendo la única fuente de color por nivel.
- **El tono del tercer nivel vuelve a `teal`**: el mapeo y la clase de la leyenda cambian `gold` → `teal`, en el mismo apply en que se reinstala el paquete — el `.tgz` nuevo hace que `gold` deje de tipar, así que rename y reinstalación son un solo movimiento.
- **Los descriptores por nivel son de la app**: "con acompañamiento", "autónomo", "resuelve y guía", "referencia técnica" (de la referencia). El catálogo HTTP no los trae y el sistema de diseño no define contenido de negocio; viven como constante de la card, junto al mapeo de tonos.

### Fuera de alcance

- Las otras dos cards del resumen (Personas activas, FTE disponible).
- Cambios de datos, mocks o contrato HTTP: todo lo que la card nueva muestra se calcula de `bySeniority` y `activeCount`, que ya llegan.
- Agregar el gráfico de barras por categoría como componente de `tuip`: con un solo consumidor se compone en la app; si aparece un segundo, la extracción se propone allá.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `people`: "Resumen del módulo de Personas" cambia la presentación de la distribución — de barra de proporciones con leyenda a una fila por nivel con barra, descriptor, porcentaje y conteo sobre un eje común — y suma las dos lecturas calculadas del pie (MODIFIED).

## Impact

- **Dependencias**: `@tuya-ui/components` y `@tuya-ui/tokens` se reinstalan desde el `.tgz` que publica `restore-accent-teal`. Sin ese change aplicado, éste no puede empezar. **La reinstalación y el rename `gold` → `teal` de esta card van juntos**: reinstalar sin renombrar rompe el typecheck.
- **Card**: `frontend/src/features/people/components/PeopleStatsCards.tsx` — la tercera card se reescribe; las dos primeras no se tocan. `SegmentedBar` deja de importarse ahí si ninguna otra card lo usa.
- **Pruebas**: `PeopleStatsCards.test.tsx` se reescribe para la representación nueva — filas por nivel, clases de acento compartidas con el listado (con `teal`), porcentajes y las dos lecturas del pie.
- **Restricción de CSS**: la app no compila Tailwind; sólo puede usar clases presentes en el CSS del paquete. Los anchos de barra van por estilo inline (como ya hace `SegmentedBar`) y las clases necesarias se verifican durante la implementación.
- **Sin impacto**: backend, mocks, catálogos, listado, las otras cards.
