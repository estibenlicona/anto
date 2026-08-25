## ADDED Requirements

### Requirement: Trazo de límite translúcido
El sistema SHALL exponer un token de borde neutro translúcido, destinado a insinuar el límite de un control o de un contenedor sin declararlo con el peso de un trazo opaco. Por ser translúcido SHALL componerse sobre la superficie que tenga debajo, de modo que un mismo valor sirva en modo claro y en modo oscuro sin definirse dos veces. Este token NO SHALL presentarse como apto para cumplir el mínimo de contraste de elementos no textuales: su propósito es de refinamiento visual, y la documentación SHALL decirlo para que nadie lo elija creyendo que delimita un componente de forma accesible.

#### Scenario: Se comporta igual en ambos modos
- **WHEN** el trazo translúcido se dibuja sobre una superficie clara y sobre una oscura
- **THEN** en cada caso se compone sobre la superficie que tiene debajo y conserva una presencia equivalente, sin requerir un valor propio por modo

#### Scenario: No se ofrece como límite accesible
- **WHEN** alguien consulta la documentación de tokens para elegir el borde de un control
- **THEN** el trazo translúcido aparece descrito como refinamiento visual, y se distingue de los trazos que sí alcanzan el mínimo para delimitar un componente

### Requirement: La escala de elevación se proyecta desde arriba
Cada escalón de la escala de sombras SHALL leerse como luz que viene de arriba: su presencia por debajo del elemento SHALL ser notoriamente mayor que por sus costados, y no SHALL asomar por encima del borde superior. Un escalón cuyo difuminado se derrama tanto hacia los lados como hacia abajo se percibe como un halo sucio alrededor del contorno en vez de como elevación, y contradice al resto de la escala.

#### Scenario: Un escalón de la escala se proyecta
- **WHEN** se compara la extensión de cualquier escalón de sombra por debajo del elemento contra la que tiene por sus costados
- **THEN** la de abajo es notoriamente mayor, y por encima del borde superior no asoma sombra

#### Scenario: Los escalones son coherentes entre sí
- **WHEN** se comparan los escalones de la escala entre sí
- **THEN** todos comparten el mismo carácter direccional, diferenciándose por intensidad y distancia y no por la forma en que se reparten alrededor del elemento

### Requirement: Anillo de foco derivado del color del control
El sistema SHALL exponer tonos de anillo de foco derivados de los colores base sobre los que se construyen los controles —el de marca, el destructivo y el neutro—, cada uno translúcido, de modo que un control enfocado se destaque en su propio tono en vez de en un color ajeno al que lo pinta. El anillo de foco SHALL dibujarse contra el borde del control, sin separación intermedia.

#### Scenario: El anillo toma el tono del control
- **WHEN** un control cuyo color base es el de marca recibe el foco
- **THEN** su anillo se dibuja en el tono translúcido derivado del color de marca, y no en un color que el control no usa en ningún otro estado

#### Scenario: El anillo se apoya en el borde
- **WHEN** un control enfocado muestra su anillo
- **THEN** el anillo arranca en el borde del control, sin una franja intermedia que lo separe
