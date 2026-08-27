## Purpose

Define cómo se compone la vista de competencias del chapter lead (la matriz de brechas): qué bloques la forman y en qué orden, dónde vive el contador de brechas a la vista, cómo se llega a evaluar a una persona, y cómo se mantiene el encabezado accesible sin ocupar espacio visible.

## ADDED Requirements

### Requirement: La vista abre con el resumen, sin encabezado de módulo visible
La vista de competencias NO SHALL mostrar un título de módulo ni una descripción visibles: el nombre de la pantalla ya lo da el breadcrumb del shell ("Competencias"). El primer bloque visible del contenido SHALL ser el resumen del chapter (cards), seguido de los controles y la matriz. La vista NO SHALL publicar acciones en la franja del breadcrumb.

#### Scenario: Primer pantallazo con evaluaciones cerradas
- **WHEN** el usuario entra a `/app/lead/competencias` y hay evaluaciones cerradas
- **THEN** no se muestra ningún texto "Competencias" ni "Brecha entre el nivel que pide cada cargo…" como encabezado de la vista
- **AND** las cards de resumen son el primer bloque visible del contenido, y la fila de controles y la matriz van inmediatamente después

#### Scenario: Franja del breadcrumb sin acciones
- **WHEN** el usuario está en `/app/lead/competencias`
- **THEN** la franja del breadcrumb muestra sólo el breadcrumb, sin acciones a la derecha

### Requirement: La página conserva un único encabezado de nivel 1 accesible
La página SHALL exponer exactamente un encabezado de nivel 1 con el texto "Competencias", disponible para tecnologías de asistencia pero no visible en pantalla.

#### Scenario: Navegación por encabezados con lector de pantalla
- **WHEN** un lector de pantalla enumera los encabezados de `/app/lead/competencias`
- **THEN** encuentra un único encabezado de nivel 1 con el texto "Competencias"
- **AND** ese encabezado no ocupa espacio visible en la vista

### Requirement: Una fila de notas sobre el mapa reúne el aviso de pendientes y el contador de brechas
Cuando la matriz tiene contenido, encima del filtro de habilidades SHALL haber una fila de notas con el aviso de evaluaciones pendientes a la izquierda (si lo hay) y, a la derecha, cuántas brechas hay a la vista, con la cifra que sigue al recorte de habilidades vigente. Cuando la matriz está acotada a un grupo de habilidades, el contador y el aviso de que los totales cuentan sólo las habilidades visibles SHALL leerse como una sola frase, sin repetir "a la vista". Sin matriz (carga, error o sin evaluaciones cerradas) la fila NO SHALL mostrarse.

#### Scenario: Matriz completa
- **WHEN** la matriz muestra todas las habilidades y hay seis brechas
- **THEN** la fila de notas muestra a la derecha "6 brechas a la vista", en la misma fila que el aviso de pendientes, y no aparece ningún aviso de recorte

#### Scenario: Matriz acotada a un grupo
- **WHEN** el usuario acota la matriz a las habilidades técnicas y quedan a la vista cinco de nueve habilidades
- **THEN** la fila de notas muestra a la derecha una sola frase con el número de brechas a la vista y el aviso de que los totales cuentan sólo esas cinco habilidades visibles, de nueve

#### Scenario: Sin pendientes
- **WHEN** todas las personas tienen evaluación cerrada
- **THEN** la fila de notas muestra sólo el contador, alineado a la derecha

### Requirement: El filtro de habilidades va pegado al mapa y el orden es fijo por brechas
El filtro de habilidades visibles (Todas / Técnicas / Humanas) SHALL mostrarse inmediatamente encima de la matriz, dentro de su misma zona y alineado con ella. La matriz SHALL ordenarse siempre por brechas, de mayor a menor, y NO SHALL ofrecer un control para cambiar el orden.

#### Scenario: Filtro sobre el mapa
- **WHEN** la matriz se muestra
- **THEN** el filtro de habilidades es lo único entre la fila de notas y la matriz, alineado al borde izquierdo del mapa

#### Scenario: Sin control de orden
- **WHEN** la matriz se muestra
- **THEN** no hay opción "Por brechas" / "Por nombre"; las filas van de más brechas a menos, como antes por defecto

#### Scenario: Una sola brecha
- **WHEN** la matriz a la vista tiene exactamente una brecha
- **THEN** el contador dice "1 brecha a la vista", en singular

#### Scenario: Sin matriz
- **WHEN** la vista está cargando, muestra un error o no hay evaluaciones cerradas
- **THEN** no se muestra ningún contador de brechas ni la fila de controles

### Requirement: Evaluar a una persona se ofrece desde el detalle de la celda, no desde el aviso de pendientes
El aviso de evaluaciones pendientes ("N personas sin evaluación cerrada. Sin evaluación cerrada no hay brecha que medir.") SHALL mostrarse sin ningún botón de acción. La acción de evaluar SHALL seguir ofreciéndose desde el detalle de una celda, para la persona y la competencia de esa celda.

#### Scenario: Aviso de pendientes sin botón
- **WHEN** hay personas sin evaluación cerrada y la matriz se muestra
- **THEN** el aviso de pendientes se lee bajo los controles sin botón "Abrir evaluaciones"

#### Scenario: Evaluar desde el detalle de una celda
- **WHEN** el usuario abre el detalle de una celda de la matriz
- **THEN** el detalle ofrece la acción "Evaluar a <persona>" para esa persona, igual que antes de este cambio

### Requirement: La leyenda del mapa vive en la columna de apoyo
La leyenda de colores del mapa ("Dónde enfocarse") SHALL mostrarse en la columna de apoyo, junto a las demás cards (detalle de celda, brechas concentradas, pendientes de gestión), y no debajo del mapa.

#### Scenario: Leyenda junto al mapa
- **WHEN** la matriz se muestra
- **THEN** la leyenda aparece como una card más de la columna de apoyo, al lado del mapa, y debajo del mapa no queda ninguna card

#### Scenario: La columna de apoyo aprovecha el ancho disponible
- **WHEN** al lado del mapa sobra ancho para más de una card
- **THEN** las cards de la columna de apoyo se reparten en varias columnas (hasta tres) en vez de apilarse en una sola dejando el resto en blanco; con menos ancho se apilan, y si no caben al lado del mapa bajan debajo de él a ancho completo

### Requirement: La vista usa un espaciado vertical compacto
El espacio vertical entre los bloques del contenido (resumen, controles, aviso de pendientes y matriz) SHALL ser de 8px (`gap-2`), no de 24px, de modo que la matriz entre lo más arriba posible en el primer pantallazo.

#### Scenario: Separación entre bloques
- **WHEN** la vista muestra las cards de resumen, los controles y la matriz
- **THEN** la separación vertical entre bloques consecutivos es de 8px
