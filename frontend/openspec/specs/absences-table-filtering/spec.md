# absences-table-filtering Specification

## Purpose

Define cómo se acota y se recorre la tabla de ausencias del mes visible: qué controles ofrece su barra de herramientas, sobre qué conjunto de filas operan, cómo se combinan entre sí y con el cambio de mes, y qué se muestra cuando no queda ninguna fila.

## Requirements

### Requirement: La tabla ofrece un buscador por persona
La tabla SHALL ofrecer, en su barra de herramientas, un buscador que acota las filas a las ausencias cuya persona coincide con el texto escrito. La coincidencia SHALL ser parcial y no distinguir mayúsculas, minúsculas ni acentos.

#### Scenario: Buscar por parte del nombre
- **WHEN** el mes visible tiene ausencias de varias personas y el usuario escribe parte del nombre de una
- **THEN** la tabla muestra sólo las ausencias de las personas cuyo nombre contiene ese texto

#### Scenario: Búsqueda insensible a mayúsculas y acentos
- **WHEN** el usuario escribe "maria" y el mes tiene una ausencia de "María González"
- **THEN** esa ausencia aparece entre los resultados

#### Scenario: Vaciar el buscador
- **WHEN** el usuario borra lo escrito
- **THEN** la tabla vuelve a mostrar todas las ausencias del mes que pasen los demás filtros

### Requirement: La tabla ofrece filtros por tipo y por estado
La tabla SHALL ofrecer dos filtros de selección múltiple en su barra de herramientas: **Tipo** (Vacaciones, Permiso, Incapacidad) y **Estado** (Solicitada, Aprobada, Rechazada). Un filtro sin nada seleccionado NO SHALL acotar nada. Dentro de un mismo filtro, las opciones marcadas SHALL sumarse (una fila pasa si coincide con cualquiera de ellas).

#### Scenario: Filtrar por un estado
- **WHEN** el usuario marca "Solicitada" en el filtro de Estado
- **THEN** la tabla muestra sólo las ausencias solicitadas del mes

#### Scenario: Dos opciones del mismo filtro
- **WHEN** el usuario marca "Vacaciones" e "Incapacidad" en el filtro de Tipo
- **THEN** la tabla muestra las ausencias de cualquiera de esos dos tipos, y ninguna de tipo Permiso

#### Scenario: Filtro sin selección
- **WHEN** el usuario desmarca todas las opciones de un filtro
- **THEN** ese filtro deja de acotar y la tabla vuelve a considerar todas las filas del mes

### Requirement: Buscador y filtros se combinan
Cuando hay más de un control activo, una fila SHALL mostrarse sólo si cumple todos: el texto del buscador y cada filtro con opciones marcadas.

#### Scenario: Búsqueda y filtro a la vez
- **WHEN** el usuario busca una persona y además marca "Aprobada" en el filtro de Estado
- **THEN** la tabla muestra sólo las ausencias aprobadas de esa persona

### Requirement: La tabla se pagina
La tabla SHALL paginar las filas que quedan tras buscar y filtrar, mostrando en su pie la página actual, el total de filas resultantes y un selector de tamaño de página con las opciones 10, 20 y 50. SHALL arrancar en la página 1 con 10 filas por página.

#### Scenario: Mes con más filas que la página
- **WHEN** las filas resultantes superan el tamaño de página
- **THEN** la tabla muestra sólo las de la página actual y el pie permite avanzar y retroceder

#### Scenario: Cambiar el tamaño de página
- **WHEN** el usuario elige otro tamaño de página
- **THEN** la tabla muestra esa cantidad de filas por página y vuelve a la primera página

#### Scenario: Acotar mientras se está en una página posterior
- **WHEN** el usuario está en una página posterior a la primera y cambia la búsqueda o un filtro
- **THEN** la tabla vuelve a la primera página del nuevo resultado, sin dejarlo en una página que ya no existe

#### Scenario: Sin filas suficientes para paginar
- **WHEN** las filas resultantes caben en una sola página
- **THEN** el pie no ofrece navegación entre páginas

### Requirement: Lo que se acota son las filas del mes, no el resumen
Los controles SHALL operar únicamente sobre las filas del mes ya cargado, sin volver a pedir datos. Las cards del resumen SHALL seguir leyendo el mes completo, sin verse afectadas por la búsqueda ni por los filtros.

#### Scenario: El resumen no sigue al filtro
- **WHEN** el usuario filtra la tabla por un estado
- **THEN** las cards del mes siguen mostrando las mismas cifras que antes de filtrar

### Requirement: Cambiar de mes reinicia lo que se acota
Al cambiar el mes visible, la búsqueda, los filtros y la página SHALL volver a su estado inicial, de modo que el mes nuevo se vea entero.

#### Scenario: Ir al mes anterior con un filtro puesto
- **WHEN** el usuario tiene un filtro activo y salta al mes anterior
- **THEN** la tabla del mes nuevo se muestra sin filtros, sin búsqueda y en la primera página

### Requirement: Sin resultados se dice dentro de la tabla
Cuando la búsqueda o los filtros dejan la tabla sin ninguna fila, SHALL mostrarse un estado "Sin resultados" dentro de la tabla, conservando visibles la barra de herramientas y las cabeceras para poder deshacer lo que se acotó. Ese estado NO SHALL confundirse con el del mes sin ausencias.

#### Scenario: Filtro que no deja nada
- **WHEN** ninguna fila del mes cumple la búsqueda o los filtros activos
- **THEN** la tabla muestra "Sin resultados" en el cuerpo, con el buscador y los filtros todavía visibles y con lo que el usuario escribió o marcó

#### Scenario: Mes sin ninguna ausencia
- **WHEN** el mes visible no tiene ninguna ausencia, sin búsqueda ni filtros activos
- **THEN** se muestra el estado vacío del mes ("Sin ausencias en …") en lugar de la tabla, y no el de "Sin resultados"

### Requirement: La carga y el error no desmontan la barra
Los estados de carga y de error del mes SHALL mostrarse dentro de la tabla, bajo sus cabeceras, con la barra de herramientas montada, de modo que un filtro abierto no se cierre ni el buscador pierda el foco al recargar.

#### Scenario: Recarga tras aprobar una ausencia
- **WHEN** el usuario tiene el foco en el buscador y una acción de la tabla dispara una recarga del mes
- **THEN** el buscador conserva el foco y lo escrito, y la fila de carga aparece bajo las cabeceras

#### Scenario: Error de carga con la barra visible
- **WHEN** el mes no se puede cargar
- **THEN** el aviso de error se muestra dentro de la tabla y la barra de herramientas sigue visible
