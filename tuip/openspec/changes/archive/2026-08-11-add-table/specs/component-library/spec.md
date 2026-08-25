## ADDED Requirements

### Requirement: Estructura del componente Table
El componente Table SHALL presentar datos tabulares mediante elementos HTML nativos de tabla (`table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`), expuestos como el conjunto compuesto `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead` y `TableCell`.

#### Scenario: Semántica de tabla accesible a tecnologías de asistencia
- **WHEN** una tecnología de asistencia recorre una tabla construida con estos componentes
- **THEN** anuncia la estructura de filas y columnas usando la semántica nativa de tabla, sin roles ARIA agregados a mano

#### Scenario: Composición de las partes de la tabla
- **WHEN** se arma una tabla con `TableHeader`, `TableBody` y, opcionalmente, `TableFooter` dentro de `Table`
- **THEN** cada parte se renderiza con el elemento HTML de tabla que le corresponde, preservando el orden de cabecera, cuerpo y pie

### Requirement: Convención de alineación y datos ausentes en Table
La documentación de Table SHALL indicar que el texto se alinea a la izquierda, las columnas numéricas se alinean a la derecha con cifras tabulares, y un dato ausente se representa con el carácter "—" en vez de dejar la celda vacía.

#### Scenario: Consultar la convención de alineación
- **WHEN** alguien arma una tabla con una columna de valores numéricos
- **THEN** la documentación de Table indica que esa columna debe alinearse a la derecha con cifras tabulares, a diferencia de las columnas de texto

## MODIFIED Requirements

### Requirement: Catálogo inicial de componentes
El sistema SHALL proveer al menos los siguientes componentes React: Button, Input, Card, Badge, Select, Combobox y Table.

#### Scenario: Componente disponible en el catálogo
- **WHEN** se consulta la lista de componentes disponibles en el sistema de diseño
- **THEN** Button, Input, Card, Badge, Select, Combobox y Table aparecen como componentes instalables
