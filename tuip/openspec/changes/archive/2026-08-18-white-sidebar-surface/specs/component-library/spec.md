## MODIFIED Requirements

### Requirement: Ítem activo del Sidebar
El ítem activo de Sidebar SHALL distinguirse de los demás por al menos tres señales simultáneas — un riel de color a su izquierda, un fondo distinto y un peso de texto mayor — y ninguna de esas señales SHALL depender únicamente del color. Su fondo SHALL distinguirse además del de la propia barra que lo contiene, y NO SHALL coincidir con ella: un fondo que iguala a su superficie deja de ser una señal, aunque el requisito de llevar fondo se cumpla en el papel. El fondo del ítem activo SHALL distinguirse también del que muestran los ítems inactivos al pasar el puntero, de modo que activo, hover y reposo se lean como tres estados y no como dos.

#### Scenario: Tres señales a la vez
- **WHEN** se renderiza un ítem activo junto a ítems inactivos
- **THEN** el ítem activo muestra riel, fondo y peso de texto distintos a los inactivos, no solo un color diferente

#### Scenario: El estado no depende del color
- **WHEN** una persona que no distingue el color del riel navega el Sidebar
- **THEN** puede identificar el ítem activo por su fondo y su peso de texto, sin depender del riel

#### Scenario: El fondo del ítem activo no iguala al de la barra
- **WHEN** se renderiza un ítem activo sobre la superficie del Sidebar
- **THEN** su fondo se distingue del de la barra, de modo que la señal siga existiendo

#### Scenario: Activo, hover y reposo son tres estados distinguibles
- **WHEN** se comparan un ítem activo, uno inactivo con el puntero encima y uno inactivo en reposo
- **THEN** los tres se distinguen entre sí, sin que el activo se confunda con el que está en hover

## ADDED Requirements

### Requirement: La superficie del Sidebar se distingue del lienzo
El Sidebar SHALL presentarse sobre una superficie propia, distinta de la del lienzo de la página que sostiene el contenido, de modo que la navegación y el área de trabajo se lean como dos planos y no como uno partido por un filete. Esa superficie SHALL ser la misma que usa la barra superior en su variante clara, para que el shell se lea como una sola pieza en vez de como dos zonas con criterios distintos.

#### Scenario: Sidebar y contenido son dos planos
- **WHEN** se renderiza el Sidebar junto al área de contenido
- **THEN** cada uno se apoya en una superficie distinta, sin depender únicamente del filete que los separa para diferenciarse

#### Scenario: El shell comparte una superficie
- **WHEN** se comparan la barra superior en su variante clara y el Sidebar
- **THEN** ambos usan la misma superficie, de modo que la navegación se lea como una sola pieza
