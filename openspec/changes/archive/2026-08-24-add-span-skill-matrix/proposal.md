## Why

El Chapter Lead gestiona personas, no equipos, y necesita ver de una vez dónde está parado su span: quién está en qué nivel de cada habilidad y cuántas brechas concentra cada una. Con el catálogo (`add-skills-catalog`) y las evaluaciones (`add-skill-assessment`) el dato ya existe, pero no hay ninguna pantalla que lo lea.

El diseño aprobado (canvas "Plan de Carrera del Chapter") ofreció dos lecturas y el usuario eligió la **propuesta B**: una fila por persona, una columna por habilidad, una celda por nivel evaluado, con la brecha marcada donde alguien no llega a lo que pide su rol. Se descartó la lectura por habilidad como pantalla principal —queda anotada como posible vista compacta futura— porque no responde "quién está en qué nivel" sin abrir nada.

## What Changes

- Nueva pantalla **Plan de carrera** en `/app/lead/plan-carrera`: la matriz del span, con una fila por persona del chapter y una columna por habilidad activa.
- **Celda**: el nivel evaluado de esa persona en esa habilidad, dibujado con el medidor de cuatro pasos de la escala Tuya, y marcada cuando queda por debajo del nivel que pide **su** rol, indicando cuántos niveles le faltan. Una persona sin evaluar muestra sus celdas vacías, no un cero.
- **Totales**: por columna, cuántas personas tienen brecha en esa habilidad; por fila, cuántas brechas tiene esa persona; y el total del span.
- **La columna de persona queda fija** al desplazar la matriz a lo ancho, y las habilidades visibles se pueden acotar; filas y columnas se ordenan por brechas.
- **Drawer por habilidad**: al abrir una columna, un panel lista a las personas agrupadas por el nivel que sacaron, marcando dentro de cada nivel quién está al nivel y quién con brecha — porque dos personas en el mismo peldaño pueden estar una bien y otra corta, según lo que pida su rol.
- Nueva entrada **Plan de carrera** en el grupo "Capacidad" del menú del Chapter Lead.

### Fuera de alcance

- El perfil individual con el detalle de criterios y el plan de acciones: es el change siguiente (`add-individual-career-plan`).
- La lectura por habilidad en filas (propuesta A) como vista alterna: queda anotada, no se implementa acá.
- Exportar la matriz.

## Capabilities

### New Capabilities

- `career-plan`: la lectura del span — matriz de personas × habilidades con sus brechas, y el detalle por habilidad.

### Modified Capabilities

- `chapter-lead-shell`: la navegación lateral gana la entrada "Plan de carrera".

## Impact

- Frontend: nueva feature `src/features/career-plan` (service, adapter, hooks, contenedor de la matriz, drawer por habilidad), página y ruta.
- Datos: consume los snapshots de evaluaciones cerradas y del catálogo; no agrega handlers propios más allá del agregado del span.
- **tuip**: depende de `add-matrix-table-primitives` (columna fija, densidad `matrix`). Ese change debe estar publicado y reinstalado en la app antes de aplicar éste.
- **Orden**: después de `add-skills-catalog` y `add-skill-assessment`; la delta de navegación es unión con los changes activos que también tocan el menú del Chapter Lead.
