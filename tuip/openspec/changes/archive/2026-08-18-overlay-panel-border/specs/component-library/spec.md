## MODIFIED Requirements

### Requirement: Comportamiento compartido de Modal y Drawer
Modal y Drawer SHALL atrapar el foco de teclado dentro de su propio contenido mientras están abiertos, SHALL cerrarse con la tecla Escape, y SHALL devolver el foco al elemento que los abrió al cerrarse. Un Modal no SHALL abrir otro Modal. El panel de ambos SHALL delimitarse contra lo que tiene detrás por un trazo propio en su contorno, y NO SHALL depender únicamente de su sombra: una sombra proyectada deja el borde superior sin definir, así que por sí sola no delimita. Ese trazo SHALL ser el mismo que usan las demás superposiciones de panel claro del catálogo, de modo que la familia se lea con un solo criterio.

#### Scenario: Foco atrapado
- **WHEN** un Modal o un Drawer está abierto y el usuario navega con Tab
- **THEN** el foco recorre solo los elementos dentro del Modal o Drawer, sin salir hacia el resto de la página

#### Scenario: Cerrar con Escape
- **WHEN** un usuario presiona Escape con un Modal o un Drawer abierto
- **THEN** se cierra

#### Scenario: El foco vuelve al disparador
- **WHEN** un Modal o un Drawer se cierra, por cualquier medio
- **THEN** el foco vuelve al elemento que lo abrió

#### Scenario: Sin anidamiento de modales
- **WHEN** se diseña un flujo que abre un Modal
- **THEN** ese Modal no SHALL abrir otro Modal encima — una confirmación adicional se resuelve dentro del mismo Modal, no apilando uno nuevo

#### Scenario: El borde superior del panel queda definido
- **WHEN** se abre un Modal o un Drawer sobre un fondo claro
- **THEN** su contorno lo delimita por los cuatro lados, incluido el superior, donde la sombra no llega

#### Scenario: La familia de panel claro comparte trazo
- **WHEN** se comparan los paneles de Modal y Drawer con los de las demás superposiciones de panel claro
- **THEN** todos se delimitan con el mismo trazo, sin que unas lo lleven y otras no

#### Scenario: Las superposiciones de superficie oscura no lo requieren
- **WHEN** una superposición se apoya en una superficie oscura que ya la separa de la página, como una burbuja de ayuda o un aviso
- **THEN** no necesita trazo propio: su superficie cumple esa función
