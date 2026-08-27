## Purpose

Permite que la pantalla activa del shell del chapter lead coloque sus acciones principales en la franja del breadcrumb, a la derecha, en lugar de gastar una fila propia dentro del contenido.

## ADDED Requirements

### Requirement: La pantalla activa puede publicar acciones en la franja del breadcrumb
El shell del chapter lead SHALL mostrar, en la misma franja horizontal del breadcrumb y alineadas a la derecha, las acciones que la pantalla activa publique. Las acciones SHALL quedar a la misma altura que el breadcrumb (centradas verticalmente en la franja) y SHALL retirarse cuando la pantalla que las publicó deja de estar montada.

#### Scenario: Pantalla con acción publicada
- **WHEN** la pantalla activa publica un botón como acción
- **THEN** el botón se muestra en la franja del breadcrumb, a la derecha, alineado verticalmente con el breadcrumb
- **AND** el breadcrumb sigue mostrándose a la izquierda con sus niveles habituales

#### Scenario: Cambio a una pantalla sin acciones
- **WHEN** el usuario navega de una pantalla que publicó acciones a otra que no publica ninguna
- **THEN** la franja del breadcrumb deja de mostrar esas acciones y se ve como antes de este cambio

#### Scenario: Pantalla montada fuera del shell
- **WHEN** una pantalla que publica acciones se renderiza sin el shell del chapter lead (por ejemplo, en un test aislado)
- **THEN** la pantalla funciona igual y simplemente no hay dónde mostrar las acciones; no falla ni requiere el shell

### Requirement: La franja y el contenido usan padding vertical corto
La franja del breadcrumb y la columna de contenido del shell SHALL usar un padding vertical de 8px cada una, de modo que entre el breadcrumb y el primer bloque de la pantalla haya 16px en total.

#### Scenario: Distancia entre el breadcrumb y el contenido
- **WHEN** se muestra cualquier pantalla del shell del chapter lead
- **THEN** el primer bloque del contenido arranca 16px por debajo del borde inferior de la franja del breadcrumb
